import { useEffect, useState, useRef } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import {
    GetDataSimple,
    getStoredYear,
    GetDataSimplePDF,
    GetDataSimpleBlobExel,
    PostSimpleFormData,
    PostDataTokenJson,
} from "../../../service/data.ts";
import Pagination from "../../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { FaQrcode, FaRegEye, FaUserEdit, FaDownload, FaCheck, FaTimes } from "react-icons/fa";
import { TbDownload } from "react-icons/tb";
import { useNavigate } from "react-router";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
// import Linkto from "../../../components/ui/link/LinkTo";
import AssignModal from "../NewContracts/AssignModal";
import { formatDate } from "../../../utils/numberFormat";
import Loader from "../../../components/ui/loader/Loader.tsx";

import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import DatePicker from "../../../components/form/date-picker";

interface PendingContract {
    appointment_id: number;
    contract_id: string;
    contract_number: string;
    contract_status: string;
    object_address: string;
    worker_price: string;
    deadline_date: string;
    days_diff: string;
    days_diff_text: string;
    client_id: string;
    client_name: string;
    client_type: string;
    business_name: string;
    phone_number: string;
    bank_account: string;
    bank_address: string;
    inn: string;
    mfo: string;
    oked: string;
    business_address: string;
    worker_user_id: string | null;
    worker_name: string | null;
    comments: string | null;
    final_document?: string | boolean | null;
    status: number;
    status_text: string;
    current_pdf?: {
        pdf_id: number;
        file_path: string;
        attempt_number: number;
        created_at: string;
    } | null;
    task_info?: {
        tasks: Array<{
            task_id: number;
            task_item: Array<{
                comments: string | null;
                [key: string]: unknown;
            }>;
        }>;
    };
}

interface User {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
}

const PendingContracts = () => {
    const [contracts, setContracts] = useState<PendingContract[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContracts, setTotalContracts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] =
        useState<PendingContract | null>(null);
    const [replaceModalOpen, setReplaceModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [replacing, setReplacing] = useState(false);
    const [downloadingQr, setDownloadingQr] = useState<string | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
    const navigate = useNavigate();
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
    const [selectedContractForPdf, setSelectedContractForPdf] =
        useState<PendingContract | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [resultModalAction, setResultModalAction] = useState<
        "accept" | "cancel" | null
    >(null);
    const [selectedContractForResult, setSelectedContractForResult] =
        useState<PendingContract | null>(null);
    const [resultComment, setResultComment] = useState("");
    const [resultCommentError, setResultCommentError] = useState<string | null>(
        null,
    );
    const [resultSubmitting, setResultSubmitting] = useState(false);
    const [resultTaskId, setResultTaskId] = useState<number | null>(null);
    const [resultInfoLoading, setResultInfoLoading] = useState(false);

    // Excel download modal state
    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [availableCount, setAvailableCount] = useState<number | null>(null);
    const [checkingCount, setCheckingCount] = useState(false);

    useEffect(() => {
        fetchPendingContracts();
    }, [page]);

    useEffect(() => {
        if (replaceModalOpen) {
            fetchUsers();
        }
    }, [replaceModalOpen]);

    useEffect(() => {
        if (!resultModalOpen || !selectedContractForResult) return;
        setResultTaskId(selectedContractForResult.appointment_id);
    }, [resultModalOpen, selectedContractForResult?.appointment_id]);

    // Auto-check count when dates change (debounced)
    useEffect(() => {
        if (startDate && endDate) {
            const timeoutId = setTimeout(() => {
                checkAvailableCount();
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setAvailableCount(null);
        }
    }, [startDate, endDate]);

    const fetchPendingContracts = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/appointment/all/list?contract_status=5&page=${page}&limit=30&year=${getStoredYear()}`,
            );
            const contractsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;
            const totalData =
                response?.total ??
                response?.count ??
                response?.total_count ??
                response?.data?.total ??
                response?.data?.count ??
                response?.data?.total_count ??
                0;

            setContracts(contractsData);
            setTotalPages(totalPagesData);
            setTotalContracts(totalData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending contracts:", error);
            toast.error("Ошибка при загрузке договоров в процессе");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (contract: PendingContract) => {
        console.log("Contract clicked:", contract);
    };

    // Convert Y-m-d format to d-m-Y format for the API
    const formatDateForAPI = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const checkAvailableCount = async (): Promise<void> => {
        if (!startDate || !endDate) {
            setAvailableCount(null);
            return;
        }

        setCheckingCount(true);
        try {
            const formattedStartDate = formatDateForAPI(startDate);
            const formattedEndDate = formatDateForAPI(endDate);

            const url = `api/excel/contract-tasks?start_date=${formattedStartDate}&end_date=${formattedEndDate}&count=1`;

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
            const formattedStartDate = formatDateForAPI(startDate);
            const formattedEndDate = formatDateForAPI(endDate);

            const url = `api/excel/contract-tasks?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;

            const response = await GetDataSimpleBlobExel(url);

            const blob = new Blob([response], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url_download = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url_download;
            link.download = `contract-tasks-${startDate}-${endDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url_download);

            toast.success("Excel файл загружен");
            setExcelModalOpen(false);
            setStartDate("");
            setEndDate("");
            setAvailableCount(null);
        } catch (error: any) {
            setExcelModalOpen(false);
            console.error("Error downloading excel:", error);
            toast.error(error?.response?.data?.error);
        } finally {
            setDownloading(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response: any = await GetDataSimple(
                "api/user/list?page=1&limit=100",
            );
            const usersData = response?.result || response?.data?.result || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error("Ошибка при загрузке сотрудников");
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleReplaceWorker = async () => {
        if (!selectedUserId || !selectedContract) {
            toast.error("Пожалуйста, выберите сотрудника");
            return;
        }

        setReplacing(true);
        try {
            const response = await PostDataTokenJson(
                "api/appointment/replace/worker",
                {
                    appointment_id: selectedContract.appointment_id,
                    new_worker_id: selectedUserId,
                },
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Сотрудник успешно переназначен!");
                setReplaceModalOpen(false);
                setSelectedUserId(null);
                setSelectedContract(null);
                fetchPendingContracts(); // Refresh the contracts list
            }
        } catch (error: any) {
           setReplaceModalOpen(false);
            
            const errorMessage =
                error?.response?.data?.message ||
                "Ошибка при переназначении сотрудника";
            toast.error(errorMessage);
        } finally {
            setReplacing(false);
        }
    };

    const handleAssignmentSuccess = () => {
        fetchPendingContracts();
    };

    const handleDownloadQr = async (contract: PendingContract) => {
        setDownloadingQr(contract.contract_id);
        try {
            const response = await GetDataSimplePDF(
                `api/appointment/downloadqrcode/${contract.contract_id}`,
            );
            const blob = new Blob([response.data], { type: "image/png" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qrcode-${
                contract.contract_number || contract.contract_id
            }.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("QR-код скачан");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error || "Ошибка при скачивании QR-кода",
            );
        } finally {
            setDownloadingQr(null);
        }
    };

    // const openPdfUploadModal = (contract: PendingContract) => {
    //     setSelectedContractForPdf(contract);
    //     setIsPdfUploadModalOpen(true);
    // };

    const closePdfUploadModal = () => {
        setIsPdfUploadModalOpen(false);
        setSelectedContractForPdf(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePdfUpload = async () => {
        if (!selectedContractForPdf || !fileInputRef.current?.files?.[0]) {
            toast.error("Выберите PDF файл");
            return;
        }
        const file = fileInputRef.current.files[0];
        if (file.type !== "application/pdf") {
            toast.error("Выберите файл в формате PDF");
            return;
        }
        setUploadingPdf(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response: any = await PostSimpleFormData(
                `api/contracts/upload-pdf/${selectedContractForPdf.contract_id}`,
                formData,
            );
            if (response?.status === 200 || response?.data?.success) {
                toast.success("PDF успешно загружен");
                closePdfUploadModal();
                fetchPendingContracts();
            } else {
                toast.error("Ошибка при загрузке PDF");
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error || "Ошибка при загрузке PDF",
            );
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleDownloadPdf = async (contract: PendingContract) => {
        const pdfId = contract.current_pdf?.pdf_id;
        if (!pdfId) return;
        setDownloadingPdf(contract.contract_id);
        try {
            const response = await GetDataSimplePDF(
                `api/appointment/result/pdf/${pdfId}`,
            );
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `contract-${
                contract.contract_number || contract.contract_id
            }.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("PDF скачан");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error || "Ошибка при скачивании PDF",
            );
        } finally {
            setDownloadingPdf(null);
        }
    };

    const openResultModal = (
        contract: PendingContract,
        action: "accept" | "cancel",
    ) => {
        setSelectedContractForResult(contract);
        setResultModalAction(action);
        setResultComment("");
        setResultModalOpen(true);
    };

    const closeResultModal = () => {
        setResultModalOpen(false);
        setResultModalAction(null);
        setSelectedContractForResult(null);
        setResultComment("");
        setResultCommentError(null);
        setResultTaskId(null);
        setResultInfoLoading(false);
    };

    const handleResultSubmit = async () => {
        if (!selectedContractForResult || !resultModalAction) return;
        if (resultTaskId == null) return;
        const commentTrimmed = resultComment.trim();
        if (resultModalAction === "cancel" && !commentTrimmed) {
            setResultCommentError("Комментарий не может быть пустым");
            return;
        }
        setResultCommentError(null);
        setResultSubmitting(true);
        try {
            const url =
                resultModalAction === "accept"
                    ? `api/appointment/accept/result/${resultTaskId}`
                    : `api/appointment/cancel/result/${resultTaskId}`;
            const response: any = await PostDataTokenJson(url, {
                comment: commentTrimmed,
            });
            if (response?.success || response?.data?.success) {
                toast.success(
                    resultModalAction === "accept"
                        ? "Результат принят"
                        : "Результат отклонён",
                );
                closeResultModal();
                fetchPendingContracts();
            } else {
                toast.error(
                    response?.message ||
                        response?.data?.message ||
                        "Ошибка при выполнении",
                );
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    "Ошибка при выполнении",
            );
        } finally {
            setResultSubmitting(false);
        }
    };

    // Derived stats for the header (current page)
    const assignedCount = contracts.filter((c) => c.worker_name).length;
    const awaitingResultCount = contracts.filter(
        (c) => c.current_pdf?.pdf_id && c.status !== 3 && c.status !== 4,
    ).length;
    const overdueCount = contracts.filter(
        (c) => Number(c.days_diff) < 0,
    ).length;

    // Color logic for the "days left" badge
    const getDaysLeftBadgeClass = (daysDiff: string | number) => {
        const diff = Number(daysDiff);
        if (Number.isNaN(diff)) {
            return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
        }
        if (diff < 0) {
            return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
        }
        if (diff <= 3) {
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200";
        }
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta
                title="BNM Tizim"
                description="Список договоров в процессе выполнения"
            />
            <PageBreadcrumb pageTitle="Договоры в процессе" />
            <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                            Всего в процессе
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {totalContracts}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                            Назначено (стр.)
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                            {assignedCount}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                            Ждут результата (стр.)
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                            {awaitingResultCount}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                            Просрочено (стр.)
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
                            {overdueCount}
                        </p>
                    </div>
                </div>

                <ComponentCard
                    title="Договоры в процессе"
                    desc={
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* <span className="text-sm text-gray-500 dark:text-gray-400">
                                Договоры со статусом «В процессе»
                            </span> */}
                            <button
                                onClick={() => setExcelModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                            >
                                <FaDownload className="size-3.5" />
                                Скачать Excel
                            </button>
                        </div>
                    }
                >
                    {/* Loading indicator */}
                    {loading && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex flex-row items-center gap-2 flex-nowrap">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <span className="text-yellow-800 dark:text-yellow-200">
                                    Загрузка...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                        <Table className="min-w-[800px]">
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 font-medium text-gray-500 whitespace-nowrap text-start text-theme-xs dark:text-gray-400"
                                    >
                                        #
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Н/договора
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Клиент
                                    </TableCell>
                                    {/* <TableCell
                                            isHeader
                                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                        >
                                            Стоимость работ
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                        >
                                            Адрес объекта
                                        </TableCell> */}
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Срок выполнения
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Осталось дней
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Исполнитель
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Статус
                                    </TableCell>
                                    {/* <TableCell
                                            isHeader
                                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                        >
                                            Комментарии
                                        </TableCell> */}
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Действия
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {contracts?.length === 0 && (
                                    <TableRow>
                                        <TableCell className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Договоры в процессе не найдены
                                        </TableCell>
                                    </TableRow>
                                )}
                                {contracts?.map(
                                    (
                                        contract: PendingContract,
                                        index: number,
                                    ) => (
                                        <TableRow
                                            key={contract.contract_id}
                                            className="transition-colors odd:bg-white even:bg-gray-50/60 hover:bg-brand-50/40 dark:odd:bg-transparent dark:even:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                                        >
                                            <TableCell
                                                className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {index + 1}
                                            </TableCell>
                                            <TableCell
                                                className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contract.contract_number}
                                            </TableCell>

                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contract.client_name}
                                            </TableCell>
                                            {/* <TableCell
                                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                    onClick={() =>
                                                        handleRowClick(contract)
                                                    }
                                                >
                                                    {formatCurrency(
                                                        parseFloat(
                                                            contract.worker_price
                                                        )
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                    onClick={() =>
                                                        handleRowClick(contract)
                                                    }
                                                >
                                                    {contract.object_address}
                                                </TableCell> */}
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {formatDate(
                                                    contract.deadline_date,
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDaysLeftBadgeClass(
                                                        contract.days_diff,
                                                    )}`}
                                                >
                                                    {contract.days_diff_text}
                                                </span>
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contract.worker_name ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        {contract.worker_name}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                        Не назначен
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                <span
                                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        contract.status === 1
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : contract.status ===
                                                                2
                                                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                                                              : contract.status ===
                                                                  3
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                                                : contract.status ===
                                                                    4
                                                                  ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                                                  : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {contract.status_text ||
                                                        "В ожидании"}
                                                </span>
                                            </TableCell>
                                            {/* <TableCell
                                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                    onClick={() =>
                                                        handleRowClick(contract)
                                                    }
                                                >
                                                    {contract.comments ||
                                                        "Нет комментариев"}
                                                </TableCell> */}
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <div className="flex flex-row items-center gap-2 flex-nowrap">
                                                    {contract.worker_name && (
                                                        <span
                                                            className="inline-flex"
                                                            title={
                                                                contract.status ===
                                                                3
                                                                    ? "Договор одобрен — замена недоступна"
                                                                    : "Заменить исполнителя"
                                                            }
                                                        >
                                                            <Button
                                                                onClick={() => {
                                                                    setReplaceModalOpen(
                                                                        true,
                                                                    );
                                                                    setSelectedContract(
                                                                        contract,
                                                                    );
                                                                    setSelectedUserId(
                                                                        null,
                                                                    );
                                                                }}
                                                                size="xs"
                                                                variant="outline"
                                                                disabled={
                                                                    contract.status ===
                                                                    3
                                                                }
                                                                startIcon={
                                                                    <FaUserEdit className="size-4" />
                                                                }
                                                                aria-label="Заменить исполнителя"
                                                            >
                                                                {""}
                                                            </Button>
                                                        </span>
                                                    )}
                                                    <span
                                                        className="inline-flex"
                                                        title="Скачать QR-код"
                                                    >
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleDownloadQr(
                                                                    contract,
                                                                )
                                                            }
                                                            disabled={
                                                                downloadingQr ===
                                                                contract.contract_id
                                                            }
                                                            startIcon={
                                                                <FaQrcode className="size-4" />
                                                            }
                                                            aria-label="Скачать QR-код"
                                                        >
                                                            {""}
                                                        </Button>
                                                    </span>
                                                    <span
                                                        className="inline-flex"
                                                        title="Просмотр информации"
                                                    >
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/pending-contracts/${contract.appointment_id}`,
                                                                )
                                                            }
                                                            startIcon={
                                                                <FaRegEye className="size-4" />
                                                            }
                                                            aria-label="Просмотр информации"
                                                        >
                                                            {""}
                                                        </Button>
                                                    </span>
                                                    <span
                                                        className="inline-flex"
                                                        title={
                                                            contract.current_pdf
                                                                ?.pdf_id
                                                                ? "Скачать PDF результата"
                                                                : "PDF ещё не загружен"
                                                        }
                                                    >
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleDownloadPdf(
                                                                    contract,
                                                                )
                                                            }
                                                            disabled={
                                                                !contract
                                                                    .current_pdf
                                                                    ?.pdf_id ||
                                                                downloadingPdf ===
                                                                    contract.contract_id
                                                            }
                                                            startIcon={
                                                                <TbDownload className="size-4" />
                                                            }
                                                            aria-label="Скачать PDF результата"
                                                        >
                                                            {""}
                                                        </Button>
                                                    </span>
                                                    <span
                                                        className="inline-flex"
                                                        title="Принять результат"
                                                    >
                                                        <Button
                                                            size="xs"
                                                            variant="primary"
                                                            onClick={() =>
                                                                openResultModal(
                                                                    contract,
                                                                    "accept",
                                                                )
                                                            }
                                                            disabled={
                                                                !contract
                                                                    .current_pdf
                                                                    ?.pdf_id ||
                                                                contract.status ===
                                                                    3 ||
                                                                contract.status ===
                                                                    4
                                                            }
                                                            startIcon={
                                                                <FaCheck className="size-4" />
                                                            }
                                                            aria-label="Принять результат"
                                                        >
                                                            {""}
                                                        </Button>
                                                    </span>
                                                    <span
                                                        className="inline-flex"
                                                        title="Отказать в результате"
                                                    >
                                                        <Button
                                                            size="xs"
                                                            variant="danger"
                                                            onClick={() =>
                                                                openResultModal(
                                                                    contract,
                                                                    "cancel",
                                                                )
                                                            }
                                                            disabled={
                                                                !contract
                                                                    .current_pdf
                                                                    ?.pdf_id ||
                                                                contract.status ===
                                                                    3 ||
                                                                contract.status ===
                                                                    4
                                                            }
                                                            startIcon={
                                                                <FaTimes className="size-4" />
                                                            }
                                                            aria-label="Отказать в результате"
                                                        >
                                                            {""}
                                                        </Button>
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {!loading && (
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

            <Toaster position="top-right" reverseOrder={false} />

            {/* Excel Download Modal */}
            <Modal
                isOpen={excelModalOpen}
                onClose={() => {
                    setExcelModalOpen(false);
                    setStartDate("");
                    setEndDate("");
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
                            id="contract-tasks-start-date"
                            label="Начальная дата *"
                            placeholder="Выберите начальную дату"
                            onChange={(selectedDates) => {
                                if (selectedDates[0]) {
                                    const date = new Date(selectedDates[0]);
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1,
                                    ).padStart(2, "0");
                                    const day = String(
                                        date.getDate(),
                                    ).padStart(2, "0");
                                    const formattedDate = `${year}-${month}-${day}`;
                                    setStartDate(formattedDate);
                                }
                            }}
                        />

                        <DatePicker
                            id="contract-tasks-end-date"
                            label="Конечная дата *"
                            placeholder="Выберите конечную дату"
                            onChange={(selectedDates) => {
                                if (selectedDates[0]) {
                                    const date = new Date(selectedDates[0]);
                                    const year = date.getFullYear();
                                    const month = String(
                                        date.getMonth() + 1,
                                    ).padStart(2, "0");
                                    const day = String(
                                        date.getDate(),
                                    ).padStart(2, "0");
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
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setExcelModalOpen(false);
                                setStartDate("");
                                setEndDate("");
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

            {/* Assignment Modal */}
            {selectedContract && (
                <AssignModal
                    isOpen={assignModalOpen}
                    onClose={() => setAssignModalOpen(false)}
                    contractId={selectedContract.contract_id.toString()}
                    contractNumber={selectedContract.contract_number}
                    onSuccess={handleAssignmentSuccess}
                />
            )}

            {/* Replace Worker Modal */}
            <Modal
                isOpen={replaceModalOpen}
                onClose={() => {
                    setReplaceModalOpen(false);
                    setSelectedUserId(null);
                    setSelectedContract(null);
                }}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Замена назначенного сотрудника
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Договор: {selectedContract?.contract_number}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Текущий исполнитель:{" "}
                        {selectedContract?.worker_name || "Не назначен"}
                    </p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Выберите нового сотрудника
                        </label>
                        {loadingUsers ? (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <Select
                                options={users.map((user) => ({
                                    value: user.user_id,
                                    label: `${user.firstname} ${
                                        user.lastname
                                    } ${user.fathername || ""}`.trim(),
                                }))}
                                placeholder="Выберите сотрудника"
                                onChange={(value) =>
                                    setSelectedUserId(Number(value))
                                }
                                className="dark:bg-dark-900"
                            />
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={() => {
                                setReplaceModalOpen(false);
                                setSelectedUserId(null);
                                setSelectedContract(null);
                            }}
                            variant="outline"
                            size="sm"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleReplaceWorker}
                            variant="primary"
                            size="sm"
                            disabled={!selectedUserId || replacing}
                        >
                            {replacing ? "Переназначение..." : "Переназначить"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* PDF Upload Modal */}
            <Modal
                isOpen={isPdfUploadModalOpen}
                onClose={closePdfUploadModal}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Загрузить PDF
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Договор: {selectedContractForPdf?.contract_number}
                    </p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Выберите PDF файл
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={closePdfUploadModal}
                            variant="outline"
                            size="sm"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handlePdfUpload}
                            variant="primary"
                            size="sm"
                            disabled={uploadingPdf}
                        >
                            {uploadingPdf ? "Загрузка..." : "Загрузить"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Accept / Cancel Result Modal */}
            <Modal
                isOpen={resultModalOpen}
                onClose={closeResultModal}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        {resultModalAction === "accept"
                            ? "Принять результат"
                            : "Отказать в результате"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Договор: {selectedContractForResult?.contract_number}
                    </p>
                    {resultInfoLoading && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                            Загрузка...
                        </div>
                    )}
                    {resultModalAction === "cancel" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Комментарий *
                            </label>
                            <textarea
                                value={resultComment}
                                onChange={(e) => {
                                    setResultComment(e.target.value);
                                    setResultCommentError(null);
                                }}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white ${
                                    resultCommentError
                                        ? "border-red-500 dark:border-red-500"
                                        : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Введите комментарий..."
                            />
                            {resultCommentError && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {resultCommentError}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={closeResultModal}
                            variant="outline"
                            size="sm"
                            disabled={resultSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleResultSubmit}
                            variant="primary"
                            size="sm"
                            disabled={
                                resultSubmitting ||
                                resultInfoLoading ||
                                resultTaskId == null
                            }
                            className={
                                resultModalAction === "cancel"
                                    ? "!bg-red-600 hover:!bg-red-700 dark:!bg-red-600 dark:hover:!bg-red-700"
                                    : undefined
                            }
                        >
                            {resultSubmitting
                                ? "..."
                                : resultModalAction === "accept"
                                  ? "Принять"
                                  : "Отказать"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PendingContracts;