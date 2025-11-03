'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaFacebook, FaGoogle, FaXTwitter } from 'react-icons/fa6';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password, remember }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || 'Sign in failed');
      }
      // success (adjust redirect logic as needed)
      setStatus('Signed in successfully.');
      // location.href = '/dashboard';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus(err.message);
      } else {
        setStatus(String(err) || 'Sign in error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: 'google' | 'facebook' | 'twitter') => {
    // Redirect to your OAuth entry points; server should handle provider flow
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="max-w-md min-w-[340px] mx-auto p-6 rounded-lg bg-white dark:bg-gray-900">
      <h2 className="text-center text-xl font-semibold mb-4">Sign in</h2>

      <form onSubmit={handleSignIn} className="space-y-4">
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-primary rounded bg-transparent text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-primary rounded bg-transparent text-sm"
          />
        </label>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Link href="/forgot" className="text-sm text-primary">Forgot?</Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <Link href="/signup" className="px-4 py-2 border border-primary rounded text-sm">Sign up</Link>
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
