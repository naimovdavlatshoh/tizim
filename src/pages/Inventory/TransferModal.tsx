import React, { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import Select from "../../components/form/Select";
import { InventoryItem } from "./TableInventory.tsx";

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    item: InventoryItem | null;
}

interface User {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
}

export default function TransferModal({
    isOpen,
    onClose,
    onSuccess,
    item,
}: TransferModalProps) {
    const [formData, setFormData] = useState({
        from_user_id: "",
        to_user_id: "",
        quantity: "",
    });

    const [loading, setLoading] = useState(false);
    
    // User search state for to_user_id
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchUsers("");
            
            // Auto-select from_user_id if there is only 1 assignment
            if (item && item.assignments && item.assignments.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    from_user_id: item.assignments[0].user_id.toString(),
                }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, item]);

    const searchUsers = async (keyword: string) => {
        setSearchingUsers(true);
        try {
            if (keyword.trim().length === 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any = await GetDataSimple("api/user/list?page=1&limit=100");
                const allUsers = response?.result || response?.data?.result || [];
                setUsers(allUsers);
                setFilteredUsers(allUsers);
            } else if (keyword.trim().length >= 3) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: any = await PostSimple(`api/user/search?keyword=${encodeURIComponent(keyword)}`);
                const searchResults = response?.data?.result || response?.data || [];
                setFilteredUsers(Array.isArray(searchResults) ? searchResults : []);
            } else {
                setFilteredUsers(users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setFilteredUsers(users);
        } finally {
            setSearchingUsers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!item) return;

        if (!formData.from_user_id || !formData.to_user_id || !formData.quantity) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        if (formData.from_user_id === formData.to_user_id) {
            toast.error("Нельзя передать инвентарь самому себе");
            return;
        }

        const selectedAssignment = item.assignments?.find(a => a.user_id.toString() === formData.from_user_id);
        if (selectedAssignment && Number(formData.quantity) > Number(selectedAssignment.quantity)) {
            toast.error(`Максимальное количество для передачи: ${Number(selectedAssignment.quantity)}`);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                from_user_id: Number(formData.from_user_id),
                to_user_id: Number(formData.to_user_id),
                items: [
                    {
                        item_id: item.id,
                        quantity: Number(formData.quantity)
                    }
                ]
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple("api/inventory/transfer", payload);

            if (response) {
                toast.success("Инвентарь успешно передан");
                handleClose();
                if (onSuccess) onSuccess();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при передаче"
            );
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            from_user_id: "",
            to_user_id: "",
            quantity: "",
        });
        setLoading(false);
        onClose();
    };

    const fromUserOptions = item?.assignments?.map((assignment) => ({
        value: assignment.user_id.toString(),
        label: `${assignment.full_name} (В наличии: ${Number(assignment.quantity)} ${item.unit})`,
    })) || [];

    const toUserOptions = filteredUsers.map((user) => ({
        value: user.user_id.toString(),
        label: `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.trim() || `Сотрудник #${user.user_id}`,
    }));

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Передача инвентаря: {item?.name}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* От кого */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> От кого (Сотрудник)
                            </label>
                            <Select
                                options={fromUserOptions}
                                placeholder="Выберите сотрудника"
                                onChange={(value) => setFormData({ ...formData, from_user_id: value })}
                                className="w-full"
                                defaultValue={formData.from_user_id}
                            />
                        </div>

                        {/* Кому */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Кому (Сотрудник)
                            </label>
                            <Select
                                options={toUserOptions}
                                placeholder="Выберите сотрудника"
                                onChange={(value) => setFormData({ ...formData, to_user_id: value })}
                                className="w-full"
                                defaultValue={formData.to_user_id}
                                searchable={true}
                                onSearch={searchUsers}
                                searching={searchingUsers}
                            />
                        </div>

                        {/* Количество */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Количество ({item?.unit})
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="any"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="Введите количество"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center gap-2"
                        >
                            {loading ? "Передача..." : "Передать"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
