"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  itemName?: string;
  hideOnSinglePage?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  loading = false,
  itemName = "events",
  hideOnSinglePage = false,
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

  if (totalItems === 0 || (hideOnSinglePage && totalPages <= 1)) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 pb-2 border-t border-blue-100/80 text-sm select-none">
      <div className="text-slate-500 font-medium text-xs sm:text-sm">
        Showing <span className="font-semibold text-slate-900">{startIndex}</span> to{" "}
        <span className="font-semibold text-slate-900">{endIndex}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalItems}</span> {itemName}
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1 || loading}
          className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Numbered Page Buttons */}
        {getPageNumbers().map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => typeof p === "number" && onPageChange(p)}
            disabled={p === "..." || loading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              p === currentPage
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-transparent font-bold"
                : p === "..."
                ? "cursor-default text-slate-400 bg-transparent border-transparent"
                : "bg-white border border-blue-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-xs"
            }`}
            aria-label={typeof p === "number" ? `Page ${p}` : "More pages"}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages || loading}
          className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
