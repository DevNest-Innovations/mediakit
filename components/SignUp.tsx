'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaFacebook, FaXTwitter } from 'react-icons/fa6';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('Passwords do not match');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || 'Sign up failed');
      }
      setStatus('Account created. Please sign in.');
      // optionally auto-redirect to sign-in
    } catch (err: any) {
      setStatus(err?.message ?? 'Sign up error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: 'google' | 'facebook' | 'twitter') => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="max-w-md lg:min-w-[340px] mx-auto p-6 rounded-lg bg-white dark:bg-gray-900">
      <h2 className="text-center text-xl font-semibold mb-4">Create account</h2>

      <form onSubmit={handleSignUp} className="space-y-4">
        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-primary rounded bg-transparent text-sm" />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-primary rounded bg-transparent text-sm" />
        </label>

        <label className="block">
          <span className="text-sm">Confirm password</span>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full px-3 py-2 border border-primary rounded bg-transparent text-sm" />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
          <Link href="/signin" className="px-4 py-2 border border-primary rounded text-sm">Sign in</Link>
        </div>

        {status && <div className="text-sm text-red-500">{status}</div>}
      </form>

      <div className="my-4 border-t pt-4 text-sm text-center text-gray-500">Or continue with</div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => handleSocial('google')} className="flex items-center justify-center gap-2 px-3 py-2 border border-primary rounded text-sm hover:cursor-pointer"><FaGoogle /></button>
                <button onClick={() => handleSocial('facebook')} className="flex items-center justify-center gap-2 px-3 py-2 border border-primary rounded text-sm hover:cursor-pointer"><FaFacebook /></button>
                <button onClick={() => handleSocial('twitter')} className="flex items-center justify-center gap-2 px-3 py-2 border border-primary rounded text-sm hover:cursor-pointer"><FaXTwitter /></button>
      </div>
    </div>
  );
}
