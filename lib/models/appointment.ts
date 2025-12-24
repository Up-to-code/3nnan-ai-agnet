/**
 * Appointment Mongoose Schema
 */

import mongoose, { Schema, model, models } from "mongoose";
import type { Appointment, AppointmentStatus } from "@/types";

export interface AppointmentDocument extends Omit<Appointment, "id">, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const appointmentSchema = new Schema<AppointmentDocument>(
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
    description: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
      index: true,
    },
    propertyId: {
      type: String,
      default: null,
      index: true,
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
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ userId: 1, status: 1 });

export const AppointmentModel =
  models.Appointment || model<AppointmentDocument>("Appointment", appointmentSchema);

