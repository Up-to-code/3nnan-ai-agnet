import { Message } from "@/components/chat/types";

// Mock messages with component data examples
export const mockMessages: Record<string, Message[]> = {
    "conv-1": [
        {
            id: "msg-1",
            content: "ما هي اتجاهات السوق العقاري الحالية؟",
            isAi: false,
            timestamp: "10:30 ص",
            type: "text",
        },
        {
            id: "msg-2",
            content: "إليك تحليل شامل لسوق العقارات:",
            isAi: true,
            timestamp: "10:31 ص",
            type: "text",
        },
        {
            id: "msg-3",
            content: "عقارات متاحة للبيع:",
            isAi: true,
            timestamp: "10:31 ص",
            type: "property-list",
            data: [
                {
                    id: "prop-1",
                    title: "فيلا فاخرة في حي الملقا",
                    description: "فيلا حديثة مع حديقة واسعة ومواقف سيارات",
                    location: "الرياض، حي الملقا",
                    price: "2,500,000 ر.س",
                    type: "buy",
                    bedrooms: 5,
                    bathrooms: 4,
                    area: "450 م²",
                    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80"
                },
                {
                    id: "prop-2",
                    title: "شقة راقية في حي العليا",
                    description: "شقة حديثة في موقع ممتاز قريب من الخدمات",
                    location: "الرياض، حي العليا",
                    price: "850,000 ر.س",
                    type: "buy",
                    bedrooms: 3,
                    bathrooms: 2,
                    area: "180 م²",
                    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                }
            ]
        }
    ],
    "conv-2": [
        {
            id: "msg-4",
            content: "كيف أبدأ الاستثمار في العقارات؟",
            isAi: false,
            timestamp: "09:15 ص",
            type: "text",
        },
        {
            id: "msg-5",
            content: "إليك الخدمات المتاحة لمساعدتك في الاستثمار:",
            isAi: true,
            timestamp: "09:16 ص",
            type: "service-list",
            data: [
                {
                    id: "svc-1",
                    title: "استشارة استثمارية",
                    description: "استشارة متخصصة لتحديد أفضل الفرص الاستثمارية المناسبة لك",
                    category: "استثمار"
                },
                {
                    id: "svc-2",
                    title: "تحليل السوق",
                    description: "تحليل شامل لاتجاهات السوق وأفضل المناطق للاستثمار",
                    category: "تحليل"
                },
                {
                    id: "svc-3",
                    title: "إدارة الممتلكات",
                    description: "خدمة إدارة كاملة للممتلكات الاستثمارية",
                    category: "إدارة"
                }
            ]
        }
    ],
    "conv-3": [
        {
            id: "msg-6",
            content: "ما هي أحدث اتجاهات التصميم؟",
            isAi: false,
            timestamp: "أمس 03:45 م",
            type: "text",
        },
        {
            id: "msg-7",
            content: "إليك أحدث الاتجاهات في التصميم الداخلي:",
            isAi: true,
            timestamp: "أمس 03:46 م",
            type: "text",
        },
        {
            id: "msg-8",
            content: "",
            isAi: true,
            timestamp: "أمس 03:46 م",
            type: "image",
            data: {
                src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
            }
        }
    ],
    "conv-4": [
        {
            id: "msg-9",
            content: "عرض عقارات في حي الملقا",
            isAi: false,
            timestamp: "منذ يومين 11:20 ص",
            type: "text",
        },
        {
            id: "msg-10",
            content: "إليك أفضل العقارات المتاحة:",
            isAi: true,
            timestamp: "منذ يومين 11:21 ص",
            type: "property",
            data: {
                id: "prop-3",
                title: "قصر فاخر في حي الملقا",
                description: "قصر حديث مع إطلالة رائعة ومساحات واسعة",
                location: "الرياض، حي الملقا",
                price: "5,200,000 ر.س",
                type: "buy",
                bedrooms: 7,
                bathrooms: 6,
                area: "850 م²",
                image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
            }
        }
    ],
    "conv-5": [
        {
            id: "msg-11",
            content: "عرض مواعيدي",
            isAi: false,
            timestamp: "منذ 3 أيام 02:30 م",
            type: "text",
        },
        {
            id: "msg-12",
            content: "إليك مواعيدك القادمة:",
            isAi: true,
            timestamp: "منذ 3 أيام 02:31 م",
            type: "appointment-list",
            data: [
                {
                    title: "زيارة عقار - حي الملقا",
                    description: "زيارة عقار للبيع مع العميل",
                    date: "2024-01-20",
                    time: "04:00 م",
                    status: "confirmed"
                },
                {
                    title: "توقيع عقد البيع",
                    description: "توقيع عقد بيع العقار في حي العليا",
                    date: "2024-01-22",
                    time: "10:00 ص",
                    status: "pending"
                },
                {
                    title: "استشارة استثمارية",
                    description: "جلسة استشارية لتحديد الفرص الاستثمارية",
                    date: "2024-01-25",
                    time: "03:00 م",
                    status: "pending"
                }
            ]
        }
    ],
    "conv-6": [
        {
            id: "msg-13",
            content: "عرض جدول الأسعار",
            isAi: false,
            timestamp: "اليوم 11:00 ص",
            type: "text",
        },
        {
            id: "msg-14",
            content: "إليك جدول أسعار العقارات حسب المنطقة:",
            isAi: true,
            timestamp: "اليوم 11:01 ص",
            type: "table",
            data: {
                columns: [
                    { header: "المنطقة", accessor: "area", align: "right" },
                    { header: "متوسط السعر", accessor: "avgPrice", align: "right" },
                    { header: "عدد الوحدات", accessor: "units", align: "center" },
                    { header: "التغيير", accessor: "change", align: "center" }
                ],
                rows: [
                    {
                        area: "حي الملقا",
                        avgPrice: "2,500,000 ر.س",
                        units: "45",
                        change: "+5%"
                    },
                    {
                        area: "حي العليا",
                        avgPrice: "1,800,000 ر.س",
                        units: "32",
                        change: "+3%"
                    },
                    {
                        area: "حي النرجس",
                        avgPrice: "1,200,000 ر.س",
                        units: "28",
                        change: "-2%"
                    },
                    {
                        area: "حي الياسمين",
                        avgPrice: "950,000 ر.س",
                        units: "19",
                        change: "+1%"
                    }
                ]
            }
        }
    ],
    "conv-7": [
        {
            id: "msg-15",
            content: "اكتب تقرير عن السوق",
            isAi: false,
            timestamp: "اليوم 12:00 م",
            type: "text",
        },
        {
            id: "msg-16",
            content: "",
            isAi: true,
            timestamp: "اليوم 12:01 م",
            type: "streaming",
            data: {
                text: "## تقرير السوق العقاري\n\n**الوضع الحالي:**\n\n- ارتفاع الطلب على العقارات السكنية بنسبة 15%\n- زيادة في أسعار الوحدات السكنية بمتوسط 8%\n- تزايد الاستثمار في المناطق الشمالية\n\n**التوقعات:**\n\nمن المتوقع أن يستمر النمو في القطاع العقاري خلال الربع القادم مع التركيز على المشاريع السكنية الجديدة.",
                speed: 20
            }
        }
    ]
};


