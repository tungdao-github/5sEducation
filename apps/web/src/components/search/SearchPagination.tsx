"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function SearchPagination({ currentPage, totalPages, onPageChange }: Props) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Pager onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
        <ChevronLeft className="size-4" />
      </Pager>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
          const show = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);

          if (!show) {
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[40px] rounded-lg px-3 py-2 text-sm transition-colors ${
                currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
      <Pager onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
        <ChevronRight className="size-4" />
      </Pager>
    </div>
  );
}

function Pager({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
