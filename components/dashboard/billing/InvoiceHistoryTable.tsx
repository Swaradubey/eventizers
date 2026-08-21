"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Invoice } from "../../../services/billingService";
import { Download, Loader2, AlertCircle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export interface InvoiceHistoryTableProps {
  invoices?: Invoice[];
  loading?: boolean;
  error?: string | null;
  onDownload?: (invoiceId: string) => Promise<void> | void;
  downloadingInvoiceId?: string | null;
  onDelete?: (invoice: Invoice) => Promise<void> | void;
  deletingInvoiceId?: string | null;
  itemsPerPage?: number;
  currentPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

export default function InvoiceHistoryTable({
  invoices = [],
  loading = false,
  error = null,
  onDownload,
  downloadingInvoiceId = null,
  onDelete,
  deletingInvoiceId = null,
  itemsPerPage: initialItemsPerPage = 5,
  currentPage: controlledPage,
  totalCount: controlledTotalCount,
  onPageChange,
}: InvoiceHistoryTableProps) {
  const [internalPage, setInternalPage] = useState(1);
  const [itemsPerPage] = useState(initialItemsPerPage);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledPage !== undefined;
  const activePage = isControlled ? controlledPage : internalPage;

  const totalItems = controlledTotalCount !== undefined ? controlledTotalCount : invoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ensure active page is within bounds when list length changes
  useEffect(() => {
    if (!isControlled && internalPage > totalPages && totalPages > 0) {
      setInternalPage(totalPages);
    }
  }, [totalPages, internalPage, isControlled]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && invoiceToDelete && !isDeletingLocal) {
        setInvoiceToDelete(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [invoiceToDelete, isDeletingLocal]);

  const handlePageChange = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    if (targetPage === activePage) return;

    if (isControlled) {
      onPageChange?.(targetPage);
    } else {
      setInternalPage(targetPage);
      onPageChange?.(targetPage);
    }

    // Smoothly scroll table into view
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      setIsDeletingLocal(true);
      await onDelete?.(invoiceToDelete);
      setInvoiceToDelete(null);
    } catch (err) {
      console.error("Delete invoice error:", err);
    } finally {
      setIsDeletingLocal(false);
    }
  };

  // Sliced invoices for current page (when not using server-side pagination)
  const displayedInvoices = useMemo(() => {
    if (controlledTotalCount !== undefined && controlledTotalCount !== invoices.length) {
      // Server-side paginated list passed directly
      return invoices;
    }
    const startIndex = (activePage - 1) * itemsPerPage;
    return invoices.slice(startIndex, startIndex + itemsPerPage);
  }, [invoices, activePage, itemsPerPage, controlledTotalCount]);

  // Generate page numbers with ellipses
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (activePage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (activePage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages];
  }, [activePage, totalPages]);

  const startIndex = totalItems === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(activePage * itemsPerPage, totalItems);

  return (
    <div ref={tableContainerRef} className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold font-display text-[#2D1B3D]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Invoice History
        </h2>
        <p className="text-xs font-bold text-[#2D1B3D]/50 mt-1">
          View and download your past billing transactions.
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm animate-pulse h-64" />
      ) : error ? (
        <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-48">
          <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
          <p className="text-xs font-semibold text-[#2D1B3D]">{error || "Failed to load invoices"}</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8C4B8]/20 text-black font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Invoice Number</th>
                  <th className="py-3 px-5">Plan</th>
                  <th className="py-3 px-5">Billing Period</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Transaction ID</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8C4B8]/10">
                {displayedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#2D1B3D]/50 font-medium">
                      No invoices available.
                    </td>
                  </tr>
                ) : (
                  displayedInvoices.map((invoice) => {
                    const targetId = invoice.invoiceNumber || invoice.id || invoice.transactionId || "";
                    const isDownloading = downloadingInvoiceId === targetId;
                    const isDeletingThis = deletingInvoiceId === targetId || (isDeletingLocal && invoiceToDelete?.id === invoice.id);

                    return (
                      <tr key={invoice.id} className="hover:bg-[#FAF8F5]/30 transition-colors">
                        <td className="py-3 px-5 font-semibold text-[#2D1B3D]">
                          {invoice.invoiceNumber || invoice.id}
                        </td>
                        <td className="py-3 px-5 font-bold text-black">
                          {invoice.planName || "Pro"}
                        </td>
                        <td className="py-3 px-5 text-[11px] font-bold text-black">
                          {invoice.billingPeriod || "Monthly"}
                        </td>
                        <td className="py-3 px-5 text-black font-bold">
                          <div>{invoice.customerName || "Customer"}</div>
                          <div className="text-[10px] font-bold text-black">{invoice.customerEmail}</div>
                        </td>
                        <td className="py-3 px-5 font-semibold text-[#2D1B3D]">
                          {invoice.currency === "USD" ? "$" : invoice.currency}
                          {typeof invoice.amount === "number" ? invoice.amount.toFixed(2) : invoice.amount}
                        </td>
                        <td className="py-3 px-5 font-mono text-[10px] font-bold text-black">
                          {invoice.transactionId || "-"}
                        </td>
                        <td className="py-3 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              invoice.status === "Paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Download Button */}
                            <button
                              onClick={() => onDownload?.(targetId)}
                              disabled={isDownloading || isDeletingThis || !onDownload}
                              className="p-1.5 text-[#C9A84C] hover:text-[#2D1B3D] hover:bg-[#FAF8F5] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-[#E8C4B8]/10 transition-colors inline-flex items-center justify-center"
                              title="Download Invoice PDF"
                              aria-label={`Download invoice ${invoice.invoiceNumber || invoice.id}`}
                            >
                              {isDownloading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Safe Delete Button */}
                            <button
                              onClick={() => setInvoiceToDelete(invoice)}
                              disabled={isDeletingThis || isDownloading || !onDelete}
                              className="hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-slate-400 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Invoice Record"
                              aria-label={`Delete invoice ${invoice.invoiceNumber || invoice.id}`}
                            >
                              {isDeletingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="border-t border-slate-200/80 px-5 py-3.5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
            {/* Left side: Results Count / Range */}
            <div className="text-xs text-slate-500 font-medium">
              {totalItems === 0 ? (
                "Showing 0 results"
              ) : (
                <>
                  Showing <span className="font-semibold text-slate-700">{startIndex}</span> to{" "}
                  <span className="font-semibold text-slate-700">{endIndex}</span> of{" "}
                  <span className="font-semibold text-slate-700">{totalItems}</span> results
                </>
              )}
            </div>

            {/* Right side: Navigation & Page Numbers */}
            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(activePage - 1)}
                disabled={activePage <= 1 || totalItems === 0}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {/* Page Number Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {pageNumbers.map((page, index) => {
                  if (typeof page === "string") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 py-1.5 text-xs text-slate-400 font-medium"
                      >
                        {page}
                      </span>
                    );
                  }

                  const isActive = page === activePage;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[32px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`Page ${page}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Current Page Indicator */}
              <div className="sm:hidden text-xs font-medium text-slate-600 px-2">
                {activePage} / {totalPages}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(activePage + 1)}
                disabled={activePage >= totalPages || totalItems === 0}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {invoiceToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => {
            if (!isDeletingLocal) {
              setInvoiceToDelete(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-invoice-modal-title"
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 id="delete-invoice-modal-title" className="text-base font-bold text-slate-900">
                  Delete Invoice Record
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Are you sure you want to remove this invoice record (
                  <span className="font-semibold text-slate-900">
                    {invoiceToDelete.invoiceNumber || invoiceToDelete.id}
                  </span>
                  ) from your history? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingLocal}
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-transparent rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingLocal}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingLocal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

