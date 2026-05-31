type PageHeaderProps = {
  tag: string;
  tagClass?: string;
  title: string;
  action?: React.ReactNode;
};

export function PageHeader({ tag, tagClass = "bg-yellow", title, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 min-w-0">
      <div className="min-w-0">
        <span className={`nb-tag ${tagClass} mb-3 sm:mb-4`}>{tag}</span>
        <h2 className="font-display text-3xl sm:text-4xl break-words">{title}</h2>
      </div>
      {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
    </div>
  );
}
