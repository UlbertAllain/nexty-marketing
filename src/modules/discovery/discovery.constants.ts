export const DISCOVERY_AREAS = [
  "Solo Raya",
  "Surakarta",
  "Sukoharjo",
  "Karanganyar",
  "Boyolali",
  "Klaten",
  "Sragen",
  "Wonogiri",
] as const;

export const DISCOVERY_CATEGORIES = [
  "Semua kategori potensial",
  "Kuliner & F&B",
  "Hotel, travel & hospitality",
  "Klinik & kesehatan",
  "Kecantikan & wellness",
  "Pendidikan & kursus",
  "Fitness & olahraga",
  "Interior, furniture & arsitektur",
  "Kontraktor & properti",
  "Retail & toko",
  "Otomotif",
  "Jasa profesional",
  "Laundry, percetakan & jasa lokal",
] as const;

export type DiscoveryArea = typeof DISCOVERY_AREAS[number];
export type DiscoveryCategory = typeof DISCOVERY_CATEGORIES[number];

export const DISCOVERY_AREA_QUERY: Record<DiscoveryArea, string> = {
  "Solo Raya": "Surakarta Solo Sukoharjo Karanganyar Boyolali Klaten Sragen Wonogiri",
  Surakarta: "Surakarta Solo",
  Sukoharjo: "Sukoharjo",
  Karanganyar: "Karanganyar",
  Boyolali: "Boyolali",
  Klaten: "Klaten",
  Sragen: "Sragen",
  Wonogiri: "Wonogiri",
};

export const DISCOVERY_CATEGORY_QUERY: Record<DiscoveryCategory, string[]> = {
  "Semua kategori potensial": [
    "restaurant cafe kuliner hotel travel",
    "klinik dental salon kecantikan fitness pendidikan kursus",
    "interior furniture arsitek kontraktor properti",
    "retail toko otomotif laundry percetakan jasa profesional",
  ],
  "Kuliner & F&B": ["restaurant cafe kuliner bakery catering", "rumah makan coffee shop F&B"],
  "Hotel, travel & hospitality": ["hotel homestay travel wisata", "penginapan tour hospitality"],
  "Klinik & kesehatan": ["klinik dental apotek kesehatan", "dokter terapi medical"],
  "Kecantikan & wellness": ["salon barbershop spa kecantikan", "beauty clinic wellness"],
  "Pendidikan & kursus": ["sekolah swasta kursus training", "bimbel les pendidikan"],
  "Fitness & olahraga": ["gym fitness studio olahraga", "futsal badminton yoga pilates"],
  "Interior, furniture & arsitektur": ["interior furniture arsitek", "custom furniture desain interior"],
  "Kontraktor & properti": ["kontraktor developer properti", "renovasi konstruksi real estate"],
  "Retail & toko": ["retail toko distributor", "fashion elektronik toko spesialis"],
  Otomotif: ["bengkel dealer otomotif", "car wash detailing variasi mobil motor"],
  "Jasa profesional": ["konsultan agency legal akuntansi", "jasa profesional B2B"],
  "Laundry, percetakan & jasa lokal": ["laundry percetakan printing", "jasa lokal service rental"],
};
