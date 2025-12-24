/**
 * Conversation Mongoose Schema
 */

import mongoose, { Schema, model, models } from "mongoose";
import type { Conversation } from "@/types";

export interface ConversationDocument extends Omit<Conversation, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    lastMessage: {
      type: String,
      default: "",
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
conversationSchema.index({ userId: 1, updatedAt: -1 });

export const ConversationModel =
  models.Conversation || model<ConversationDocument>("Conversation", conversationSchema);

