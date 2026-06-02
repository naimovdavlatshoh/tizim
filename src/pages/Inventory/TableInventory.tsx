import { useState } from "react";
import Button from "../../components/ui/button/Button.tsx";
import { TrashBinIcon } from "../../icons/index.ts";
import { MdOutlineRemoveCircleOutline } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import WriteOffModal from "./WriteOffModal.tsx";
import TransferModal from "./TransferModal.tsx";
import { Modal } from "../../components/ui/modal/index.tsx";
import { PostSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";

export interface InventoryItem {
    id: number;
    inventory_number: string;
    name: string;
    category_name: string;
    unit: string;
    total_quantity: string;
    photo_path: string | null;
    is_active: number;
    added_by: string;
    created_at: string;
    updated_at: string | null;
    assignments: {
        user_id: number;
        full_name: string;
        quantity: string;
    }[];
}

interface TableProps {
    items: InventoryItem[];
    onRefresh: () => void;
}

export default function TableInventory({ items, onRefresh }: TableProps) {
    const [writeOffItem, setWriteOffItem] = useState<InventoryItem | null>(null);
    const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deletingId) return;

        setIsDeleting(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple(`api/inventory/items/delete/${deletingId}`);

            if (response) {
                toast.success("Инвентарь удален");
                setIsConfirmOpen(false);
                setDeletingId(null);
                onRefresh();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при удалении"
            );
            setIsConfirmOpen(false);
            setDeletingId(null);
        } finally {
            setIsDeleting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Записи не найдены
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
            <table className="w-full table-auto min-w-[640px]">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            #
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Название
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Инв. номер
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                            Категория
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Количество
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Ед. изм.
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Сотрудник
                        </th>
                        <th className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item, index) => {
                        const userName = item.assignments && item.assignments.length > 0 
                            ? item.assignments.map(a => a.full_name).join(", ")
                            : "-";
                        const categoryName = item.category_name || "-";

                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {item.name}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {item.inventory_number}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {categoryName}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.total_quantity ? Number(item.total_quantity) : 0}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.unit}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {userName}
                                </td>
                                <td className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-sm text-gray-900 dark:text-gray-100">
                                    <div className="flex flex-row items-center gap-2 flex-nowrap">
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            className="text-orange-500 border-orange-500 hover:bg-orange-50"
                                            onClick={() => setWriteOffItem(item)}
                                        >
                                            <MdOutlineRemoveCircleOutline size={16} />
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            className="text-indigo-500 border-indigo-500 hover:bg-indigo-50"
                                            onClick={() => setTransferItem(item)}
                                        >
                                            <FaExchangeAlt size={16} />
                                        </Button>
                                        <Button
                                            size="xs"
                                            variant="danger"
                                            onClick={() => {
                                                setDeletingId(item.id);
                                                setIsConfirmOpen(true);
                                            }}
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

            <WriteOffModal
                isOpen={!!writeOffItem}
                onClose={() => setWriteOffItem(null)}
                onSuccess={() => {
                    onRefresh();
                }}
                item={writeOffItem}
            />

            <TransferModal
                isOpen={!!transferItem}
                onClose={() => setTransferItem(null)}
                onSuccess={() => {
                    onRefresh();
                }}
                item={transferItem}
            />

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={() => !isDeleting && setIsConfirmOpen(false)}>
                <div className="p-6 md:p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Удаление инвентаря
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить этот инвентарь? Это действие нельзя отменить.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
