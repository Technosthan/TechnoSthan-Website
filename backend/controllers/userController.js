const fs = require("fs");
const Contact = require("../models/Contact");
const HeaderConfig = require("../models/HeaderConfig");
const SystemSettings = require("../models/SystemSettings");
const { parseFile, extractFields } = require("../utils/fileParser");
const { sendEmailsInBatches } = require("../services/emailService");
const { log } = require("../utils/logger");
const {
  calculateMergeScore,
  buildFieldWeights,
  valuesMatch,
  DEFAULT_FIELD_WEIGHTS,
  DEFAULT_MERGE_THRESHOLD,
} = require("../utils/fieldNormalization");

const normalizeData = (data) => {
  if (!data) return {};
  if (data instanceof Map) return Object.fromEntries(data);
  if (typeof data === "object") return data;
  return {};
};

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (value === null || value === undefined) {
    return [];
  }

  const normalized = String(value).trim();

  return normalized ? [normalized] : [];
};

const buildSearchText = (fields) =>
  Object.values(fields || {})
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getArtifactBaseKey = (key) => {
  if (typeof key !== "string") return null;
  const normalized = key.trim();
  const match = /^(.+?)(?:_(\d+)|(\d+))$/.exec(normalized);
  return match ? match[1] : null;
};

const mergeValues = (current, incoming) => {
  const base = Array.isArray(current) ? current : normalizeValue(current);
  const merged = [...base];
  normalizeValue(incoming).forEach((value) => {
    if (!merged.includes(value)) merged.push(value);
  });
  return merged;
};

const sanitizeMergedFields = (data) => {
  const normalized = normalizeData(data);
  const baseKeys = {};
  const artifactGroups = {};

  Object.entries(normalized).forEach(([key, value]) => {
    const artifactBaseKey = getArtifactBaseKey(key);
    if (artifactBaseKey) {
      artifactGroups[artifactBaseKey] = artifactGroups[artifactBaseKey] || [];
      artifactGroups[artifactBaseKey].push({ key, value });
    } else {
      baseKeys[key] = value;
    }
  });

  const sanitized = {};
  Object.entries(baseKeys).forEach(([key, value]) => {
    const values = normalizeValue(value);
    sanitized[key] = values.length <= 1 ? values[0] || "" : values;
  });

  Object.entries(artifactGroups).forEach(([baseKey, variants]) => {
    const baseExists = Object.prototype.hasOwnProperty.call(sanitized, baseKey);
    const shouldCollapse = baseExists || variants.length > 1;
    if (!shouldCollapse) {
      variants.forEach(({ key, value }) => {
        const values = normalizeValue(value);
        sanitized[key] = values.length <= 1 ? values[0] || "" : values;
      });
      return;
    }

    let combined = baseExists ? normalizeValue(sanitized[baseKey]) : [];
    variants.forEach(({ value }) => {
      combined = mergeValues(combined, value);
    });
    sanitized[baseKey] = combined.length <= 1 ? combined[0] || "" : combined;
  });

  return sanitized;
};

const getNormalizedValues = (data, key) => {
  const values = normalizeValue(data[key]);

  if (["email", "name"].includes(key)) {
    return values.map((v) => v.toLowerCase());
  }

  return values;
};

const isExactDuplicate = (existingData, incomingData) => {
  const keys = new Set([
    ...Object.keys(existingData || {}),
    ...Object.keys(incomingData || {}),
  ]);

  for (const key of keys) {
    const existingValues = getNormalizedValues(existingData, key);

    const incomingValues = getNormalizedValues(incomingData, key);

    if (existingValues.length !== incomingValues.length) {
      return false;
    }

    for (const value of incomingValues) {
      if (!existingValues.includes(value)) {
        return false;
      }
    }
  }

  return true;
};

const isSameUserDynamic = (
  existingData,
  incomingData,
  fieldWeights = DEFAULT_FIELD_WEIGHTS,
  mergeThreshold = DEFAULT_MERGE_THRESHOLD,
) => {
  // Build field types map for normalization
  const fieldTypes = {};
  Object.keys(fieldWeights).forEach((key) => {
    fieldTypes[key] = key; // Field type = field name for now
  });

  const score = calculateMergeScore(
    existingData,
    incomingData,
    fieldWeights,
    fieldTypes,
  );

  return score >= mergeThreshold;
};

const mergeDataRecords = (existingData, incomingData) => {
  const merged = {
    ...sanitizeMergedFields(existingData),
  };

  Object.keys(incomingData).forEach((key) => {
    const existingValues = normalizeValue(merged[key]);

    const incomingValues = normalizeValue(incomingData[key]);

    if (!incomingValues.length) {
      return;
    }

    const combined = [...existingValues];

    incomingValues.forEach((value) => {
      if (!combined.includes(value)) {
        combined.push(value);
      }
    });

    merged[key] = combined.length === 1 ? combined[0] : combined;
  });

  return merged;
};

const formatContactForResponse = (contact) => {
  const baseData = sanitizeMergedFields(contact.data);

  const normalized = {};

  Object.entries(baseData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      normalized[key] = value;
    } else {
      normalized[key] = value || "";
    }
  });

  return {
    ...contact,
    data: normalized,
  };
};

const canonicalHeaderKey = (key, knownBaseKeys, artifactCounts) => {
  const normalizedKey = String(key || "").trim();
  const match = /^(.+?)(?:_(\d+)|(\d+))$/.exec(normalizedKey);
  if (!match) return normalizedKey;

  const baseKey = match[1];
  const lowerBase = baseKey.toLowerCase();
  if (knownBaseKeys.has(lowerBase) || artifactCounts[lowerBase] > 1) {
    return baseKey;
  }

  return normalizedKey;
};

const dedupeHeaders = (headers) => {
  const validHeaders = (headers || []).filter(
    (header) => header && header.key && String(header.key).trim(),
  );

  const knownBaseKeys = new Set();
  const artifactCounts = {};

  validHeaders.forEach((header) => {
    const normalizedKey = String(header.key).trim();
    const match = /^(.+?)(?:_(\d+)|(\d+))$/.exec(normalizedKey);
    if (!match) {
      knownBaseKeys.add(normalizedKey.toLowerCase());
      return;
    }
    const baseKey = match[1].toLowerCase();
    artifactCounts[baseKey] = (artifactCounts[baseKey] || 0) + 1;
  });

  const unique = new Map();
  validHeaders.forEach((header) => {
    const normalizedKey = String(header.key).trim();
    const canonicalKey = canonicalHeaderKey(
      normalizedKey,
      knownBaseKeys,
      artifactCounts,
    );
    const canonicalLower = canonicalKey.toLowerCase();
    const label = String(header.label || canonicalKey).trim() || canonicalKey;
    const existing = unique.get(canonicalLower);

    if (
      !existing ||
      (existing.key !== canonicalKey &&
        existing.key !== normalizedKey &&
        canonicalKey === normalizedKey)
    ) {
      unique.set(canonicalLower, {
        key: canonicalKey,
        label,
      });
    }
  });

  return Array.from(unique.values());
};

const syncHeaderConfig = async (userId, fileHeaders) => {
  const uniqueHeaders = dedupeHeaders(fileHeaders);

  if (!uniqueHeaders.length) {
    const existingHeaders = await HeaderConfig.find({
      user: userId,
    }).lean();

    return dedupeHeaders(existingHeaders);
  }

  const existing = await HeaderConfig.find({
    user: userId,
  }).lean();

  const existingKeys = new Set(existing.map((item) => item.key.toLowerCase()));

  const newHeaders = uniqueHeaders
    .filter(
      (header) => header.key && !existingKeys.has(header.key.toLowerCase()),
    )
    .map((header) => ({
      user: userId,
      key: header.key,
      label: header.label || header.key,
    }));

  if (newHeaders.length) {
    await HeaderConfig.insertMany(newHeaders);
  }

  const finalHeaders = await HeaderConfig.find({
    user: userId,
  }).lean();

  return dedupeHeaders(finalHeaders);
};

const buildCandidateQuery = (incoming, userId) => {
  const conditions = [];

  // Search all non-empty fields in incoming data
  // This is now dynamic - works with ANY fields, not just email/phone/name
  Object.entries(incoming).forEach(([key, value]) => {
    if (!value) return;

    const values = Array.isArray(value) ? value : [value];
    values.forEach((v) => {
      if (v && typeof v === "string") {
        const normalizedVal = v.toLowerCase().trim();
        // Search both flat fields and nested data fields
        conditions.push({ [`data.${key}`]: normalizedVal });
      }
    });
  });

  // If we have high-confidence identity fields, add them too
  if (incoming.email) {
    const emails = normalizeValue(incoming.email);
    emails.forEach((email) => {
      conditions.push({ email: email.toLowerCase() });
    });
  }

  if (incoming.phone) {
    conditions.push({ phone: normalizeValue(incoming.phone)[0] });
  }

  if (incoming.name) {
    const names = normalizeValue(incoming.name);
    names.forEach((name) => {
      conditions.push({ name: name.toLowerCase() });
    });
  }

  return {
    uploadedBy: userId,
    ...(conditions.length ? { $or: conditions } : {}),
  };
};

const uploadContacts = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  try {
    // Load system settings for field aliases and weights
    const settings = (await SystemSettings.findOne()) || {};
    const systemFieldAliases =
      settings.fieldAliases instanceof Map
        ? Object.fromEntries(settings.fieldAliases)
        : settings.fieldAliases || DEFAULT_FIELD_ALIASES;
    const fieldWeights =
      settings.fieldWeights instanceof Map
        ? Object.fromEntries(settings.fieldWeights)
        : settings.fieldWeights || DEFAULT_FIELD_WEIGHTS;
    const mergeThreshold = settings.mergeThreshold || DEFAULT_MERGE_THRESHOLD;

    // Parse file with dynamic field aliases only
    const { rows, headers } = await parseFile(
      req.file.path,
      req.file.originalname,
      systemFieldAliases,
    );

    fs.unlinkSync(req.file.path);

    const validRows = rows.filter((row) => Object.keys(row).length > 0);

    if (!validRows.length) {
      return res.status(400).json({
        success: false,
        message: "File contains no usable data",
      });
    }

    // Settings already loaded above - use for requireApproval
    const requireApproval = settings.requireApproval || false;

    const initialStatus = requireApproval ? "waiting_approval" : "pending";
    const initialMessage = requireApproval
      ? "Waiting for Admin Approval"
      : "Not Sent Yet";

    await syncHeaderConfig(req.user._id, headers);

    let skippedDuplicates = 0;
    let mergedRecords = 0;
    let newRecords = 0;

    const pendingSendIds = [];
    const newContacts = [];

    // Build field weights for this batch
    const batchFieldWeights = buildFieldWeights(
      headers.map((h) => h.key),
      fieldWeights,
    );

    for (const row of validRows) {
      const incoming = {
        ...sanitizeMergedFields(row),
      };

      const extracted = extractFields(incoming);

      if (extracted.email) {
        incoming.email = extracted.email.toLowerCase();
      }

      if (extracted.phone) {
        incoming.phone = extracted.phone;
      }

      if (extracted.name) {
        incoming.name = extracted.name;
      }

      const candidateQuery = buildCandidateQuery(incoming, req.user._id);
      const candidates = await Contact.find(candidateQuery).lean();

      let existing = null;
      let exactDuplicate = false;

      for (const candidate of candidates) {
        const existingData = sanitizeMergedFields(candidate.data);

        const existingPayload = {
          ...existingData,
          email: candidate.email || existingData.email || "",
          phone: candidate.phone || existingData.phone || "",
          name: candidate.name || existingData.name || "",
        };

        // Exact duplicate check (all fields identical)
        if (isExactDuplicate(existingPayload, incoming)) {
          exactDuplicate = true;
          existing = candidate;
          break;
        }

        // Dynamic merge scoring - replaces hardcoded isSameUser logic
        if (
          isSameUserDynamic(
            existingPayload,
            incoming,
            batchFieldWeights,
            mergeThreshold,
          )
        ) {
          existing = candidate;
          break;
        }
      }

      if (exactDuplicate) {
        skippedDuplicates += 1;
        continue;
      }

      if (existing) {
        const mergedData = mergeDataRecords(existing.data, incoming);

        await Contact.findByIdAndUpdate(existing._id, {
          data: mergedData,
          searchText: buildSearchText(mergedData),
          headerKeys: Array.from(
            new Set([
              ...(existing.headerKeys || []),
              ...Object.keys(mergedData),
            ]),
          ),
        });

        mergedRecords += 1;

        if (!requireApproval && existing.status === "pending") {
          pendingSendIds.push(existing._id);
        }

        continue;
      }

      const contact = await Contact.create({
        email: incoming.email || "",
        phone: incoming.phone || incoming.mobile || "",
        name: incoming.name || "",
        data: incoming,
        headerKeys: Object.keys(incoming),
        searchText: buildSearchText(incoming),
        uploadedBy: req.user._id,
        status: initialStatus,
        message: initialMessage,
      });

      newContacts.push(contact);
      if (!requireApproval) pendingSendIds.push(contact._id);

      newRecords += 1;
    }

    await log(
      req.user._id,
      "upload",
      `Uploaded ${newRecords} new contacts, merged ${mergedRecords}, skipped ${skippedDuplicates}`,
    );

    if (!requireApproval && pendingSendIds.length) {
      setImmediate(async () => {
        try {
          const contactsToSend = await Contact.find({
            _id: {
              $in: pendingSendIds,
            },
          });

          await sendEmailsInBatches(contactsToSend);

          await Contact.updateMany(
            {
              _id: {
                $in: pendingSendIds,
              },
            },
            {
              $set: {
                status: "sent",
                message: "Mail Sent Successfully",
                sentAt: new Date(),
              },
            },
          );

          console.log("Emails sent successfully");
        } catch (emailError) {
          console.error("Email sending failed:", emailError);

          await Contact.updateMany(
            {
              _id: {
                $in: pendingSendIds,
              },
            },
            {
              $set: {
                status: "failed",
                message: "Email Sending Failed",
              },
            },
          );
        }
      });
    }

    res.json({
      success: true,

      message: "Upload completed successfully",

      data: {
        summary: {
          totalUploaded: validRows.length,

          newRecords,
          mergedRecords,
          skippedDuplicates,
        },
      },
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    next(err);
  }
};

const getMyStatus = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      sortBy = "createdAt",
      sortOrder = -1,
    } = req.query;

    const filter = {
      uploadedBy: req.user._id,
    };

    if (search) {
      filter.searchText = {
        $regex: search,
        $options: "i",
      };
    }

    const [contacts, total, headers] = await Promise.all([
      Contact.find(filter)
        .sort({
          [sortBy]: Number(sortOrder),
        })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),

      Contact.countDocuments(filter),

      HeaderConfig.find({
        user: req.user._id,
      }).lean(),
    ]);

    res.json({
      success: true,

      data: {
        contacts: contacts.map(formatContactForResponse),

        headers: dedupeHeaders(headers).map((item) => ({
          key: item.key,
          label: item.label,
        })),
      },

      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateHeaders = async (req, res, next) => {
  try {
    const updates = Array.isArray(req.body.updates) ? req.body.updates : [];

    if (!updates.length) {
      return res.status(400).json({
        success: false,
        message: "Header updates required",
      });
    }

    const ops = updates
      .filter((header) => header.key && typeof header.label === "string")
      .map((header) => ({
        updateOne: {
          filter: {
            user: req.user._id,
            key: header.key,
          },

          update: {
            $set: {
              label: header.label.trim() || header.key,
            },
          },

          upsert: true,
        },
      }));

    if (ops.length) {
      await HeaderConfig.bulkWrite(ops);
    }

    const savedHeaders = await HeaderConfig.find({
      user: req.user._id,
    }).lean();

    res.json({
      success: true,

      data: dedupeHeaders(savedHeaders).map((item) => ({
        key: item.key,
        label: item.label,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const deleteMyContacts = async (req, res, next) => {
  try {
    const result = await Contact.deleteMany({
      uploadedBy: req.user._id,
    });

    await log(
      req.user._id,
      "delete",
      `Deleted ${result.deletedCount} contacts`,
    );

    res.json({
      success: true,

      message: `Deleted ${result.deletedCount} contacts`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadContacts,
  getMyStatus,
  updateHeaders,
  deleteMyContacts,
};
