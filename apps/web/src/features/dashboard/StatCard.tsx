type StatCardProps = {
  label: string; // e.g. "Open deals"
  value: string; // e.g. "12", or "—" when there's no data yet
  note?: string; // small grey text underneath
};

export default function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    </div>
  );
}
