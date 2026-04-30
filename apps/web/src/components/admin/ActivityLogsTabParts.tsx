"use client";

import { AlertCircle, CheckCircle, Edit, Filter, Info, LogIn, LogOut, Plus, Settings, Trash2 } from "lucide-react";
import { useI18n } from "@/app/providers";

export type LogType = "info" | "success" | "warning" | "error";
type ActionType = "login" | "logout" | "add" | "update" | "delete" | "settings" | "view";
type ResourceType = "orders" | "courses" | "categories" | "blog" | "users" | "settings" | "support" | "auth" | "system";

export const logTypeConfig: Record<LogType, { icon: React.ReactNode; color: string; bg: string }> = {
  success: { icon: <CheckCircle className="size-4" />, color: "text-green-600", bg: "bg-green-50" },
  info: { icon: <Info className="size-4" />, color: "text-blue-600", bg: "bg-blue-50" },
  warning: { icon: <AlertCircle className="size-4" />, color: "text-yellow-600", bg: "bg-yellow-50" },
  error: { icon: <Trash2 className="size-4" />, color: "text-red-600", bg: "bg-red-50" },
};

export const actionIcons: Record<ActionType, React.ReactNode> = {
  login: <LogIn className="size-3.5" />,
  logout: <LogOut className="size-3.5" />,
  add: <Plus className="size-3.5" />,
  update: <Edit className="size-3.5" />,
  delete: <Trash2 className="size-3.5" />,
  settings: <Settings className="size-3.5" />,
  view: <Info className="size-3.5" />,
};

export function resolveResourceKey(path: string): ResourceType {
  const normalized = path.toLowerCase();
  if (normalized.includes("/orders")) return "orders";
  if (normalized.includes("/courses")) return "courses";
  if (normalized.includes("/categories")) return "categories";
  if (normalized.includes("/blog")) return "blog";
  if (normalized.includes("/users")) return "users";
  if (normalized.includes("/settings")) return "settings";
  if (normalized.includes("/support")) return "support";
  if (normalized.includes("/auth")) return "auth";
  return "system";
}

export function resolveType(statusCode: number): LogType {
  if (statusCode >= 500) return "error";
  if (statusCode >= 400) return "warning";
  if (statusCode >= 200 && statusCode < 300) return "success";
  return "info";
}

export function resolveActionType(method: string, path: string): ActionType {
  const upper = method.toUpperCase();
  if (upper === "POST") return path.includes("/login") ? "login" : "add";
  if (upper === "PUT" || upper === "PATCH") return "update";
  if (upper === "DELETE") return "delete";
  return "view";
}

function getActionLabel(action: ActionType, tx: ReturnType<typeof useI18n>["tx"]) {
  if (action === "login") return tx("Login", "Đăng nhập");
  if (action === "logout") return tx("Logout", "Đăng xuất");
  if (action === "add") return tx("Add", "Thêm");
  if (action === "update") return tx("Update", "Cập nhật");
  if (action === "delete") return tx("Delete", "Xóa");
  if (action === "settings") return tx("Settings", "Cài đặt");
  return tx("View", "Xem");
}

function getResourceLabel(resource: ResourceType, tx: ReturnType<typeof useI18n>["tx"]) {
  if (resource === "orders") return tx("Orders", "Đơn hàng");
  if (resource === "courses") return tx("Courses", "Khóa học");
  if (resource === "categories") return tx("Categories", "Danh mục");
  if (resource === "blog") return tx("Blog", "Blog");
  if (resource === "users") return tx("Users", "Người dùng");
  if (resource === "settings") return tx("Settings", "Cài đặt");
  if (resource === "support") return tx("Support", "Hỗ trợ");
  if (resource === "auth") return tx("Auth", "Xác thực");
  return tx("System", "Hệ thống");
}

export function getActivityResourceLabel(resource: string, tx: ReturnType<typeof useI18n>["tx"]) {
  return getResourceLabel(resource as ResourceType, tx);
}

export function ActivityLogsStats({
  counts,
  filterType,
  onToggleType,
}: {
  counts: Record<LogType, number>;
  filterType: LogType | "all";
  onToggleType: (type: LogType) => void;
}) {
  const { tx } = useI18n();

  return (
    <div className="mb-6 grid grid-cols-4 gap-3">
      {(["success", "info", "warning", "error"] as LogType[]).map((type) => (
        <div
          key={type}
          className={`${logTypeConfig[type].bg} cursor-pointer rounded-lg border-2 p-3 text-center ${filterType === type ? "border-current" : "border-transparent"}`}
          onClick={() => onToggleType(type)}
        >
          <div className={`text-xl font-bold ${logTypeConfig[type].color}`}>{counts[type]}</div>
          <div className="mt-0.5 text-xs text-gray-600">
            {type === "success" && tx("Success", "Thành công")}
            {type === "info" && tx("Info", "Thông tin")}
            {type === "warning" && tx("Warning", "Cảnh báo")}
            {type === "error" && tx("Critical", "Nghiêm trọng")}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityLogsFilters({
  search,
  setSearch,
  filterResource,
  setFilterResource,
  resources,
}: {
  search: string;
  setSearch: (value: string) => void;
  filterResource: string;
  setFilterResource: (value: string) => void;
  resources: string[];
}) {
  const { tx } = useI18n();

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tx("Search logs...", "Tìm kiếm log...")}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-gray-400" />
        <select
          value={filterResource}
          onChange={(e) => setFilterResource(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {resources.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? tx("All modules", "Tất cả module") : getResourceLabel(r as ResourceType, tx)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ActivityLogsList({
  logs,
  formatTime,
}: {
  logs: {
    id: string | number;
    method: string;
    path: string;
    queryString?: string;
    userEmail: string;
    ipAddress: string;
    createdAt: string;
    durationMs: number;
    statusCode: number;
  }[];
  formatTime: (timestamp: string) => string;
}) {
  const { tx } = useI18n();

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const type = resolveType(log.statusCode);
        const resource = resolveResourceKey(log.path);
        const action = resolveActionType(log.method, log.path);
        const cfg = logTypeConfig[type];
        const actionLabel = getActionLabel(action, tx);
        const resourceLabel = getResourceLabel(resource, tx);
        return (
          <div key={log.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition hover:border-gray-200">
            <div className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{actionLabel}</span>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>{resourceLabel}</span>
                {actionIcons[action] ? <span className="text-gray-400">{actionIcons[action]}</span> : null}
              </div>
              <p className="text-sm text-gray-600">
                {log.method} {log.path}
                {log.queryString ? `?${log.queryString}` : ""}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                <span>{log.userEmail || tx("system", "system")}</span>
                <span>IP: {log.ipAddress}</span>
                <span>{formatTime(log.createdAt)}</span>
                <span>{log.durationMs}ms</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityLogsEmptyState() {
  const { tx } = useI18n();
  return (
    <div className="py-12 text-center text-gray-400">
      <AlertCircle className="mx-auto mb-3 size-10 opacity-50" />
      <p className="text-sm">{tx("No matching logs found.", "Không tìm thấy log nào phù hợp")}</p>
    </div>
  );
}
