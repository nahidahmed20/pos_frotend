'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Select2 from '@/components/Select2';

const tabs = [
    { id: 'roles', label: 'Roles' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'users', label: 'Users' },
];

export default function AccessControlPage() {
    const [activeTab, setActiveTab] = useState('roles');
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [permissionName, setPermissionName] = useState('');
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: '', branch_id: '' });

    const fireToast = (icon, title) => {
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title,
                showConfirmButton: false,
                timer: 2600,
                timerProgressBar: true,
            });
        }
    };

    const loadData = async ({ notify = false } = {}) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/access-control');
            setPermissions(response.data.permissions || []);
            setRoles(response.data.roles || []);
            setUsers(response.data.users || []);
            if (notify) fireToast('success', 'Access-control data refreshed');
        } catch (requestError) {
            fireToast('error', requestError.response?.status === 403
                ? 'আপনার এই management screen ব্যবহার করার permission নেই।'
                : 'API থেকে data load করা যায়নি। Backend চালু আছে কি না পরীক্ষা করুন।');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const requestedTab = new URLSearchParams(window.location.search).get('tab');
        if (tabs.some((tab) => tab.id === requestedTab)) setActiveTab(requestedTab);
        loadData();
    }, []);

    const submit = async (event, endpoint, body, reset) => {
        event.preventDefault();
        try {
            await axios.post(endpoint, body);
            reset();
            fireToast('success', 'সফলভাবে তৈরি হয়েছে।');
            await loadData();
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors;
            fireToast('error', validationErrors ? Object.values(validationErrors).flat().join(' ') : 'তৈরি করা যায়নি।');
        }
    };

    const createPermission = (event) => submit(event, '/api/permissions', { name: permissionName }, () => setPermissionName(''));
    const createRole = (event) => submit(event, '/api/roles', { name: roleName, permissions: selectedPermissions }, () => {
        setRoleName('');
        setSelectedPermissions([]);
    });
    const createUser = (event) => submit(event, '/api/users', userForm, () => setUserForm({ name: '', email: '', password: '', role: '', branch_id: '' }));

    const togglePermission = (permissionId) => {
        setSelectedPermissions((current) => current.includes(permissionId)
            ? current.filter((id) => id !== permissionId)
            : [...current, permissionId]);
    };

    return (
        <div className="access-control-page">
            <div className="access-hero">
                <div>
                    <span className="access-kicker">WORKSPACE SECURITY</span>
                    <h1>Access control</h1>
                    <p>Shape who can see, manage, and move through your workspace.</p>
                </div>
                <button type="button" className="access-refresh" onClick={() => loadData({ notify: true })}><i className="ti ti-refresh" /> Refresh data</button>
            </div>

            <div className="access-stats">
                <div><span className="access-stat-icon orange"><i className="ti ti-shield-check" /></span><span><strong>{roles.length}</strong><small>Active roles</small></span></div>
                <div><span className="access-stat-icon blue"><i className="ti ti-key" /></span><span><strong>{permissions.length}</strong><small>Permissions</small></span></div>
                <div><span className="access-stat-icon green"><i className="ti ti-users" /></span><span><strong>{users.length}</strong><small>Workspace users</small></span></div>
            </div>

            <div className="access-tabs" role="tablist">
                {tabs.map((tab) => <button type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}><i className={`ti ti-${tab.id === 'roles' ? 'shield' : tab.id === 'permissions' ? 'key' : 'users'}`} />{tab.label}<span>{tab.id === 'roles' ? roles.length : tab.id === 'permissions' ? permissions.length : users.length}</span></button>)}
            </div>

            {loading ? <div className="access-empty"><i className="ti ti-loader-2" /><p>Loading access-control data...</p></div> : (
                <div className="access-layout">
                    {activeTab === 'permissions' && <>
                        <CreatePanel eyebrow="NEW PERMISSION" title="Add a permission" description="Give your team a precise capability." onSubmit={createPermission} button="Create permission"><label>Permission name<input className="access-input" value={permissionName} onChange={(event) => setPermissionName(event.target.value)} placeholder="e.g. manage sales" required /></label></CreatePanel>
                        <RecordPanel title="Permission library" count={permissions.length}>{permissions.map((permission) => <div className="access-record" key={permission.id}><span className="record-mark"><i className="ti ti-key" /></span><span><strong>{permission.name}</strong><small>Web guard</small></span></div>)}</RecordPanel>
                    </>}
                    {activeTab === 'roles' && <>
                        <CreatePanel eyebrow="NEW ROLE" title="Build a role" description="Bundle permissions into a job-ready access level." onSubmit={createRole} button="Create role"><label>Role name<input className="access-input" value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="e.g. store manager" required /></label><fieldset><legend>Assign permissions <span>{selectedPermissions.length} selected</span></legend><div className="permission-picker">{permissions.map((permission) => <label key={permission.id} className={selectedPermissions.includes(permission.id) ? 'selected' : ''}><input type="checkbox" checked={selectedPermissions.includes(permission.id)} onChange={() => togglePermission(permission.id)} />{permission.name}</label>)}</div></fieldset></CreatePanel>
                        <RecordPanel title="Role directory" count={roles.length}>{roles.map((role) => <div className="access-record role-record" key={role.id}><span className="record-mark role"><i className="ti ti-shield" /></span><span><strong>{role.name}</strong><small>{role.permissions?.length || 0} permissions assigned</small></span><em>{role.permissions?.slice(0, 2).map((permission) => permission.name).join(' · ') || 'No permissions'}</em></div>)}</RecordPanel>
                    </>}
                    {activeTab === 'users' && <>
                        <CreatePanel eyebrow="NEW USER" title="Invite a teammate" description="Create an account and set its access level." onSubmit={createUser} button="Create user">
                            <div className="access-form-grid">
                                <label>Full name<input className="access-input" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} placeholder="e.g. Ayesha Rahman" required /></label>
                                <label>Email address<input className="access-input" type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} placeholder="name@company.com" required /></label>
                                <label>Password<input className="access-input" type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} placeholder="Minimum 8 characters" minLength="8" required /></label>
                                <label>
                                    Role
                                    <Select2
                                        value={userForm.role}
                                        onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}
                                        required
                                        placeholder="Select a role"
                                        options={[
                                            { value: '', label: 'Select a role' },
                                            ...roles.map((role) => ({ value: role.name, label: role.name })),
                                        ]}
                                        className="mt-1"
                                    />
                                </label>
                            </div>
                        </CreatePanel>
                        <RecordPanel title="Workspace users" count={users.length}>{users.map((user) => <div className="access-record user-record" key={user.id}><span className="user-avatar">{user.name?.charAt(0)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><em>{user.roles?.map((role) => role.name).join(', ') || 'No role'}</em></div>)}</RecordPanel>
                    </>}
                </div>
            )}
        </div>
    );
}

function CreatePanel({ eyebrow, title, description, onSubmit, button, children }) {
    return <form className="access-panel create-panel" onSubmit={onSubmit}><span className="access-kicker">{eyebrow}</span><h2>{title}</h2><p>{description}</p>{children}<button className="access-submit" type="submit">{button}<i className="ti ti-arrow-up-right" /></button></form>;
}

function RecordPanel({ title, count, children }) {
    return <section className="access-panel records-panel"><div className="records-heading"><div><span className="access-kicker">DIRECTORY</span><h2>{title}</h2></div><span className="records-count">{count} total</span></div><div className="records-list">{children.length ? children : <div className="access-empty small"><i className="ti ti-inbox" /><p>Nothing here yet.</p></div>}</div></section>;
}
