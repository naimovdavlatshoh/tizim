import { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import InputField from "../../components/form/input/InputField.tsx";
import Select from "../../components/form/Select";

interface AddBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

interface User {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
}

export default function AddBonusModal({
    isOpen,
    onClose,
    changeStatus,
}: AddBonusModalProps) {
    const [formData, setFormData] = useState({
        to_user_id: "",
        bonuses_comments: "",
        amount_of_bonuses: "",
    });
    const [displayAmount, setDisplayAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchUsers("");
        }
    }, [isOpen]);

    const searchUsers = async (keyword: string) => {
        setSearchingUsers(true);

        try {
            if (keyword.trim().length === 0) {
                // Empty search - fetch all users from backend
                const response = await GetDataSimple(
                    "api/user/list?page=1&limit=100"
                );
                const allUsers =
                    response?.result || response?.data?.result || [];
                setUsers(allUsers);
                setFilteredUsers(allUsers);
            } else if (keyword.trim().length >= 3) {
                // Search with keyword
                const response: any = await PostSimple(
                    `api/user/search?keyword=${encodeURIComponent(keyword)}`
                );
                const searchResults =
                    response?.data?.result || response?.data || [];
                setFilteredUsers(
                    Array.isArray(searchResults) ? searchResults : []
                );
            } else {
                // Less than 3 characters - show current users
                setFilteredUsers(users);
            }
        } catch (error) {
            console.error("Error searching/fetching users:", error);
            toast.error("Ошибка при загрузке пользователей");
            // Fallback to showing current users
            setFilteredUsers(users);
        } finally {
            setSearchingUsers(false);
        }
    };

    const formatNumberWithSpaces = (value: string) => {
        const cleanValue = value.replace(/\s/g, "");
        const parts = cleanValue.split(".");
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Remove all non-numeric characters except decimal point and spaces
        const cleanValue = value.replace(/[^0-9.\s]/g, "");

        // Remove spaces for processing
        const numericValue = cleanValue.replace(/\s/g, "");

        // Ensure only one decimal point
        const parts = numericValue.split(".");
        if (parts.length > 2) {
            return;
        }

        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) {
            return;
        }

        // Format with spaces for display
        const formattedValue = formatNumberWithSpaces(numericValue);

        // Update both display and form data
        setDisplayAmount(formattedValue);
        setFormData({
            ...formData,
            amount_of_bonuses: numericValue, // Store without spaces for API
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.to_user_id ||
            !formData.bonuses_comments ||
            !formData.amount_of_bonuses
        ) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response: any = await PostSimple("api/user-bonuses/create", {
                to_user_id: Number(formData.to_user_id),
                bonuses_comments: formData.bonuses_comments,
                amount_of_bonuses: Number(formData.amount_of_bonuses),
            });

            if (response) {
                toast.success("Бонус успешно создан");
                setFormData({
                    to_user_id: "",
                    bonuses_comments: "",
                    amount_of_bonuses: "",
                });
                setDisplayAmount("");
                changeStatus();
                onClose();
            }
        } catch (error: any) {
            onClose();
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при создании бонуса"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            to_user_id: "",
            bonuses_comments: "",
            amount_of_bonuses: "",
        });
        setDisplayAmount("");
        setLoading(false);
        onClose();
    };

    const userOptions = filteredUsers.map((user) => ({
        value: user.user_id,
        label:
            user.firstname + " " + user.lastname + " " + user.fathername ||
            `Пользователь #${user.user_id}`,
    }));

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Добавить новый бонус
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span>{" "}
                                Пользователь
                            </label>
                            <Select
                                options={userOptions}
                                placeholder="Выберите пользователя"
                                onChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        to_user_id: value,
                                    })
                                }
                                className="w-full"
                                defaultValue={formData.to_user_id || ""}
                                searchable={true}
                                onSearch={searchUsers}
                                searching={searchingUsers}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span>{" "}
                                Комментарий
                            </label>
                            <InputField
                                type="text"
                                value={formData.bonuses_comments}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        bonuses_comments: e.target.value,
                                    })
                                }
                                placeholder="Введите комментарий к бонусу"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Сумма
                                бонуса
                            </label>
                            <InputField
                                type="text"
                                value={displayAmount}
                                onChange={handlePriceChange}
                                placeholder="Введите сумму бонуса"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    Создать бонус
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
