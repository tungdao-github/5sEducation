"use client";

import { Mail, Phone, Search } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { AdminUserDto } from "@/services/api";
import { fullName } from "@/components/admin/adminDashboardUtils";
import { toIntlLocale } from "@/components/admin/adminLocale";

const LEVEL_COLORS: Record<string, string> = {
  Platinum: "bg-purple-100 text-purple-700",
  Gold: "bg-yellow-100 text-yellow-700",
  Silver: "bg-gray-100 text-gray-600",
  Bronze: "bg-orange-100 text-orange-700",
};

export function UsersStatsCards({ users }: { users: AdminUserDto[] }) {
  const { tx } = useI18n();
  return (
    <div className="mb-5 grid grid-cols-3 gap-3">
      <div className="rounded-lg bg-blue-50 p-3 text-center">
        <p className="font-bold text-blue-700">{users.length}</p>
        <p className="text-xs text-gray-500">{tx("Users", "Người dùng")}</p>
      </div>
      <div className="rounded-lg bg-purple-50 p-3 text-center">
        <p className="font-bold text-purple-700">{users.filter((entry) => entry.isAdmin).length}</p>
        <p className="text-xs text-gray-500">{tx("Admins", "Quản trị viên")}</p>
      </div>
      <div className="rounded-lg bg-red-50 p-3 text-center">
        <p className="font-bold text-red-700">{users.filter((entry) => entry.status === "locked").length}</p>
        <p className="text-xs text-gray-500">{tx("Locked", "Đã khóa")}</p>
      </div>
    </div>
  );
}

export function UsersFilters({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}) {
  const { tx } = useI18n();
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={tx("Search users (name, email, phone)...", "Tìm người dùng (tên, email, phone)...")}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        value={roleFilter}
        onChange={(event) => setRoleFilter(event.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">{tx("All roles", "Tất cả vai trò")}</option>
        <option value="admin">{tx("Admin", "Admin")}</option>
        <option value="instructor">{tx("Instructor", "Giảng viên")}</option>
        <option value="user">{tx("Student", "Học viên")}</option>
      </select>
      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">{tx("All statuses", "Tất cả trạng thái")}</option>
        <option value="active">{tx("Active", "Hoạt động")}</option>
        <option value="locked">{tx("Locked", "Đang khóa")}</option>
      </select>
    </div>
  );
}

function UsersTableRow({
  entry,
  onChangeRole,
  onToggleLock,
}: {
  entry: AdminUserDto;
  onChangeRole: (target: AdminUserDto, makeAdmin: boolean) => Promise<void>;
  onToggleLock: (target: AdminUserDto) => Promise<void>;
}) {
  const { tx, locale } = useI18n();
  return (
    <tr className="transition hover:bg-gray-50">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white">
            {fullName(entry).charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{fullName(entry)}</p>
            {entry.status === "locked" ? <span className="text-xs text-red-500">{tx("Locked", "Đã khóa")}</span> : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="flex items-center gap-1 text-xs text-gray-700">
          <Mail className="size-3" />
          {entry.email}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
          <Phone className="size-3" />
          {entry.phoneNumber || tx("Not updated", "Chưa cập nhật")}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            entry.isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {entry.isAdmin ? tx("Admin", "🛡️ Admin") : tx("User", "👤 User")}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            LEVEL_COLORS[entry.loyaltyTier] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {entry.loyaltyTier || tx("Standard", "Standard")}
        </span>
      </td>
      <td className="px-4 py-3.5 text-sm">
        <span className="font-medium text-gray-900">{entry.loyaltyPoints.toLocaleString()} đ</span>
        <span className="mx-1 text-gray-400">·</span>
        <span className="text-blue-600">{entry.courseCount} KH</span>
      </td>
      <td className="px-4 py-3.5 text-xs text-gray-500">
        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString(toIntlLocale(locale)) : tx("Unknown", "Chưa rõ")}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => void onChangeRole(entry, !entry.isAdmin)}
            className="rounded p-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
          >
            {entry.isAdmin ? tx("Remove admin", "Bỏ admin") : tx("Grant admin", "Cấp admin")}
          </button>
          {entry.status === "locked" ? (
            <button
              onClick={() => void onToggleLock(entry)}
              className="rounded p-1.5 text-xs font-medium text-green-600 transition hover:bg-green-50"
            >
              {tx("Unlock", "Mở")}
            </button>
          ) : (
            <button
              onClick={() => void onToggleLock(entry)}
              className="rounded p-1.5 text-xs font-medium text-orange-500 transition hover:bg-orange-50"
            >
              {tx("Lock", "Khóa")}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function UsersTable({
  users,
  onChangeRole,
  onToggleLock,
}: {
  users: AdminUserDto[];
  onChangeRole: (target: AdminUserDto, makeAdmin: boolean) => Promise<void>;
  onToggleLock: (target: AdminUserDto) => Promise<void>;
}) {
  const { tx } = useI18n();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">{tx("User", "Người dùng")}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">{tx("Contact", "Liên hệ")}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">{tx("Role", "Vai trò")}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">{tx("Tier", "Cấp độ")}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">{tx("Points / Courses", "Điểm / KH")}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">{tx("Joined", "Ngày tham gia")}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">{tx("Actions", "Thao tác")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((entry) => (
            <UsersTableRow key={entry.id} entry={entry} onChangeRole={onChangeRole} onToggleLock={onToggleLock} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsersEmptyState() {
  const { tx } = useI18n();
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
      {tx("No matching users found.", "Không tìm thấy người dùng phù hợp.")}
    </div>
  );
}
