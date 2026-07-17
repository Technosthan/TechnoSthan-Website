const mongoose = require("mongoose");
const {
  DataWork,
  DataWorkFile,
  DataWorkColumn,
  DataWorkRecord,
} = require("../models/DataWork");
const {
  deleteStoredFile,
  escapeRegExp,
  parseUploadedDataFile,
  runWithOptionalTransaction,
  saveUploadedFile,
  validateDataWorkFile,
  formatPreviewCell,
} = require("../services/dataWorkImportService");

const buildWorkQuery = (query = {}) => {
  const filter = {};
  const search = String(query.search || query.q || "").trim();

  if (search) {
    const re = new RegExp(escapeRegExp(search), "i");
    filter.$or = [{ name: re }, { originalFileName: re }];
  }

  if (query.status) {
    filter.status = String(query.status).trim();
  }

  return filter;
};

const buildSortObject = (sortBy = "newest") => {
  switch (String(sortBy || "newest").toLowerCase()) {
    case "oldest":
      return { createdAt: 1 };
    case "workname":
      return { name: 1, updatedAt: -1 };
    case "totalrecords":
      return { totalRecords: -1, updatedAt: -1 };
    case "newest":
    default:
      return { updatedAt: -1, createdAt: -1 };
  }
};

const toObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error("Invalid work id");
    error.statusCode = 400;
    throw error;
  }
  return new mongoose.Types.ObjectId(value);
};

const buildImportEntities = ({ workId, columns, records, session }) => {
  const columnDocs = columns.map((column) => ({
    workId,
    originalHeader: column.originalHeader,
    normalizedKey: column.normalizedKey,
    displayOrder: column.displayOrder,
    detectedType: column.detectedType || "text",
  }));

  const recordDocs = records.map((record) => ({
    workId,
    rowNumber: record.rowNumber,
    data: record.data,
    searchableText: record.searchableText,
  }));

  return { columnDocs, recordDocs, session };
};

const buildWorkMetadata = (parsed = {}, fileValidation = {}) => ({
  fileHash: fileValidation.fileHash || parsed.fileHash || "",
  extractionMethod: parsed.extractionMethod || "",
  pageCount: Number.isFinite(Number(parsed.pageCount)) ? Number(parsed.pageCount) : null,
  imageWidth: Number.isFinite(Number(parsed.imageWidth)) ? Number(parsed.imageWidth) : null,
  imageHeight: Number.isFinite(Number(parsed.imageHeight)) ? Number(parsed.imageHeight) : null,
  selectedTable: parsed.selectedTable?.tableName || parsed.selectedTable?.label || "",
  selectedPage: Number.isFinite(Number(parsed.selectedPage))
    ? Number(parsed.selectedPage)
    : Number.isFinite(Number(parsed.selectedTable?.pageNumber))
      ? Number(parsed.selectedTable.pageNumber)
      : null,
  ocrUsed: Boolean(parsed.ocrUsed),
  averageConfidence: Number.isFinite(Number(parsed.averageConfidence))
    ? Number(parsed.averageConfidence)
    : null,
  processingStatus: parsed.processingStatus || "Ready",
  extractionWarnings: Array.isArray(parsed.extractionWarnings)
    ? parsed.extractionWarnings
    : [],
});

const buildImportActivityMetadata = (work, file, parsed, fileValidation) => ({
  adminId: work.createdBy?.toString?.() || null,
  workId: work._id?.toString?.() || null,
  workName: work.name,
  fileName: file.originalname,
  fileType: fileValidation.extension,
  totalRecords: work.totalRecords,
  totalColumns: work.totalColumns,
  extractionMethod: parsed.extractionMethod || "",
  pageCount: parsed.pageCount || null,
  ocrUsed: Boolean(parsed.ocrUsed),
  averageConfidence: Number.isFinite(Number(parsed.averageConfidence))
    ? Number(parsed.averageConfidence)
    : null,
  selectedTable: parsed.selectedTable?.tableName || parsed.selectedTable?.label || "",
  selectedPage: Number.isFinite(Number(parsed.selectedPage))
    ? Number(parsed.selectedPage)
    : Number.isFinite(Number(parsed.selectedTable?.pageNumber))
      ? Number(parsed.selectedTable.pageNumber)
      : null,
  extractionWarnings: Array.isArray(parsed.extractionWarnings)
    ? parsed.extractionWarnings
    : [],
});

const buildSummary = async () => {
  const [totalWorks, totalFiles, totalRecords, recentlyUpdated] = await Promise.all(
    [
      DataWork.countDocuments({}),
      DataWorkFile.countDocuments({}),
      DataWorkRecord.countDocuments({}),
      DataWork.countDocuments({
        updatedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ],
  );

  const latest = await DataWork.findOne({})
    .sort({ updatedAt: -1 })
    .select("updatedAt")
    .lean();

  return {
    totalWorks,
    totalFiles,
    totalRecords,
    recentlyUpdated,
    latestUpdatedAt: latest?.updatedAt || null,
  };
};

const getAdminDataWorks = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const filter = buildWorkQuery(req.query);
    const sort = buildSortObject(req.query.sortBy);

    const [rows, total, summary] = await Promise.all([
      DataWork.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email role")
        .populate("currentFileId")
        .lean(),
      DataWork.countDocuments(filter),
      buildSummary(),
    ]);

    return res.status(200).json({
      success: true,
      data: rows.map((row) => ({
        ...row,
        id: row._id?.toString?.() || row.id,
      })),
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Get data works error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load data works right now",
    });
  }
};

const getAdminDataWorkById = async (req, res) => {
  try {
    const workId = toObjectId(req.params.workId);
    const work = await DataWork.findById(workId)
      .populate("createdBy", "name email role")
      .populate("currentFileId")
      .lean();

    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Data work not found",
      });
    }

    const columns = await DataWorkColumn.find({ workId })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        ...work,
        id: work._id?.toString?.() || work.id,
        columns: columns.map((column) => ({
          ...column,
          id: column._id?.toString?.() || column.id,
        })),
      },
    });
  } catch (error) {
    console.error("Get data work error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load data work",
    });
  }
};

const getAdminDataWorkRecords = async (req, res) => {
  try {
    const workId = toObjectId(req.params.workId);
    const work = await DataWork.findById(workId).select("_id").lean();
    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Data work not found",
      });
    }

    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 25), 1), 100);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || req.query.q || "").trim();
    const sortOrder = String(req.query.sortOrder || "asc").toLowerCase() === "desc" ? -1 : 1;
    const sortBy = String(req.query.sortBy || "rowNumber").trim();
    const columns = await DataWorkColumn.find({ workId })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    const columnKeys = columns.map((column) => column.normalizedKey);
    const hasColumnSort = columnKeys.includes(sortBy);

    const filter = { workId };
    if (search) {
      filter.$or = [
        { searchableText: new RegExp(escapeRegExp(search.toLowerCase()), "i") },
        { rowNumber: Number.isFinite(Number(search)) ? Number(search) : undefined },
      ].filter(Boolean);
    }

    const sort = hasColumnSort
      ? { [`data.${sortBy}`]: sortOrder, rowNumber: 1 }
      : { [sortBy === "rowNumber" ? "rowNumber" : "createdAt"]: sortOrder };

    const [rows, total] = await Promise.all([
      DataWorkRecord.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      DataWorkRecord.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: rows.map((row) => ({
        ...row,
        id: row._id?.toString?.() || row.id,
      })),
      columns: columns.map((column) => ({
        ...column,
        id: column._id?.toString?.() || column.id,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Get data work records error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load records",
    });
  }
};

const previewUpload = async (req, res) => {
  try {
    const file = req.file;
    const selectedSheet = String(req.body?.selectedSheet || "").trim() || undefined;
    const selectedTableId = String(req.body?.selectedTableId || req.body?.selectedTable || "").trim() || undefined;
    const preview = await parseUploadedDataFile({
      file,
      selectedSheet,
      selectedTableId,
    });

    const hasMultipleSheets = Array.isArray(preview.sheetNames) && preview.sheetNames.length > 1;
    const hasMultipleTables = Array.isArray(preview.availableTables) && preview.availableTables.length > 1;

    return res.status(200).json({
      success: true,
      data: preview,
      message:
        hasMultipleSheets
          ? "This workbook contains multiple sheets. Please select a sheet."
          : hasMultipleTables
            ? "Multiple tables were detected. Please select one."
            : preview.ocrUsed
              ? "Preview ready using OCR."
          : "Preview ready",
    });
  } catch (error) {
    console.error("Preview data work upload error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to preview file",
    });
  }
};

const createDataWork = async (req, res) => {
  let savedFileInfo = null;
  try {
    const file = req.file;
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim().slice(0, 500);
    const selectedSheet = String(req.body?.selectedSheet || "").trim() || undefined;
    const selectedTableId = String(req.body?.selectedTableId || req.body?.selectedTable || "").trim() || undefined;

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a work name.",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Work name must be 100 characters or fewer.",
      });
    }

    const fileValidation = validateDataWorkFile(file);
    const parsed = await parseUploadedDataFile({
      file,
      selectedSheet,
      selectedTableId,
    });

    if (Array.isArray(parsed.sheetNames) && parsed.sheetNames.length > 1 && !selectedSheet) {
      return res.status(400).json({
        success: false,
        message: "This workbook contains multiple sheets. Please select a sheet.",
        data: parsed,
      });
    }

    if (Array.isArray(parsed.availableTables) && parsed.availableTables.length > 1 && !selectedTableId) {
      return res.status(400).json({
        success: false,
        message: "Multiple tables were detected. Please select one.",
        data: parsed,
      });
    }

    savedFileInfo = await saveUploadedFile({ file, workName: name });

    const result = await runWithOptionalTransaction(async (session) => {
      const workMetadata = buildWorkMetadata(parsed, fileValidation);
      const work = new DataWork({
        name,
        description,
        createdBy: req.user.id,
        status: "Processing",
        originalFileName: file.originalname,
        storedFileName: savedFileInfo.storedFileName,
        fileHash: workMetadata.fileHash,
        storageUrl: savedFileInfo.storageUrl,
        filePath: savedFileInfo.filePath,
        mimeType: fileValidation.mimeType,
        extension: fileValidation.extension,
        fileSize: file.size,
        selectedSheet: parsed.selectedSheet,
        sheetNames: parsed.sheetNames,
        extractionMethod: workMetadata.extractionMethod,
        pageCount: workMetadata.pageCount,
        imageWidth: workMetadata.imageWidth,
        imageHeight: workMetadata.imageHeight,
        selectedTable: workMetadata.selectedTable,
        selectedPage: workMetadata.selectedPage,
        ocrUsed: workMetadata.ocrUsed,
        averageConfidence: workMetadata.averageConfidence,
        processingStatus: workMetadata.processingStatus,
        extractionWarnings: workMetadata.extractionWarnings,
        totalColumns: parsed.totalColumns,
        totalRecords: parsed.totalRows,
        fileUploadedAt: new Date(),
      });

      if (session) {
        work.$session(session);
      }

      const savedWork = await work.save({ session });

      const fileDoc = await DataWorkFile.create(
        [
          {
            workId: savedWork._id,
            originalFileName: file.originalname,
            storedFileName: savedFileInfo.storedFileName,
            fileHash: workMetadata.fileHash,
            storageUrl: savedFileInfo.storageUrl,
            filePath: savedFileInfo.filePath,
            mimeType: fileValidation.mimeType,
            extension: fileValidation.extension,
            fileSize: file.size,
            selectedSheet: parsed.selectedSheet,
            sheetNames: parsed.sheetNames,
            extractionMethod: workMetadata.extractionMethod,
            pageCount: workMetadata.pageCount,
            imageWidth: workMetadata.imageWidth,
            imageHeight: workMetadata.imageHeight,
            selectedTable: workMetadata.selectedTable,
            selectedPage: workMetadata.selectedPage,
            ocrUsed: workMetadata.ocrUsed,
            averageConfidence: workMetadata.averageConfidence,
            processingStatus: workMetadata.processingStatus,
            extractionWarnings: workMetadata.extractionWarnings,
            uploadedBy: req.user.id,
            uploadedAt: new Date(),
          },
        ],
        session ? { session } : undefined,
      );

      const { columnDocs, recordDocs } = buildImportEntities({
        workId: savedWork._id,
        columns: parsed.columns,
        records: parsed.records,
        session,
      });

      await DataWorkColumn.insertMany(columnDocs, session ? { session } : undefined);
      await DataWorkRecord.insertMany(recordDocs, session ? { session } : undefined);

      savedWork.currentFileId = fileDoc[0]._id;
      savedWork.status = "Ready";
      savedWork.fileHash = workMetadata.fileHash;
      savedWork.totalColumns = parsed.totalColumns;
      savedWork.totalRecords = parsed.totalRows;
      savedWork.fileUploadedAt = new Date();
      savedWork.extractionMethod = workMetadata.extractionMethod;
      savedWork.pageCount = workMetadata.pageCount;
      savedWork.imageWidth = workMetadata.imageWidth;
      savedWork.imageHeight = workMetadata.imageHeight;
      savedWork.selectedTable = workMetadata.selectedTable;
      savedWork.selectedPage = workMetadata.selectedPage;
      savedWork.ocrUsed = workMetadata.ocrUsed;
      savedWork.averageConfidence = workMetadata.averageConfidence;
      savedWork.processingStatus = workMetadata.processingStatus;
      savedWork.extractionWarnings = workMetadata.extractionWarnings;
      await savedWork.save({ session });

      return savedWork;
    });

    try {
      await req.logActivity?.({
        action: "DATA_WORK_CREATED",
        module: "DataWorkManager",
        description: `Created data work ${result.name}`,
        entityId: result._id?.toString(),
        entityType: "DataWork",
        metadata: buildImportActivityMetadata(result, file, parsed, fileValidation),
      });
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(201).json({
      success: true,
      message: parsed.ocrUsed
        ? "File imported successfully using OCR."
        : "Work created successfully.",
      data: {
        work: await DataWork.findById(result._id)
          .populate("createdBy", "name email role")
          .populate("currentFileId")
          .lean(),
      },
    });
  } catch (error) {
    if (savedFileInfo?.filePath) {
      await deleteStoredFile(savedFileInfo.filePath);
    }

    console.error("Create data work error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "The data could not be imported. No changes were saved.",
    });
  }
};

const updateDataWork = async (req, res) => {
  try {
    const workId = toObjectId(req.params.workId);
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim().slice(0, 500);

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a work name.",
      });
    }

    const work = await DataWork.findById(workId);
    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Data work not found",
      });
    }

    work.name = name;
    work.description = description;
    await work.save();

    try {
      await req.logActivity?.({
        action: "DATA_WORK_UPDATED",
        module: "DataWorkManager",
        description: `Updated data work ${work.name}`,
        entityId: work._id?.toString(),
        entityType: "DataWork",
        metadata: {
          workName: work.name,
        },
      });
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Work updated successfully.",
      data: await DataWork.findById(work._id)
        .populate("createdBy", "name email role")
        .populate("currentFileId")
        .lean(),
    });
  } catch (error) {
    console.error("Update data work error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to update work",
    });
  }
};

const replaceDataWorkFile = async (req, res) => {
  let savedFileInfo = null;
  let oldFilePath = "";
  let cleanupWarning = "";
  try {
    const workId = toObjectId(req.params.workId);
    const work = await DataWork.findById(workId).populate("currentFileId");
    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Data work not found",
      });
    }

    const file = req.file;
    const selectedSheet = String(req.body?.selectedSheet || "").trim() || undefined;
    const selectedTableId = String(req.body?.selectedTableId || req.body?.selectedTable || "").trim() || undefined;
    const fileValidation = validateDataWorkFile(file);
    if (work.fileHash && work.fileHash === fileValidation.fileHash) {
      return res.status(400).json({
        success: false,
        message: "This file has already been imported for this work.",
      });
    }

    const parsed = await parseUploadedDataFile({
      file,
      selectedSheet,
      selectedTableId,
    });

    if (Array.isArray(parsed.sheetNames) && parsed.sheetNames.length > 1 && !selectedSheet) {
      return res.status(400).json({
        success: false,
        message: "This workbook contains multiple sheets. Please select a sheet.",
        data: parsed,
      });
    }

    if (Array.isArray(parsed.availableTables) && parsed.availableTables.length > 1 && !selectedTableId) {
      return res.status(400).json({
        success: false,
        message: "Multiple tables were detected. Please select one.",
        data: parsed,
      });
    }

    savedFileInfo = await saveUploadedFile({
      file,
      workName: work.name,
    });

    oldFilePath = work.filePath || work.currentFileId?.filePath || "";

    const result = await runWithOptionalTransaction(async (session) => {
      if (session) {
        work.$session(session);
      }

      await DataWorkColumn.deleteMany({ workId: work._id }, session ? { session } : undefined);
      await DataWorkRecord.deleteMany({ workId: work._id }, session ? { session } : undefined);
      await DataWorkFile.deleteMany({ workId: work._id }, session ? { session } : undefined);

      const newFileDoc = await DataWorkFile.create(
        [
          {
            workId: work._id,
            originalFileName: file.originalname,
            storedFileName: savedFileInfo.storedFileName,
            fileHash: fileValidation.fileHash,
            storageUrl: savedFileInfo.storageUrl,
            filePath: savedFileInfo.filePath,
            mimeType: fileValidation.mimeType,
            extension: fileValidation.extension,
            fileSize: file.size,
            selectedSheet: parsed.selectedSheet,
            sheetNames: parsed.sheetNames,
            extractionMethod: parsed.extractionMethod || "",
            pageCount: parsed.pageCount ?? null,
            imageWidth: parsed.imageWidth ?? null,
            imageHeight: parsed.imageHeight ?? null,
            selectedTable: parsed.selectedTable?.tableName || parsed.selectedTable?.label || "",
            selectedPage: parsed.selectedPage ?? parsed.selectedTable?.pageNumber ?? null,
            ocrUsed: Boolean(parsed.ocrUsed),
            averageConfidence: Number.isFinite(Number(parsed.averageConfidence))
              ? Number(parsed.averageConfidence)
              : null,
            processingStatus: parsed.processingStatus || "Ready",
            extractionWarnings: Array.isArray(parsed.extractionWarnings)
              ? parsed.extractionWarnings
              : [],
            uploadedBy: req.user.id,
            uploadedAt: new Date(),
          },
        ],
        session ? { session } : undefined,
      );

      const { columnDocs, recordDocs } = buildImportEntities({
        workId: work._id,
        columns: parsed.columns,
        records: parsed.records,
        session,
      });

      await DataWorkColumn.insertMany(columnDocs, session ? { session } : undefined);
      await DataWorkRecord.insertMany(recordDocs, session ? { session } : undefined);

      work.currentFileId = newFileDoc[0]._id;
      work.originalFileName = file.originalname;
      work.storedFileName = savedFileInfo.storedFileName;
      work.fileHash = fileValidation.fileHash;
      work.storageUrl = savedFileInfo.storageUrl;
      work.filePath = savedFileInfo.filePath;
      work.mimeType = fileValidation.mimeType;
      work.extension = fileValidation.extension;
      work.fileSize = file.size;
      work.selectedSheet = parsed.selectedSheet;
      work.sheetNames = parsed.sheetNames;
      work.extractionMethod = parsed.extractionMethod || "";
      work.pageCount = parsed.pageCount ?? null;
      work.imageWidth = parsed.imageWidth ?? null;
      work.imageHeight = parsed.imageHeight ?? null;
      work.selectedTable = parsed.selectedTable?.tableName || parsed.selectedTable?.label || "";
      work.selectedPage = parsed.selectedPage ?? parsed.selectedTable?.pageNumber ?? null;
      work.ocrUsed = Boolean(parsed.ocrUsed);
      work.averageConfidence = Number.isFinite(Number(parsed.averageConfidence))
        ? Number(parsed.averageConfidence)
        : null;
      work.processingStatus = parsed.processingStatus || "Ready";
      work.extractionWarnings = Array.isArray(parsed.extractionWarnings)
        ? parsed.extractionWarnings
        : [];
      work.totalColumns = parsed.totalColumns;
      work.totalRecords = parsed.totalRows;
      work.fileUploadedAt = new Date();
      work.status = "Ready";
      await work.save({ session });

      return work;
    });

    if (oldFilePath && oldFilePath !== savedFileInfo.filePath) {
      try {
        await deleteStoredFile(oldFilePath);
      } catch (cleanupError) {
        cleanupWarning = "The previous file could not be removed automatically.";
        console.error("Cleanup file deletion failed:", cleanupError?.message || cleanupError);
      }
    }

    try {
      await req.logActivity?.({
        action: "DATA_FILE_REPLACED",
        module: "DataWorkManager",
        description: `Replaced file for data work ${result.name}`,
        entityId: result._id?.toString(),
        entityType: "DataWork",
        metadata: buildImportActivityMetadata(result, file, parsed, fileValidation),
      });
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: parsed.ocrUsed
        ? "File imported successfully using OCR."
        : "File replaced successfully.",
      warning: cleanupWarning || undefined,
      data: await DataWork.findById(result._id)
        .populate("createdBy", "name email role")
        .populate("currentFileId")
        .lean(),
    });
  } catch (error) {
    if (savedFileInfo?.filePath) {
      await deleteStoredFile(savedFileInfo.filePath);
    }
    console.error("Replace data work file error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to replace file",
    });
  }
};

const deleteDataWork = async (req, res) => {
  try {
    const workId = toObjectId(req.params.workId);
    const work = await DataWork.findById(workId).populate("currentFileId");
    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Data work not found",
      });
    }

    const filePath = work.filePath || work.currentFileId?.filePath || "";
    let cleanupWarning = "";

    await runWithOptionalTransaction(async (session) => {
      await DataWorkRecord.deleteMany({ workId: work._id }, session ? { session } : undefined);
      await DataWorkColumn.deleteMany({ workId: work._id }, session ? { session } : undefined);
      await DataWorkFile.deleteMany({ workId: work._id }, session ? { session } : undefined);
      await DataWork.deleteOne({ _id: work._id }, session ? { session } : undefined);
    });

    if (filePath) {
      try {
        await deleteStoredFile(filePath);
      } catch (cleanupError) {
        cleanupWarning = "Some stored files could not be removed automatically.";
        console.error("Cleanup file deletion failed:", cleanupError?.message || cleanupError);
      }
    }

    try {
      await req.logActivity?.({
        action: "DATA_WORK_DELETED",
        module: "DataWorkManager",
        description: `Deleted data work ${work.name}`,
        entityId: work._id?.toString(),
        entityType: "DataWork",
        metadata: {
          adminId: req.user?.id || null,
          workId: work._id?.toString() || null,
          workName: work.name,
          fileName: work.originalFileName,
          fileType: work.extension || work.currentFileId?.extension || "",
          totalRecords: work.totalRecords,
          deletedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Work deleted successfully.",
      warning: cleanupWarning || undefined,
    });
  } catch (error) {
    console.error("Delete data work error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to delete work",
    });
  }
};

const exportDataWork = async (req, res) => {
  try {
    const workId = toObjectId(req.params.workId);
    const work = await DataWork.findById(workId).lean();
    if (!work) {
      return res.status(404).json({
        success: false,
        message: "Data work not found",
      });
    }

    const columns = await DataWorkColumn.find({ workId })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    const records = await DataWorkRecord.find({ workId })
      .sort({ rowNumber: 1 })
      .lean();

    const headerRow = ["rowNumber", ...columns.map((column) => column.originalHeader)];
    const csvRows = [headerRow.join(",")];

    const escapeCsv = (value) => {
      const text = formatPreviewCell(value).replace(/"/g, '""');
      return `"${text}"`;
    };

    records.forEach((record) => {
      const row = [
        escapeCsv(record.rowNumber),
        ...columns.map((column) => escapeCsv(record.data?.[column.normalizedKey])),
      ];
      csvRows.push(row.join(","));
    });

    try {
      await req.logActivity?.({
        action: "DATA_WORK_EXPORTED",
        module: "DataWorkManager",
        description: `Exported data work ${work.name}`,
        entityId: work._id?.toString(),
        entityType: "DataWork",
        metadata: {
          workName: work.name,
          totalRows: records.length,
          totalColumns: columns.length,
        },
      });
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${String(work.name || "data-work")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "data-work"}-export.csv"`,
    );

    return res.status(200).send(csvRows.join("\n"));
  } catch (error) {
    console.error("Export data work error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to export work",
    });
  }
};

module.exports = {
  getAdminDataWorks,
  getAdminDataWorkById,
  getAdminDataWorkRecords,
  previewUpload,
  createDataWork,
  updateDataWork,
  replaceDataWorkFile,
  deleteDataWork,
  exportDataWork,
};
