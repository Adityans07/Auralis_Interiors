export function AdminActivityTimeline({
  events,
}: {
  events: Array<{ id: string; label: string; createdAt: string }>;
}) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5">
      <h3 className="text-base font-semibold text-ink-900">Activity</h3>
      <ol className="mt-4 space-y-4">
        {events.length ? (
          events.map((event) => (
            <li key={event.id} className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-gold-dark" />
              <p className="text-sm text-ink-800">{event.label}</p>
              <p className="text-xs text-ink-500">{new Date(event.createdAt).toLocaleString()}</p>
            </li>
          ))
        ) : (
          <li className="text-sm text-ink-500">No activity yet.</li>
        )}
      </ol>
    </section>
  );
}
