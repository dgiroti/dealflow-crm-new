import { useQuery } from '@tanstack/react-query';
import { DEAL_STAGES } from '@dealflow/shared';
import { fetchHealth } from '../../lib/api';
import StatCard from './StatCard';
import { useCurrentUser } from '../auth/auth-context';

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

// Which API the dev server is forwarding to, based on Vite's mode
const connectedToLabel: Record<string, string> = {
  development: 'Local API (your Codespace)',
  cloud: 'Cloud API (AWS Lambda + Neon)',
};

// "Good morning" / "Good afternoon" / "Good evening", based on the user's own clock
function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ── The page's content, kept as data so it's easy to change ──

const stats = [
  { label: 'Open deals', value: '—', note: 'Available in Milestone 3' },
  { label: 'Pipeline value', value: '—', note: 'Available in Milestone 5' },
  { label: 'Tasks due today', value: '—', note: 'Available in Milestone 4' },
  { label: 'Companies', value: '—', note: 'Available in Milestone 2' },
];

const checklist = [
  { label: 'Create your workspace', done: true },
  { label: 'Add your first company', done: false },
  { label: 'Create your first deal', done: false },
  { label: 'Invite a teammate', done: false },
];

export default function DashboardPage() {
  // const { state } = useAuth(); // NEW
  const user = useCurrentUser();
  // if (state.status === 'authenticated') {
  //   console.log(state.user.name); // ✅ allowed: here TypeScript knows someone is logged in
  // }

  const health = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 10_000,
    retry: 1,
  });

  // // Not logged in (for example, after a reload): Steps 8 and 9 will handle this properly
  // if (state.status !== 'authenticated') {
  //   return (
  //     <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
  //       <p className="text-gray-600">You're not logged in.</p>
  //       <Link to="/login" className="font-medium text-indigo-600 hover:underline">
  //         Go to the login page
  //       </Link>
  //     </main>
  //   );
  // }

  // const { user } = state;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Greeting ── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-gray-600">{user.organization.name}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium capitalize text-indigo-700">
          {user.role}
        </span>
      </header>

      {/* ── Summary cards: 1 column on phones, 2 on tablets, 4 on wide screens ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} note={stat.note} />
        ))}
      </section>
      {/* <header>
          <h1 className="text-3xl font-bold">DealFlow CRM</h1>
        </header> */}

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Getting started</h2>
        <ul className="mt-4 space-y-3">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  item.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {item.done ? '✓' : '○'}
              </span>
              <span className={item.done ? 'text-gray-500 line-through' : 'text-gray-800'}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

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

        {connectedToLabel[import.meta.env.MODE] && (
          <p className="mt-4 text-xs text-gray-500">
            Connected to: {connectedToLabel[import.meta.env.MODE]}
          </p>
        )}
      </section>

      {/* Temporary links, so we can move between pages while building them
      <nav className="flex gap-4 text-sm">
        <Link to="/signup" className="text-indigo-600 hover:underline">
          Sign up
        </Link>
        <Link to="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </nav> */}
    </div>
  );
}
