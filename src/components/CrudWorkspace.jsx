'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';

export default function CrudWorkspace({
    title,
    eyebrow,
    description,
    endpoint,
    fields = [],
    columns = [],
    mapRow = (item, key) => item[key] || '—',
    mapForm = (form) => form,
    initialForm = {},
    readOnly = false,
    canDelete = true,
    customAction,
}) {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const toast = (icon, text) => {
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title: text,
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
            });
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            const response = await axios.get(endpoint);
            setItems(response.data.data || response.data || []);
        } catch (error) {
            toast('error', error.response?.status === 403 ? 'You do not have access to this section.' : 'Could not load data from the API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [endpoint]);

    const startEdit = (item) => {
        setEditingItem(item);
        const populated = { ...initialForm };
        fields.forEach((f) => {
            if (item[f.name] !== undefined && item[f.name] !== null) {
                populated[f.name] = item[f.name];
            }
        });
        setForm(populated);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setForm(initialForm);
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            if (editingItem) {
                await axios.put(`${endpoint}/${editingItem.id}`, mapForm(form));
                toast('success', `${title.slice(0, -1)} updated successfully`);
                setEditingItem(null);
            } else {
                await axios.post(endpoint, mapForm(form));
                toast('success', `${title.slice(0, -1)} created successfully`);
            }
            setForm(initialForm);
            load();
        } catch (error) {
            const errors = error.response?.data?.errors;
            const message = error.response?.data?.message;
            toast('error', errors ? Object.values(errors).flat().join(' ') : (message || 'Could not save this record.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.Swal) {
            const res = await window.Swal.fire({
                title: 'Delete this record?',
                text: 'This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f47721',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete',
            });
            if (!res.isConfirmed) return;
        } else if (!confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            await axios.delete(`${endpoint}/${id}`);
            toast('success', 'Record deleted successfully');
            if (editingItem?.id === id) {
                cancelEdit();
            }
            load();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not delete record');
        }
    };

    const filteredItems = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
    }, [items, search]);

    const paginatedItems = useMemo(() => {
        if (pageSize === -1 || pageSize >= filteredItems.length) return filteredItems;
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage, pageSize]);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">{eyebrow}</span>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {customAction}
                    <button type="button" className="access-refresh" onClick={load}>
                        <i className="ti ti-refresh" /> Refresh
                    </button>
                </div>
            </div>

            <div className={`resource-layout ${readOnly ? 'single' : ''}`}>
                {!readOnly && (
                    <form className="access-panel create-panel" onSubmit={submit}>
                        <span className="access-kicker">{editingItem ? 'EDIT RECORD' : 'CREATE NEW'}</span>
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="mb-0">{editingItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1).toLowerCase()}`}</h2>
                            {editingItem && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="text-[11px] font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center"
                                >
                                    <i className="ti ti-x mr-1 text-xs" />Cancel Edit
                                </button>
                            )}
                        </div>
                        <p>{editingItem ? `Editing record #${editingItem.id}. Modify attributes and click update.` : 'Enter the details below matching your database attributes.'}</p>

                        {fields.map((field) => (
                            <label key={field.name} className="block mb-3">
                                <span className="block text-xs font-bold text-gray-700 mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </span>
                                {field.type === 'select' ? (
                                    <select
                                        className="access-input"
                                        value={form[field.name] ?? ''}
                                        onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                                        required={field.required}
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options?.map((option) => (
                                            <option value={option.value} key={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        className="access-input min-h-[74px]"
                                        value={form[field.name] ?? ''}
                                        onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                ) : field.type === 'checkbox' ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="checkbox"
                                            id={field.name}
                                            checked={Boolean(form[field.name])}
                                            onChange={(event) => setForm({ ...form, [field.name]: event.target.checked })}
                                            className="w-4 h-4 accent-[#f47721]"
                                        />
                                        <label htmlFor={field.name} className="text-xs text-gray-600 cursor-pointer">
                                            {field.checkboxLabel || 'Active'}
                                        </label>
                                    </div>
                                ) : (
                                    <input
                                        className="access-input"
                                        type={field.type || 'text'}
                                        value={form[field.name] ?? ''}
                                        onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        min={field.min}
                                        step={field.step}
                                    />
                                )}
                            </label>
                        ))}

                        <button className="access-submit" type="submit" disabled={submitting}>
                            {submitting ? 'Saving...' : editingItem ? `Update ${title.slice(0, -1)}` : `Create ${title.slice(0, -1).toLowerCase()}`}
                            <i className="ti ti-arrow-up-right ml-1" />
                        </button>
                    </form>
                )}

                <section className="access-panel records-panel">
                    <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <span className="access-kicker">DIRECTORY</span>
                            <h2>
                                {title} <small className="resource-total">({filteredItems.length})</small>
                            </h2>
                        </div>
                        <TableToolbar
                            title={title}
                            columns={columns}
                            data={filteredItems}
                            renderCell={mapRow}
                            search={search}
                            onSearchChange={(val) => {
                                setSearch(val);
                                setCurrentPage(1);
                            }}
                            searchPlaceholder={`Search ${title.toLowerCase()}...`}
                            pageSize={pageSize}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setCurrentPage(1);
                            }}
                            currentPage={currentPage}
                            totalItems={filteredItems.length}
                            onPageChange={setCurrentPage}
                        />
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading records...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        {columns.map((column) => (
                                            <th key={column.key}>{column.label}</th>
                                        ))}
                                        {!readOnly && <th className="text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((item) => (
                                        <tr key={item.id}>
                                            {columns.map((column) => (
                                                <td key={column.key}>{mapRow(item, column.key)}</td>
                                            ))}
                                            {!readOnly && (
                                                <td className="text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(item)}
                                                        className="text-gray-400 hover:text-[#f47721] transition-colors p-1.5 mr-1 rounded hover:bg-orange-50"
                                                        title="Edit this record"
                                                    >
                                                        <i className="ti ti-edit text-base" />
                                                    </button>
                                                    {canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                                                            title="Delete this record"
                                                        >
                                                            <i className="ti ti-trash text-base" />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredItems.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No records found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination Footer */}
                    {!loading && filteredItems.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredItems.length}
                            pageSize={pageSize}
                            onPageChange={(p) => setCurrentPage(p)}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </section>
            </div>
        </div>
    );
}
