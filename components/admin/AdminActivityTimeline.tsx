export function AdminActivityTimeline({
  events,
}: {
  events: Array<{ id: string; label: string; createdAt: string }>;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-base p-5">
      <h3 className="text-base font-semibold text-foreground">Activity</h3>
      <ol className="mt-4 space-y-4">
        {events.length ? (
          events.map((event) => (
            <li key={event.id} className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-gold-dark" />
              <p className="text-sm text-foreground">{event.label}</p>
              <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground">No activity yet.</li>
        )}
      </ol>
    </section>
  );
}
