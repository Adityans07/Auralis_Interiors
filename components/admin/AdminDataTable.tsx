import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
  filterNode?: React.ReactNode;
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-base">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sand-200 text-sm">
          <thead className="bg-void text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-4 py-3 font-medium ${column.className ?? ""}`}>
                  <div className="flex flex-col gap-2">
                    <span>{column.header}</span>
                    {column.filterNode && (
                      <div className="mt-1 font-normal normal-case tracking-normal">
                        {column.filterNode}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="align-top hover:bg-void/60">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 text-foreground/90 ${column.className ?? ""}`}>
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
