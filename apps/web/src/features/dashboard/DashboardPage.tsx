import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { DEAL_STAGES } from '@dealflow/shared';
import { fetchHealth } from '../../lib/api';

type Tone = 'green' | 'amber' | 'red' | 'gray';

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const tones: Record<Tone, string> = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${tones[tone]}`}>{label}</span>
  );
}

export default function DashboardPage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 10_000,
    retry: 1,
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold">DealFlow CRM</h1>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">System status</h2>
          {health.isPending ? (
            <StatusBadge label="Checking…" tone="gray" />
          ) : health.isError ? (
            <StatusBadge label="API unreachable" tone="red" />
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                label={`API: ${health.data.status}`}
                tone={health.data.status === 'ok' ? 'green' : 'amber'}
              />
              <StatusBadge
                label={`Database: ${health.data.database}`}
                tone={health.data.database === 'up' ? 'green' : 'red'}
              />
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Deal stages</h2>
          <ol className="flex flex-wrap gap-2">
            {DEAL_STAGES.map((stage) => (
              <li
                key={stage}
                className="rounded-md bg-indigo-50 px-3 py-1 text-sm capitalize text-indigo-700"
              >
                {stage}
              </li>
            ))}
          </ol>
        </section>

        {/* Temporary links, so we can move between pages while building them */}
        <nav className="flex gap-4 text-sm">
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
          <Link to="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
        </nav>
      </div>
    </main>
  );
}
