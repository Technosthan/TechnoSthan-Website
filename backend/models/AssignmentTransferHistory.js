const mongoose = require("mongoose");

const AssignmentTransferHistorySchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    oldAssigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    newAssigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transferReason: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    assignmentTitle: {
      type: String,
      trim: true,
    },
    oldAssigneeName: {
      type: String,
      trim: true,
    },
    newAssigneeName: {
      type: String,
      trim: true,
    },
    transferredByName: {
      type: String,
      trim: true,
    },
    transferredByRole: {
      type: String,
      enum: ["ADMIN", "HR", "USER"],
      default: "HR",
    },
  },
  {
    timestamps: true,
    collection: "assignmenttransferhistories",
  },
);

// Indexes for efficient querying
AssignmentTransferHistorySchema.index({ assignmentId: 1, createdAt: -1 });
AssignmentTransferHistorySchema.index({ oldAssigneeId: 1, createdAt: -1 });
AssignmentTransferHistorySchema.index({ newAssigneeId: 1, createdAt: -1 });
AssignmentTransferHistorySchema.index({ transferredBy: 1, createdAt: -1 });

module.exports =
  mongoose.models.AssignmentTransferHistory ||
  mongoose.model("AssignmentTransferHistory", AssignmentTransferHistorySchema);
