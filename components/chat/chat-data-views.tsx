"use client";

import { Calendar, CheckCircle2, Clock, Download, ExternalLink, FileText, Tag, Home, MapPin, Bed, Bath, Square, ArrowLeftRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "./image-viewer";

// --- Appointment List ---
export interface Appointment {
    title: string;
    date: string;
    time: string;
    status: "confirmed" | "pending" | "cancelled";
    description?: string;
}

export function AppointmentList({ appointments }: { appointments: Appointment[] }) {
    return (
        <div className="flex flex-col gap-3 w-full mt-3 mb-3">
            {appointments.map((apt, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-background/50 border border-border/50 rounded-xl hover:border-primary/30 transition-all cursor-pointer min-h-[60px]">
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                            <span className="font-semibold text-sm sm:text-base truncate leading-snug">{apt.title}</span>
                            <div className={cn(
                                "px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0",
                                apt.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500" :
                                    apt.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                                        "bg-rose-500/10 text-rose-500"
                            )}>
                                {apt.status === "confirmed" ? "مؤكد" : apt.status === "pending" ? "قيد الانتظار" : "ملغى"}
                            </div>
                        </div>
                        {apt.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 leading-relaxed">{apt.description}</p>
                        )}
                        <div className="flex items-center gap-4 sm:gap-5 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span className="leading-relaxed">{apt.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                <span className="leading-relaxed">{apt.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- Coupon Card ---
interface Coupon {
    code: string;
    discount: string;
    expiry: string;
}

export function CouponCard({ coupon }: { coupon: Coupon }) {
    return (
        <div className="relative overflow-hidden w-full mt-3 mb-3 p-5 sm:p-6 rounded-xl bg-primary/5 border border-primary/20 flex flex-col items-center text-center gap-4">
            <div className="absolute top-0 right-0 p-2 bg-primary/10 rounded-bl-xl">
                <Tag className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
                <span className="text-3xl sm:text-4xl font-black text-primary leading-none">{coupon.discount}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">خصم لفترة محدودة</p>
            </div>
            <div className="w-full flex flex-col gap-3">
                <div className="px-4 py-3 bg-background border border-dashed border-primary/30 rounded-lg font-mono font-bold text-center tracking-widest text-primary text-base leading-snug">
                    {coupon.code}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">ينتهي في {coupon.expiry}</p>
            </div>
        </div>
    );
}

// --- Image Preview ---
export function ImagePreview({ src }: { src: string }) {
    return <ImageViewer src={src} alt="Property" />;
}

// --- PDF Document ---
interface Document {
    name: string;
    size: string;
}

export function DocumentCard({ doc }: { doc: Document }) {
    return (
        <div className="flex items-center gap-4 p-4 mt-3 mb-3 w-full bg-background border border-border/50 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group min-h-[64px]">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden gap-1">
                <span className="text-sm sm:text-base font-medium truncate group-hover:text-primary transition-colors leading-relaxed">{doc.name}</span>
                <span className="text-xs text-muted-foreground uppercase leading-relaxed">{doc.size}</span>
            </div>
            <Download className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
    );
}

// --- Property Card ---
export interface Property {
    id?: string;
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

export function PropertyCard({ property }: { property: Property }) {
    return (
        <div className="mt-3 mb-3 w-full rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 transition-all group cursor-pointer">
            <div className="flex gap-4 p-4 min-h-[100px]">
                {property.image && (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2.5">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate leading-snug">{property.title}</h3>
                            {property.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1 leading-relaxed">{property.description}</p>
                            )}
                        </div>
                        <div className={cn(
                            "px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase shrink-0",
                            property.type === "buy" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                            {property.type === "buy" ? "للبيع" : "للإيجار"}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate leading-relaxed">{property.location}</span>
                    </div>
                    
                    {(property.bedrooms || property.bathrooms || property.area) && (
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            {property.bedrooms && (
                                <div className="flex items-center gap-1.5">
                                    <Bed className="h-3.5 w-3.5 shrink-0" />
                                    <span className="leading-relaxed">{property.bedrooms}</span>
                                </div>
                            )}
                            {property.bathrooms && (
                                <div className="flex items-center gap-1.5">
                                    <Bath className="h-3.5 w-3.5 shrink-0" />
                                    <span className="leading-relaxed">{property.bathrooms}</span>
                                </div>
                            )}
                            {property.area && (
                                <div className="flex items-center gap-1.5">
                                    <Square className="h-3.5 w-3.5 shrink-0" />
                                    <span className="leading-relaxed">{property.area}</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-base sm:text-lg font-bold text-foreground leading-snug">{property.price}</span>
                        <Button size="sm" variant="outline" className="h-9 text-xs sm:text-sm px-4 shrink-0 min-w-[60px]">
                            عرض
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Property List ---
export function PropertyList({ properties }: { properties: Property[] }) {
    return (
        <div className="flex flex-col gap-3 w-full mt-3 mb-3">
            {properties.map((property, i) => (
                <PropertyCard key={property.id || i} property={property} />
            ))}
        </div>
    );
}

// --- Service Card ---
export interface Service {
    id?: string;
    title: string;
    description: string;
    icon?: string;
    category?: string;
}

export function ServiceCard({ service }: { service: Service }) {
    return (
        <div className="mt-3 mb-3 p-4 sm:p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group min-h-[80px]">
            <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <h3 className="font-semibold text-sm sm:text-base leading-snug">{service.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{service.description}</p>
                    {service.category && (
                        <span className="inline-block mt-1 px-2.5 py-1 text-xs rounded-md bg-muted text-muted-foreground leading-relaxed">
                            {service.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
