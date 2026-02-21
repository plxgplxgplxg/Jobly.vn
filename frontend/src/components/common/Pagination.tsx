interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    const getVisiblePages = () => {
        const pages: (number | '...')[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
            return pages
        }

        pages.push(1)

        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)

        if (start > 2) pages.push('...')
        for (let i = start; i <= end; i++) pages.push(i)
        if (end < totalPages - 1) pages.push('...')

        pages.push(totalPages)
        return pages
    }

    const btnBase =
        'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center'
    const btnActive = 'bg-primary text-white shadow-sm'
    const btnInactive =
        'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    const btnDisabled = 'opacity-40 pointer-events-none'

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
            >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {getVisiblePages().map((page, idx) =>
                page === '...' ? (
                    <span key={`dots-${idx}`} className="min-w-[36px] h-9 flex items-center justify-center text-slate-400">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`${btnBase} ${page === currentPage ? btnActive : btnInactive}`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
            >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
        </div>
    )
}
