import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

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
      <Button
        variant="outline"
        size="icon"
        className="size-6"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <IconChevronLeft size={12} />
      </Button>

      {pages.map((p, i) =>
        p === "…" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis positions are stable
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-600">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            size="icon"
            className="size-6 text-xs"
            onClick={() => onPageChange(p as number)}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="size-6"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <IconChevronRight size={12} />
      </Button>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "…", current - 1, current, current + 1, "…", total]
}
