import type { ReactNode } from 'react';

const labels: Record<string, string> = {
  experimental: 'Experimental',
  new: 'New',
  beta: 'Beta',
  deprecated: 'Deprecated',
};

/** A small label for pages whose `status` front matter is set (for example `status: experimental`). */
export function StatusBadge({ status, className = '' }: { status: string; className?: string }): ReactNode {
  return (
    <span
      data-status={status}
      className={`inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium leading-none text-amber-700 dark:text-amber-400 ${className}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
