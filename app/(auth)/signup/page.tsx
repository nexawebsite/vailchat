'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phoneNumber, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Hitilafu imetokea wakati wa kujisajili');
      }

      setSuccess('Usajili umekamilika! Unaweza kuingia sasa.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Vailnet</h1>
          <p className="text-muted-foreground">Jisajili ili kuanza</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 text-green-500 p-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Jina (Linaloonekana kwa wengine)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Mfano: Juma Kaseja"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Namba ya Simu (Kwa ajili ya kuchat)</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Mfano: 0712345678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tengeneza password imara"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Inasajili...' : 'Jisajili Hapa'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Tayari una akaunti?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Ingia (Login)
          </Link>
        </div>
      </div>
    </div>
  );
}
