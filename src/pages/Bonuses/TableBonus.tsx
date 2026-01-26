import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { toast } from "react-hot-toast";
import { DeleteData } from "../../service/data.ts";
import { Modal } from "../../components/ui/modal/index.tsx";
import { TrashBinIcon } from "../../icons/index.ts";

interface Bonus {
    bonus_id: number;
    to_user_id: number;
    to_user_name: string;
    user_name: string;
    bonuses_comments: string;
    amount_of_bonuses: number;
    created_at: string;
}

interface TableBonusProps {
    bonuses: Bonus[];
    changeStatus: () => void;
}

export default function TableBonus({ bonuses, changeStatus }: TableBonusProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const canDelete = userRole === 1;

    const openDeleteModal = (bonus: Bonus) => {
        setSelectedBonus(bonus);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedBonus) return;

        setDeletingId(selectedBonus.bonus_id);
        try {
            const response: any = await DeleteData(
                `api/user-bonuses/delete/${selectedBonus.bonus_id}`
            );

            if (
                response?.status === 200 ||
                response?.data?.success ||
                response?.data
            ) {
                toast.success("Бонус успешно удален");
                setIsDeleteModalOpen(false);
                setSelectedBonus(null);
                changeStatus(); // Table list ni yangilash
            } else {
                toast.error("Ошибка при удалении бонуса");
                setIsDeleteModalOpen(false);
                setSelectedBonus(null);
            }
        } catch (error: any) {
            console.error("Error deleting bonus:", error);
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при удалении бонуса"
            );
            setIsDeleteModalOpen(false);
            setSelectedBonus(null);
        } finally {
            setDeletingId(null);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedBonus(null);
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

    if (bonuses.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Бонусы не найдены
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
                                #
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Пользователь
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Комментарий
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                Сумма бонуса
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
                        {bonuses.map((bonus, index) => (
                            <tr
                                key={bonus.bonus_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {bonus.to_user_name || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {bonus.bonuses_comments || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {formatAmount(bonus.amount_of_bonuses)} сум
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {formatDate(bonus.created_at)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center gap-2">
                                        {canDelete && (
                                            <Button
                                                onClick={() =>
                                                    openDeleteModal(bonus)
                                                }
                                                size="xs"
                                                variant="danger"
                                                disabled={
                                                    deletingId === bonus.bonus_id
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
                        Вы уверены, что хотите удалить бонус для пользователя{" "}
                        <span className="font-semibold">
                            {selectedBonus?.user_name}
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
