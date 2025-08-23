import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { GetDataSimple, PostSimple } from "../../service/data";
import Pagination from "../../components/common/Pagination";
import { Toaster } from "react-hot-toast";
import TablePayment from "./TablePayment";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import { useModal } from "../../hooks/useModal";
import AddPaymentModal from "./AddPayment";
import Loader from "../../components/ui/loader/Loader";

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
                `api/payments/list?page=${page}&limit=10`
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
                )}&page=${page}&limit=10`
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

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="Платежи" description="Список платежей с поиском" />
            <PageBreadcrumb pageTitle="Платежи" />
            <div className="space-y-6">
                <ComponentCard
                    title="Платежи"
                    desc={
                        <button
                            onClick={handleAddPayment}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            + Добавить платеж
                        </button>
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

            <Toaster position="top-right" reverseOrder={false} />
        </>
    );
}
