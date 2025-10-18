import { useState, useEffect, useRef } from "react";
import { PostSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import InputField from "../../components/form/input/InputField.tsx";

interface ExpenseCategory {
    expenses_category_id: number;
    category_name: string;
}

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    categories: ExpenseCategory[];
}

export default function AddExpenseModal({
    isOpen,
    onClose,
    changeStatus,
    categories,
}: AddExpenseModalProps) {
    const [formData, setFormData] = useState({
        expenses_category_id: "",
        amount: "",
        comments: "",
    });
    const [displayAmount, setDisplayAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCategories, setFilteredCategories] = useState<
        ExpenseCategory[]
    >([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.expenses_category_id || !formData.amount) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response: any = await PostSimple("api/expenses/create", {
                expenses_category_id: parseInt(formData.expenses_category_id),
                amount: parseFloat(formData.amount),
                comments: formData.comments || undefined,
            });

            if (response) {
                toast.success("Расход успешно создан");
                setFormData({
                    expenses_category_id: "",
                    amount: "",
                    comments: "",
                });
                setDisplayAmount("");
                changeStatus();
                onClose();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error);
            // Error holatida ham modal yopish
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Loading bo'lsa ham modal yopish mumkin
        setFormData({ expenses_category_id: "", amount: "", comments: "" });
        setDisplayAmount("");
        setSearchQuery("");
        setFilteredCategories([]);
        setIsDropdownOpen(false);
        setLoading(false); // Loading state ni ham tozalash
        onClose();
    };

    const formatNumberWithSpaces = (value: string) => {
        // Remove all spaces first
        const cleanValue = value.replace(/\s/g, "");

        // Split by decimal point
        const parts = cleanValue.split(".");

        // Format the integer part with spaces
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

        // Combine with decimal part if exists
        return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const handleAmountChange = (value: string) => {
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
            amount: numericValue, // Store without spaces for API
        });
    };

    const performSearch = async (query: string) => {
        // Search bo'sh bo'lganda barcha categorylarni ko'rsat
        if (!query.trim()) {
            setFilteredCategories(categories);
            return;
        }

        // 3 ta harfdan kam bo'lsa, barcha categorylarni ko'rsat
        if (query.trim().length < 3) {
            setFilteredCategories(categories);
        }

        setIsSearching(true);
        try {
            const response: any = await PostSimple(
                `api/expensescategories/search?keyword=${encodeURIComponent(
                    query
                )}`
            );

            if (response) {
                const searchResults =
                    response?.data?.result || response?.result || [];
                setFilteredCategories(searchResults);
            }
        } catch (error) {
            console.error("Error searching categories:", error);
            setFilteredCategories(categories);
        } finally {
            setIsSearching(false);
        }
    };

    // Update filtered categories when categories prop changes
    useEffect(() => {
        setFilteredCategories(categories);
    }, [categories]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredCategories(categories);
        }
    }, [searchQuery, categories]);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Добавить новый расход
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span>{" "}
                                Категория расхода
                            </label>

                            {/* Custom Dropdown with Search */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsDropdownOpen(!isDropdownOpen)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors text-left flex items-center justify-between"
                                >
                                    <span
                                        className={
                                            formData.expenses_category_id
                                                ? "text-gray-900 dark:text-white"
                                                : "text-gray-500 dark:text-gray-400"
                                        }
                                    >
                                        {formData.expenses_category_id
                                            ? filteredCategories.find(
                                                  (c) =>
                                                      c.expenses_category_id.toString() ===
                                                      formData.expenses_category_id
                                              )?.category_name
                                            : "Выберите категорию расхода"}
                                    </span>
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                                        {/* Search Input */}
                                        <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                            <InputField
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    const query =
                                                        e.target.value;
                                                    setSearchQuery(query);
                                                    // Har doim performSearch ni chaqir
                                                    performSearch(query);
                                                }}
                                                placeholder="Поиск категории..."
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Categories List */}
                                        <div className="max-h-48 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                                    Поиск...
                                                </div>
                                            ) : filteredCategories.length ===
                                              0 ? (
                                                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                                    Категории не найдены
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {filteredCategories.map(
                                                        (category) => (
                                                            <button
                                                                key={
                                                                    category.expenses_category_id
                                                                }
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            expenses_category_id:
                                                                                category.expenses_category_id.toString(),
                                                                        }
                                                                    );
                                                                    setIsDropdownOpen(
                                                                        false
                                                                    );
                                                                    setSearchQuery(
                                                                        ""
                                                                    );
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                                            >
                                                                {
                                                                    category.category_name
                                                                }
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Сумма
                                расхода
                            </label>
                            <div className="relative">
                                <InputField
                                    type="text"
                                    value={displayAmount}
                                    onChange={(e) =>
                                        handleAmountChange(e.target.value)
                                    }
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                    required
                                />
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                    сум
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Комментарий (не обязательно)
                            </label>
                            <InputField
                                type="text"
                                value={formData.comments}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        comments: e.target.value,
                                    })
                                }
                                placeholder="Добавьте описание или комментарий к расходу"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
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
                                    Создать расход
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
