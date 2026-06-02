import React, { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import Select from "../../components/form/Select";

interface WriteOffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    item: {
        id: number;
        name: string;
    } | null;
}

interface User {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
}

export default function WriteOffModal({
    isOpen,
    onClose,
    onSuccess,
    item,
}: WriteOffModalProps) {
    const [formData, setFormData] = useState({
        user_id: "",
        quantity: "",
        reason: "",
    });

    const [loading, setLoading] = useState(false);
    
    // User search state
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchUsers("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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

        if (!formData.user_id || !formData.quantity || !formData.reason.trim()) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                item_id: item.id,
                user_id: Number(formData.user_id),
                quantity: Number(formData.quantity),
                reason: formData.reason.trim(),
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await PostSimple("api/inventory/categories/write-off", payload);

            if (response) {
                toast.success("Списание прошло успешно");
                handleClose();
                if (onSuccess) onSuccess();
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || error?.response?.data?.error || "Ошибка при списании"
            );
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            user_id: "",
            quantity: "",
            reason: "",
        });
        setLoading(false);
        onClose();
    };

    const userOptions = filteredUsers.map((user) => ({
        value: user.user_id,
        label: `${user.firstname || ""} ${user.lastname || ""} ${user.fathername || ""}`.trim() || `Сотрудник #${user.user_id}`,
    }));

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Списание: {item?.name}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Сотрудник */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Сотрудник
                            </label>
                            <Select
                                options={userOptions}
                                placeholder="Выберите сотрудника"
                                onChange={(value) => setFormData({ ...formData, user_id: value })}
                                className="w-full"
                                defaultValue={formData.user_id || ""}
                                searchable={true}
                                onSearch={searchUsers}
                                searching={searchingUsers}
                            />
                        </div>

                        {/* Количество */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Количество
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="Введите количество"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Причина */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Причина
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Укажите причину списания"
                                rows={3}
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
                            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 flex items-center gap-2"
                        >
                            {loading ? "Списание..." : "Списать"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
