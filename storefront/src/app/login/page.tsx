'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_CUSTOMER_EMAIL);
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_CUSTOMER_PASSWORD);
  const [error, setError] = useState('');

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Login</h1>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');

            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              }
            );

            const data = await res.json();

            if (!res.ok) {
              setError(data.message ?? 'Login failed');
              return;
            }

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            router.push('/cart');
          }}
          className="mt-8 space-y-4"
        >
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
