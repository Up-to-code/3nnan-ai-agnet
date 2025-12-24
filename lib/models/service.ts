/**
 * Service Mongoose Schema
 */

import mongoose, { Schema, model, models } from "mongoose";
import type { Service } from "@/types";

export interface ServiceDocument extends Omit<Service, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const serviceSchema = new Schema<ServiceDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: null,
      index: true,
    },
    price: {
      type: String,
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
serviceSchema.index({ category: 1 });

export const ServiceModel = models.Service || model<ServiceDocument>("Service", serviceSchema);

