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
import Select from "../../components/form/Select";
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
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [downloading, setDownloading] = useState(false);

    // Get month name in Russian
    const getMonthName = (month: number) => {
        const months = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ];
        return months[month - 1] || "";
    };

    // Month options for Select
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(
        (month) => ({
            value: month,
            label: getMonthName(month),
        })
    );

    // Year options for Select
    const yearOptions = Array.from(
        { length: 5 },
        (_, i) => new Date().getFullYear() - 2 + i
    ).map((year) => ({
        value: year,
        label: year.toString(),
    }));

    useEffect(() => {
        setLoading(true);
        GetDataSimple(`api/user/list?page=${page}&limit=30`).then((res) => {
            setUsers(res?.result || []);
            setTotalPages(res?.pages || 1);
            setLoading(false);
        });
    }, [status, page]);

    const changeStatus = () => {
        setStatus(!status);
    };

    const handleDownloadExcel = async (): Promise<void> => {
        if (!selectedYear || !selectedMonth) {
            setExcelModalOpen(false);
            toast.error("Пожалуйста, выберите год и месяц");
            return;
        }

        setDownloading(true);
        try {
            const response = await GetDataSimpleBlobExel(
                `api/excel/attendance?year=${selectedYear}&month=${selectedMonth}`
            );

            // Create blob and download
            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `attendance-${selectedYear}-${selectedMonth}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Excel файл загружен");
            setExcelModalOpen(false);
        } catch (error: any) {
            setExcelModalOpen(false);
            console.error(error?.response?.data?.error);
            toast.error(error?.response?.data?.error || "Ошибка при загрузке Excel файла");
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
                }}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Скачать Excel отчет
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Год *
                            </label>
                            <Select
                                options={yearOptions}
                                placeholder="Выберите год"
                                onChange={(value) => setSelectedYear(Number(value))}
                                className="dark:bg-dark-900"
                                defaultValue={selectedYear.toString()}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Месяц *
                            </label>
                            <Select
                                options={monthOptions}
                                placeholder="Выберите месяц"
                                onChange={(value) => setSelectedMonth(Number(value))}
                                className="dark:bg-dark-900"
                                defaultValue={selectedMonth.toString()}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setExcelModalOpen(false);
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
