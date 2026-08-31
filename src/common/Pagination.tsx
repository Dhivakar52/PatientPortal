import React from "react";

interface PaginationTable {
  getState: () => { pagination: { pageIndex: number; pageSize: number } };
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
}

interface PaginationProps {
  table: PaginationTable;
  totalCount: number;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({ table, totalCount, pageSizeOptions = [5, 10, 25, 50] }) => {
  if (!table) return null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  if (totalCount === 0) return null;

  const start = Math.min(pageIndex * pageSize + 1, totalCount);
  const end = Math.min((pageIndex + 1) * pageSize, totalCount);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages.filter((page, index, arr) => arr.indexOf(page) === index);
  };

  const pages = getVisiblePages();

  const availablePageSizes = React.useMemo(() => {
    const set = new Set([...pageSizeOptions, pageSize]);
    return Array.from(set).sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
      {/* LEFT: Records Count & Records Per Page Dropdown */}
      <div className="flex items-center gap-3 text-sm text-foreground">
        <div>
          Showing <b>{start}</b> to <b>{end}</b> of <b>{totalCount}</b> records
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              table.setPageSize(newSize);
              table.setPageIndex(0);
            }}
            className="border border-border bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 px-2 py-1 rounded text-xs cursor-pointer hover:border-slate-400 focus:outline-none"
          >
            {availablePageSizes.map((size) => (
              <option key={size} value={size} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RIGHT: Page Navigation Buttons */}
      <div className="flex items-center">
        {/* Previous */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 mx-1 rounded border border-border bg-background text-foreground hover:theme-color hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
        >
          ‹
        </button>

        {/* Page Numbers */}
        {pages.map((p, index) => {
          if (p === "...") {
            return (
              <span key={index} className="px-2 text-muted-foreground text-xs">
                ...
              </span>
            );
          }

          return (
            <button
              key={p}
              onClick={() => table.setPageIndex(Number(p) - 1)}
              className={`px-3 py-1 mx-1 rounded transition-colors text-xs cursor-pointer ${
                p === currentPage
                  ? "theme-color font-bold"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 mx-1 rounded border border-border bg-background text-foreground hover:theme-color hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
