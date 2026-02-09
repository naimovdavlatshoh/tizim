import { useState } from "react";
import { useNavigate } from "react-router";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import { PostDataTokenJson } from "../../service/data";
import { formatAmount, formatDate } from "../../utils/numberFormat";
import { FaRegEye } from "react-icons/fa";
import { Modal } from "../../components/ui/modal";
import { TrashBinIcon } from "../../icons";

interface Payment {
    payment_id: number;
    contract_id: number;
    contract_number?: string;
    business_name?: string;
    client_name?: string;
    is_advance: number;
    amount: number;
    payment_type: string;
    comments?: string;
    created_at?: string;
    operator_name?: string;
    payment_type_text: string;
}

interface TablePaymentProps {
    payments: Payment[];
    changeStatus: () => void;
}

export default function TablePayment({
    payments,
    changeStatus,
}: TablePaymentProps) {
    const navigate = useNavigate();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(
        null
    );
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const canDelete = userRole === 1;

    const handleDeleteClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setDeleteModalOpen(true);
    };

    const onDeletePayment = async (): Promise<void> => {
        if (!selectedPayment) return;

        setIsDeleting(true);
        try {
            await PostDataTokenJson(
                `api/payments/delete/${selectedPayment.payment_id}`,
                {}
            );
            toast.success("Платеж успешно удален");
            changeStatus();
            setDeleteModalOpen(false);
            setSelectedPayment(null);
        } catch (error: any) {
            setDeleteModalOpen(false);
            toast.error(
                error?.response?.data?.error || "Ошибка при удалении платежа"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewContractDetail = (contractId: number) => {
        navigate(`/contracts/detail/${contractId}`);
    };

    const getAdvanceText = (isAdvance: number): string => {
        return isAdvance === 1 ? "Да" : "Нет";
    };

    // formatAmount function is now imported from utils

    // const formatDate = (dateString: string): string => {
    //     if (!dateString) return "-";
    //     return new Date(dateString).toLocaleDateString("ru-RU");
    // };

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
            <Table className="min-w-[900px]">
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
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Название компании
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Клиент
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Оператор
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Аванс
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Сумма
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Тип платежа
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Комментарий
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Дата
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
                <TableBody>
                    {payments.length === 0 ? (
                        <TableRow>
                            <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Платежи не найдены
                            </TableCell>
                        </TableRow>
                    ) : (
                        payments.map((payment, index) => (
                            <TableRow
                                key={payment.payment_id}
                                className="border-b border-gray-100 dark:border-white/[0.05]"
                            >
                                <TableCell className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200 text-center">
                                    {payment.contract_number || "-"}
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    {payment.business_name || "-"}
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    {payment.client_name || "-"}
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    {payment.operator_name || "-"}
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            payment.is_advance === 1
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                                        }`}
                                    >
                                        {getAdvanceText(payment.is_advance)}
                                    </span>
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                    {formatAmount(payment.amount)} сум
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            payment.payment_type === "1"
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                : payment.payment_type === "2"
                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                                : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                        }`}
                                    >
                                        {payment.payment_type_text}
                                    </span>
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200 max-w-xs">
                                    {payment.comments ? (
                                        <div className="relative group">
                                            <span className="block truncate">
                                                {payment.comments.length > 10
                                                    ? `${payment.comments.slice(
                                                          0,
                                                          10
                                                      )}...`
                                                    : payment.comments}
                                            </span>
                                            <div className="pointer-events-none absolute z-10 hidden max-w-xs rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block top-full mt-1">
                                                {payment.comments}
                                            </div>
                                        </div>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                                <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    {payment.created_at
                                        ? formatDate(payment.created_at)
                                        : "-"}
                                </TableCell>
                                <TableCell className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-sm text-gray-800 dark:text-gray-200">
                                    <div className="flex flex-row items-center gap-2 flex-nowrap">
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            onClick={() =>
                                                handleViewContractDetail(
                                                    payment.contract_id
                                                )
                                            }
                                        >
                                            <FaRegEye className="size-4" />
                                        </Button>
                                        {canDelete && (
                                            <Button
                                                onClick={() =>
                                                    handleDeleteClick(payment)
                                                }
                                                size="xs"
                                                variant="danger"
                                                startIcon={
                                                    <TrashBinIcon className="size-4" />
                                                }
                                            >
                                                {""}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedPayment(null);
                }}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Удалить платеж?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить этот платеж? Это действие
                        нельзя отменить.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setSelectedPayment(null);
                            }}
                            disabled={isDeleting}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="danger"
                            onClick={onDeletePayment}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Удаление...
                                </div>
                            ) : (
                                "Удалить"
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
