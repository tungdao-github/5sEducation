"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, AlertCircle, CheckCircle, Info, Trash2, Edit, Plus, LogIn, LogOut, Settings } from "lucide-react";
import { fetchAdminAuditLogs, type AdminAuditLogDto } from "../../data/api";

type LogType = "info" | "success" | "warning" | "error";

const logTypeConfig: Record<LogType, { icon: React.ReactNode; color: string; bg: string }> = {
  success: { icon: <CheckCircle className="size-4" />, color: "text-green-600", bg: "bg-green-50" },
  info: { icon: <Info className="size-4" />, color: "text-blue-600", bg: "bg-blue-50" },
  warning: { icon: <AlertCircle className="size-4" />, color: "text-yellow-600", bg: "bg-yellow-50" },
  error: { icon: <Trash2 className="size-4" />, color: "text-red-600", bg: "bg-red-50" },
};

const actionIcons: Record<string, React.ReactNode> = {
  "Đăng nhập": <LogIn className="size-3.5" />,
  "Đăng xuất": <LogOut className="size-3.5" />,
  "Thêm": <Plus className="size-3.5" />,
  "Cập nhật": <Edit className="size-3.5" />,
  "Xóa": <Trash2 className="size-3.5" />,
  "Cấu hình": <Settings className="size-3.5" />,
};

function resolveResource(path: string) {
  const normalized = path.toLowerCase();
  if (normalized.includes("/orders")) return "Orders";
  if (normalized.includes("/courses")) return "Courses";
  if (normalized.includes("/categories")) return "Categories";
  if (normalized.includes("/blog")) return "Blog";
  if (normalized.includes("/users")) return "Users";
  if (normalized.includes("/settings")) return "Settings";
  if (normalized.includes("/support")) return "Support";
  if (normalized.includes("/auth")) return "Auth";
  return "System";
}

function resolveType(statusCode: number): LogType {
  if (statusCode >= 500) return "error";
  if (statusCode >= 400) return "warning";
  if (statusCode >= 200 && statusCode < 300) return "success";
  return "info";
}

function resolveAction(method: string, path: string) {
  const upper = method.toUpperCase();
  if (upper === "POST") return path.includes("/login") ? "Đăng nhập" : "Thêm";
  if (upper === "PUT" || upper === "PATCH") return "Cập nhật";
  if (upper === "DELETE") return "Xóa";
  return "Xem";
}

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState<AdminAuditLogDto[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<LogType | "all">("all");
  const [filterResource, setFilterResource] = useState("all");

  useEffect(() => {
    let active = true;
    fetchAdminAuditLogs({ take: 120 })
      .then((data) => {
        if (!active) return;
        setLogs(data);
      })
      .catch(() => {
        if (!active) return;
        setLogs([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const resources = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => set.add(resolveResource(log.path)));
    return ["all", ...Array.from(set)];
  }, [logs]);

  const filtered = logs.filter((log) => {
    const resource = resolveResource(log.path);
    const type = resolveType(log.statusCode);
    const action = resolveAction(log.method, log.path);
    const detail = `${log.method} ${log.path} ${log.queryString}`.toLowerCase();
    const matchSearch = !search
      || log.userEmail.toLowerCase().includes(search.toLowerCase())
      || action.toLowerCase().includes(search.toLowerCase())
      || detail.includes(search.toLowerCase());
    const matchType = filterType === "all" || type === filterType;
    const matchResource = filterResource === "all" || resource === filterResource;
    return matchSearch && matchType && matchResource;
  });

  const counts = useMemo(() => {
    return {
      success: logs.filter((l) => resolveType(l.statusCode) === "success").length,
      info: logs.filter((l) => resolveType(l.statusCode) === "info").length,
      warning: logs.filter((l) => resolveType(l.statusCode) === "warning").length,
      error: logs.filter((l) => resolveType(l.statusCode) === "error").length,
    };
  }, [logs]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(["success", "info", "warning", "error"] as LogType[]).map((type) => (
          <div
            key={type}
            className={`${logTypeConfig[type].bg} rounded-lg p-3 text-center cursor-pointer border-2 ${filterType === type ? "border-current" : "border-transparent"}`}
            onClick={() => setFilterType(filterType === type ? "all" : type)}
          >
            <div className={`text-xl font-bold ${logTypeConfig[type].color}`}>{counts[type]}</div>
            <div className="text-xs text-gray-600 mt-0.5">
              {type === "success" && "Thành công"}
              {type === "info" && "Thông tin"}
              {type === "warning" && "Cảnh báo"}
              {type === "error" && "Nghiêm trọng"}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm log..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-gray-400" />
          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {resources.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "Tất cả module" : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((log) => {
          const type = resolveType(log.statusCode);
          const resource = resolveResource(log.path);
          const action = resolveAction(log.method, log.path);
          const cfg = logTypeConfig[type];
          return (
            <div key={log.id} className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition">
              <div className={`size-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{action}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color}`}>{resource}</span>
                  {actionIcons[action] && <span className="text-gray-400">{actionIcons[action]}</span>}
                </div>
                <p className="text-sm text-gray-600">{log.method} {log.path}{log.queryString ? `?${log.queryString}` : ""}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{log.userEmail || "system"}</span>
                  <span>IP: {log.ipAddress}</span>
                  <span>{formatTime(log.createdAt)}</span>
                  <span>{log.durationMs}ms</span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="size-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Không tìm thấy log nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
