/**
 * Field Normalization Engine
 *
 * Handles:
 * - Field alias mapping (email, email_id, work_email -> canonical "email")
 * - Field type detection (regex, keywords, patterns)
 * - Dynamic priority/weight system
 * - No hardcoded fields beyond initialization
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s+\-()\\.]{7,20}$/;
const ID_REGEX = /^[A-Z0-9\-]{3,20}$/;
const URL_REGEX = /^https?:\/\/[^\s]+$/;
const DATE_REGEX = /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/;

/**
 * Default field aliases - can be extended via SystemSettings
 */
const DEFAULT_FIELD_ALIASES = {
  email: [
    "email",
    "email id",
    "emailid",
    "email_id",
    "work email",
    "work_email",
    "work mail",
    "work_mail",
    "personal email",
    "personal_email",
    "mail",
    "e-mail",
  ],
  phone: [
    "phone",
    "mobile",
    "contact",
    "contact no",
    "contact_no",
    "contact number",
    "contact_number",
    "whatsapp",
    "whatsapp number",
    "whatsapp_number",
    "mobile no",
    "mobile_no",
    "phone number",
    "phone_number",
    "tel",
    "telephone",
    "cell",
    "cellphone",
  ],
  name: [
    "name",
    "full name",
    "full_name",
    "firstname",
    "first name",
    "first_name",
    "last name",
    "lastname",
    "last_name",
    "employee name",
    "employee_name",
    "customer name",
    "customer_name",
    "user name",
    "username",
    "contact name",
    "contact_name",
  ],
  address: [
    "address",
    "city",
    "location",
    "state",
    "country",
    "postal code",
    "postal_code",
    "zip",
    "zipcode",
    "zip_code",
  ],
};

/**
 * Default field weights - used for merge scoring
 */
const DEFAULT_FIELD_WEIGHTS = {
  email: 100,
  phone: 90,
  name: 60,
  address: 20,
  // Enterprise/ID fields - usually high priority
  employee_id: 95,
  aadhaar: 100,
  ssn: 100,
  pan: 95,
  gst: 90,
  username: 80,
  account_id: 95,
  customer_id: 95,
  // Generic fallback
  // Any unspecified field gets weight 50
};

const DEFAULT_MERGE_THRESHOLD = 150;

/**
 * Normalize a header name using field aliases
 *
 * @param {string} headerName - Original header from file
 * @param {Object} fieldAliases - Alias mapping (from SystemSettings)
 * @returns {string} Canonical field name or original if no match
 */
const normalizeHeaderWithAliases = (
  headerName,
  fieldAliases = DEFAULT_FIELD_ALIASES,
) => {
  if (!headerName || typeof headerName !== "string") return headerName;

  const lowerName = headerName.toLowerCase().trim();

  // Check each canonical field's aliases
  for (const [canonical, aliases] of Object.entries(fieldAliases || {})) {
    if (!Array.isArray(aliases)) {
      continue;
    }

    if (
      aliases.some(
        (a) => typeof a === "string" && a.toLowerCase().trim() === lowerName,
      )
    ) {
      return canonical;
    }
  }

  // No match - return original
  return headerName;
};

/**
 * Detect field type from header name and sample values
 *
 * @param {string} headerName - Field name
 * @param {Array<string>} sampleValues - First 5-10 non-empty values
 * @param {Object} fieldAliases - For cross-checking
 * @returns {Object} { type, confidence, weight }
 */
const detectFieldType = (
  headerName,
  sampleValues = [],
  fieldAliases = DEFAULT_FIELD_ALIASES,
) => {
  const normalized = normalizeHeaderWithAliases(headerName, fieldAliases);
  const lowerName = headerName.toLowerCase().trim();

  // If normalized to known alias, use that
  if (normalized !== headerName) {
    return {
      type: normalized,
      confidence: 0.95,
      weight: DEFAULT_FIELD_WEIGHTS[normalized] || 50,
    };
  }

  // Pattern-based detection from values
  const validSamples = sampleValues
    .filter((v) => v && typeof v === "string")
    .slice(0, 10);

  if (validSamples.length === 0) {
    // Default to generic field
    return {
      type: headerName,
      confidence: 0,
      weight: DEFAULT_FIELD_WEIGHTS[headerName] || 50,
    };
  }

  let emailMatches = 0;
  let phoneMatches = 0;
  let idMatches = 0;
  let urlMatches = 0;
  let dateMatches = 0;
  let numberMatches = 0;

  validSamples.forEach((value) => {
    const trimmed = String(value).trim();
    if (EMAIL_REGEX.test(trimmed)) emailMatches++;
    if (PHONE_REGEX.test(trimmed)) phoneMatches++;
    if (ID_REGEX.test(trimmed)) idMatches++;
    if (URL_REGEX.test(trimmed)) urlMatches++;
    if (DATE_REGEX.test(trimmed)) dateMatches++;
    if (/^\d+(\.\d+)?$/.test(trimmed)) numberMatches++;
  });

  const total = validSamples.length;
  const emailPercent = (emailMatches / total) * 100;
  const phonePercent = (phoneMatches / total) * 100;
  const idPercent = (idMatches / total) * 100;

  // Decision tree based on percentages
  if (emailPercent >= 70) {
    return {
      type: "email",
      confidence: emailPercent / 100,
      weight: DEFAULT_FIELD_WEIGHTS.email,
    };
  }

  if (phonePercent >= 70) {
    return {
      type: "phone",
      confidence: phonePercent / 100,
      weight: DEFAULT_FIELD_WEIGHTS.phone,
    };
  }

  // Check keywords in header for semantic hints
  if (lowerName.includes("id") || lowerName.includes("code")) {
    return {
      type: "id",
      confidence: 0.7,
      weight: DEFAULT_FIELD_WEIGHTS.account_id || 80,
    };
  }

  if (lowerName.includes("url") || lowerName.includes("website")) {
    return {
      type: "url",
      confidence: 0.8,
      weight: 30,
    };
  }

  if (
    lowerName.includes("date") ||
    lowerName.includes("created") ||
    lowerName.includes("updated")
  ) {
    return {
      type: "date",
      confidence: 0.8,
      weight: 10,
    };
  }

  if (
    lowerName.includes("address") ||
    lowerName.includes("city") ||
    lowerName.includes("state")
  ) {
    return {
      type: "address",
      confidence: 0.8,
      weight: DEFAULT_FIELD_WEIGHTS.address || 20,
    };
  }

  if (
    lowerName.includes("number") ||
    lowerName.includes("count") ||
    lowerName.includes("quantity")
  ) {
    return {
      type: "number",
      confidence: 0.7,
      weight: 20,
    };
  }

  // Default: generic field
  return {
    type: headerName,
    confidence: 0,
    weight: DEFAULT_FIELD_WEIGHTS[headerName] || 50,
  };
};

/**
 * Build field weights map from uploaded headers
 * Falls back to defaults for unspecified fields
 *
 * @param {Array<string>} headerKeys - Field keys from upload
 * @param {Object} globalWeights - Custom weights (from SystemSettings)
 * @returns {Object} Weights map for all fields
 */
const buildFieldWeights = (
  headerKeys = [],
  globalWeights = DEFAULT_FIELD_WEIGHTS,
) => {
  const weights = {};

  headerKeys.forEach((key) => {
    // Use custom weight if available, else default, else 50
    weights[key] = globalWeights[key] !== undefined ? globalWeights[key] : 50;
  });

  return weights;
};

/**
 * Check if two values match (handles arrays and normalization)
 *
 * @param {*} existing - Existing value (string or array)
 * @param {*} incoming - Incoming value (string or array)
 * @param {string} fieldType - Field type for normalization
 * @returns {boolean}
 */
const valuesMatch = (existing, incoming, fieldType = "generic") => {
  if (!existing || !incoming) return false;

  const normalize = (val) => {
    if (typeof val !== "string")
      return String(val || "")
        .toLowerCase()
        .trim();
    let normalized = val.toLowerCase().trim();

    // Special normalization for email
    if (fieldType === "email" || fieldType === "email") {
      normalized = normalized.toLowerCase();
    }

    // Remove spaces from phone
    if (fieldType === "phone") {
      normalized = normalized.replace(/[\s\-()]/g, "");
    }

    return normalized;
  };

  const existingVals = Array.isArray(existing) ? existing : [existing];
  const incomingVals = Array.isArray(incoming) ? incoming : [incoming];

  return existingVals.some((e) =>
    incomingVals.some((i) => normalize(e) === normalize(i)),
  );
};

/**
 * Calculate merge score between two records
 *
 * @param {Object} existing - Existing record data
 * @param {Object} incoming - Incoming record data
 * @param {Object} fieldWeights - Weights for each field
 * @param {Object} fieldTypes - Field types for normalization
 * @returns {number} Merge score
 */
const calculateMergeScore = (
  existing = {},
  incoming = {},
  fieldWeights = DEFAULT_FIELD_WEIGHTS,
  fieldTypes = {},
) => {
  let score = 0;

  const allKeys = new Set([...Object.keys(existing), ...Object.keys(incoming)]);

  for (const key of allKeys) {
    const weight = fieldWeights[key] || 50;
    const fieldType = fieldTypes[key] || "generic";
    const existingVal = existing[key];
    const incomingVal = incoming[key];

    if (valuesMatch(existingVal, incomingVal, fieldType)) {
      score += weight;
    }
  }

  return score;
};

/**
 * Get default settings - suitable for System initialization
 */
const getDefaultSettings = () => ({
  fieldAliases: DEFAULT_FIELD_ALIASES,
  fieldWeights: DEFAULT_FIELD_WEIGHTS,
  mergeThreshold: DEFAULT_MERGE_THRESHOLD,
});

module.exports = {
  normalizeHeaderWithAliases,
  detectFieldType,
  buildFieldWeights,
  valuesMatch,
  calculateMergeScore,
  getDefaultSettings,
  DEFAULT_FIELD_ALIASES,
  DEFAULT_FIELD_WEIGHTS,
  DEFAULT_MERGE_THRESHOLD,
};
