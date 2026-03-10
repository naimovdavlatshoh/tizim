import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, GetDataSimpleBlob, GetDataSimpleBlobExel, getStoredYear } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import { Toaster } from "react-hot-toast";

// import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import DebtorsTable from "./DebtorsTable";
import { FaDownload } from "react-icons/fa";

export default function Debtors() {
    // const { searchQuery, currentPage, setIsSearching } = useSearch();
    const currentPage = "debtors";
    const [debtors, setDebtors] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);
    const [installmentsModalOpen, setInstallmentsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloadingInstallments, setDownloadingInstallments] = useState(false);

    useEffect(() => {
        if (currentPage === "debtors") {
            fetchDebtors();
        }
    }, [currentPage, status, page]);

    const fetchDebtors = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/debtors/list?page=${page}&limit=30&year=${getStoredYear()}`
            );
            const debtorsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setDebtors(debtorsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching debtors:", error);
            toast.error("Что-то пошло не так при загрузке должников");
            setLoading(false);
        }
    };

    const changeStatus = () => {
        setStatus(!status);
    };

    const handleDownloadExcel = async () => {
        setDownloadingExcel(true);
        try {
            const blob = await GetDataSimpleBlob("api/excel/debtors", {
                responseType: "blob",
            });
            if (blob && blob instanceof Blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `Должники-${getStoredYear() || "export"}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success("Файл успешно загружен");
            } else {
                toast.error("Ошибка при загрузке файла");
            }
        } catch (error) {
            console.error("Error downloading Excel:", error);
            toast.error("Ошибка при загрузке Excel");
        } finally {
            setDownloadingExcel(false);
        }
    };

    const handleDownloadInstallmentsExcel = async (): Promise<void> => {
        if (!startDate || !endDate) {
            toast.error("Пожалуйста, выберите даты");
            return;
        }

        setDownloadingInstallments(true);
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
                `api/excel/installments?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
            );

            // Create blob and download
            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `debtors-installments-${startDate}-${endDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Excel файл успешно скачан");
            setInstallmentsModalOpen(false);
            setStartDate("");
            setEndDate("");
        } catch (error: any) {
            console.error("Error downloading installments excel:", error);
            setInstallmentsModalOpen(false);

            if (error?.response?.data instanceof ArrayBuffer) {
                const decoder = new TextDecoder("utf-8");
                const text = decoder.decode(error.response.data);
                try {
                    const json = JSON.parse(text);
                    toast.error(json.error || "Ошибка при загрузке Excel");
                } catch (e) {
                    toast.error("Ошибка при загрузке Excel");
                }
            } else {
                toast.error(
                    error?.response?.data?.error || "Ошибка при загрузке Excel"
                );
            }
        } finally {
            setDownloadingInstallments(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список должников" />
            <PageBreadcrumb pageTitle="Должники" />
            <ComponentCard
                title="Список должников"
                desc={
                    <div className="flex gap-3 items-center flex-wrap">
                        <button
                            onClick={handleDownloadExcel}
                            disabled={downloadingExcel}
                            className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaDownload />
                            {downloadingExcel ? "Загрузка..." : "Excel"}
                        </button>
                        <button
                            onClick={() => setInstallmentsModalOpen(true)}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <FaDownload />
                            Должники по рассрочке
                        </button>
                    </div>
                }
            >
                <DebtorsTable debtors={debtors} changeStatus={changeStatus} />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            {/* Installments Excel Download Modal */}
            <Modal
                isOpen={installmentsModalOpen}
                onClose={() => {
                    setInstallmentsModalOpen(false);
                    setStartDate("");
                    setEndDate("");
                }}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Скачать Excel отчет (Должники по рассрочке)
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
                                setInstallmentsModalOpen(false);
                                setStartDate("");
                                setEndDate("");
                            }}
                            disabled={downloadingInstallments}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleDownloadInstallmentsExcel}
                            disabled={downloadingInstallments}
                            startIcon={<FaDownload />}
                        >
                            {downloadingInstallments ? "Загруzka..." : "Скачать Excel"}
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
