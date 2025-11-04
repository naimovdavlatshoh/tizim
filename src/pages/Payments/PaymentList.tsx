import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
    GetDataSimple,
    PostSimple,
    GetDataSimpleBlobExel,
} from "../../service/data";
import Pagination from "../../components/common/Pagination";
import { Toaster } from "react-hot-toast";
import TablePayment from "./TablePayment";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal";
import AddPaymentModal from "./AddPayment";
import Loader from "../../components/ui/loader/Loader";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { FaDownload } from "react-icons/fa";
import DatePicker from "../../components/form/date-picker";

interface Payment {
    payment_id: number;
    contract_id: number;
    contract_number?: string;
    client_name?: string;
    is_advance: number;
    amount: number;
    payment_type: number;
    comments?: string;
    created_at?: string;
    payment_type_text: string;
}

export default function PaymentList() {
    const { searchQuery, currentPage, isSearching, setIsSearching } =
        useSearch();
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [status, setStatus] = useState<boolean>(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (currentPage === "payments") {
            if (searchQuery.trim()) {
                // Search query bo'lsa search API ni chaqirish
                performSearch(searchQuery);
            } else {
                // Search query bo'lmasa oddiy list ni yuklash
                fetchPayments();
            }
        }
    }, [searchQuery, currentPage, status, page]);

    const fetchPayments = async (): Promise<void> => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/payments/list?page=${page}&limit=30`
            );
            const paymentsData: Payment[] =
                response?.result || response?.data?.result || [];
            const totalPagesData: number =
                response?.pages || response?.data?.pages || 1;

            setFilteredPayments(paymentsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Ошибка при загрузке платежей");
            setLoading(false);
        }
    };

    const performSearch = async (query: string): Promise<void> => {
        if (!query.trim() || query.trim().length < 3) return;

        setIsSearching(true);
        try {
            // Search API ni chaqirish (POST request with URL params)
            const response: any = await PostSimple(
                `api/payments/search?keyword=${encodeURIComponent(
                    query
                )}&page=${page}&limit=30`
            );

            if (response?.status === 200 || response?.data?.success) {
                const searchResults: Payment[] =
                    response?.data?.result || response?.result || [];
                const totalPagesData: number =
                    response?.data?.pages || response?.pages || 1;

                setFilteredPayments(searchResults);
                setTotalPages(totalPagesData);

                if (searchResults.length === 0) {
                    toast.success(`Поиск не дал результатов для: "${query}"`);
                }
            } else {
                toast.error("Ошибка при поиске платежей");
                // Search xatoligida oddiy list ni yuklash
                fetchPayments();
            }
        } catch (error) {
            console.error("Error searching payments:", error);
            toast.error("Ошибка при поиске платежей");
            // Search xatoligida oddiy list ni yuklash
            fetchPayments();
        } finally {
            setIsSearching(false);
        }
    };

    const changeStatus = (): void => {
        setStatus(!status);
    };

    const handleAddPayment = (): void => {
        openModal();
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

            const response = await GetDataSimpleBlobExel(
                `api/excel/payments?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
            );
            console.log(response);

            // Create blob and download
            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `payments-${startDate}-${endDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Excel файл загружен");
            setExcelModalOpen(false);
            setStartDate("");
            setEndDate("");
        } catch (error: any) {
            setExcelModalOpen(false);
            console.log("Error downloading excel:", error);

            let message = "Произошла ошибка";

            if (error.response) {
                const data = error.response.data;

                if (data instanceof ArrayBuffer) {
                    try {
                        const decoder = new TextDecoder("utf-8");
                        const text = decoder.decode(data);
                        const parsed = JSON.parse(text);
                        message = parsed.error || text;
                    } catch {
                        const decoder = new TextDecoder("utf-8");
                        message = decoder.decode(data);
                    }
                } else if (typeof data === "object" && data.error) {
                    message = data.error;
                } else {
                    message = error.message;
                }
            } else {
                message = error.message;
            }

            toast.error(message);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta
                title="BNM Tizim"
                description="Список платежей с поиском"
            />
            <PageBreadcrumb pageTitle="Платежи" />
            <div className="space-y-6">
                <ComponentCard
                    title="Платежи"
                    desc={
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddPayment}
                                className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                                + Добавить платеж
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
                    {/* Search Results Info */}
                    {searchQuery && currentPage === "payments" && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                                        Результаты поиска
                                    </h3>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        Поиск по запросу:{" "}
                                        <span className="font-semibold">
                                            "{searchQuery}"
                                        </span>
                                    </p>
                                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                                        Найдено: {filteredPayments.length}{" "}
                                        платежей
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        // Search ni tozalash
                                        window.location.reload();
                                    }}
                                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
                                >
                                    Очистить поиск
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {isSearching && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <span className="text-yellow-800 dark:text-yellow-200">
                                    Поиск...
                                </span>
                            </div>
                        </div>
                    )}

                    <TablePayment
                        payments={filteredPayments as any}
                        changeStatus={changeStatus}
                    />

                    {!isSearching && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </ComponentCard>
            </div>

            <AddPaymentModal
                isOpen={isOpen}
                onClose={closeModal}
                changeStatus={changeStatus}
                setResponse={() => {}}
            />

            {/* Excel Download Modal */}
            <Modal
                isOpen={excelModalOpen}
                onClose={() => {
                    setExcelModalOpen(false);
                    setStartDate("");
                    setEndDate("");
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
                                    const formattedDate = date
                                        .toISOString()
                                        .split("T")[0];
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
                                    const formattedDate = date
                                        .toISOString()
                                        .split("T")[0];
                                    setEndDate(formattedDate);
                                }
                            }}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setExcelModalOpen(false);
                                setStartDate("");
                                setEndDate("");
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

            <Toaster position="top-right" reverseOrder={false} />
        </>
    );
}
