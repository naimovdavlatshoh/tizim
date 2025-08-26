import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, PostSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableExpense from "./TableExpense.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import AddExpenseModal from "./AddExpenseModal.tsx";
import Loader from "../../components/ui/loader/Loader.tsx";

interface Expense {
    expenses_id: number;
    expenses_category_id: number;
    amount: number;
    comments?: string;
    created_at: string;
    user_name: string;
    category_name?: string;
}

interface ExpenseCategory {
    expenses_category_id: number;
    category_name: string;
}

export default function ExpenseList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/expenses/list?page=${page}&limit=10`
            );
            const expensesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredExpenses(expensesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error("Что-то пошло не так при загрузке расходов");
        }
    }, [page]);

    const fetchCategories = useCallback(async () => {
        try {
            const response: any = await GetDataSimple(
                `api/expensescategories/list?page=1&limit=100`
            );
            const categoriesData =
                response?.result || response?.data?.result || [];
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || query.trim().length < 3) return;

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/expenses/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=10`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredExpenses(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchExpenses();
                }
            } catch (error) {
                fetchExpenses();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchExpenses]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchExpenses();
    }, [status, fetchExpenses]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Fetch categories only when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, fetchCategories]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "expenses") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchExpenses();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchExpenses]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список расходов" />
            <PageBreadcrumb pageTitle="Расходы" />
            <ComponentCard
                title="Список расходов"
                desc={
                    <div className="flex gap-3 items-center">
                        {/* <input
                            type="text"
                            placeholder="Поиск расходов..."
                            value={searchQuery}
                            onChange={(e) => {
                                const query = e.target.value;
                                if (
                                    query.trim().length >= 3 ||
                                    query.trim() === ""
                                ) {
                                    performSearch(query);
                                }
                            }}
                            className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        /> */}
                        <button
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Добавить расход
                        </button>
                    </div>
                }
            >
                <TableExpense
                    expenses={filteredExpenses}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddExpenseModal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
                categories={categories}
            />

            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}
