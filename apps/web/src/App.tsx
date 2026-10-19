import { useQuery } from '@tanstack/react-query';
import { DEAL_STAGES } from '@dealflow/shared';
import { fetchHealth } from './lib/api';

type Tone = 'green' | 'amber' | 'red' | 'gray';

// A small colored label, reused for every status
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

export default function App() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 10_000,
    retry: 1, // if the API doesn't answer, try once more before showing an error
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold">DealFlow CRM</h1>
          <p className="mt-1 text-gray-600">Milestone 0: frontend, API and database connected.</p>
        </header>
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">System status</h2>
          {health.isPending ? (
            <StatusBadge label="Checking" tone="gray" />
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
              <span className="text-sm text-gray-500">
                Last checked {new Date(health.data.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Deal stages (from @dealflow/shared)</h2>
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
      </div>
    </main>
  );
}
