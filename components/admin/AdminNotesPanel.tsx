export function AdminNotesPanel({ notes }: { notes: Array<{ id: string; note: string; createdAt: string }> }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-base p-5">
      <h3 className="text-base font-semibold text-foreground">Internal Notes</h3>
      <div className="mt-3 space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <article key={note.id} className="rounded-xl border border-sand-100 bg-void p-3">
              <p className="text-sm text-foreground">{note.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
      </div>
    </section>
  );
}
