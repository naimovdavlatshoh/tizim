import { useEffect, useState, useRef } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import {
    GetDataSimple,
    getStoredYear,
    GetDataSimplePDF,
    PostSimpleFormData,
    PostDataTokenJson,
} from "../../../service/data.ts";
import Pagination from "../../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { FaQrcode } from "react-icons/fa";
import { TbDownload } from "react-icons/tb";
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
import { PostDataToken } from "../../../service/data.ts";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

interface PendingContract {
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
        let cancelled = false;
        setResultTaskId(null);
        setResultInfoLoading(true);
        GetDataSimple(
            `api/appointment/info?contract_id=${selectedContractForResult.contract_id}`,
        )
            .then((response: any) => {
                if (cancelled) return;
                const raw =
                    response?.task_info ??
                    response?.data?.task_info ??
                    response?.data ??
                    response;
                const tasks =
                    raw?.tasks ??
                    raw?.task_info?.tasks ??
                    response?.tasks ??
                    response?.data?.tasks;
                const lastTask =
                    Array.isArray(tasks) && tasks.length > 0
                        ? tasks[tasks.length - 1]
                        : null;
                const taskId = lastTask?.task_id ?? lastTask?.id ?? null;
                if (taskId != null) setResultTaskId(Number(taskId));
                setResultInfoLoading(false);
            })
            .catch(() => {
                if (!cancelled) {
                    setResultTaskId(null);
                    setResultInfoLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [resultModalOpen, selectedContractForResult?.contract_id]);

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

            setContracts(contractsData);
            setTotalPages(totalPagesData);
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

    const getResultBadgeStatus = (
        contract: PendingContract,
    ): "no_result" | "waiting" | "rejected" => {
        if (!contract.final_document) return "no_result";
        const tasks = contract?.task_info?.tasks;
        if (!Array.isArray(tasks) || tasks.length === 0) return "waiting";
        const lastTask = tasks[tasks.length - 1];
        const taskItem = lastTask?.task_item;
        if (!Array.isArray(taskItem) || taskItem.length === 0) return "waiting";
        return "rejected";
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
            const response = await PostDataToken(
                "api/appointment/replaceworker",
                {
                    user_id: selectedUserId,
                    contract_id: Number(selectedContract.contract_id),
                },
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Сотрудник успешно переназначен!");
                setReplaceModalOpen(false);
                setSelectedUserId(null);
                setSelectedContract(null);
                fetchPendingContracts(); // Refresh the contracts list
            } else {
                toast.error("Что-то пошло не так при переназначении");
            }
        } catch (error: any) {
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
                `api/contracts/qrcode/${contract.contract_id}`,
            );
            const blob = new Blob([response.data], { type: "image/png" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qrcode-${contract.contract_number || contract.contract_id}.png`;
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

    const openPdfUploadModal = (contract: PendingContract) => {
        setSelectedContractForPdf(contract);
        setIsPdfUploadModalOpen(true);
    };

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
        if (!contract.final_document) return;
        setDownloadingPdf(contract.contract_id);
        try {
            const response = await GetDataSimplePDF(
                `api/contracts/pdf/${contract.contract_id}`,
            );
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `contract-${contract.contract_number || contract.contract_id}.pdf`;
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
        if (!commentTrimmed) {
            setResultCommentError("Комментарий не может быть пустым");
            return;
        }
        setResultCommentError(null);
        setResultSubmitting(true);
        try {
            const url =
                resultModalAction === "accept"
                    ? "api/appointment/accept/result"
                    : "api/appointment/cancel/result";
            const response: any = await PostDataTokenJson(url, {
                contract_id: Number(selectedContractForResult.contract_id),
                task_id: resultTaskId,
                comments: commentTrimmed,
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
                <ComponentCard
                    title="Договоры в процессе"
                    desc="Договоры со статусом 'В процессе'"
                >
                    {/* Loading indicator */}
                    {loading && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                <span className="text-yellow-800 dark:text-yellow-200">
                                    Загрузка...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell
                                            isHeader
                                            className="pl-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            #
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Н/договора
                                        </TableCell>

                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Клиент
                                        </TableCell>
                                        {/* <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Стоимость работ
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Адрес объекта
                                        </TableCell> */}
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Срок выполнения
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Осталось дней
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Исполнитель
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Статус
                                        </TableCell>
                                        {/* <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Комментарии
                                        </TableCell> */}
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Действия
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                {/* Table Body */}
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {contracts?.map(
                                        (
                                            contract: PendingContract,
                                            index: number,
                                        ) => (
                                            <TableRow
                                                key={contract.contract_id}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {
                                                            contract.days_diff_text
                                                        }
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
                                                            {
                                                                contract.worker_name
                                                            }
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
                                                    {(() => {
                                                        const status =
                                                            getResultBadgeStatus(
                                                                contract,
                                                            );
                                                        if (
                                                            status ===
                                                            "no_result"
                                                        ) {
                                                            return (
                                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                                    Ещё нет
                                                                    результата
                                                                </span>
                                                            );
                                                        }
                                                        if (
                                                            status ===
                                                            "rejected"
                                                        ) {
                                                            return (
                                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                    Отказано
                                                                </span>
                                                            );
                                                        }
                                                        return (
                                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                                                Ждут ответ
                                                            </span>
                                                        );
                                                    })()}
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
                                                    <div className="flex items-center gap-2">
                                                        {/* <Linkto
                                                            to={`/pending-contracts/${contract.contract_id}`}
                                                            size="xs"
                                                            variant="outline"
                                                            startIcon={
                                                                <FaRegEye className="size-4" />
                                                            }
                                                        >
                                                            {""}
                                                        </Linkto>
                                                        {contract.worker_name && (
                                                            <Button
                                                                onClick={() => {
                                                                    setReplaceModalOpen(
                                                                        true
                                                                    );
                                                                    setSelectedContract(
                                                                        contract
                                                                    );
                                                                    setSelectedUserId(
                                                                        null
                                                                    );
                                                                }}
                                                                size="xs"
                                                                variant="outline"
                                                                startIcon={
                                                                    <FaUserEdit className="size-4" />
                                                                }
                                                            >
                                                                {""}
                                                            </Button>
                                                        )} */}
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
                                                            {downloadingQr ===
                                                            contract.contract_id
                                                                ? ""
                                                                : ""}
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            variant="primary"
                                                            onClick={() =>
                                                                openPdfUploadModal(
                                                                    contract,
                                                                )
                                                            }
                                                            startIcon={
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                                    />
                                                                </svg>
                                                            }
                                                            aria-label="Загрузить PDF"
                                                        >
                                                            {""}
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleDownloadPdf(
                                                                    contract,
                                                                )
                                                            }
                                                            disabled={
                                                                !contract.final_document ||
                                                                downloadingPdf ===
                                                                    contract.contract_id
                                                            }
                                                            startIcon={
                                                                <TbDownload className="size-4" />
                                                            }
                                                            aria-label="Скачать PDF"
                                                        >
                                                            {downloadingPdf ===
                                                            contract.contract_id
                                                                ? ""
                                                                : ""}
                                                        </Button>
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
                                                                !contract.final_document ||
                                                                getResultBadgeStatus(
                                                                    contract,
                                                                ) === "rejected"
                                                            }
                                                            aria-label="Принять результат"
                                                        >
                                                            Принять
                                                        </Button>
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
                                                                !contract.final_document ||
                                                                getResultBadgeStatus(
                                                                    contract,
                                                                ) === "rejected"
                                                            }
                                                            aria-label="Отказать в результате"
                                                        >
                                                            Отказать
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        </div>
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
                        Переназначить сотрудника
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
