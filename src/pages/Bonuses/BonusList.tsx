import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, getStoredYear, PostSimple, GetDataSimpleBlobExel } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableBonus from "./TableBonus.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddBonusModal from "./AddBonusModal.tsx";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { FaDownload } from "react-icons/fa";
import DatePicker from "../../components/form/date-picker";

interface Bonus {
    bonus_id: number;
    to_user_id: number;
    user_name: string;
    bonuses_comments: string;
    amount_of_bonuses: number;
    created_at: string;
}

export default function BonusList() {
    const { searchQuery, currentPage, setIsSearching } = useSearch();
    const [filteredBonuses, setFilteredBonuses] = useState<Bonus[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();
    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);

    const fetchBonuses = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/user-bonuses/list?page=${page}&limit=30&year=${getStoredYear()}`
            );
            const bonusesData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setFilteredBonuses(bonusesData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching bonuses:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Что-то пошло не так при загрузке бонусов"
            );
            setLoading(false);
        }
    }, [page]);

    const performSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || query.trim().length < 3) return;

            setIsSearching(true);
            try {
                const response: any = await PostSimple(
                    `api/user-bonuses/search?keyword=${encodeURIComponent(
                        query
                    )}&page=${page}&limit=100&year=${getStoredYear()}`
                );

                if (response?.status === 200 || response?.data?.success) {
                    const searchResults =
                        response?.data?.result || response?.result || [];
                    const totalPagesData =
                        response?.data?.pages || response?.pages || 1;

                    setFilteredBonuses(searchResults);
                    setTotalPages(totalPagesData);
                } else {
                    fetchBonuses();
                }
            } catch (error) {
                fetchBonuses();
            } finally {
                setIsSearching(false);
            }
        },
        [page, fetchBonuses, setIsSearching]
    );

    const changeStatus = useCallback(() => {
        setStatus(!status);
        // Table list ni yangilash
        fetchBonuses();
    }, [status, fetchBonuses]);

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
                `api/excel/staffbonus?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
            );

            // Create blob and download
            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `staffbonus-${startDate}-${endDate}.xlsx`;
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
            console.error(error?.response);
            toast.error(error?.response?.data?.error||
                "Данные отсутствуют"
            );
        } finally {
            setDownloading(false);
        }
    };

    // Initial fetch when component mounts
    useEffect(() => {
        fetchBonuses();
    }, [fetchBonuses]);

    // Handle search and page changes
    useEffect(() => {
        if (currentPage === "bonuses") {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                fetchBonuses();
            }
        }
    }, [searchQuery, currentPage, status, performSearch, fetchBonuses]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список бонусов" />
            <PageBreadcrumb pageTitle="Бонусы" />
            <ComponentCard
                title="Список бонусов"
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
                            Добавить бонус
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
                <TableBonus
                    bonuses={filteredBonuses}
                    changeStatus={changeStatus}
                />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <AddBonusModal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    changeStatus();
                }}
                changeStatus={changeStatus}
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
