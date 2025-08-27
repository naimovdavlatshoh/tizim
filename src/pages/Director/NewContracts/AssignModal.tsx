import React, { useState, useEffect } from "react";
import { PostDataTokenJson, GetDataSimple } from "../../../service/data";
import { toast } from "react-hot-toast";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import DatePicker from "../../../components/form/date-picker";

interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractId: string;
    contractNumber: string;
    onSuccess?: () => void;
}

interface User {
    user_id: number;
    fullname: string;
}

const AssignModal: React.FC<AssignModalProps> = ({
    isOpen,
    onClose,
    contractId,
    contractNumber,
    onSuccess,
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_id: "",
        contract_id: contractId,
        percent: "",
        deadline_date: "",
        comments: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const response: any = await GetDataSimple(
                "api/appointment/staff/list"
            );
            const usersData = response?.result || response?.data || [];
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast.error("Ошибка при загрузке списка сотрудников");
            // Fallback to empty array
            setUsers([]);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.user_id || !formData.percent || !formData.deadline_date) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response = await PostDataTokenJson("api/appointment/create", {
                user_id: parseInt(formData.user_id),
                contract_id: parseInt(formData.contract_id),
                percent: parseFloat(formData.percent),
                deadline_date: formData.deadline_date,
                comments: formData.comments,
            });

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Сотрудник успешно назначен на контракт");
                onSuccess?.();
                onClose();
                // Reset form
                setFormData({
                    user_id: "",
                    contract_id: contractId,
                    percent: "",
                    deadline_date: "",
                    comments: "",
                });
            } else {
                toast.error("Ошибка при назначении сотрудника");
            }
        } catch (error) {
            console.error("Error assigning worker:", error);
            toast.error("Ошибка при назначении сотрудника");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-4">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Назначить сотрудника
                </h3>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Contract Info */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Контракт:{" "}
                        <span className="font-medium">{contractNumber}</span>
                    </p>
                </div>

                {/* User Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Сотрудник *
                    </label>
                    <select
                        value={formData.user_id}
                        onChange={(e) =>
                            handleInputChange("user_id", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Выберите сотрудника</option>
                        {users.map((user) => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Percent */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Доля сотрудника (%) *
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.percent}
                        onChange={(e) =>
                            handleInputChange("percent", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        placeholder="2.5"
                        required
                    />
                </div>

                {/* Deadline Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Срок выполнения *
                    </label>
                    <DatePicker
                        id="deadline-date"
                        mode="single"
                        defaultDate={
                            formData.deadline_date
                                ? new Date(formData.deadline_date)
                                : undefined
                        }
                        onChange={(selectedDates) => {
                            if (selectedDates && selectedDates.length > 0) {
                                const date = selectedDates[0];
                                const formattedDate = date
                                    .toISOString()
                                    .split("T")[0];
                                handleInputChange(
                                    "deadline_date",
                                    formattedDate
                                );
                            }
                        }}
                        placeholder="Выберите дату"
                    />
                </div>

                {/* Comments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Комментарии
                    </label>
                    <textarea
                        value={formData.comments}
                        onChange={(e) =>
                            handleInputChange("comments", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Введите комментарии..."
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Назначение..." : "Назначить"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AssignModal;
