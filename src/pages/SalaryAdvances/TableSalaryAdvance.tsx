import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface SalaryAdvance {
    advance_id: number;
    to_user_id: number;
    to_user_name: string;
    user_name: string;
    advance_comments: string;
    amount_of_advance: number;
    created_at: string;
}

interface TableSalaryAdvanceProps {
    advances: SalaryAdvance[];
    changeStatus: () => void;
}

export default function TableSalaryAdvance({
    advances,
    changeStatus,
}: TableSalaryAdvanceProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAdvance, setSelectedAdvance] =
        useState<SalaryAdvance | null>(null);

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const canDelete = userRole === 1;

    const openDeleteModal = (advance: SalaryAdvance) => {
        setSelectedAdvance(advance);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedAdvance) return;

        setDeletingId(selectedAdvance.advance_id);
        try {
            const response: any = await DeleteData(
                `api/user-salary-advance/delete/${selectedAdvance.advance_id}`
            );

            if (
                response?.status === 200 ||
                response?.data?.success ||
                response?.data
            ) {
                toast.success("Аванс успешно удален");
                setIsDeleteModalOpen(false);
                setSelectedAdvance(null);
                changeStatus(); // Table list ni yangilash
            } else {
                toast.error("Ошибка при удалении аванса");
                setIsDeleteModalOpen(false);
                setSelectedAdvance(null);
            }
        } catch (error: any) {
            console.error("Error deleting salary advance:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при удалении аванса"
            );
            setIsDeleteModalOpen(false);
            setSelectedAdvance(null);
        } finally {
            setDeletingId(null);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedAdvance(null);
        setDeletingId(null);
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

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("ru-RU").format(amount);
    };

    if (advances.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Авансы не найдены
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
                <table className="w-full table-auto min-w-[640px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                #
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Пользователь
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Комментарий
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Сумма аванса
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Дата
                            </th>
                            <th className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {advances.map((advance, index) => (
                            <tr
                                key={advance.advance_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <td className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {advance.to_user_name || "-"}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {advance.advance_comments || "-"}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {formatAmount(advance.amount_of_advance)}{" "}
                                    сум
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {formatDate(advance.created_at)}
                                </td>
                                <td className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <div className="flex flex-row items-center gap-2 flex-nowrap">
                                        {canDelete && (
                                            <Button
                                                onClick={() =>
                                                    openDeleteModal(advance)
                                                }
                                                size="xs"
                                                variant="danger"
                                                disabled={
                                                    deletingId ===
                                                    advance.advance_id
                                                }
                                            >
                                                <TrashBinIcon />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Подтверждение удаления
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить аванс для пользователя{" "}
                        <span className="font-semibold">
                            {selectedAdvance?.user_name}
                        </span>
                        ?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={closeDeleteModal}
                            disabled={deletingId !== null}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            disabled={deletingId !== null}
                        >
                            {deletingId !== null ? "Удаление..." : "Удалить"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
