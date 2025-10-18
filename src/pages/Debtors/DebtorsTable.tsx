import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

interface Debtor {
    debtor_id: number;
    debtor_name: string;
    phone_number: string;
    debt_amount: number;
    debt_date: string;
    status: string;
    created_at?: string;
}

interface DebtorsTableProps {
    debtors: Debtor[];
    changeStatus?: () => void;
}

export default function DebtorsTable({ debtors }: DebtorsTableProps) {
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
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Helper function to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return "Не указано";
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU");
    };

    // Helper function to get status badge
    const getStatusBadge = (status: string) => {
        const statusMap: {
            [key: string]: {
                bg: string;
                text: string;
                darkBg: string;
                darkText: string;
            };
        } = {
            active: {
                bg: "bg-green-100",
                text: "text-green-800",
                darkBg: "dark:bg-green-900",
                darkText: "dark:text-green-200",
            },
            paid: {
                bg: "bg-blue-100",
                text: "text-blue-800",
                darkBg: "dark:bg-blue-900",
                darkText: "dark:text-blue-200",
            },
            overdue: {
                bg: "bg-red-100",
                text: "text-red-800",
                darkBg: "dark:bg-red-900",
                darkText: "dark:text-red-200",
            },
        };

        const statusConfig = statusMap[status] || statusMap["active"];

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.darkBg} ${statusConfig.darkText}`}
            >
                {status === "active"
                    ? "Активный"
                    : status === "paid"
                    ? "Оплачен"
                    : status === "overdue"
                    ? "Просрочен"
                    : status}
            </span>
        );
    };

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
                                className="pl-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Имя должника
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Номер телефона
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Сумма долга
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Дата долга
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Статус
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {debtors?.map((debtor: Debtor, index: number) => (
                            <TableRow
                                key={debtor.debtor_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <TableCell className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {renderFieldValue(debtor.debtor_name)}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {renderFieldValue(debtor.phone_number)}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {debtor.debt_amount
                                        ? formatCurrency(debtor.debt_amount)
                                        : renderFieldValue(debtor.debt_amount)}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {formatDate(debtor.debt_date)}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {getStatusBadge(debtor.status)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
