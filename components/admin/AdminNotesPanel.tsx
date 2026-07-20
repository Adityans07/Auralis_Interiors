export function AdminNotesPanel({ notes }: { notes: Array<{ id: string; note: string; createdAt: string }> }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5">
      <h3 className="text-base font-semibold text-ink-900">Internal Notes</h3>
      <div className="mt-3 space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <article key={note.id} className="rounded-xl border border-sand-100 bg-sand-50 p-3">
              <p className="text-sm text-ink-800">{note.note}</p>
              <p className="mt-1 text-xs text-ink-500">{new Date(note.createdAt).toLocaleString()}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-ink-500">No notes yet.</p>
        )}
      </div>
    </section>
  );
}
