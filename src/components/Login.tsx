import React, { useState } from 'react';
import { User } from '../types';
import logo from '../image/logo.png';
import { Lock, User as UserIcon, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('users')
      .select('id, name, role')
      .ilike('name', username.trim())
      .eq('password', password)
      .single();

    if (dbError || !data) {
      setError('Invalid username or password!');
    } else {
      onLogin({ id: data.id, name: data.name, role: data.role });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center bg-[#F9FAFB] dark:bg-gray-900 px-4 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <img
                src={logo}
                alt="QuickCart Logo"
                className="w-48 h-48 sm:w-80 sm:h-80 object-contain"
              />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 dark:text-gray-500 font-medium mt-2">Sign in to your QuickCart account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <UserIcon size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-600 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none font-bold text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-600 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none font-bold text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-sm font-bold text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-green-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <LogIn size={22} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
