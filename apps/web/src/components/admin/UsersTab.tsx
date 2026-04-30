"use client";

import { useMemo, useState } from "react";
import type { AdminUserDto } from "@/services/api";
import {
  UsersEmptyState,
  UsersFilters,
  UsersStatsCards,
  UsersTable,
} from "@/components/admin/UsersTabParts";
import { fullName } from "@/components/admin/adminDashboardUtils";

type UsersTabProps = {
  users: AdminUserDto[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onChangeRole: (target: AdminUserDto, makeAdmin: boolean) => Promise<void>;
  onToggleLock: (target: AdminUserDto) => Promise<void>;
};

export default function UsersTab({
  users,
  searchQuery,
  setSearchQuery,
  onChangeRole,
  onToggleLock,
}: UsersTabProps) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const visible = useMemo(() => {
    return users
      .filter((entry) =>
        `${fullName(entry)} ${entry.email} ${entry.phoneNumber ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((entry) => {
        const roleMatches =
          roleFilter === "all" ? true : roleFilter === "admin" ? entry.isAdmin : entry.roles.some((role) => role.toLowerCase() === roleFilter);
        const statusMatches = statusFilter === "all" ? true : entry.status === statusFilter;
        return roleMatches && statusMatches;
      });
  }, [users, searchQuery, roleFilter, statusFilter]);

  return (
    <div>
      <UsersStatsCards users={users} />
      <UsersFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <UsersTable users={visible} onChangeRole={onChangeRole} onToggleLock={onToggleLock} />
      {visible.length === 0 ? <UsersEmptyState /> : null}
    </div>
  );
}
