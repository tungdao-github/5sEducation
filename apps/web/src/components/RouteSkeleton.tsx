import clsx from "clsx";

type RouteSkeletonVariant = "list" | "detail" | "search" | "dashboard";

export function RouteSkeleton({ variant = "list" }: { variant?: RouteSkeletonVariant }) {
  if (variant === "detail") return <DetailSkeleton />;
  if (variant === "dashboard") return <DashboardSkeleton />;
  if (variant === "search") return <SearchSkeleton />;
  return <ListSkeleton />;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={clsx("animate-pulse rounded-2xl bg-slate-200/70", className)} />;
}

function ListSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-10 w-2/3 rounded-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <SkeletonBlock className="h-44 w-full rounded-[20px]" />
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-5 w-11/12" />
              <SkeletonBlock className="h-4 w-4/5" />
              <div className="flex items-center justify-between pt-2">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SkeletonBlock className="h-6 w-32 rounded-full" />
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-6 w-11/12" />
          <SkeletonBlock className="h-6 w-5/6" />
          <div className="flex flex-wrap gap-3 pt-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-28 rounded-full" />
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm">
          <SkeletonBlock className="h-64 w-full rounded-[24px]" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-8 w-2/3" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <SkeletonBlock className="h-7 w-56" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <SkeletonBlock key={itemIndex} className="h-4 w-full rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-12 w-full rounded-[24px]" />
          <SkeletonBlock className="h-12 w-full rounded-[24px]" />
          <SkeletonBlock className="h-40 w-full rounded-[28px]" />
        </div>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-12 w-2/3 rounded-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-10 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                <SkeletonBlock className="h-44 w-full rounded-[20px]" />
                <div className="mt-4 space-y-3">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-5 w-11/12" />
                  <SkeletonBlock className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-12 w-1/2 rounded-full" />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-4 h-10 w-24" />
            <SkeletonBlock className="mt-3 h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}