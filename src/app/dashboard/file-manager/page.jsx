'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function FileManagerPage() {
    const [files, setFiles] = useState([]);
    const [folder, setFolder] = useState('general');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const loadFiles = async (curFolder = folder) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/files?folder=${curFolder}`);
            setFiles(res.data.data || []);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load media files', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles(folder);
    }, [folder]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);
        data.append('folder', folder);

        try {
            await axios.post('/api/files', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'File uploaded successfully', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            loadFiles(folder);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Upload failed', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this file?')) return;
        try {
            await axios.delete(`/api/files/${id}`);
            loadFiles(folder);
        } catch {
            if (window.Swal) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Could not delete file', showConfirmButton: false, timer: 4000, timerProgressBar: true });
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">APPLICATION</span>
                    <h1>File Manager</h1>
                    <p>Central repository for product images, receipts, business licenses, and digital documents.</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="access-submit !w-auto !mt-0 !py-2 !px-4 text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                        <i className="ti ti-upload" /> {uploading ? 'Uploading...' : 'Upload File'}
                        <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} />
                    </label>
                    <button type="button" className="access-refresh" onClick={() => loadFiles(folder)}>
                        <i className="ti ti-refresh" /> Refresh
                    </button>
                </div>
            </div>

            {/* Folders */}
            <div className="flex gap-2 mb-6">
                {['general', 'products', 'receipts', 'documents'].map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFolder(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all ${
                            folder === f
                                ? 'bg-[#f47721] text-white border-[#f47721]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#f47721]'
                        }`}
                    >
                        📁 {f}
                    </button>
                ))}
            </div>

            <section className="access-panel records-panel bg-white p-6">
                {loading ? (
                    <div className="access-empty">
                        <i className="ti ti-loader-2 animate-spin text-2xl" />
                        <p>Loading files...</p>
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <i className="ti ti-folder-off text-4xl mb-2" />
                        <p className="text-xs">No files in this folder. Use the upload button above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="border border-gray-200 rounded-xl p-3 text-center flex flex-col justify-between hover:shadow-md transition-shadow group relative bg-gray-50"
                            >
                                <div className="py-4">
                                    <i className="ti ti-file text-3xl text-[#f47721]" />
                                </div>
                                <div>
                                    <span className="font-bold text-xs text-gray-800 truncate block w-full" title={file.name}>
                                        {file.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                        {formatBytes(file.size_bytes)}
                                    </span>
                                </div>
                                <div className="mt-2 pt-2 border-t flex justify-between items-center text-xs">
                                    <a
                                        href={file.path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline font-bold"
                                    >
                                        Open
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(file.id)}
                                        className="text-gray-400 hover:text-red-500"
                                        title="Delete file"
                                    >
                                        <i className="ti ti-trash" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

