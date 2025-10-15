import React from "react";
import { AngleLeftIcon, AngleRightIcon } from "../../icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage <= 4) {
                for (let i = 2; i <= 3; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push("...");
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center gap-1 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-3 text-sm rounded-md font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Предыдущая страница"
            >
                <AngleLeftIcon />
            </button>

            {pageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                    {page === "..." ? (
                        <span className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border rounded-md border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                            ...
                        </span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page as number)}
                            className={`px-3 py-2 text-sm font-medium border ${
                                page === currentPage
                                    ? "text-white bg-blue-600 border-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-600 rounded-md"
                                    : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 rounded-md dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-3 text-sm rounded-md font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Следующая страница"
            >
                <AngleRightIcon />
            </button>
        </div>
    );
};

export default Pagination;
