import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useState } from "react";

interface Payment {
    payment_id: number;
    amount: number;
    payment_type: number;
    payment_type_text: string;
    comments: string;
    contract_id: number;
    contract_number: string;
    object_address: string;
    client_id: number;
    client_name: string;
    client_type: number;
    business_name: string;
    operator_name: string;
    created_at: string;
}

interface Debtor {
    contract_id: number;
    contract_number: string;
    contract_date: string;
    contract_price: number;
    total_paid: string;
    remaining_amount: string;
    client_id: number;
    client_name: string;
    contract_document_id: number;
    document_file_path: string;
    payments: Payment[];
}

interface DebtorsTableProps {
    debtors: Debtor[];
    changeStatus?: () => void;
}

export default function DebtorsTable({ debtors }: DebtorsTableProps) {
    const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helper function to render field value or "Не указано" badge
    const renderFieldValue = (value: any) => {
        if (!value || value === "" || value === null || value === undefined) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Не указано
                </span>
            );
        }
        return value;
    };

    // Helper function to format currency
    const formatCurrency = (amount: number | string) => {
        const numAmount =
            typeof amount === "string" ? parseFloat(amount) : amount;
        // Format number with thousand separators
        const formatted = new Intl.NumberFormat("uz-UZ", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numAmount);
        // Return formatted number with UZS at the end
        return `${formatted} UZS`;
    };

    // Helper function to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return "Не указано";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleViewPayments = (debtor: Debtor) => {
        setSelectedDebtor(debtor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDebtor(null);
    };

    // Helper function to get status badge based on remaining amount
    const getStatusBadge = (remainingAmount: string) => {
        const amount = parseFloat(remainingAmount);
        if (amount === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Оплачен
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Долг
                </span>
            );
        }
    };

    return (
        <>
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
                                    className="pl-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                                    Сумма договора
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Оплачено
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Остаток
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
                                    Действия
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {debtors?.map((debtor: Debtor, index: number) => (
                                <TableRow
                                    key={debtor.contract_id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <TableCell className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {renderFieldValue(
                                            debtor.contract_number
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {renderFieldValue(debtor.client_name)}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {formatCurrency(debtor.contract_price)}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {formatCurrency(debtor.total_paid)}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {formatCurrency(
                                            debtor.remaining_amount
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {getStatusBadge(
                                            debtor.remaining_amount
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <button
                                            onClick={() =>
                                                handleViewPayments(debtor)
                                            }
                                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                                        >
                                            Платежи (
                                            {debtor.payments?.length || 0})
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                className="max-w-7xl"
            >
                <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900">
                    <div className="mb-6">
                        <h3 className="text-xl mb-3 font-semibold text-gray-800 dark:text-white/90">
                            Платежи по договору №
                            {selectedDebtor?.contract_number}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Клиент: <span className="text-black font-bold">{selectedDebtor?.client_name}</span>
                        </p>
                    </div>

                    {selectedDebtor?.payments &&
                    selectedDebtor.payments.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
                            <div className="max-w-full overflow-x-auto">
                                <Table>
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
                                                Адрес объекта
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                            >
                                                Оператор
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                            >
                                                Дата создания
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {selectedDebtor.payments.map(
                                            (
                                                payment: Payment,
                                                index: number
                                            ) => (
                                                <TableRow
                                                    key={payment.payment_id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <TableCell className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {formatCurrency(
                                                            payment.amount
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {renderFieldValue(
                                                            payment.payment_type_text
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        <div className="max-w-[400px] break-words">
                                                            {renderFieldValue(
                                                                payment.comments
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        <div className="max-w-[400px] break-words">
                                                            {renderFieldValue(
                                                                payment.object_address
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {renderFieldValue(
                                                            payment.operator_name
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                        {formatDate(
                                                            payment.created_at
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                Платежи не найдены
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
