"use client";

import { AppointmentList, PropertyCard, ServiceCard, PropertyList } from "./chat-data-views";
import { ImagePreview } from "./chat-data-views";
import { DocumentCard } from "./chat-data-views";
import { TableView } from "./table-view";
import { StreamingText } from "./streaming-text";

export type ComponentType = 
    | "text" 
    | "appointment" 
    | "appointment-list"
    | "property" 
    | "property-list"
    | "service"
    | "service-list"
    | "image" 
    | "document"
    | "coupon"
    | "table"
    | "streaming";

export interface ComponentData {
    type: ComponentType;
    data: any;
}

export function ComponentMapper({ type, data }: ComponentData) {
    switch (type) {
        case "appointment":
            return <AppointmentList appointments={Array.isArray(data) ? data : [data]} />;
        
        case "appointment-list":
            return <AppointmentList appointments={data} />;
        
        case "property":
            return <PropertyCard property={data} />;
        
        case "property-list":
            return <PropertyList properties={data} />;
        
        case "service":
            return <ServiceCard service={data} />;
        
        case "service-list":
            return (
                <div className="flex flex-col gap-3 w-full mt-3 mb-3">
                    {data?.map((service: any, i: number) => (
                        <ServiceCard key={service.id || i} service={service} />
                    ))}
                </div>
            );
        
        case "image":
            return <ImagePreview src={data?.src || data} />;
        
        case "document":
            return <DocumentCard doc={data} />;
        
        case "table":
            return <div className="w-full"><TableView data={data} /></div>;
        
        case "streaming":
            return <div className="w-full"><StreamingText text={data.text || data} speed={data.speed} /></div>;
        
        case "coupon":
            return null; // Handled in chat-bubble
        
        default:
            return null;
    }
}

