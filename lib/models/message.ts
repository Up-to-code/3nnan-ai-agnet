/**
 * Message Mongoose Schema
 */

import mongoose, { Schema, model, models } from "mongoose";
import type { Message, MessageType } from "@/types";

export interface MessageDocument extends Omit<Message, "id" | "timestamp">, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const messageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    isAi: {
      type: Boolean,
      required: true,
      default: false,
    },
    type: {
      type: String,
      enum: [
        "text",
        "appointment",
        "appointment-list",
        "property",
        "property-list",
        "service",
        "service-list",
        "image",
        "document",
        "coupon",
        "table",
        "streaming",
      ],
      default: "text",
    },
    data: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        if (ret.createdAt && ret.createdAt instanceof Date) {
          ret.timestamp = ret.createdAt.toISOString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const MessageModel = models.Message || model<MessageDocument>("Message", messageSchema);

