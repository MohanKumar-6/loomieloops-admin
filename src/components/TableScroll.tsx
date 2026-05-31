type TableScrollProps = {
  children: React.ReactNode;
  minWidth?: string;
};

export function TableScroll({ children, minWidth = "640px" }: TableScrollProps) {
  return (
    <div className="nb-card min-w-0 max-w-full">
      <div className="table-scroll">
        <table className="w-full text-left" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}
