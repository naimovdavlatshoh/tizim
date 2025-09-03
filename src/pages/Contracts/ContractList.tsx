import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
import TableContract from "./TableContract.tsx";
import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { FaDownload } from "react-icons/fa";
import DatePicker from "../../components/form/date-picker";

export default function ContractList() {
    const navigate = useNavigate();
    const { searchQuery, currentPage, isSearching, setIsSearching } =
        useSearch();
    const [contracts, setContracts] = useState([]);
    const [filteredContracts, setFilteredContracts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    console.log(contracts);

    const [loading, setLoading] = useState(false);
    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (currentPage === "contracts") {
            if (searchQuery.trim()) {
                // Search query bo'lsa search API ni chaqirish
                performSearch(searchQuery);
            } else {
                // Search query bo'lmasa oddiy list ni yuklash
                fetchContracts();
            }
        }
    }, [searchQuery, currentPage, status, page]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/contracts/list?page=${page}&limit=10`
            );
            const contractsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setContracts(contractsData);
            setFilteredContracts(contractsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Ошибка при загрузке договоров");
            setLoading(false);
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim() || query.trim().length < 3) return;

        setIsSearching(true);
        try {
            // Search API ni chaqirish (POST request with URL params)
            const response: any = await PostSimple(
                `api/contracts/search?keyword=${encodeURIComponent(
                    query
                )}&page=${page}&limit=10`
            );

            if (response?.status === 200 || response?.data?.success) {
                const searchResults =
                    response?.data?.result || response?.result || [];
                const totalPagesData =
                    response?.data?.pages || response?.pages || 1;

                setFilteredContracts(searchResults);
                setTotalPages(totalPagesData);

                // if (searchResults.length === 0) {
                //     toast.success(`Поиск не дал результатов для: "${query}"`);
                // }
            } else {
                toast.error("Ошибка при поиске договоров");
                // Search xatoligida oddiy list ni yuklash
                fetchContracts();
            }
        } catch (error) {
            console.error("Error searching contracts:", error);
            toast.error("Ошибка при поиске договоров");
            // Search xatoligida oddiy list ni yuklash
            fetchContracts();
        } finally {
            setIsSearching(false);
        }
    };

    const changeStatus = () => {
        setStatus(!status);
    };

    const handleAddContract = () => {
        navigate("/contracts/add");
    };

    const handleDownloadExcel = async (): Promise<void> => {
        if (!startDate || !endDate) {
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
                `api/excel/contracts?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
            );

            // Create blob and download
            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `contracts-${startDate}-${endDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Excel файл загружен");
            setExcelModalOpen(false);
            setStartDate("");
            setEndDate("");
        } catch (error) {
            console.error("Error downloading excel:", error);
            toast.error("Ошибка при загрузке Excel файла");
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
                description="Список договоров с поиском"
            />
            <PageBreadcrumb pageTitle="Договоры" />
            <div className="space-y-6">
                <ComponentCard
                    title="Договоры"
                    desc={
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddContract}
                                className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                                + Добавить договор
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
                    {searchQuery && currentPage === "contracts" && (
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
                                        Найдено: {filteredContracts.length}{" "}
                                        договоров
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

                    <TableContract
                        contracts={filteredContracts}
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
