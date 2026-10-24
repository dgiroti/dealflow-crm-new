type ComingSoonProps = {
  title: string; // e.g. "Companies"
  availableIn: string; // e.g. "Milestone 2"
};

export default function ComingSoon({ title, availableIn }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <p className="text-gray-600">This page is coming in {availableIn}.</p>
      </div>
    </div>
  );
}
