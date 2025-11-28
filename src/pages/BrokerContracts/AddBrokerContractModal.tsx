import { useState, useEffect } from "react";
import { PostSimple, GetDataSimple } from "../../service/data.ts";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal/index.tsx";
import InputField from "../../components/form/input/InputField.tsx";
import DatePicker from "../../components/form/date-picker";

interface AddBrokerContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
}

export default function AddBrokerContractModal({
    isOpen,
    onClose,
    changeStatus,
}: AddBrokerContractModalProps) {
    const [formData, setFormData] = useState({
        contract_number: "",
        business_name: "",
        object_address: "",
        contract_price: "",
        contract_date: "",
    });
    const [displayPrice, setDisplayPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastContractNumber, setLastContractNumber] = useState<string>("");
    const [loadingLastNumber, setLoadingLastNumber] = useState(false);

    const formatNumberWithSpaces = (value: string) => {
        const cleanValue = value.replace(/\s/g, "");
        const parts = cleanValue.split(".");
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    };

    const handlePriceChange = (value: string) => {
        const cleanValue = value.replace(/[^0-9.\s]/g, "");
        const numericValue = cleanValue.replace(/\s/g, "");
        const parts = numericValue.split(".");
        if (parts.length > 2) {
            return;
        }
        if (parts[1] && parts[1].length > 2) {
            return;
        }
        const formattedValue = formatNumberWithSpaces(numericValue);
        setDisplayPrice(formattedValue);
        setFormData({
            ...formData,
            contract_price: numericValue,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.contract_number ||
            !formData.business_name ||
            !formData.object_address ||
            !formData.contract_price ||
            !formData.contract_date
        ) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        setLoading(true);
        try {
            const response: any = await PostSimple(
                "api/contracts/broker/create",
                {
                    contract_number: formData.contract_number,
                    business_name: formData.business_name,
                    object_address: formData.object_address,
                    contract_price: parseFloat(formData.contract_price),
                    contract_date: formData.contract_date,
                }
            );

            if (response) {
                toast.success("Контракт брокера успешно создан");
                setFormData({
                    contract_number: "",
                    business_name: "",
                    object_address: "",
                    contract_price: "",
                    contract_date: "",
                });
                setDisplayPrice("");
                changeStatus();
                onClose();
            }
        } catch (error: any) {
            onClose();
            toast.error(
                error?.response?.data?.error ||
                    "Что-то пошло не так при создании контракта брокера"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchLastContractNumber = async () => {
        setLoadingLastNumber(true);
        try {
            const response: any = await GetDataSimple(
                "api/contracts/lastcontractnumber"
            );
            const lastNumber =
                response?.contract_number ||
                response?.data?.contract_number ||
                response?.last_contract_number ||
                response?.data?.last_contract_number ||
                "";
            setLastContractNumber(lastNumber);
            // Автоматически заполнить поле последним номером + 1
            if (lastNumber) {
                const nextNumber = String(parseInt(lastNumber) + 1);
                setFormData((prev) => ({
                    ...prev,
                    contract_number: nextNumber,
                }));
            }
        } catch (error) {
            console.error("Error fetching last contract number:", error);
        } finally {
            setLoadingLastNumber(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLastContractNumber();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleClose = () => {
        setFormData({
            contract_number: "",
            business_name: "",
            object_address: "",
            contract_price: "",
            contract_date: "",
        });
        setDisplayPrice("");
        setLastContractNumber("");
        setLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={true}>
            <div className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Добавить новый контракт брокера
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Номер
                                контракта (Последний номер контракта:{" "}
                                <span className="font-semibold text-blue-500">
                                    {lastContractNumber}
                                </span>
                                )
                            </label>
                            <InputField
                                type="number"
                                // value={formData.contract_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        contract_number: e.target.value,
                                    })
                                }
                                placeholder={
                                    loadingLastNumber
                                        ? "Загрузка..."
                                        : lastContractNumber
                                        ? `Последний номер: ${lastContractNumber}`
                                        : "Например: 1"
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
                                disabled={loadingLastNumber}
                            />
                            {lastContractNumber && !loadingLastNumber && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"></p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Название
                                компании
                            </label>
                            <InputField
                                type="text"
                                value={formData.business_name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        business_name: e.target.value,
                                    })
                                }
                                placeholder='Например: "Company Name"'
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Дата
                                контракта
                            </label>
                            <DatePicker
                                id="contract-date"
                                label=""
                                placeholder="Выберите дату контракта"
                                onChange={(selectedDates) => {
                                    if (selectedDates[0]) {
                                        const date = new Date(selectedDates[0]);
                                        const formattedDate = date
                                            .toISOString()
                                            .split("T")[0];
                                        setFormData({
                                            ...formData,
                                            contract_date: formattedDate,
                                        });
                                    }
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Адрес
                                объекта
                            </label>
                            <InputField
                                type="text"
                                value={formData.object_address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        object_address: e.target.value,
                                    })
                                }
                                placeholder="Например: Dreamland"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="text-red-500">*</span> Цена
                                контракта
                            </label>
                            <div className="relative">
                                <InputField
                                    type="text"
                                    value={displayPrice}
                                    onChange={(e) =>
                                        handlePriceChange(e.target.value)
                                    }
                                    placeholder="0"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                    required
                                />
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                    сум
                                </span>
                            </div>
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
                                    Создать контракт
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
