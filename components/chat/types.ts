// Centralized types for chat components

import { ComponentType } from "./component-mapper";

export interface Message {
    id: string;
    content: string;
    isAi: boolean;
    timestamp: string;
    type?: ComponentType | "text";
    data?: unknown;
}

export interface ChatRequest {
    message: string;
    model: "standard" | "pro";
    conversationId?: string | null;
}

export interface ChatResponse {
    content: string;
    type: ComponentType | "text";
    data?: unknown;
    conversationId?: string;
    error?: string;
}

// Property type for property cards
export interface Property {
    id: string;
    title: string;
    description?: string;
    location: string;
    price: string;
    type: "buy" | "rent";
    bedrooms?: number;
    bathrooms?: number;
    area?: string;
    image?: string;
}

// Appointment type for appointment cards
export interface Appointment {
    id: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    status: "confirmed" | "pending" | "cancelled";
}

// Service type for service cards
export interface Service {
    id: string;
    title: string;
    description: string;
    category?: string;
    price?: string;
}

// Document type
export interface Document {
    id: string;
    name: string;
    size: string;
    url?: string;
    type: string;
}

// Coupon type
export interface Coupon {
    id: string;
    code: string;
    discount: string;
    expiry: string;
}

// Table types
export interface TableColumn {
    header: string;
    accessor: string;
    align?: "left" | "center" | "right";
}

export interface TableData {
    columns: TableColumn[];
    rows: Record<string, string | number>[];
}
