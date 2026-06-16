import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useState } from "react";
import AddPaymentModal from "../Payments/AddPayment.tsx";
import { EyeIcon } from "../../icons/index.ts";
import { useNavigate } from "react-router";
import { formatCurrency, formatDate } from "../../utils/numberFormat";

// ── Types ──────────────────────────────────────────────────────────────────
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
    contract_type: number;
    contract_price: number;
    total_paid: string;
    remaining_amount: string;
    client_id: number;
    client_name: string;
    phone_number?: string;
    contract_document_id: number;
    document_file_path: string;
    overdue_months: number;
    months_since_contract: number;
    is_overdue: number; // 0 | 1
    payments: Payment[];
}

interface DebtorsTableProps {
    debtors: Debtor[];
    changeStatus?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function EmptyBadge() {
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            —
        </span>
    );
}

function renderField(value: unknown) {
    if (value === null || value === undefined || value === "") return <EmptyBadge />;
    return value as React.ReactNode;
}

/** Индикатор просрочки */
function OverdueBadge({ months }: { months: number }) {
    if (months === 0) return null;

    const color =
        months >= 3
            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            <span className="size-1.5 rounded-full bg-current animate-pulse" />
            {months} мес.
        </span>
    );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function DebtorsTable({ debtors, changeStatus }: DebtorsTableProps) {
    const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState<number | undefined>();
    const navigate = useNavigate();

    const handleViewPayments = (debtor: Debtor) => {
        setSelectedDebtor(debtor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDebtor(null);
    };

    const handleAddPayment = (debtor: Debtor) => {
        setSelectedContractId(debtor.contract_id);
        setIsAddPaymentModalOpen(true);
    };

    // Итоговые суммы
    const totalRemaining = debtors?.reduce(
        (sum, d) => sum + parseFloat(d.remaining_amount || "0"),
        0
    ) ?? 0;
    const overdueCount = debtors?.filter((d) => d.is_overdue === 1).length ?? 0;

    return (
        <>
            {/* ── Summary cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-3">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Всего должников</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-white tabular-nums">
                        {debtors?.length ?? 0}
                    </p>
                </div>
                <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-900/10 px-4 py-3">
                    <p className="text-xs text-orange-500 dark:text-orange-400 mb-1">Просроченных</p>
                    <p className="text-xl font-semibold text-orange-600 dark:text-orange-300 tabular-nums">
                        {overdueCount}
                    </p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3">
                    <p className="text-xs text-red-500 dark:text-red-400 mb-1">Общий остаток долга</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-300 tabular-nums">
                        {formatCurrency(totalRemaining)}
                    </p>
                </div>
            </div>

            {/* ── Table ──────────────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                <Table className="min-w-[900px]">
                    {/* Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.02]">
                        <TableRow>
                            {[
                                { label: "#",             cls: "pl-4 pr-2 w-10" },
                                { label: "№ договора",    cls: "px-3 whitespace-nowrap" },
                                { label: "Клиент",        cls: "px-3 min-w-[160px]" },
                                { label: "Телефон",       cls: "px-3 whitespace-nowrap" },
                                { label: "Сумма",         cls: "px-3 whitespace-nowrap text-right" },
                                { label: "Оплачено",      cls: "px-3 whitespace-nowrap text-right" },
                                { label: "Остаток",       cls: "px-3 whitespace-nowrap text-right" },
                                { label: "Просрочка",     cls: "px-3 whitespace-nowrap" },
                                { label: "Действия",      cls: "pl-3 pr-4 whitespace-nowrap" },
                            ].map(({ label, cls }) => (
                                <TableCell
                                    key={label}
                                    isHeader
                                    className={`py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 text-start ${cls}`}
                                >
                                    {label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                        {debtors?.map((debtor, index) => {
                            const isOverdue = debtor.is_overdue === 1;
                            const isCritical = debtor.overdue_months >= 3;

                            return (
                                <TableRow
                                    key={debtor.contract_id}
                                    className={`transition-colors ${
                                        isCritical
                                            ? "bg-red-50/60 dark:bg-red-900/10"
                                            : isOverdue
                                            ? "bg-orange-50/40 dark:bg-orange-900/10"
                                            : "hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                                    }`}
                                >
                                    {/* # */}
                                    <TableCell className="pl-4 pr-2 py-3 text-xs text-gray-400 tabular-nums">
                                        {index + 1}
                                    </TableCell>

                                    {/* № договора */}
                                    <TableCell className="px-3 py-3">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                                            {debtor.contract_number}
                                        </span>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {formatDate(debtor.contract_date)}
                                        </p>
                                    </TableCell>

                                    {/* Клиент */}
                                    <TableCell className="px-3 py-3 min-w-[160px]">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate max-w-[200px]">
                                            {debtor.client_name || <EmptyBadge />}
                                        </p>
                                    </TableCell>

                                    {/* Телефон */}
                                    <TableCell className="px-3 py-3">
                                        {debtor.phone_number ? (
                                            <div className="flex flex-col gap-0.5">
                                                {debtor.phone_number.split(",").map((num, i) => (
                                                    <span key={i} className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap tabular-nums">
                                                        {num.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            renderField(null)
                                        )}
                                    </TableCell>

                                    {/* Сумма */}
                                    <TableCell className="px-3 py-3 text-right">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 tabular-nums whitespace-nowrap">
                                            {formatCurrency(debtor.contract_price)}
                                        </span>
                                    </TableCell>

                                    {/* Оплачено */}
                                    <TableCell className="px-3 py-3 text-right">
                                        <span className="text-sm text-green-600 dark:text-green-400 tabular-nums whitespace-nowrap font-medium">
                                            {formatCurrency(debtor.total_paid)}
                                        </span>
                                    </TableCell>

                                    {/* Остаток */}
                                    <TableCell className="px-3 py-3 text-right">
                                        <span className="text-sm text-red-600 dark:text-red-400 tabular-nums whitespace-nowrap font-semibold">
                                            {formatCurrency(debtor.remaining_amount)}
                                        </span>
                                        {/* Прогресс оплаты */}
                                        {debtor.contract_price > 0 && (
                                            <div className="mt-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 w-20 ml-auto">
                                                <div
                                                    className="h-1 rounded-full bg-green-500"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            (parseFloat(debtor.total_paid) /
                                                                debtor.contract_price) *
                                                                100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </TableCell>

                                    {/* Просрочка */}
                                    <TableCell className="px-3 py-3">
                                        {debtor.overdue_months > 0 ? (
                                            <OverdueBadge months={debtor.overdue_months} />
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                                В норме
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Действия */}
                                    <TableCell className="pl-3 pr-4 py-3">
                                        <div className="flex items-center gap-1.5 flex-nowrap">
                                            <button
                                                onClick={() => handleViewPayments(debtor)}
                                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors whitespace-nowrap"
                                            >
                                                История
                                            </button>
                                            <button
                                                onClick={() => handleAddPayment(debtor)}
                                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 transition-colors whitespace-nowrap"
                                            >
                                                Оплатить
                                            </button>
                                            <button
                                                onClick={() => navigate(`/contracts/detail/${debtor.contract_id}`)}
                                                title="Посмотреть договор"
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {(!debtors || debtors.length === 0) && (
                            <TableRow>
                                <TableCell className="py-12 text-center text-sm text-gray-400 dark:text-gray-500" colSpan={9}>
                                    Должники не найдены
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── История платежей Modal ─────────────────────────────── */}
            <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-4xl w-full">
                <div className="p-6 bg-white rounded-2xl dark:bg-gray-900">
                    {/* Modal header */}
                    <div className="mb-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                            История платежей — договор №{selectedDebtor?.contract_number}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Клиент:{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                {selectedDebtor?.client_name}
                            </span>
                        </p>
                        {selectedDebtor && (
                            <div className="flex gap-4 mt-3">
                                <div>
                                    <p className="text-xs text-gray-400">Оплачено</p>
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">
                                        {formatCurrency(selectedDebtor.total_paid)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Остаток</p>
                                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
                                        {formatCurrency(selectedDebtor.remaining_amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Кол-во платежей</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                                        {selectedDebtor.payments?.length ?? 0}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedDebtor?.payments && selectedDebtor.payments.length > 0 ? (
                        <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] overflow-x-auto">
                            <Table className="min-w-[600px]">
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.02]">
                                    <TableRow>
                                        {["#", "Сумма", "Тип", "Комментарий", "Оператор", "Дата"].map((h) => (
                                            <TableCell
                                                key={h}
                                                isHeader
                                                className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 text-start"
                                            >
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                                    {selectedDebtor.payments.map((payment, index) => (
                                        <TableRow
                                            key={payment.payment_id}
                                            className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <TableCell className="pl-4 pr-2 py-2.5 text-xs text-gray-400 tabular-nums w-10">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="px-3 py-2.5">
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 tabular-nums whitespace-nowrap">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-3 py-2.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
                                                    {payment.payment_type_text || "—"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-3 py-2.5">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[220px] break-words">
                                                    {payment.comments || <EmptyBadge />}
                                                </p>
                                            </TableCell>
                                            <TableCell className="px-3 py-2.5">
                                                <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                    {payment.operator_name || <EmptyBadge />}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-3 py-2.5">
                                                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap tabular-nums">
                                                    {formatDate(payment.created_at)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Платежи не найдены
                            </p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* ── Add Payment Modal ───────────────────────────────────── */}
            <AddPaymentModal
                isOpen={isAddPaymentModalOpen}
                onClose={() => {
                    setIsAddPaymentModalOpen(false);
                    setSelectedContractId(undefined);
                }}
                changeStatus={() => changeStatus?.()}
                setResponse={() => {}}
                selectedContractId={selectedContractId}
                disableContractSelect={true}
            />
        </>
    );
}