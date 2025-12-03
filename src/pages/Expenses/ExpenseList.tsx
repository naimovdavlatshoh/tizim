import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import {
    GetDataSimple,
    PostSimple,
    GetDataSimpleBlobExel,
} from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableExpense from "./TableExpense.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal.ts";
import AddExpenseModal from "./AddExpenseModal.tsx";
import Loader from "../../components/ui/loader/Loader.tsx";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { FaDownload } from "react-icons/fa";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";

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
    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [availableCount, setAvailableCount] = useState<number | null>(null);
    const [checkingCount, setCheckingCount] = useState(false);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/expenses/list?page=${page}&limit=30`
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
                `api/expensescategories/list?page=1&limit=30`
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
                    )}&page=${page}&limit=30`
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

    const checkAvailableCount = async (): Promise<void> => {
        if (!startDate || !endDate) {
            setAvailableCount(null);
            return;
        }

        setCheckingCount(true);
        try {
            // Convert Y-m-d format to d-m-Y format
            const formatDateForAPI = (dateString: string) => {
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const formattedStartDate = formatDateForAPI(startDate);
            const formattedEndDate = formatDateForAPI(endDate);

            // Build URL with parameters
            let url = `api/excel/expenses?start_date=${formattedStartDate}&end_date=${formattedEndDate}&count=1`;

            if (selectedCategoryId) {
                url += `&expenses_category_id=${selectedCategoryId}`;
            }

            const response = await GetDataSimple(url);
            const count =
                response?.total_count || response?.data?.total_count || 0;
            setAvailableCount(count);

            if (count > 0) {
                toast.success(`По вашему запросу найдено ${count} записей`);
            } else {
                toast.error("Данные не найдены");
            }
        } catch (error) {
            console.error("Error checking count:", error);
            toast.error("Данные не найдены");
            setAvailableCount(null);
        } finally {
            setCheckingCount(false);
        }
    };

    const handleDownloadExcel = async (): Promise<void> => {
        if (!startDate || !endDate) {
            setExcelModalOpen(false);
            toast.error("Пожалуйста, выберите даты");
            return;
        }

        setDownloading(true);
        try {
            // Convert Y-m-d format to d-m-Y format
            const formatDateForAPI = (dateString: string) => {
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, "0");
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const formattedStartDate = formatDateForAPI(startDate);
            const formattedEndDate = formatDateForAPI(endDate);

            // Build URL with parameters (without count for download)
            let url = `api/excel/expenses?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;

            if (selectedCategoryId) {
                url += `&expenses_category_id=${selectedCategoryId}`;
            }

            const response = await GetDataSimpleBlobExel(url);

            // Create blob and download
            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url_download = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url_download;
            link.download = `expenses-${startDate}-${endDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url_download);

            toast.success("Excel файл загружен");
            setExcelModalOpen(false);
            setStartDate("");
            setEndDate("");
            setSelectedCategoryId("");
            setAvailableCount(null);
        } catch (error: any) {
            setExcelModalOpen(false);
            console.error("Error downloading excel:", error);
            toast.error(error?.response?.data?.error);
        } finally {
            setDownloading(false);
        }
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Fetch categories only when modal opens
    useEffect(() => {
        fetchCategories();
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

    // Auto-check count when dates or category change
    useEffect(() => {
        if (startDate && endDate) {
            const timeoutId = setTimeout(() => {
                checkAvailableCount();
            }, 500); // Debounce for 500ms

            return () => clearTimeout(timeoutId);
        } else {
            setAvailableCount(null);
        }
    }, [startDate, endDate, selectedCategoryId]);

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
                        <button
                            onClick={() => setExcelModalOpen(true)}
                            className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                            <FaDownload />
                            Excel
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

            {/* Excel Download Modal */}
            <Modal
                isOpen={excelModalOpen}
                onClose={() => {
                    setExcelModalOpen(false);
                    setStartDate("");
                    setEndDate("");
                    setSelectedCategoryId("");
                    setAvailableCount(null);
                }}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Скачать Excel отчет
                    </h3>

                    <div className="space-y-4">
                        <DatePicker
                            id="start-date"
                            label="Начальная дата *"
                            placeholder="Выберите начальную дату"
                            onChange={(selectedDates) => {
                                if (selectedDates[0]) {
                                    const date = new Date(selectedDates[0]);
                                    // Используем локальные методы для избежания проблем с часовыми поясами
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                        2,
                                        "0"
                                    );
                                    const formattedDate = `${year}-${month}-${day}`;
                                    setStartDate(formattedDate);
                                }
                            }}
                        />

                        <DatePicker
                            id="end-date"
                            label="Конечная дата *"
                            placeholder="Выберите конечную дату"
                            onChange={(selectedDates) => {
                                if (selectedDates[0]) {
                                    const date = new Date(selectedDates[0]);
                                    // Используем локальные методы для избежания проблем с часовыми поясами
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                        2,
                                        "0"
                                    );
                                    const formattedDate = `${year}-${month}-${day}`;
                                    setEndDate(formattedDate);
                                }
                            }}
                        />

                        {checkingCount && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    Проверка количества записей...
                                </p>
                            </div>
                        )}
                        {availableCount !== null && !checkingCount && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Найдено записей:{" "}
                                    <span className="font-semibold">
                                        {availableCount}
                                    </span>
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Категория расходов (не обязательно)
                            </label>
                            <Select
                                options={[
                                    { value: 0, label: "Все категории" },
                                    ...categories.map((category) => ({
                                        value: category.expenses_category_id,
                                        label: category.category_name,
                                    })),
                                ]}
                                placeholder="Выберите категорию"
                                onChange={(value) =>
                                    setSelectedCategoryId(
                                        value === "0" ? "" : value
                                    )
                                }
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setExcelModalOpen(false);
                                setStartDate("");
                                setEndDate("");
                                setSelectedCategoryId("");
                                setAvailableCount(null);
                            }}
                            disabled={downloading}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleDownloadExcel}
                            disabled={downloading}
                            startIcon={<FaDownload />}
                        >
                            {downloading ? "Загрузка..." : "Скачать Excel"}
                        </Button>
                    </div>
                </div>
            </Modal>

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
