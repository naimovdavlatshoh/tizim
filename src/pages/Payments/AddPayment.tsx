import { useState, useEffect } from "react";
import {
    PostDataTokenJson,
    GetDataSimple,
    PostDataToken,
} from "../../service/data";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import { formatCurrency } from "../../utils/numberFormat";

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    setResponse: (response: string) => void;
}

interface Contract {
    contract_id: number;
    contract_number: string;
    client_name: string;
}

interface FormData {
    contract_id: string;
    is_advance: string;
    amount: string;
    payment_type: string;
    comments: string;
}

export default function AddPaymentModal({
    isOpen,
    onClose,
    changeStatus,
    setResponse,
}: AddPaymentModalProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [contractSearch, setContractSearch] = useState<string>("");
    const [showContractDropdown, setShowContractDropdown] =
        useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        contract_id: "",
        is_advance: "0",
        amount: "",
        payment_type: "1",
        comments: "",
    });

    // formatCurrency function is now imported from utils

    useEffect(() => {
        if (isOpen) {
            fetchContracts();
            // Don't show dropdown automatically when modal opens
            setShowContractDropdown(false);
        }
    }, [isOpen]);

    useEffect(() => {
        // Search contracts when search text changes
        if (contractSearch.trim().length >= 3) {
            searchContracts(contractSearch.trim());
        } else if (contractSearch.trim() === "") {
            // Show all contracts when search is empty
            setFilteredContracts(contracts);
        } else {
            // Clear results when less than 3 characters
            setFilteredContracts([]);
        }
    }, [contractSearch, contracts]);

    const fetchContracts = async (): Promise<void> => {
        try {
            const response: any = await GetDataSimple(
                "api/contracts/list?page=1&limit=100"
            );
            const contractsData: Contract[] =
                response?.result || response?.data?.result || [];
            setContracts(contractsData);
            setFilteredContracts(contractsData);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Ошибка при загрузке договоров");
        }
    };

    const searchContracts = async (keyword: string): Promise<void> => {
        if (keyword.length < 3) return;

        setSearchLoading(true);
        try {
            const response: any = await PostDataToken(
                `api/contracts/search?keyword=${encodeURIComponent(keyword)}`,
                {}
            );

            const searchResults: Contract[] =
                response?.result || response?.data?.result || [];

            setFilteredContracts(searchResults);
        } catch (error) {
            console.error("Error searching contracts:", error);
            toast.error("Ошибка при поиске договоров");
            setFilteredContracts([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleInputChange = (
        field: keyof FormData,
        value: string | number
    ): void => {
        setFormData((prev) => ({
            ...prev,
            [field]: String(value),
        }));
    };

    const handleContractSelect = (contract: Contract) => {
        setFormData((prev) => ({
            ...prev,
            contract_id: contract.contract_id.toString(),
        }));
        setContractSearch(
            `${contract.contract_number} - ${contract.client_name}`
        );
        setShowContractDropdown(false);
    };

    const handleSubmit = async (): Promise<void> => {
        // Form validatsiyasi
        if (!formData.contract_id || !formData.amount) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            toast.error("Сумма должна быть больше 0");
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                contract_id: parseInt(formData.contract_id),
                is_advance: parseInt(formData.is_advance),
                amount: parseFloat(formData.amount),
                payment_type: parseInt(formData.payment_type),
                comments: formData.comments,
            };

            console.log(submitData);

            const response: any = await PostDataTokenJson(
                "api/payments/create",
                submitData
            );

            if (response) {
                toast.success("Платеж успешно создан!");
                setResponse(JSON.stringify(response?.data || response));
                changeStatus();
                onClose();
                // Form ni tozalash
                setFormData({
                    contract_id: "",
                    is_advance: "0",
                    amount: "",
                    payment_type: "1",
                    comments: "",
                });
                setContractSearch("");
            } else {
                toast.error(
                    `Ошибка: ${response?.data?.message || "Неизвестная ошибка"}`
                );
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[800px] p-6 lg:p-10"
        >
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Добавить платеж
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Label htmlFor="contract_id">Договор *</Label>
                    <div className="relative">
                        <div
                            onClick={() => {
                                setShowContractDropdown(true);
                                if (contractSearch.trim() === "") {
                                    setFilteredContracts(contracts);
                                }
                            }}
                        >
                            <Input
                                type="text"
                                placeholder="Поиск договора (минимум 3 символа)..."
                                value={contractSearch}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setContractSearch(e.target.value);
                                    setShowContractDropdown(true);
                                }}
                                className="w-full"
                            />
                        </div>
                        {showContractDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {searchLoading ? (
                                    <div className="px-3 py-4 text-center">
                                        <div className="inline-flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Поиск...
                                        </div>
                                    </div>
                                ) : filteredContracts.length > 0 ? (
                                    filteredContracts.map((contract) => (
                                        <div
                                            key={contract.contract_id}
                                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                            onClick={() =>
                                                handleContractSelect(contract)
                                            }
                                        >
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {contract.contract_number}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {contract.client_name}
                                            </div>
                                        </div>
                                    ))
                                ) : contractSearch.trim().length >= 3 ? (
                                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                                        Договоры не найдены
                                    </div>
                                ) : contractSearch.trim().length > 0 ? (
                                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                                        Введите минимум 3 символа для поиска
                                    </div>
                                ) : (
                                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                                        Начните вводить для поиска договоров
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <Label htmlFor="is_advance">Аванс</Label>
                    <Select
                        options={[
                            { value: 0, label: "Нет" },
                            { value: 1, label: "Да" },
                        ]}
                        defaultValue={formData.is_advance}
                        onChange={(value: string | number) =>
                            handleInputChange("is_advance", value)
                        }
                    />
                </div>
                <div>
                    <Label htmlFor="amount">Сумма *</Label>
                    <Input
                        type="number"
                        id="amount"
                        placeholder="Введите сумму"
                        value={formData.amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("amount", e.target.value)
                        }
                        min="0"
                        step={0.01}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatCurrency(formData.amount)}
                    </p>
                </div>
                <div>
                    <Label htmlFor="payment_type">Тип платежа</Label>
                    <Select
                        options={[
                            { value: 1, label: "Наличка" },
                            { value: 2, label: "На карту" },
                            { value: 3, label: "Перечисление" },
                        ]}
                        defaultValue={formData.payment_type}
                        onChange={(value: string | number) =>
                            handleInputChange("payment_type", value)
                        }
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="comments">Комментарий</Label>
                    <TextArea
                        placeholder="Введите комментарий"
                        value={formData.comments}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange("comments", e.target.value)
                        }
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white transition-colors ${
                        loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Сохранение...
                        </div>
                    ) : (
                        "Сохранить"
                    )}
                </button>
            </div>
        </Modal>
    );
}
