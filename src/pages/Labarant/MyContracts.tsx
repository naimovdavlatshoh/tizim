import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { FaRegEye, FaPaperPlane } from "react-icons/fa";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import Linkto from "../../components/ui/link/LinkTo";
import Button from "../../components/ui/button/Button";
import SendResultModal from "./SendResultModal";
import { formatCurrency } from "../../utils/numberFormat";
import Loader from "../../components/ui/loader/Loader.tsx";

interface MyContract {
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
    laboratory: Array<{
        lab_test_id: string;
        tests_name: string;
        test_type: string;
    }>;
    result_for_worker: boolean;
    final_document: boolean;
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

    useEffect(() => {
        fetchMyContracts();
    }, [page]);

    const fetchMyContracts = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/appointment/my/list?contract_status=5&page=${page}&limit=10`
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
            toast.error("Ошибка при загрузке моих договоров");
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
        // Refresh the contracts list after successful submission
        fetchMyContracts();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "5":
                return "success";
            case "4":
                return "info";
            case "3":
                return "warning";
            default:
                return "error";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "5":
                return "Завершено";
            case "4":
                return "На проверке";
            case "3":
                return "В процессе";
            default:
                return "Неизвестно";
        }
    };

    // const getTestTypeText = (type: string) => {
    //     switch (type) {
    //         case "1":
    //             return "Основной";
    //         case "2":
    //             return "Дополнительный";
    //         default:
    //             return "Неизвестно";
    //     }
    // };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta
                title="BNM Tizim"
                description="Список моих назначенных договоров"
            />
            <PageBreadcrumb pageTitle="Мои договоры" />
            <div className="space-y-6">
                <ComponentCard
                    title="Мои договоры"
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
                                            Клиент
                                        </TableCell>
                                        <TableCell
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
                                        </TableCell>
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
                                            Статус
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            Тесты
                                        </TableCell>
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
                                    {contracts?.map((contract: MyContract) => (
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
                                            <TableCell
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
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                {new Date(
                                                    contract.deadline_date
                                                ).toLocaleDateString("ru-RU")}
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {contract.days_diff_text}
                                                </span>
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        getStatusColor(
                                                            contract.contract_status
                                                        ) === "success"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : getStatusColor(
                                                                  contract.contract_status
                                                              ) === "warning"
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                            : getStatusColor(
                                                                  contract.contract_status
                                                              ) === "info"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                    }`}
                                                >
                                                    {getStatusText(
                                                        contract.contract_status
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                onClick={() =>
                                                    handleRowClick(contract)
                                                }
                                            >
                                                <div className="space-y-1">
                                                    {contract.laboratory &&
                                                    contract.laboratory.length >
                                                        0 ? (
                                                        contract.laboratory
                                                            .slice(0, 2)
                                                            .map(
                                                                (
                                                                    test,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            test.lab_test_id
                                                                        }
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <span className="w-4 h-4 bg-brand-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
                                                                            {
                                                                                test.tests_name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            Нет тестов
                                                        </span>
                                                    )}
                                                    {contract.laboratory &&
                                                        contract.laboratory
                                                            .length > 2 && (
                                                            <span className="text-xs text-gray-500">
                                                                +
                                                                {contract
                                                                    .laboratory
                                                                    .length -
                                                                    2}{" "}
                                                                еще
                                                            </span>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <div className="flex items-center gap-2">
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
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleSendResult(
                                                                contract
                                                            )
                                                        }
                                                        startIcon={
                                                            <FaPaperPlane className="size-4" />
                                                        }
                                                    >
                                                        {""}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
