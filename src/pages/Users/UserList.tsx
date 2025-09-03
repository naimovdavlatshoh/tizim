import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { GetDataSimple, GetDataSimpleBlobExel } from "../../service/data";
import { useModal } from "../../hooks/useModal";
import AddUserModal from "./AddUser";
import TableUser from "./TableUser";
import Pagination from "../../components/common/Pagination.tsx"; // 👈 yangi component
import { Toaster } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import { FaDownload } from "react-icons/fa";
import DatePicker from "../../components/form/date-picker";
import { toast } from "react-hot-toast";

export default function ClientList() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1); // 👈 pagination uchun
    const [totalPages, setTotalPages] = useState(1);
    const { isOpen, openModal, closeModal } = useModal();
    const [status, setStatus] = useState(false);
    const [response, setResponse] = useState("");
    console.log(response);
    const [loading, setLoading] = useState(false);
    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        setLoading(true);
        GetDataSimple(`api/user/list?page=${page}&limit=10`).then((res) => {
            setUsers(res?.result || []);
            setTotalPages(res?.pages || 1);
            setLoading(false);
        });
    }, [status, page]);

    const changeStatus = () => {
        setStatus(!status);
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
                description="User list with pagination"
            />
            <PageBreadcrumb pageTitle="Пользователи" />
            <div className="space-y-6">
                <ComponentCard
                    title="Пользователи"
                    desc={
                        <div className="flex gap-2">
                            <button
                                onClick={openModal}
                                className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                                + Добавить пользователя
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
                    <TableUser users={users} changeStatus={changeStatus} />
                    <div className="mt-4">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </ComponentCard>
            </div>

            <AddUserModal
                isOpen={isOpen}
                onClose={closeModal}
                changeStatus={changeStatus}
                setResponse={setResponse}
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
