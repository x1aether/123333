"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { FilterState, FrameShape, Gender, Category } from "@/types";
import { brands, frameShapes, frameColors, lensColors, categories } from "@/data/constants";
import { defaultFilters, getTranslatedCategory, getTranslatedLabel, frameShapeTranslations, genderTranslations } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  productCount: number;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-medium tracking-wider uppercase"
      >
        {title}
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function CheckboxFilter({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-luxury-gold"
      />
      <span className="group-hover:text-luxury-gold transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-gray-400 text-xs ml-auto">({count})</span>
      )}
    </label>
  );
}

export function ShopFilters({ filters, onChange, productCount }: ShopFiltersProps) {
  const { language } = useLanguage();

  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const toggleArray = <T extends string>(
    arr: T[],
    value: T,
    key: keyof FilterState
  ) => {
    const newArr = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    update({ [key]: newArr } as Partial<FilterState>);
  };

  const activeFilterCount =
    filters.brands.length +
    filters.frameShapes.length +
    filters.materials.length +
    filters.frameColors.length +
    filters.lensColors.length +
    filters.genders.length +
    filters.categories.length +
    (filters.polarized !== null ? 1 : 0) +
    (filters.uvProtection !== null ? 1 : 0) +
    (filters.blueLightFilter !== null ? 1 : 0) +
    (filters.uv400 !== null ? 1 : 0) +
    (filters.newArrivals ? 1 : 0) +
    (filters.bestSellers ? 1 : 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg">{language === "ar" ? "التصفية" : "Filters"}</h3>
          <p className="text-sm text-gray-500">{productCount} {language === "ar" ? "منتجات" : "products"}</p>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={() => onChange(defaultFilters)}
            className="text-xs text-luxury-gold hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> {language === "ar" ? "مسح الكل" : "Clear all"}
          </button>
        )}
      </div>

      <FilterSection title={language === "ar" ? "تصفية سريعة" : "Quick Filters"}>
        <CheckboxFilter
          label={language === "ar" ? "وصل حديثاً" : "New Arrivals"}
          checked={filters.newArrivals}
          onChange={() => update({ newArrivals: !filters.newArrivals })}
        />
        <CheckboxFilter
          label={language === "ar" ? "الأكثر مبيعاً" : "Best Sellers"}
          checked={filters.bestSellers}
          onChange={() => update({ bestSellers: !filters.bestSellers })}
        />
        <CheckboxFilter
          label={language === "ar" ? "مستقطب" : "Polarized"}
          checked={filters.polarized === true}
          onChange={() =>
            update({
              polarized: filters.polarized === true ? null : true,
            })
          }
        />
        <CheckboxFilter
          label={language === "ar" ? "حماية UV400" : "UV400"}
          checked={filters.uv400 === true}
          onChange={() =>
            update({
              uv400:
                filters.uv400 === true ? null : true,
            })
          }
        />
        <CheckboxFilter
          label={language === "ar" ? "فلتر الضوء الأزرق" : "Blue Light Filter"}
          checked={filters.blueLightFilter === true}
          onChange={() =>
            update({
              blueLightFilter:
                filters.blueLightFilter === true ? null : true,
            })
          }
        />
      </FilterSection>

      <FilterSection title={language === "ar" ? "الفئة" : "Category"}>
        {categories.map((cat) => (
          <CheckboxFilter
            key={cat}
            label={getTranslatedCategory(cat, language)}
            checked={filters.categories.includes(cat as Category)}
            onChange={() =>
              toggleArray(filters.categories, cat as Category, "categories")
            }
          />
        ))}
      </FilterSection>

      <FilterSection title={language === "ar" ? "العلامة التجارية" : "Brand"}>
        {brands.map((brand) => (
          <CheckboxFilter
            key={brand}
            label={brand}
            checked={filters.brands.includes(brand)}
            onChange={() => toggleArray(filters.brands, brand, "brands")}
          />
        ))}
      </FilterSection>

      <FilterSection title={language === "ar" ? "نطاق السعر" : "Price Range"}>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={filters.priceMin}
            onChange={(e) =>
              update({ priceMin: Number(e.target.value) })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-transparent"
            placeholder="Min"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            value={filters.priceMax}
            onChange={(e) =>
              update({ priceMax: Number(e.target.value) })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-transparent"
            placeholder="Max"
          />
        </div>
      </FilterSection>

      <FilterSection title={language === "ar" ? "شكل الإطار" : "Frame Shape"}>
        {frameShapes.map((shape) => (
          <CheckboxFilter
            key={shape}
            label={getTranslatedLabel(frameShapeTranslations, shape, language)}
            checked={filters.frameShapes.includes(shape as FrameShape)}
            onChange={() =>
              toggleArray(
                filters.frameShapes,
                shape as FrameShape,
                "frameShapes"
              )
            }
          />
        ))}
      </FilterSection>

      <FilterSection title={language === "ar" ? "لون الإطار" : "Frame Color"} defaultOpen={false}>
        {frameColors.map((color) => (
          <CheckboxFilter
            key={color}
            label={color}
            checked={filters.frameColors.includes(color)}
            onChange={() =>
              toggleArray(filters.frameColors, color, "frameColors")
            }
          />
        ))}
      </FilterSection>

      <FilterSection title={language === "ar" ? "لون العدسة" : "Lens Color"} defaultOpen={false}>
        {lensColors.map((color) => (
          <CheckboxFilter
            key={color}
            label={color}
            checked={filters.lensColors.includes(color)}
            onChange={() =>
              toggleArray(filters.lensColors, color, "lensColors")
            }
          />
        ))}
      </FilterSection>

      <FilterSection title={language === "ar" ? "الجنس" : "Gender"} defaultOpen={false}>
        {(["Men", "Women", "Unisex"] as Gender[]).map((gender) => (
          <CheckboxFilter
            key={gender}
            label={getTranslatedLabel(genderTranslations, gender, language)}
            checked={filters.genders.includes(gender)}
            onChange={() => toggleArray(filters.genders, gender, "genders")}
          />
        ))}
      </FilterSection>
    </div>
  );
}
