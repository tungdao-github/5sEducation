import { Search, UserCheck, UserPlus } from "lucide-react";
import { useI18n } from "@/app/providers";
import type { AdminUserDto } from "@/services/api";

type Props = {
  users: AdminUserDto[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onToggleInstructor: (target: AdminUserDto, enableInstructor: boolean) => Promise<void>;
};

function fullName(user: AdminUserDto) {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.email;
}

function hasInstructorRole(user: AdminUserDto) {
  return user.roles.some((role) => role.toLowerCase() === "instructor");
}

export default function InstructorsTab({ users, searchQuery, setSearchQuery, onToggleInstructor }: Props) {
  const { tx } = useI18n();
  const filtered = users.filter((entry) => {
    const term = searchQuery.toLowerCase();
    return `${fullName(entry)} ${entry.email} ${entry.roles.join(" ")}`.toLowerCase().includes(term);
  });

  const instructors = filtered.filter(hasInstructorRole);
  const nonInstructors = filtered.filter((entry) => !hasInstructorRole(entry));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-2xl font-semibold text-slate-950">{users.filter(hasInstructorRole).length}</div>
          <div className="mt-1 text-sm text-slate-500">{tx("Instructor accounts", "Tài khoản giảng viên")}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-2xl font-semibold text-slate-950">{users.filter((entry) => !hasInstructorRole(entry)).length}</div>
          <div className="mt-1 text-sm text-slate-500">{tx("Eligible users", "Có thể cấp quyền")}</div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={tx("Search instructors or users to grant access...", "Tìm giảng viên hoặc người dùng để cấp quyền...")}
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-slate-400 focus:outline-none"
        />
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{tx("Current instructors", "Đang là giảng viên")}</h3>
        <div className="space-y-3">
          {instructors.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{fullName(entry)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.email} • {entry.courseCount} {tx("courses", "khóa học")} • {entry.loyaltyTier}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onToggleInstructor(entry, false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700"
                >
                  <UserCheck className="size-3.5" />{tx("Revoke instructor", "Gỡ quyền giảng viên")}
                </button>
              </div>
            </div>
          ))}
          {instructors.length === 0 ? <div className="text-sm text-slate-500">{tx("No matching instructors.", "Không có giảng viên phù hợp.")}</div> : null}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{tx("Users eligible for grant", "Người dùng có thể cấp quyền")}</h3>
        <div className="space-y-3">
          {nonInstructors.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{fullName(entry)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.email} • {entry.roles.join(", ") || tx("User", "Người dùng")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void onToggleInstructor(entry, true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                >
                  <UserPlus className="size-3.5" />{tx("Grant instructor", "Cấp quyền giảng viên")}
                </button>
              </div>
            </div>
          ))}
          {nonInstructors.length === 0 ? <div className="text-sm text-slate-500">{tx("No more users to grant.", "Không còn user nào để cấp quyền.")}</div> : null}
        </div>
      </section>
    </div>
  );
}

