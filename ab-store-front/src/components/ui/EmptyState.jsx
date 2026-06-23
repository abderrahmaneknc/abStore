import { SearchX } from 'lucide-react';

export default function EmptyState({ icon: Icon = SearchX, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-gray-50/50">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-muted max-w-sm mb-6">{description}</p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
