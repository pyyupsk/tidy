import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

type TablePaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<TablePaginationProps>) {
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center gap-1">
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <IconChevronLeft size={12} />
      </PageButton>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-600">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            onClick={() => onPageChange(p as number)}
            active={currentPage === p}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <IconChevronRight size={12} />
      </PageButton>
    </div>
  )
}

type PageButtonProps = {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
  "aria-label"?: string
}

function PageButton({ onClick, disabled, active, children, "aria-label": ariaLabel }: Readonly<PageButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex min-w-[22px] cursor-pointer items-center justify-center rounded border px-1.5 py-0.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30",
        active
          ? "border-white bg-white text-black"
          : "border-[#2a2a2a] text-zinc-500 hover:text-zinc-300"
      )}
    >
      {children}
    </button>
  )
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "…", current - 1, current, current + 1, "…", total]
}
