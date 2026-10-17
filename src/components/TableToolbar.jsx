'use client';

import React from 'react';
import { exportToCsv, exportToExcel, printTable } from '@/lib/tableExport';

export default function TableToolbar({
    title = 'Records',
    columns = [],
    data = [],
    renderCell,
    search = '',
    onSearchChange,
    searchPlaceholder = 'Search records...',
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100, -1],
}) {
    const handleCsv = () => {
        exportToCsv({ filename: title, columns, data, renderCell });
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Exported ${data.length} records to CSV`,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    const handleExcel = () => {
        exportToExcel({ filename: title, columns, data, renderCell });
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Exported ${data.length} records to Excel`,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    const handlePrint = () => {
        printTable({ title, columns, data, renderCell, isPdf: false });
    };

    const handlePdf = () => {
        printTable({ title, columns, data, renderCell, isPdf: true });
    };

    return (
        <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Show per page selector (Show [10] entries / All pages) at the TOP */}
            {onPageSizeChange && (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1 shadow-2xs text-xs">
                    <span className="text-slate-500 font-semibold whitespace-nowrap">Show</span>
                    <select
                        value={pageSize ?? 10}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer py-0.5"
                        title="Show entries per page"
                    >
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt === -1 ? 'All' : opt}
                            </option>
                        ))}
                    </select>
                    <span className="text-slate-500 font-medium whitespace-nowrap hidden sm:inline">entries</span>
                </div>
            )}

            {/* Export Toolbar */}
            <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                <button
                    type="button"
                    onClick={handleCsv}
                    disabled={data.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Export to CSV"
                >
                    <i className="ti ti-file-spreadsheet text-emerald-600 text-sm" />
                    <span>CSV</span>
                </button>

                <div className="h-3.5 w-px bg-slate-200" />

                <button
                    type="button"
                    onClick={handleExcel}
                    disabled={data.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 hover:text-green-700 hover:bg-green-50 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Export to Excel"
                >
                    <i className="ti ti-file-type-xls text-green-600 text-sm" />
                    <span>Excel</span>
                </button>

                <div className="h-3.5 w-px bg-slate-200" />

                <button
                    type="button"
                    onClick={handlePrint}
                    disabled={data.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Print table"
                >
                    <i className="ti ti-printer text-blue-600 text-sm" />
                    <span>Print</span>
                </button>

                <div className="h-3.5 w-px bg-slate-200" />

                <button
                    type="button"
                    onClick={handlePdf}
                    disabled={data.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 hover:text-red-700 hover:bg-red-50 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Export as PDF"
                >
                    <i className="ti ti-file-type-pdf text-red-600 text-sm" />
                    <span>PDF</span>
                </button>
            </div>

            {/* Live Search Input */}
            {onSearchChange && (
                <div className="resource-search relative">
                    <i className="ti ti-search text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="text-xs text-slate-800 placeholder-slate-400 outline-none w-28 sm:w-36 focus:w-48 transition-all"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer ml-1"
                            title="Clear search"
                        >
                            <i className="ti ti-x" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
