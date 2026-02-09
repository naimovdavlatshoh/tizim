import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, GetDataSimplePDF } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster, toast } from "react-hot-toast";

import { FaQrcode, FaRegEye } from "react-icons/fa";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
// import Linkto from "../../components/ui/link/LinkTo";
import Button from "../../components/ui/button/Button";
import SendResultModal from "./SendResultModal";
import { formatCurrency, formatDate } from "../../utils/numberFormat";
import Loader from "../../components/ui/loader/Loader.tsx";

import { TbDownload } from "react-icons/tb";
import Linkto from "../../components/ui/link/LinkTo.tsx";
import Badge from "../../components/ui/badge/Badge.tsx";

interface MyContract {
    contract_id: string;
    contract_number: string;
    contract_status: number;
    object_address: string;
    worker_price: string;
    deadline_date: string;
    days_diff: string;
    days_diff_text: string;
    client_id: string;
    client_name: string;
    client_type: string | number;
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
    laboratory: Array<{
        lab_test_id: string;
        tests_name: string;
        test_type: string;
    }>;
    result_for_worker: boolean;
    final_document: {
        document_id: number;
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

const MyContracts = () => {
    const [contracts, setContracts] = useState<MyContract[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sendResultModalOpen, setSendResultModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<MyContract | null>(
        null
    );
    const [downloadingQr, setDownloadingQr] = useState<string | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);

    useEffect(() => {
        fetchMyContracts();
    }, [page]);

    const fetchMyContracts = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/appointment/my/list?contract_status=5&page=${page}&limit=30`
            );
            const contractsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setContracts(contractsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching my contracts:", error);

            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (contract: MyContract) => {
        console.log("Contract clicked:", contract);
    };

    const handleSendResult = (contract: MyContract) => {
        setSelectedContract(contract);
        setSendResultModalOpen(true);
    };

    const handleResultSent = () => {
        fetchMyContracts();
    };

    const getLastTaskRejectInfo = (contract: MyContract) => {
        const tasks = contract?.task_info?.tasks;
        if (!Array.isArray(tasks) || tasks.length === 0) return null;
        const lastTask = tasks[tasks.length - 1];
        const taskItem = lastTask?.task_item;
        if (!Array.isArray(taskItem) || taskItem.length === 0) return null;
        const firstItem = taskItem[0];
        return {
            isRejected: true,
            comment: firstItem?.comments ?? null,
        };
    };

    const handleDownloadQrCode = async (contract: MyContract) => {
        if (!contract?.contract_id) {
            toast.error("ID договора не найден");
            return;
        }

        setDownloadingQr(contract.contract_id);
        try {
            const response = await GetDataSimplePDF(
                `api/appointment/downloadqrcode/${contract.contract_id}`
            );

            // Create blob and download
            const blob = new Blob([response.data], {
                type: "image/png",
            });
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

            toast.success("QR-код успешно скачан");
        } catch (error: any) {
            console.error("Error downloading QR code:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при скачивании QR-кода"
            );
        } finally {
            setDownloadingQr(null);
        }
    };

    const handleDownloadResultPdf = async (contract: MyContract) => {
        if (!contract?.final_document?.document_id) {
            toast.error("Документ не найден");
            return;
        }

        setDownloadingPdf(contract.final_document.document_id);
        try {
            const response = await GetDataSimplePDF(
                `api/appointment/result/pdf/${contract.final_document.document_id}`
            );

            // Create blob and download
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `result-${
                contract.contract_number || contract.contract_id
            }.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF успешно скачан");
        } catch (error: any) {
            console.error("Error downloading PDF:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при скачивании PDF"
            );
        } finally {
            setDownloadingPdf(null);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta
                title="BNM Tizim"
                description="Список моих назначенных договоров"
            />
            <PageBreadcrumb
                pageTitle={`${
                    localStorage.getItem("role_id") === "3"
                        ? "Мои заключение"
                        : "Мои договоры"
                }`}
            />
            <div className="space-y-6">
                <ComponentCard
                    title={`${
                        localStorage.getItem("role_id") === "3"
                            ? "Мои заключение"
                            : "Мои договоры"
                    }`}
                    desc="Договоры, назначенные на меня"
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
                    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                        <Table className="min-w-[720px]">
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
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
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[100px]"
                                    >
                                        Клиент
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Тип клиента
                                    </TableCell>
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
                                        Бонус
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Статус
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                    >
                                        Действия
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {contracts?.map((contract: MyContract) => {
                                    const rejectInfo =
                                        getLastTaskRejectInfo(contract);
                                    return (
                                        <TableRow
                                            key={contract.contract_id}
                                            className={`cursor-pointer transition-colors ${
                                                rejectInfo
                                                    ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/40"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <TableCell
                                                className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contracts.indexOf(contract) +
                                                    1}
                                            </TableCell>
                                            <TableCell
                                                className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contract.contract_number}
                                            </TableCell>
                                            <TableCell
                                                className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[120px] sm:max-w-none truncate"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contract.client_name}
                                            </TableCell>
                                            <TableCell
                                                className="px-2 sm:px-4 py-2 sm:py-3 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contract.client_type === "1" ||
                                                contract.client_type === 1 ? (
                                                    <Badge
                                                        color="info"
                                                        variant="light"
                                                        size="sm"
                                                    >
                                                        Юридическое лицо
                                                    </Badge>
                                                ) : contract.client_type ===
                                                      "2" ||
                                                  contract.client_type === 2 ? (
                                                    <Badge
                                                        color="success"
                                                        variant="light"
                                                        size="sm"
                                                    >
                                                        Физическое лицо
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {contract.client_type ||
                                                            "—"}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {contract.deadline_date
                                                    ? formatDate(
                                                          contract.deadline_date
                                                      )
                                                    : "-"}
                                            </TableCell>
                                            <TableCell
                                                className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap"
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
                                                className="px-2 sm:px-4 py-2 sm:py-3 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {rejectInfo ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                            Отказано
                                                        </span>
                                                        {rejectInfo.comment && (
                                                            <span className="text-xs text-gray-600 dark:text-gray-300">
                                                                {
                                                                    rejectInfo.comment
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800  ">
                                                        В ожидании
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <div className="flex flex-row items-center gap-2 flex-nowrap">
                                                    {" "}
                                                    <Button
                                                        size="xs"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleDownloadQrCode(
                                                                contract
                                                            )
                                                        }
                                                        disabled={
                                                            downloadingQr ===
                                                            contract.contract_id
                                                        }
                                                        startIcon={
                                                            <FaQrcode className="size-4" />
                                                        }
                                                    >
                                                        {downloadingQr ===
                                                        contract.contract_id
                                                            ? ""
                                                            : ""}
                                                    </Button>
                                                    <Linkto
                                                        to={`/my-contracts/${contract.contract_id}`}
                                                        size="xs"
                                                        variant="outline"
                                                        startIcon={
                                                            <FaRegEye className="size-4" />
                                                        }
                                                    >
                                                        {""}
                                                    </Linkto>
                                                    <Button
                                                        size="xs"
                                                        variant="primary"
                                                        onClick={() =>
                                                            handleSendResult(
                                                                contract
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
                                                    >
                                                        {""}
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleDownloadResultPdf(
                                                                contract
                                                            )
                                                        }
                                                        disabled={
                                                            !contract
                                                                ?.final_document
                                                                ?.document_id ||
                                                            downloadingPdf ===
                                                                contract
                                                                    .final_document
                                                                    ?.document_id
                                                        }
                                                        startIcon={
                                                            <TbDownload className="size-4" />
                                                        }
                                                    >
                                                        {downloadingPdf ===
                                                        contract?.final_document
                                                            ?.document_id
                                                            ? ""
                                                            : ""}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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

            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Send Result Modal */}
            {selectedContract && (
                <SendResultModal
                    isOpen={sendResultModalOpen}
                    onClose={() => setSendResultModalOpen(false)}
                    contractId={selectedContract.contract_id}
                    onSuccess={handleResultSent}
                />
            )}
        </>
    );
};

export default MyContracts;
