'use client';

import React from 'react';

export default function Pagination({
    currentPage = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
}) {
    const isAll = pageSize === -1 || (totalItems > 0 && pageSize >= totalItems);
    const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = isAll ? 1 : Math.min(Math.max(1, currentPage), totalPages);

    const startItem = totalItems === 0 ? 0 : isAll ? 1 : (safeCurrentPage - 1) * pageSize + 1;
    const endItem = isAll ? totalItems : Math.min(safeCurrentPage * pageSize, totalItems);

    // Build page range with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let start = Math.max(2, safeCurrentPage - 1);
            let end = Math.min(totalPages - 1, safeCurrentPage + 1);

            if (safeCurrentPage <= 3) {
                end = 4;
            } else if (safeCurrentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const handlePageClick = (page) => {
        if (typeof page !== 'number' || page === safeCurrentPage) return;
        if (page >= 1 && page <= totalPages && onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100 text-xs text-slate-600 rounded-b-xl">
            {/* Left: Summary */}
            <div className="flex items-center gap-2">
                {isAll ? (
                    <span className="font-medium text-slate-500">
                        Showing all <b className="text-[#f47721] font-black">{totalItems}</b> entries
                    </span>
                ) : (
                    <span className="font-medium text-slate-500">
                        Showing <b className="text-slate-900 font-bold">{startItem}</b> to{' '}
                        <b className="text-slate-900 font-bold">{endItem}</b> of{' '}
                        <b className="text-[#f47721] font-black">{totalItems}</b> entries
                    </span>
                )}
            </div>

            {/* Right: Page Navigation Buttons */}
            {!isAll && totalPages > 1 && (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={() => handlePageClick(safeCurrentPage - 1)}
                        disabled={safeCurrentPage <= 1}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            safeCurrentPage <= 1
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                                : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-[#f47721] border-slate-200 hover:border-orange-300 shadow-2xs'
                        }`}
                        title="Previous Page"
                    >
                        <i className="ti ti-chevron-left text-xs" />
                        <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Numbered Page Buttons */}
                    {getPageNumbers().map((p, idx) => {
                        if (p === '...') {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="px-2 py-1 text-xs text-slate-400 font-bold select-none"
                                >
                                    ...
                                </span>
                            );
                        }
                        const isCurrent = p === safeCurrentPage;
                        return (
                            <button
                                key={`page-${p}`}
                                type="button"
                                onClick={() => handlePageClick(p)}
                                className={`min-w-[32px] h-8 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                    isCurrent
                                        ? 'bg-[#f47721] text-white border-[#f47721] shadow-sm shadow-orange-500/20'
                                        : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-[#f47721] border-slate-200 hover:border-orange-300'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={() => handlePageClick(safeCurrentPage + 1)}
                        disabled={safeCurrentPage >= totalPages}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            safeCurrentPage >= totalPages
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                                : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-[#f47721] border-slate-200 hover:border-orange-300 shadow-2xs'
                        }`}
                        title="Next Page"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <i className="ti ti-chevron-right text-xs" />
                    </button>
                </div>
            )}
        </div>
    );
}
