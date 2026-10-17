'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';

export default function ApiResourcePage({
    title,
    eyebrow,
    description,
    endpoint,
    fields = [],
    columns = [],
    formTitle = 'Create record',
    transform = (form) => form,
    renderCell = (item, key) => item[key] ?? '—',
}) {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(Object.fromEntries(fields.map((field) => [field.name, field.default ?? ''])));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const toast = (icon, title) =>
        window.Swal?.fire({
            toast: true,
            position: 'top-end',
            icon,
            title,
            showConfirmButton: false,
            showCloseButton: true,
            timer: 4000,
            timerProgressBar: true,
        });

    const load = async () => {
        setLoading(true);
        try {
            const response = await axios.get(endpoint);
            const data = response.data.data;
            setItems(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            toast('error', error.response?.status === 403 ? 'You do not have access to this section.' : 'Could not load data from the API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [endpoint]);

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await axios.post(endpoint, transform(form));
            toast('success', `${formTitle} successful`);
            setForm(Object.fromEntries(fields.map((field) => [field.name, field.default ?? ''])));
            load();
        } catch (error) {
            const errors = error.response?.data?.errors;
            toast('error', errors ? Object.values(errors).flat().join(' ') : error.response?.data?.message || 'Could not save this record.');
        } finally {
            setSaving(false);
        }
    };

    // Filter items based on search query
    const visible = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
    }, [items, search]);

    // Paginated slice
    const paginatedItems = useMemo(() => {
        if (pageSize === -1 || pageSize >= visible.length) return visible;
        const start = (currentPage - 1) * pageSize;
        return visible.slice(start, start + pageSize);
    }, [visible, currentPage, pageSize]);

    // Handle search change
    const handleSearchChange = (val) => {
        setSearch(val);
        setCurrentPage(1);
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">{eyebrow}</span>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
                <button type="button" className="access-refresh" onClick={load}>
                    <i className="ti ti-refresh" />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="resource-layout">
                {/* Create Record Form */}
                <form className="access-panel create-panel" onSubmit={submit}>
                    <span className="access-kicker">CREATE NEW</span>
                    <h2>{formTitle}</h2>
                    <p>Enter the details below to continue.</p>

                    {fields.map((field) => (
                        <label key={field.name}>
                            {field.label}
                            {field.type === 'select' ? (
                                <select
                                    className="access-input"
                                    value={form[field.name]}
                                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                                    required={field.required}
                                >
                                    <option value="">Select {field.label.toLowerCase()}</option>
                                    {field.options?.map((option) => (
                                        <option value={option.value} key={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className="access-input"
                                    type={field.type || 'text'}
                                    value={form[field.name]}
                                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    min={field.min}
                                    step={field.step}
                                />
                            )}
                        </label>
                    ))}

                    <button className="access-submit" disabled={saving} type="submit">
                        {saving ? 'Saving...' : formTitle}
                        <i className="ti ti-arrow-up-right" />
                    </button>
                </form>

                {/* Records Table Directory */}
                <section className="access-panel records-panel flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">DIRECTORY</span>
                                <h2>
                                    {title} <small className="resource-total">({visible.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title={title}
                                columns={columns}
                                data={visible}
                                renderCell={renderCell}
                                search={search}
                                onSearchChange={handleSearchChange}
                                searchPlaceholder={`Search ${title.toLowerCase()}...`}
                                pageSize={pageSize}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                                currentPage={currentPage}
                                totalItems={visible.length}
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((item) => (
                                            <tr key={item.id}>
                                                {columns.map((column) => (
                                                    <td key={column.key}>{renderCell(item, column.key)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {visible.length === 0 && (
                                    <div className="access-empty small">
                                        <i className="ti ti-inbox" />
                                        <p>No records found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {!loading && visible.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={visible.length}
                            pageSize={pageSize}
                            onPageChange={(page) => setCurrentPage(page)}
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
