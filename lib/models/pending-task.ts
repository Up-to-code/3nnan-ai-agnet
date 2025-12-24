/**
 * Pending Task Mongoose Schema
 */

import mongoose, { Schema, model, models } from "mongoose";
import type { PendingTask, TaskStatus } from "@/types";

export interface PendingTaskDocument extends Omit<PendingTask, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const pendingTaskSchema = new Schema<PendingTaskDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    result: {
      type: Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
pendingTaskSchema.index({ userId: 1, status: 1 });
pendingTaskSchema.index({ conversationId: 1, status: 1 });

export const PendingTaskModel =
  models.PendingTask || model<PendingTaskDocument>("PendingTask", pendingTaskSchema);

