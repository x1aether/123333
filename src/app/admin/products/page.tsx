"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Package,
  Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  category: string;
  stockStatus: string;
  stockQuantity: number;
  isPublished: boolean;
  isHidden: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  thumbnail: string;
  images: string[];
}

export default function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedBrand]);

  async function fetchProducts() {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedBrand) params.append("brand", selectedBrand);

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(productId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (response.ok) fetchProducts();
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
  }

  async function toggleHide(productId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !currentStatus }),
      });
      if (response.ok) fetchProducts();
    } catch (error) {
      console.error("Failed to toggle hide status:", error);
    }
  }

  async function toggleFeatured(productId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });
      if (response.ok) fetchProducts();
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
    }
  }

  async function _toggleBestSeller(productId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBestSeller: !currentStatus }),
      });
      if (response.ok) fetchProducts();
    } catch (error) {
      console.error("Failed to toggle best seller status:", error);
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm(t("admin.products.confirmDelete"))) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (response.ok) fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }

  const categories = [...new Set(products.map((p) => p.category))];
  const brands = [...new Set(products.map((p) => p.brand))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {t("admin.products.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            {t("admin.products.subtitle")}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-luxury-black to-gray-800 dark:from-luxury-white dark:to-gray-200 text-white dark:text-luxury-black rounded-lg hover:shadow-lg transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t("admin.products.add")}
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("admin.products.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-luxury-gold/50 focus:border-transparent transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all text-sm font-medium ${
              showFilters
                ? "border-luxury-gold bg-luxury-gold/10 text-luxury-gold"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            {t("common.filter")}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {t("admin.products.category")}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              >
                <option value="">{t("admin.products.allCategories")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {t("admin.products.brand")}
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              >
                <option value="">{t("admin.products.allBrands")}</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.products.title")}
                </th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.products.price")}
                </th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.products.stock")}
                </th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.products.status")}
                </th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("admin.products.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden shrink-0">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.brand}
                        </p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {product.isFeatured && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-medium">
                              {t("admin.products.featured")}
                            </span>
                          )}
                          {product.isBestSeller && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full font-medium">
                              {t("admin.products.bestSeller")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    {product.salePrice ? (
                      <div>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {product.salePrice} EGP
                        </p>
                        <p className="text-xs text-gray-400 line-through">
                          {product.price} EGP
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {product.price} EGP
                      </p>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.stockQuantity}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          product.stockStatus === "In Stock"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : product.stockStatus === "Low Stock"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {product.stockStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => togglePublish(product.id, product.isPublished)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.isPublished
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-700"
                        }`}
                        title={product.isPublished ? t("common.published") : t("common.draft")}
                      >
                        {product.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => toggleHide(product.id, product.isHidden)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.isHidden
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-700"
                        }`}
                        title={product.isHidden ? t("admin.products.hidden") : t("admin.products.visible")}
                      >
                        {product.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => toggleFeatured(product.id, product.isFeatured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.isFeatured
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-700"
                        }`}
                        title={t("admin.products.toggleFeatured")}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex gap-1.5">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                        title={t("common.edit")}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                        title={t("common.delete")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t("admin.products.noProducts")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
