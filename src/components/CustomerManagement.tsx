import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Check, Users, Shield, User as UserIcon, Crown } from 'lucide-react';
import { Role, isAdminRole } from '../types';

interface UserAccount {
  id: string;
  name: string;
  role: Role;
  created_at: string;
}

export const CustomerManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', password: '', role: 'user' as Role });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, created_at')
      .order('name');
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .ilike('name', formData.name.trim())
      .single();

    if (existing) {
      setError('A user with that name already exists.');
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('users')
      .insert({ name: formData.name.trim(), password: formData.password, role: formData.role })
      .select('id, name, role, created_at')
      .single();

    if (insertError) {
      setError('Failed to create user. Please try again.');
    } else if (data) {
      setUsers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData({ name: '', password: '', role: 'user' });
      setIsAdding(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const cancel = () => {
    setIsAdding(false);
    setFormData({ name: '', password: '', role: 'user' });
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Accounts</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Add User
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-green-100 dark:border-green-900/50 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">New User Account</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError(''); }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Maria Santos"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Set a password"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm border-2 transition-all cursor-pointer ${formData.role === 'user'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                >
                  <UserIcon size={15} />
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm border-2 transition-all cursor-pointer ${formData.role === 'admin'
                      ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                >
                  <Shield size={15} />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'super_admin' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm border-2 transition-all cursor-pointer ${formData.role === 'super_admin'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                >
                  <Crown size={15} />
                  Super Admin
                </button>
              </div>
            </div>

            {error && (
              <p className="md:col-span-3 text-sm font-bold text-red-500">{error}</p>
            )}

            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-2 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check size={18} />
                {saving ? 'Saving...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-200 dark:text-gray-600" />
                      No users yet. Add one above.
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100 capitalize">{user.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${user.role === 'super_admin'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                          : user.role === 'admin'
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/50'
                        }`}>
                        {user.role === 'super_admin' ? <Crown size={11} /> : user.role === 'admin' ? <Shield size={11} /> : <UserIcon size={11} />}
                        {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('en-PH', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
