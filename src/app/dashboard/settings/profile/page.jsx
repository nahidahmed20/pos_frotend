'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export default function ProfileSettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingProfile, setSubmittingProfile] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);

    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const toast = (icon, title) =>
        window.Swal?.fire({
            toast: true,
            position: 'top-end',
            icon,
            title,
            showConfirmButton: false,
            timer: 2600,
            timerProgressBar: true,
        });

    const loadProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/profile').catch(() => axios.get('/api/me'));
            const userData = res.data.data || res.data.user || res.data;
            setUser(userData);
            setProfileForm({
                name: userData.name || '',
                email: userData.email || '',
            });
        } catch {
            toast('error', 'Could not load profile details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSubmittingProfile(true);
        try {
            await axios.put('/api/profile', profileForm);
            toast('success', 'Profile updated successfully');
            loadProfile();
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not update profile.');
        } finally {
            setSubmittingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.password !== passwordForm.password_confirmation) {
            toast('error', 'New password and confirmation do not match.');
            return;
        }

        setSubmittingPassword(true);
        try {
            await axios.put('/api/profile/password', passwordForm);
            toast('success', 'Password changed successfully');
            setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            toast('error', error.response?.data?.message || 'Could not change password.');
        } finally {
            setSubmittingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <i className="ti ti-loader-2 text-3xl animate-spin text-emerald-600" />
                <p className="mt-2 text-sm text-slate-500">Loading profile information...</p>
            </div>
        );
    }

    return (
        <div className="resource-page">
            <div className="resource-hero">
                <div>
                    <span className="access-kicker">USER PREFERENCES</span>
                    <h1>My Profile & Security</h1>
                    <p>Manage your personal login credentials, name, email, and password.</p>
                </div>
            </div>

            <div className="resource-layout">
                {/* Profile Information Panel */}
                <form className="access-panel create-panel" onSubmit={handleUpdateProfile}>
                    <span className="access-kicker">PERSONAL DETAILS</span>
                    <h2>Edit Profile</h2>
                    <p>Update your personal information below.</p>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                {user?.roles?.[0]?.name || user?.role || 'Staff Member'}
                            </span>
                        </div>
                    </div>

                    <label>
                        Full Name *
                        <input
                            className="access-input"
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            required
                        />
                    </label>

                    <label>
                        Email Address *
                        <input
                            className="access-input"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            required
                        />
                    </label>

                    {user?.branch && (
                        <div className="text-xs text-slate-500 py-1">
                            <span>Assigned Branch: </span>
                            <strong className="text-slate-800 dark:text-slate-200">{user.branch.name}</strong>
                        </div>
                    )}

                    <button className="access-submit mt-2" type="submit" disabled={submittingProfile}>
                        {submittingProfile ? 'Saving...' : 'Save Profile Changes'}{' '}
                        <i className="ti ti-check" />
                    </button>
                </form>

                {/* Password Change Panel */}
                <form className="access-panel create-panel" onSubmit={handleUpdatePassword}>
                    <span className="access-kicker">SECURITY</span>
                    <h2>Change Password</h2>
                    <p>Ensure your account uses a strong, secure password.</p>

                    <label>
                        Current Password *
                        <input
                            className="access-input"
                            type="password"
                            placeholder="Enter current password"
                            value={passwordForm.current_password}
                            onChange={(e) =>
                                setPasswordForm({ ...passwordForm, current_password: e.target.value })
                            }
                            required
                        />
                    </label>

                    <label>
                        New Password *
                        <input
                            className="access-input"
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={passwordForm.password}
                            onChange={(e) =>
                                setPasswordForm({ ...passwordForm, password: e.target.value })
                            }
                            required
                        />
                    </label>

                    <label>
                        Confirm New Password *
                        <input
                            className="access-input"
                            type="password"
                            placeholder="Repeat new password"
                            value={passwordForm.password_confirmation}
                            onChange={(e) =>
                                setPasswordForm({
                                    ...passwordForm,
                                    password_confirmation: e.target.value,
                                })
                            }
                            required
                        />
                    </label>

                    <button className="access-submit mt-2" type="submit" disabled={submittingPassword}>
                        {submittingPassword ? 'Updating Password...' : 'Update Password'}{' '}
                        <i className="ti ti-shield-lock" />
                    </button>
                </form>
            </div>
        </div>
    );
}
