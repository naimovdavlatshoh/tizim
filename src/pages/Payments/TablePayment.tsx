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
import { DeleteData } from "../../service/data";
import { formatAmount } from "../../utils/numberFormat";
import { FaRegEye } from "react-icons/fa";

interface Payment {
    payment_id: number;
    contract_id: number;
    contract_number?: string;
    client_name?: string;
    is_advance: number;
    amount: number;
    payment_type: string;
    comments?: string;
    created_at?: string;
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
    const [selectedPayment] = useState<Payment | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

    const onDeletePayment = (): void => {
        if (selectedPayment) {
            DeleteData(
                `api/payments/delete/${selectedPayment.payment_id}`
            ).then(() => {
                toast.success("Платеж успешно удален");
                changeStatus();
            });
        }
        setDeleteModalOpen(false);
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
                                Номер договора
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
                                Аванс
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Сумма
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Тип платежа
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Комментарий
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Дата
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
                                    <TableCell className="pl-5 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {payment.contract_number || "-"}
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {payment.client_name || "-"}
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
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
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                        {formatAmount(payment.amount)} сум
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                payment.payment_type === "1"
                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                    : payment.payment_type ===
                                                      "2"
                                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                            }`}
                                        >
                                            {payment.payment_type_text}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200 max-w-xs truncate">
                                        {payment.comments || "-"}
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {payment.created_at || ""}
                                    </TableCell>
                                    <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
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
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Удалить платеж?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Вы уверены, что хотите удалить этот платеж? Это
                            действие нельзя отменить.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Отмена
                            </Button>
                            <Button variant="danger" onClick={onDeletePayment}>
                                Удалить
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
