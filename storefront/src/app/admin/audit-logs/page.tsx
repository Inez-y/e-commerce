'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getStoredUser } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';

type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
};

function formatMetadata(metadata: unknown) {
  if (!metadata) {
    return '-';
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return String(metadata);
  }
}

export default function AdminAuditLogsPage() {
  const router = useRouter();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAuditLogs() {
      const token = getAccessToken();
      const user = getStoredUser();

      if (!token || user?.role !== 'ADMIN') {
        router.push('/admin/login');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message ?? 'Failed to fetch audit logs');
          return;
        }

        setAuditLogs(data);
      } catch {
        setError('Failed to connect to API');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAuditLogs();
  }, [router]);

  return (
    <>
      <AdminNav />

      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="mt-2 text-gray-600">
              Track important admin and customer actions.
            </p>
          </div>

          {isLoading && <p className="mt-8 text-gray-600">Loading audit logs...</p>}

          {error && <p className="mt-8 text-red-600">{error}</p>}

          {!isLoading && !error && (
            <div className="mt-8 overflow-hidden rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Metadata</th>
                  </tr>
                </thead>

                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-t align-top">
                      <td className="p-4 font-medium">{log.action}</td>

                      <td className="p-4">
                        <div>{log.entityType}</div>
                        <div className="mt-1 font-mono text-xs text-gray-500">
                          {log.entityId ?? '-'}
                        </div>
                      </td>

                      <td className="p-4">
                        {log.user?.email ?? 'System / Unknown'}
                      </td>

                      <td className="p-4">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="p-4">
                        <pre className="max-w-md overflow-auto rounded-lg bg-gray-50 p-3 text-xs">
                          {formatMetadata(log.metadata)}
                        </pre>
                      </td>
                    </tr>
                  ))}

                  {auditLogs.length === 0 && (
                    <tr>
                      <td className="p-4 text-gray-600" colSpan={5}>
                        No audit logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
