import { egyptianGovernorates } from "./egypt";

export interface Country {
  code: string;
  name: string;
  nameAr: string;
  phoneCode: string;
  governorates: { name: string; nameAr: string; cities: string[]; citiesAr: string[] }[];
}

export const countries: Country[] = [
  {
    code: "EG",
    name: "Egypt",
    nameAr: "مصر",
    phoneCode: "+20",
    governorates: egyptianGovernorates.map((g) => ({
      name: g.name,
      nameAr: g.nameAr,
      cities: g.cities,
      citiesAr: g.citiesAr,
    })),
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    phoneCode: "+966",
    governorates: [
      { name: "Riyadh", nameAr: "الرياض", cities: ["Riyadh"], citiesAr: ["الرياض"] },
      { name: "Jeddah", nameAr: "جدة", cities: ["Jeddah"], citiesAr: ["جدة"] },
      { name: "Mecca", nameAr: "مكة", cities: ["Mecca"], citiesAr: ["مكة"] },
      { name: "Medina", nameAr: "المدينة", cities: ["Medina"], citiesAr: ["المدينة"] },
      { name: "Dammam", nameAr: "الدمام", cities: ["Dammam"], citiesAr: ["الدمام"] },
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    phoneCode: "+971",
    governorates: [
      { name: "Dubai", nameAr: "دبي", cities: ["Dubai"], citiesAr: ["دبي"] },
      { name: "Abu Dhabi", nameAr: "أبو ظبي", cities: ["Abu Dhabi"], citiesAr: ["أبو ظبي"] },
      { name: "Sharjah", nameAr: "الشارقة", cities: ["Sharjah"], citiesAr: ["الشارقة"] },
      { name: "Ajman", nameAr: "عجمان", cities: ["Ajman"], citiesAr: ["عجمان"] },
    ],
  },
  {
    code: "US",
    name: "United States",
    nameAr: "الولايات المتحدة",
    phoneCode: "+1",
    governorates: [
      { name: "New York", nameAr: "نيويورك", cities: ["New York City", "Buffalo"], citiesAr: ["مدينة نيويورك", "بافالو"] },
      { name: "California", nameAr: "كاليفورنيا", cities: ["Los Angeles", "San Francisco"], citiesAr: ["لوس أنجلوس", "سان فرانسيسكو"] },
      { name: "Texas", nameAr: "تكساس", cities: ["Houston", "Dallas"], citiesAr: ["هيوستن", "دالاس"] },
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    nameAr: "المملكة المتحدة",
    phoneCode: "+44",
    governorates: [
      { name: "England", nameAr: "إنجلترا", cities: ["London", "Manchester"], citiesAr: ["لندن", "مانشستر"] },
      { name: "Scotland", nameAr: "اسكتلندا", cities: ["Edinburgh", "Glasgow"], citiesAr: ["إدنبرة", "جلاسكو"] },
    ],
  },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getGovernoratesForCountry(countryCode: string) {
  const country = getCountryByCode(countryCode);
  return country?.governorates || [];
}

export function getCitiesForGovernorate(countryCode: string, governorateName: string) {
  const gov = getGovernoratesForCountry(countryCode).find(
    (g) => g.name === governorateName || g.nameAr === governorateName
  );
  return gov || null;
}
