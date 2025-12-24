/**
 * Property Mongoose Schema
 */

import mongoose, { Schema, model, models } from "mongoose";
import type { Property, PropertyType } from "@/types";

export interface PropertyDocument extends Omit<Property, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const propertySchema = new Schema<PropertyDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: String,
      required: true,
    },
    priceNumeric: {
      type: Number,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["buy", "rent"],
      required: true,
      index: true,
    },
    bedrooms: {
      type: Number,
      default: null,
    },
    bathrooms: {
      type: Number,
      default: null,
    },
    area: {
      type: String,
      default: null,
    },
    areaNumeric: {
      type: Number,
      default: null,
      index: true,
    },
    image: {
      type: String,
      default: null,
    },
    features: {
      type: [String],
      default: [],
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

// Indexes for efficient queries
propertySchema.index({ type: 1, location: 1 });
propertySchema.index({ priceNumeric: 1 });
propertySchema.index({ areaNumeric: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ type: 1, priceNumeric: 1, location: 1 });

export const PropertyModel = models.Property || model<PropertyDocument>("Property", propertySchema);

