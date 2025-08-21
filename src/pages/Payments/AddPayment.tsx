import { useState, useEffect } from "react";
import { PostDataTokenJson, GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";

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
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [formData, setFormData] = useState<FormData>({
        contract_id: "",
        is_advance: "0",
        amount: "",
        payment_type: "1",
        comments: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchContracts();
        }
    }, [isOpen]);

    const fetchContracts = async (): Promise<void> => {
        try {
            const response: any = await GetDataSimple(
                "api/contracts/list?page=1&limit=100"
            );
            const contractsData: Contract[] =
                response?.result || response?.data?.result || [];
            setContracts(contractsData);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Ошибка при загрузке контрактов");
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
                <div>
                    <Label htmlFor="contract_id">Контракт *</Label>
                    <Select
                        options={contracts.map((contract) => ({
                            value: contract.contract_id,
                            label: `${contract.contract_number} - ${contract.client_name}`,
                        }))}
                        defaultValue={formData.contract_id || ""}
                        onChange={(value: string | number) =>
                            handleInputChange("contract_id", value)
                        }
                        placeholder="Выберите контракт"
                    />
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
                        onChange={(value: string) =>
                            handleInputChange("comments", value)
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
