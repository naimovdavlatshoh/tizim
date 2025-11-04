import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";

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
import { formatCurrency, formatDate } from "../../utils/numberFormat";
import Loader from "../../components/ui/loader/Loader.tsx";

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
                                            Н/договора
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
                                            Срок выполнения
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
                                                {contracts.indexOf(contract) +
                                                    1}
                                            </TableCell>
                                            <TableCell
                                                className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
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
                                                {contract.deadline_date
                                                    ? formatDate(
                                                          contract.deadline_date
                                                      )
                                                    : "-"}
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
