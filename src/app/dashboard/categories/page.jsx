'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from '@/lib/axios';
import Pagination from '@/components/Pagination';
import TableToolbar from '@/components/TableToolbar';
import Select2 from '@/components/Select2';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        is_active: true,
        branch_id: '',
    });

    const toast = (icon, text) => {
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title: text,
                showConfirmButton: false,
                showCloseButton: true,
                timer: 4000,
                timerProgressBar: true,
            });
        }
    };

    const extractArray = (res) => {
        if (!res || !res.data) return [];
        if (Array.isArray(res.data.data?.data)) return res.data.data.data;
        if (Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray(res.data)) return res.data;
        return [];
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, branchRes] = await Promise.all([
                axios.get('/api/categories').catch(() => ({ data: { data: [] } })),
                axios.get('/api/branches').catch(() => ({ data: { data: [] } })),
            ]);
            setCategories(extractArray(catRes));
            setBranches(extractArray(branchRes));
        } catch {
            toast('error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const resetForm = () => {
        setForm({
            name: '',
            slug: '',
            parent_id: '',
            description: '',
            is_active: true,
            branch_id: '',
        });
        setEditingItem(null);
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name || '',
            slug: item.slug || '',
            parent_id: item.parent_id ? String(item.parent_id) : '',
            description: item.description || '',
            is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
            branch_id: item.branch_id ? String(item.branch_id) : '',
        });
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast('error', 'Category name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim() || null,
                parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
                description: form.description.trim() || null,
                is_active: Boolean(form.is_active),
            };
            if (form.branch_id) {
                payload.branch_id = parseInt(form.branch_id, 10);
            }

            if (editingItem) {
                await axios.put(`/api/categories/${editingItem.id}`, payload);
                toast('success', 'Category updated successfully');
            } else {
                await axios.post('/api/categories', payload);
                toast('success', 'Category created successfully');
            }

            resetForm();
            loadData();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const message = err.response?.data?.message;
            toast('error', errors ? Object.values(errors).flat().join(' ') : (message || 'Could not save category.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (window.Swal) {
            const res = await window.Swal.fire({
                title: 'Delete this category?',
                text: 'Make sure no child categories or products are linked to it.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
            });
            if (!res.isConfirmed) return;
        } else if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            await axios.delete(`/api/categories/${categoryId}`);
            toast('success', 'Category deleted successfully');
            if (editingItem?.id === categoryId) {
                resetForm();
            }
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not delete category');
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return categories;
        const q = search.toLowerCase();
        return categories.filter((item) =>
            item.name?.toLowerCase().includes(q) ||
            item.slug?.toLowerCase().includes(q) ||
            item.parent?.name?.toLowerCase().includes(q)
        );
    }, [categories, search]);

    const paginatedCategories = useMemo(() => {
        if (pageSize === -1 || pageSize >= filtered.length) return filtered;
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const categoryColumns = [
        { key: 'sl', label: 'SL' },
        { key: 'name', label: 'Category Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'parent', label: 'Parent Category' },
        { key: 'is_active', label: 'Status' },
    ];

    const renderCategoryCell = (item, key, idx) => {
        switch (key) {
            case 'sl':
                return idx !== undefined ? idx + 1 : (item.id ?? '—');
            case 'name':
                return item.name || '—';
            case 'slug':
                return item.slug || '—';
            case 'parent':
                return item.parent?.name || 'Root Category';
            case 'is_active':
                return item.is_active ? 'Active' : 'Inactive';
            default:
                return item[key] ?? '—';
        }
    };

    // Candidates for parent category dropdown (exclude self during edit)
    const parentCandidates = useMemo(() => {
        return categories.filter((c) => !editingItem || c.id !== editingItem.id);
    }, [categories, editingItem]);

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">CATALOG STRUCTURE</span>
                    <h1>Categories</h1>
                    <p>Organize products into hierarchical categories and sub-categories.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Create / Edit Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">{editingItem ? 'EDIT RECORD' : 'CREATE NEW'}</span>
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="mb-0">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
                        {editingItem && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-[11px] font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center"
                            >
                                <i className="ti ti-x mr-1 text-xs" /> Cancel Edit
                            </button>
                        )}
                    </div>
                    <p>
                        {editingItem
                            ? `Editing category #${editingItem.id}. Modify attributes and click update.`
                            : 'Enter category details below to add a new catalog classification.'}
                    </p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">
                            Category Name <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="text"
                            className="access-input"
                            placeholder="e.g. Beverages, Electronics"
                            value={form.name}
                            onChange={(e) => {
                                const val = e.target.value;
                                setForm((prev) => ({
                                    ...prev,
                                    name: val,
                                    slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                        ? val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                        : prev.slug,
                                }));
                            }}
                            required
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Parent Category</span>
                        <Select2
                            value={form.parent_id}
                            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                            placeholder="None (Top-Level Root Category)"
                            options={[
                                { value: '', label: 'None (Top-Level Root Category)' },
                                ...parentCandidates.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                    sublabel: c.parent?.name ? `(under ${c.parent.name})` : null,
                                })),
                            ]}
                            className="mt-1"
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Slug (URL friendly key)</span>
                        <input
                            type="text"
                            className="access-input"
                            placeholder="e.g. beverages, electronics"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        />
                    </label>

                    {branches.length > 1 && (
                        <label className="block mb-3">
                            <span className="block text-xs font-bold text-gray-700 mb-1">Branch</span>
                            <Select2
                                value={form.branch_id}
                                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                                placeholder="Default Branch"
                                options={[
                                    { value: '', label: 'Default Branch' },
                                    ...branches.map((b) => ({ value: b.id, label: b.name })),
                                ]}
                                className="mt-1"
                            />
                        </label>
                    )}

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Description</span>
                        <textarea
                            className="access-input min-h-[64px]"
                            placeholder="Optional category description or notes"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </label>

                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="category_is_active"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            className="w-4 h-4 accent-[#f47721]"
                        />
                        <label htmlFor="category_is_active" className="text-xs text-gray-700 font-medium cursor-pointer">
                            Active Category
                        </label>
                    </div>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Saving...' : editingItem ? 'Update Category' : 'Create Category'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* List Table */}
                <section className="access-panel records-panel flex flex-col justify-between">
                    <div>
                        <div className="records-heading flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="access-kicker">DIRECTORY</span>
                                <h2>
                                    Categories <small className="resource-total">({filtered.length})</small>
                                </h2>
                            </div>
                            <TableToolbar
                                title="Categories"
                                columns={categoryColumns}
                                data={filtered}
                                renderCell={renderCategoryCell}
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                searchPlaceholder="Search categories..."
                                pageSize={pageSize}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                                currentPage={currentPage}
                                totalItems={filtered.length}
                                onPageChange={setCurrentPage}
                            />
                        </div>

                        {loading ? (
                            <div className="access-empty">
                                <i className="ti ti-loader-2 animate-spin" />
                                <p>Loading categories...</p>
                            </div>
                        ) : (
                            <div className="resource-table-wrap">
                                <table className="resource-table">
                                    <thead>
                                        <tr>
                                            <th className="w-12 text-center">SL</th>
                                            <th>Category Name</th>
                                            <th>Slug</th>
                                            <th>Parent Category</th>
                                            <th>Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCategories.map((c, idx) => {
                                            const sl = (pageSize === -1 ? 0 : (currentPage - 1) * pageSize) + idx + 1;
                                            return (
                                                <tr key={c.id}>
                                                    <td className="text-center font-bold text-slate-500">{sl}</td>
                                                    <td className="font-bold text-gray-900">{c.name}</td>
                                                    <td className="font-mono text-xs text-gray-500">{c.slug || '—'}</td>
                                                    <td>
                                                        {c.parent?.name ? (
                                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                {c.parent.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Root Category</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                                c.is_active
                                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                            }`}
                                                        >
                                                            {c.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(c)}
                                                            className="text-gray-400 hover:text-[#f47721] p-1.5 rounded hover:bg-orange-50 transition-colors inline-flex items-center mr-1"
                                                            title="Edit category"
                                                        >
                                                            <i className="ti ti-edit text-base" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(c.id)}
                                                            className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors inline-flex items-center"
                                                            title="Delete category"
                                                        >
                                                            <i className="ti ti-trash text-base" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {filtered.length === 0 && (
                                    <div className="access-empty small">
                                        <i className="ti ti-inbox" />
                                        <p>No categories found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!loading && filtered.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
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
