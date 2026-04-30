"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminAuditLogs, type AdminAuditLogDto } from "@/services/api";
import {
  ActivityLogsEmptyState,
  ActivityLogsFilters,
  ActivityLogsList,
  ActivityLogsStats,
  type LogType,
  resolveResourceKey,
  resolveType,
  resolveActionType,
} from "@/components/admin/ActivityLogsTabParts";

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState<AdminAuditLogDto[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<LogType | "all">("all");
  const [filterResource, setFilterResource] = useState("all");

  useEffect(() => {
    let active = true;
    fetchAdminAuditLogs({ take: 120 })
      .then((data) => {
        if (active) setLogs(data);
      })
      .catch(() => {
        if (active) setLogs([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const resources = useMemo(() => ["all", ...Array.from(new Set(logs.map((log) => resolveResourceKey(log.path))))], [logs]);

  const filtered = logs.filter((log) => {
    const resource = resolveResourceKey(log.path);
    const type = resolveType(log.statusCode);
    const action = resolveActionType(log.method, log.path);
    const detail = `${log.method} ${log.path} ${log.queryString}`.toLowerCase();
    const matchSearch =
      !search ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      action.toLowerCase().includes(search.toLowerCase()) ||
      detail.includes(search.toLowerCase());
    const matchType = filterType === "all" || type === filterType;
    const matchResource = filterResource === "all" || resource === filterResource;
    return matchSearch && matchType && matchResource;
  });

  const counts = useMemo(
    () =>
      ({
        success: logs.filter((l) => resolveType(l.statusCode) === "success").length,
        info: logs.filter((l) => resolveType(l.statusCode) === "info").length,
        warning: logs.filter((l) => resolveType(l.statusCode) === "warning").length,
        error: logs.filter((l) => resolveType(l.statusCode) === "error").length,
      }) satisfies Record<LogType, number>,
    [logs]
  );

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div>
      <ActivityLogsStats counts={counts} filterType={filterType} onToggleType={(type) => setFilterType(filterType === type ? "all" : type)} />
      <ActivityLogsFilters
        search={search}
        setSearch={setSearch}
        filterResource={filterResource}
        setFilterResource={setFilterResource}
        resources={resources}
      />

      {filtered.length > 0 ? <ActivityLogsList logs={filtered} formatTime={formatTime} /> : <ActivityLogsEmptyState />}
    </div>
  );
}
