"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  itemName?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  loading = false,
  itemName = "items"
}: PaginationProps) {
  // Ellipsis page number list generator
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const startIndex = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endIndex = Math.min(currentPage * limit, totalItems);

  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-[#E8C4B8]/20 text-xs text-[#2D1B3D]/70 font-semibold select-none">
      <div>
        Showing {startIndex}–{endIndex} of {totalItems} {itemName}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-3 py-2 bg-white border border-[#E8C4B8]/30 rounded-xl hover:bg-[#F0EBE8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[#2D1B3D]"
          aria-label="Previous page"
        >
          Previous
        </button>
        {getPageNumbers().map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => typeof p === "number" && onPageChange(p)}
            disabled={p === "..." || loading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              p === currentPage
                ? "bg-[#2D1B3D] text-white shadow-sm font-bold"
                : p === "..."
                ? "cursor-default text-[#2D1B3D]/40"
                : "bg-white border border-[#E8C4B8]/30 hover:bg-[#F0EBE8] text-[#2D1B3D]"
            }`}
            aria-label={typeof p === "number" ? `Page ${p}` : "Ellipsis"}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="px-3 py-2 bg-white border border-[#E8C4B8]/30 rounded-xl hover:bg-[#F0EBE8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-[#2D1B3D]"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}
