"use client";

import { useState, useEffect } from "react";
import {
  Search, User as UserIcon, Mail, Phone, Calendar, Shield, CheckCircle,
  XCircle, Edit2, Trash2, UserPlus, Save, Ban, Unlock,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  isActive: boolean;
  isBanned?: boolean;
  banReason?: string;
  createdAt: string;
  addresses: Array<{
    id: string; label: string; firstName: string; lastName: string;
    address: string; city: string; state: string; zipCode: string; country: string;
  }>;
}

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", role: "", isActive: true });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, isActive: !isActive }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); }
      await fetchUsers();
    } catch (error) {
      console.error("Toggle active error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, isBanned: !isBanned, isActive: isBanned, banReason: isBanned ? "" : "Banned by admin" }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); }
      await fetchUsers();
    } catch (error) {
      console.error("Toggle ban error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); }
      await fetchUsers();
    } catch (error) {
      console.error("Change role error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); alert(d.error || "Failed"); }
      await fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error("Delete user error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id, ...editForm }),
      });
      await fetchUsers();
      setEditMode(false);
      // Refresh selected user
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        const updated = data.users.find((u: UserData) => u.id === selectedUser.id);
        if (updated) setSelectedUser(updated);
      }
    } catch (error) {
      console.error("Save edit error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (user: UserData) => {
    setEditForm({ name: user.name, phone: user.phone, role: user.role, isActive: user.isActive });
    setEditMode(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && user.isActive && !user.isBanned) ||
      (statusFilter === "disabled" && !user.isActive && !user.isBanned) ||
      (statusFilter === "banned" && user.isBanned);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{t("admin.users.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{t("admin.users.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <UserPlus className="w-4 h-4" />
          {users.length} {t("admin.users.title")}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder={t("admin.users.search")} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-luxury-gold/50 focus:border-transparent text-sm" />
          </div>
          <div className="relative">
            <Shield className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="ps-9 pe-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none text-sm">
              <option value="all">{t("admin.users.allRoles")}</option>
              <option value="admin">{t("admin.users.admin")}</option>
              <option value="customer">{t("admin.users.customer")}</option>
            </select>
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="ps-4 pe-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none text-sm">
              <option value="all">{t("admin.users.allStatus")}</option>
              <option value="active">{t("admin.users.active")}</option>
              <option value="disabled">{t("admin.users.inactive")}</option>
              <option value="banned">{t("admin.users.bannedLabel")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.users.user")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.users.contact")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.users.role")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.users.status")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.users.registered")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.users.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 lg:px-6 py-16 text-center">
                  <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{t("admin.users.noUsers")}</p>
                </td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 flex items-center justify-center shrink-0">
                          <UserIcon className="w-4 h-4 text-luxury-gold" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Phone className="w-3 h-3 shrink-0" />{user.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        <Shield className="w-3 h-3" />{user.role === "admin" ? t("admin.users.admin") : t("admin.users.customer")}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isBanned
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : user.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        {user.isBanned ? <><Ban className="w-3 h-3" />{t("admin.users.bannedLabel")}</> : user.isActive ? <><CheckCircle className="w-3 h-3" />{t("admin.users.active")}</> : <><XCircle className="w-3 h-3" />{t("admin.users.inactive")}</>}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setSelectedUser(user); startEdit(user); }}
                          className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors" title={t("common.edit")}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleActive(user.id, user.isActive)} disabled={actionLoading}
                          className={`p-1.5 rounded-lg transition-colors ${user.isActive ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"}`}
                          title={user.isActive ? t("admin.users.disableUser") : t("admin.users.enableUser")}>
                          {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button onClick={() => toggleBan(user.id, !!user.isBanned)} disabled={actionLoading}
                          className={`p-1.5 rounded-lg transition-colors ${user.isBanned ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"}`}
                          title={user.isBanned ? t("admin.users.unbanUser") : t("admin.users.banUser")}>
                          {user.isBanned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(user.id)} disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors" title={t("common.delete")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail/Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedUser(null); setEditMode(false); }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editMode ? t("admin.users.editUser") : t("admin.users.viewDetails")}
              </h2>
              <button onClick={() => { setSelectedUser(null); setEditMode(false); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {editMode ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">{t("common.name")}</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">{t("common.phone")}</label>
                      <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.users.role")}</label>
                      <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
                        <option value="customer">{t("admin.users.customer")}</option>
                        <option value="admin">{t("admin.users.admin")}</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isActive" checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold" />
                      <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">{t("admin.users.active")}</label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveEdit} disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
                      <Save className="w-4 h-4" />{t("common.save")}
                    </button>
                    <button onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">
                      {t("common.cancel")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.users.personalInfo")}</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
                      <p><span className="text-gray-500">{t("common.name")}:</span> <span className="font-medium">{selectedUser.name}</span></p>
                      <p><span className="text-gray-500">{t("common.email")}:</span> <span className="font-medium">{selectedUser.email}</span></p>
                      <p><span className="text-gray-500">{t("common.phone")}:</span> <span className="font-medium">{selectedUser.phone || "—"}</span></p>
                      <p><span className="text-gray-500">{t("admin.users.role")}:</span> <span className="font-medium capitalize">{selectedUser.role}</span></p>
                      <p><span className="text-gray-500">{t("admin.users.status")}:</span> <span className="font-medium">{selectedUser.isActive ? t("admin.users.active") : t("admin.users.inactive")}</span></p>
                      <p><span className="text-gray-500">{t("admin.users.registered")}:</span> <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</span></p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => startEdit(selectedUser)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />{t("admin.users.editUser")}
                    </button>
                    <button onClick={() => toggleActive(selectedUser.id, selectedUser.isActive)} disabled={actionLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedUser.isActive ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                      {selectedUser.isActive ? <><XCircle className="w-3.5 h-3.5" />{t("admin.users.disableUser")}</> : <><CheckCircle className="w-3.5 h-3.5" />{t("admin.users.enableUser")}</>}
                    </button>
                    <button onClick={() => toggleBan(selectedUser.id, !!selectedUser.isBanned)} disabled={actionLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedUser.isBanned ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                      {selectedUser.isBanned ? <><Unlock className="w-3.5 h-3.5" />{t("admin.users.unbanUser")}</> : <><Ban className="w-3.5 h-3.5" />{t("admin.users.banUser")}</>}
                    </button>
                    <button onClick={() => changeRole(selectedUser.id, selectedUser.role === "admin" ? "customer" : "admin")} disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors">
                      <Shield className="w-3.5 h-3.5" />
                      {selectedUser.role === "admin" ? t("admin.users.demoteToCustomer") : t("admin.users.promoteToAdmin")}
                    </button>
                    <button onClick={() => deleteUser(selectedUser.id)} disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />{t("common.delete")}
                    </button>
                  </div>

                  {/* Addresses */}
                  {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("account.addresses")}</h3>
                      <div className="space-y-3">
                        {selectedUser.addresses.map((address, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">{address.label || `Address ${index + 1}`}</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {address.firstName} {address.lastName}<br />
                              {address.address}<br />
                              {address.city}, {address.state} {address.zipCode}<br />
                              {address.country}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
