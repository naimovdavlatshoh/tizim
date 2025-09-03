import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { GetDataSimple } from "../../../service/data.ts";
import Pagination from "../../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { FaRegEye } from "react-icons/fa";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import Linkto from "../../../components/ui/link/LinkTo";
import Loader from "../../../components/ui/loader/Loader.tsx";

interface CompletedContract {
    contract_id: string;
    contract_number: string;
    contract_status: string;
    object_address: string;
    worker_price: string;
    contract_price: string;
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
    result_for_director: {
        result_id: string;
        task_status: string;
        contract_id: string;
        from_user_id: string;
        from_user_name: string;
        to_user_id: string;
        to_user_name: string;
        document_id: string;
        comments: string;
        created_at: string;
    } | null;
    final_document: {
        document_id: string;
        created_at: string;
    } | null;
}

const CompletedContracts = () => {
    const [contracts, setContracts] = useState<CompletedContract[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCompletedContracts();
    }, [page]);

    const fetchCompletedContracts = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/appointment/all/list?contract_status=6&page=${page}&limit=10`
            );
            const contractsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setContracts(contractsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching completed contracts:", error);
            toast.error("Ошибка при загрузке завершенных договоров");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (contract: CompletedContract) => {
        console.log("Contract clicked:", contract);
    };

    // const getStatusColor = (status: string) => {
    //     switch (status) {
    //         case "6":
    //             return "success";
    //         default:
    //             return "light";
    //     }
    // };

    const getClientTypeText = (type: string) => {
        switch (type) {
            case "1":
                return "Физическое лицо";
            case "2":
                return "Юридическое лицо";
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

    // const getTaskStatusText = (status: string) => {
    //     switch (status) {
    //         case "1":
    //             return "В процессе";
    //         case "2":
    //             return "Завершено";
    //         case "3":
    //             return "Отклонено";
    //         default:
    //             return "Неизвестно";
    //     }
    // };

    // const getTaskStatusColor = (status: string) => {
    //     switch (status) {
    //         case "1":
    //             return "warning";
    //         case "2":
    //             return "success";
    //         case "3":
    //             return "error";
    //         default:
    //             return "light";
    //     }
    // };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Не указано";
        return new Date(dateString).toLocaleDateString("ru-RU");
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Завершенные договоры" />
            <PageBreadcrumb pageTitle="Завершенные договоры" />
            <div className="space-y-6">
                <ComponentCard title="Завершенные договоры">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell className="pl-5 py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                #
                                            </span>
                                        </TableCell>
                                        <TableCell className="pl-5 py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Номер договора
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Клиент
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Адрес объекта
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Стоимость работ
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Срок выполнения
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Исполнитель
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-left">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Действия
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                {/* Table Body */}
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {contracts?.map(
                                        (
                                            contract: CompletedContract,
                                            index: number
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
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {
                                                                contract.client_name
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {getClientTypeText(
                                                                contract.client_type
                                                            )}
                                                        </p>
                                                    </div>
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
                                                    {contract.contract_price}{" "}
                                                    сум
                                                </TableCell>
                                                <TableCell
                                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                    onClick={() =>
                                                        handleRowClick(contract)
                                                    }
                                                >
                                                    {formatDate(
                                                        contract.deadline_date
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                                    onClick={() =>
                                                        handleRowClick(contract)
                                                    }
                                                >
                                                    {contract.worker_name ||
                                                        "Не назначен"}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Linkto
                                                        to={`/completed-contracts/${contract.contract_id}`}
                                                        className="mr-2"
                                                        size="xs"
                                                        variant="outline"
                                                        startIcon={
                                                            <FaRegEye className="size-4" />
                                                        }
                                                    >
                                                        {""}
                                                    </Linkto>
                                                    {/* <div className="flex items-center ">
                                                        <Linkto
                                                            to={`/completed-contracts/${contract.contract_id}`}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <FaRegEye className="w-4 h-4" />
                                                        </Linkto>
                                                    </div> */}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
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
        </>
    );
};

export default CompletedContracts;
