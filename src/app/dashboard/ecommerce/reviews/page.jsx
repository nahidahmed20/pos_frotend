'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function EcommerceReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        product_id: '',
        reviewer_name: '',
        rating: 5,
        comment: '',
        status: 'approved',
    });

    const toast = (icon, text) => {
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title: text,
                showConfirmButton: false,
                timer: 2600,
            });
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [revRes, prodRes] = await Promise.all([
                axios.get('/api/ecommerce/reviews'),
                axios.get('/api/products'),
            ]);
            setReviews(revRes.data.data || []);
            setProducts(prodRes.data.data || []);
        } catch {
            toast('error', 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/ecommerce/reviews', {
                ...form,
                product_id: parseInt(form.product_id, 10),
                rating: parseInt(form.rating, 10),
            });
            toast('success', 'Customer review added');
            setForm({ product_id: '', reviewer_name: '', rating: 5, comment: '', status: 'approved' });
            loadData();
        } catch (err) {
            toast('error', err.response?.data?.message || 'Could not save review');
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`/api/ecommerce/reviews/${id}`, { status: newStatus });
            toast('success', `Review marked as ${newStatus}`);
            loadData();
        } catch {
            toast('error', 'Failed to update review status');
        }
    };

    const deleteReview = async (id) => {
        if (!confirm('Delete this review permanently?')) return;
        try {
            await axios.delete(`/api/ecommerce/reviews/${id}`);
            toast('success', 'Review deleted');
            loadData();
        } catch {
            toast('error', 'Failed to delete review');
        }
    };

    const filtered = reviews.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">ECOMMERCE & CATALOG</span>
                    <h1>Product Reviews & Ratings</h1>
                    <p>Moderate customer feedback, star ratings, and online store product reviews.</p>
                </div>
                <button type="button" className="access-refresh" onClick={loadData}>
                    <i className="ti ti-refresh" /> Refresh
                </button>
            </div>

            <div className="resource-layout">
                {/* Form */}
                <form className="access-panel create-panel" onSubmit={handleSubmit}>
                    <span className="access-kicker">NEW REVIEW</span>
                    <h2>Add Product Feedback</h2>
                    <p>Submit customer review and rating score.</p>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Product *</span>
                        <select
                            className="access-input"
                            value={form.product_id}
                            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                            required
                        >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.sku})
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Reviewer Name *</span>
                        <input
                            type="text"
                            className="access-input"
                            value={form.reviewer_name}
                            onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
                            placeholder="e.g. Mahbub Alam"
                            required
                        />
                    </label>

                    <label className="block mb-3">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Star Rating (1 - 5)</span>
                        <select
                            className="access-input"
                            value={form.rating}
                            onChange={(e) => setForm({ ...form, rating: e.target.value })}
                        >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 Stars - Good)</option>
                            <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                            <option value={2}>⭐⭐ (2 Stars - Below Average)</option>
                            <option value={1}>⭐ (1 Star - Poor)</option>
                        </select>
                    </label>

                    <label className="block mb-4">
                        <span className="block text-xs font-bold text-gray-700 mb-1">Customer Comments</span>
                        <textarea
                            className="access-input min-h-[70px]"
                            value={form.comment}
                            onChange={(e) => setForm({ ...form, comment: e.target.value })}
                            placeholder="What the customer said about quality, sizing, packaging..."
                        />
                    </label>

                    <button className="access-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Publishing...' : 'Save Review'}
                        <i className="ti ti-arrow-up-right ml-1" />
                    </button>
                </form>

                {/* List */}
                <section className="access-panel records-panel">
                    <div className="records-heading">
                        <div>
                            <span className="access-kicker">FEEDBACK STREAM</span>
                            <h2>
                                Reviews <small className="resource-total">({reviews.length})</small>
                            </h2>
                        </div>
                        <div className="resource-search">
                            <i className="ti ti-search" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search reviewer or comment..."
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="access-empty">
                            <i className="ti ti-loader-2 animate-spin" />
                            <p>Loading reviews...</p>
                        </div>
                    ) : (
                        <div className="resource-table-wrap">
                            <table className="resource-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Reviewer</th>
                                        <th>Rating</th>
                                        <th>Feedback</th>
                                        <th>Status</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((r) => (
                                        <tr key={r.id}>
                                            <td className="font-bold text-gray-900">{r.product?.name || '—'}</td>
                                            <td className="font-semibold text-gray-800">{r.reviewer_name}</td>
                                            <td className="text-amber-500 font-bold whitespace-nowrap">
                                                {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                                            </td>
                                            <td className="text-xs text-gray-600 max-w-xs truncate">{r.comment || '—'}</td>
                                            <td>
                                                <select
                                                    value={r.status || 'approved'}
                                                    onChange={(e) => updateStatus(r.id, e.target.value)}
                                                    className="text-xs font-bold py-0.5 px-2 rounded border border-gray-200 bg-white"
                                                >
                                                    <option value="approved">Approved</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="spam">Spam</option>
                                                </select>
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteReview(r.id)}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                >
                                                    <i className="ti ti-trash text-sm" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="access-empty small">
                                    <i className="ti ti-inbox" />
                                    <p>No product reviews recorded yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

