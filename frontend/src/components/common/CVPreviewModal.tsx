import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Cấu hình worker cho pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs?v=5.4.296',
    import.meta.url,
).toString();

interface CVPreviewModalProps {
    url: string
    fileName: string
    isOpen: boolean
    onClose: () => void
}

export function CVPreviewModal({ url, fileName, isOpen, onClose }: CVPreviewModalProps) {
    const [numPages, setNumPages] = useState<number | null>(null)
    const [scale, setScale] = useState(1.0)
    const modalRef = useRef<HTMLDivElement>(null)

    // Determine file type
    const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i)
    const isPDF = url.match(/\.pdf$/i)

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen) return null

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
    }

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0))
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div
                ref={modalRef}
                className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg z-10">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-md">
                        {fileName}
                    </h3>
                    <div className="flex items-center gap-4">
                        {isPDF && (
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={zoomOut}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Thu nhỏ"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                <span className="text-sm font-medium w-12 text-center text-gray-700 dark:text-gray-200">
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    onClick={zoomIn}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                    title="Phóng to"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <a
                            href={url}
                            download
                            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Tải xuống"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            title="Đóng"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4 flex justify-center">
                    {isImage ? (
                        <img
                            src={url}
                            alt={fileName}
                            className="max-w-full h-auto object-contain shadow-lg"
                        />
                    ) : isPDF ? (
                        <div className="shadow-lg">
                            <Document
                                file={url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex items-center justify-center p-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                }
                                error={
                                    <div className="text-center p-12 text-red-500 bg-white dark:bg-gray-800 rounded-lg">
                                        <p>Không thể tải file PDF.</p>
                                        <a href={url} download className="text-blue-600 hover:underline mt-2 inline-block">
                                            Tải xuống để xem
                                        </a>
                                    </div>
                                }
                            >
                                {Array.from(new Array(numPages), (_, index) => (
                                    <div key={`page_${index + 1}`} className="mb-4 last:mb-0">
                                        <Page
                                            pageNumber={index + 1}
                                            scale={scale}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            className="bg-white"
                                        />
                                    </div>
                                ))}
                            </Document>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>Không thể xem trước định dạng này.</p>
                            <a
                                href={url}
                                download
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Tải xuống file
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
