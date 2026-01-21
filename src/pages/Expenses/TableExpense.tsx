import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface Expense {
    expenses_id: number;
    expenses_category_id: number;
    amount: number;
    comments?: string;
    created_at: string;
    user_name: string;
    category_name?: string;
}

interface TableExpenseProps {
    expenses: Expense[];
    changeStatus: () => void;
}

export default function TableExpense({
    expenses,
    changeStatus,
}: TableExpenseProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(
        null
    );

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const canDelete = userRole === 1;

    const openDeleteModal = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedExpense) return;

        setDeletingId(selectedExpense.expenses_id);
        try {
            const response: any = await DeleteData(
                `api/expenses/delete/${selectedExpense.expenses_id}`
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Расход успешно удален");
                setIsDeleteModalOpen(false);
                setSelectedExpense(null);
                changeStatus(); // Table list ni yangilash
            } else {
                toast.error("Ошибка при удалении расхода");
                // Error holatida ham modal yopish
                setIsDeleteModalOpen(false);
                setSelectedExpense(null);
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
            toast.error("Что-то пошло не так при удалении расхода");
            // Error holatida ham modal yopish
            setIsDeleteModalOpen(false);
            setSelectedExpense(null);
        } finally {
            setDeletingId(null);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedExpense(null);
        setDeletingId(null);
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("ru-RU").format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";

            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();

            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return "";
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Расходы не найдены
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                ID
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Категория
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Сумма
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Комментарий
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Пользователь
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Дата
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {expenses.map((expense, index) => (
                            <tr
                                key={expense.expenses_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {expense.category_name ||
                                        `ID: ${expense.expenses_category_id}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {formatAmount(expense.amount)} сум
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {expense.comments || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {expense.user_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {formatDate(expense.created_at)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {canDelete && (
                                        <Button
                                            onClick={() => openDeleteModal(expense)}
                                            size="xs"
                                            variant="danger"
                                            startIcon={
                                                <TrashBinIcon className="size-4" />
                                            }
                                        >
                                            {""}
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                showCloseButton={true}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Подтверждение удаления
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить расход на сумму{" "}
                        {selectedExpense
                            ? formatAmount(selectedExpense.amount)
                            : 0}{" "}
                        сум?
                    </p>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={closeDeleteModal}
                            disabled={deletingId !== null}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deletingId !== null}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deletingId !== null ? "Удаление..." : "Удалить"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
