import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle,
}: {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
}) {
  if (!rows.length) {
    return <AdminEmptyState title={emptyTitle} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sand-200 text-sm">
          <thead className="bg-sand-50 text-left text-xs uppercase tracking-[0.12em] text-ink-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-4 py-3 font-medium ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="align-top hover:bg-sand-50/60">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 text-ink-700 ${column.className ?? ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
