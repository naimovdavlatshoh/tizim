import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { TrashBinIcon } from "../../icons/index.ts";
import { FaEdit } from "react-icons/fa";
import EditSalaryPaymentModal from "./EditSalaryPaymentModal.tsx";
import DeleteSalaryPayment from "./DeleteSalaryPayment.tsx";

interface SalaryPayment {
    id: number;
    user_id: number;
    user?: {
        firstname: string;
        lastname: string;
        fathername: string;
    };
    full_name?: string;
    to_user_name?: string;
    year: string;
    month: number;
    amount: number;
    payment_type?: "cash" | "card";
}

interface TableProps {
    payments: SalaryPayment[];
    changeStatus: () => void;
}

export default function TableSalaryPayment({ payments, changeStatus }: TableProps) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(null);

    const formatNumberWithSpaces = (value: number | string) => {
        if (!value) return "0";
        const parts = value.toString().split(".");
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const renderPaymentType = (type?: string) => {
        if (type === "card") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    На карту
                </span>
            );
        }
        if (type === "cash") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Наличка
                </span>
            );
        }
        return <span className="text-gray-400">—</span>;
    };

    if (payments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Зарплаты не найдены
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                <table className="w-full table-auto min-w-[720px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                #
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Сотрудник
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Год
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Месяц
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Сумма
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Тип оплаты
                            </th>
                            <th className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.map((payment, index) => {
                            return (
                                <tr key={payment.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {index + 1}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {payment.full_name}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {payment.year}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {monthNames[(payment.month || 1) - 1]}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {formatNumberWithSpaces(payment.amount)} сум
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                                        {renderPaymentType(payment.payment_type)}
                                    </td>
                                    <td className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                        <div className="flex flex-row items-center gap-2 flex-nowrap">
                                            <Button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setEditModalOpen(true);
                                                }}
                                                size="xs"
                                                variant="outline"
                                                className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                            >
                                                <FaEdit size={16} />
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setDeleteModalOpen(true);
                                                }}
                                                size="xs"
                                                variant="danger"
                                            >
                                                <TrashBinIcon />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedPayment && (
                <>
                    <EditSalaryPaymentModal
                        isOpen={editModalOpen}
                        onClose={() => {
                            setEditModalOpen(false);
                            setSelectedPayment(null);
                        }}
                        changeStatus={changeStatus}
                        payment={selectedPayment}
                    />

                    <DeleteSalaryPayment
                        isOpen={deleteModalOpen}
                        onClose={() => {
                            setDeleteModalOpen(false);
                            setSelectedPayment(null);
                        }}
                        changeStatus={changeStatus}
                        id={selectedPayment.id}
                    />
                </>
            )}
        </>
    );
}