import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import { GetDataSimple, PostDataTokenJson } from "../../service/data";
import PageMeta from "../../components/common/PageMeta";

interface Client {
    client_id: number;
    client_name: string;
    business_name: string;
}

interface LabTest {
    lab_test_id: number;
    tests_name: string;
}

interface ContractFormData {
    contract_number: string;
    object_address: string;
    client_id: number;
    contract_type: number;
    contract_tarif: number | null;
    contract_plan_months: number;
    contract_price: number;
    contract_date: string;
    plan: Array<{
        date_of_payment: string;
        monthly_fee: number;
    }>;
    laboratory: Array<{
        lab_test_id: number;
    }>;
}

const AddContract = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ContractFormData>({
        contract_number: "",
        object_address: "",
        client_id: 0,
        contract_type: 1,
        contract_tarif: 1,
        contract_plan_months: 2,
        contract_price: 0,
        contract_date: "",
        plan: [
            {
                date_of_payment: "",
                monthly_fee: 0,
            },
        ],
        laboratory: [],
    });

    useEffect(() => {
        fetchClients();
    }, []);

    // Laboratoriya testlarini contract_tarif ga qarab yuklash
    useEffect(() => {
        if (
            formData.contract_tarif &&
            (formData.contract_type === 1 || formData.contract_type === 2)
        ) {
            fetchLabTests(formData.contract_tarif);
        }
    }, [formData.contract_tarif, formData.contract_type]);

    const fetchClients = async () => {
        try {
            const response = await GetDataSimple(
                "api/clients/list?page=1&limit=100"
            );
            setClients(response?.result || []);
        } catch (error) {
            console.error("Error fetching clients:", error);
            toast.error("Ошибка при загрузке клиентов");
        }
    };

    const fetchLabTests = async (tarifId: number) => {
        try {
            const response = await GetDataSimple(
                `api/contracts/laboratorytest/list?contract_tarif=${tarifId}`
            );
            setLabTests(response?.result || []);
        } catch (error) {
            console.error("Error fetching lab tests:", error);
            toast.error("Ошибка при загрузке лабораторных тестов");
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePlanChange = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            plan: prev.plan.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addPlanItem = () => {
        setFormData((prev) => ({
            ...prev,
            plan: [
                ...prev.plan,
                {
                    date_of_payment: "",
                    monthly_fee: 0,
                },
            ],
        }));
    };

    const removePlanItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            plan: prev.plan.filter((_, i) => i !== index),
        }));
    };

    const handleLabTestToggle = (labTestId: number) => {
        setFormData((prev) => {
            const isSelected = prev.laboratory.some(
                (item) => item.lab_test_id === labTestId
            );
            if (isSelected) {
                return {
                    ...prev,
                    laboratory: prev.laboratory.filter(
                        (item) => item.lab_test_id !== labTestId
                    ),
                };
            } else {
                return {
                    ...prev,
                    laboratory: [
                        ...prev.laboratory,
                        { lab_test_id: labTestId },
                    ],
                };
            }
        });
    };

    const calculateMonthlyFee = () => {
        if (formData.contract_price > 0 && formData.contract_plan_months > 0) {
            return Math.ceil(
                formData.contract_price / formData.contract_plan_months
            );
        }
        return 0;
    };

    const updatePlanWithCalculatedFee = () => {
        if (!formData.contract_price || !formData.contract_plan_months) {
            toast.error(
                "Пожалуйста, введите стоимость контракта и количество месяцев рассрочки"
            );
            return;
        }

        const monthlyFee = calculateMonthlyFee();
        if (monthlyFee > 0) {
            const today = new Date();
            const newPlan: Array<{
                date_of_payment: string;
                monthly_fee: number;
            }> = [];

            for (let i = 0; i < formData.contract_plan_months; i++) {
                const paymentDate = new Date(today);
                paymentDate.setMonth(today.getMonth() + i + 1);
                paymentDate.setDate(1);
                newPlan.push({
                    date_of_payment: paymentDate.toISOString().split("T")[0],
                    monthly_fee: monthlyFee,
                });
            }

            setFormData((prev) => ({
                ...prev,
                plan: newPlan,
            }));

            toast.success(
                `План рассрочки создан! Ежемесячный платеж: ${monthlyFee.toLocaleString()} сум`
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Form validatsiyasi
            if (
                !formData.contract_number ||
                !formData.object_address ||
                !formData.client_id ||
                !formData.contract_date
            ) {
                toast.error("Пожалуйста, заполните все обязательные поля");
                setLoading(false);
                return;
            }

            if (formData.contract_price <= 0) {
                toast.error("Стоимость контракта должна быть больше 0");
                setLoading(false);
                return;
            }

            // Prepare data based on contract type
            const submitData = {
                ...formData,
                contract_tarif:
                    formData.contract_type === 1 || formData.contract_type === 2
                        ? formData.contract_tarif
                        : null,
                contract_plan_months:
                    formData.contract_type === 1 || formData.contract_type === 2
                        ? formData.contract_plan_months
                        : 0,
                laboratory:
                    formData.contract_type === 1 || formData.contract_type === 2
                        ? formData.laboratory
                        : [],
            };

            const response = await PostDataTokenJson(
                `api/contracts/create`,
                submitData
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Контракт успешно создан!");
                navigate("/contracts"); // Kontraktlar ro'yxatiga qaytish
            } else {
                toast.error(
                    `Ошибка: ${response?.data?.message || "Неизвестная ошибка"}`
                );
            }
        } catch (error) {
            console.error("Error creating contract:", error);
            toast.error("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Новый Контракт"
                description="Создание нового контракта"
            />
            <PageBreadcrumb pageTitle="Новый Контракт" />

            <div className="space-y-6">
                <div className="flex items-center justify-end">
                    <Button
                        onClick={() => navigate("/contracts")}
                        variant="danger"
                    >
                        Отмена
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Contract Information */}
                    <ComponentCard title="Основная информация">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Номер контракта *
                                </label>
                                <Input
                                    value={formData.contract_number}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "contract_number",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Введите номер контракта"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Адрес объекта *
                                </label>
                                <Input
                                    value={formData.object_address}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "object_address",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Введите адрес объекта"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Клиент *
                                </label>
                                <Select
                                    options={clients.map((client) => ({
                                        value: client.client_id,
                                        label:
                                            client.business_name ||
                                            client.client_name,
                                    }))}
                                    placeholder="Выберите клиента"
                                    onChange={(value) =>
                                        handleInputChange(
                                            "client_id",
                                            parseInt(value)
                                        )
                                    }
                                    defaultValue=""
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Дата контракта *
                                </label>
                                <DatePicker
                                    id="contract-date"
                                    label=""
                                    placeholder="Выберите дату контракта"
                                    onChange={(selectedDates) => {
                                        if (
                                            selectedDates &&
                                            selectedDates.length > 0
                                        ) {
                                            const date = new Date(
                                                selectedDates[0]
                                            );
                                            handleInputChange(
                                                "contract_date",
                                                date.toISOString().split("T")[0]
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </ComponentCard>

                    {/* Contract Type and Settings */}
                    <ComponentCard title="Тип контракта и настройки">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Тип контракта
                                </label>
                                <Select
                                    options={[
                                        {
                                            value: 1,
                                            label: "Юридическое лицо - Рассрочка + Лаборатория",
                                        },
                                        {
                                            value: 2,
                                            label: "Физическое лицо - Рассрочка + Лаборатория",
                                        },
                                        { value: 3, label: "Обычный контракт" },
                                    ]}
                                    placeholder="Выберите тип контракта"
                                    onChange={(value) =>
                                        handleInputChange(
                                            "contract_type",
                                            parseInt(value)
                                        )
                                    }
                                    defaultValue="1"
                                />
                            </div>

                            {(formData.contract_type === 1 ||
                                formData.contract_type === 2) && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Тариф
                                        </label>
                                        <Select
                                            options={[
                                                { value: 1, label: "Старт" },
                                                { value: 2, label: "Серебро" },
                                                { value: 3, label: "Золото" },
                                                {
                                                    value: 4,
                                                    label: "Премиум (VIP)",
                                                },
                                            ]}
                                            placeholder="Выберите тариф"
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "contract_tarif",
                                                    parseInt(value)
                                                )
                                            }
                                            defaultValue="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Количество месяцев рассрочки
                                        </label>
                                        <Input
                                            type="number"
                                            value={
                                                formData.contract_plan_months
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "contract_plan_months",
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            min="1"
                                            max="60"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </ComponentCard>

                    {/* Contract Price */}
                    <ComponentCard title="Стоимость контракта">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Стоимость контракта (сум) *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.contract_price}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "contract_price",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    min="0"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={updatePlanWithCalculatedFee}
                                    disabled={
                                        !formData.contract_price ||
                                        !formData.contract_plan_months
                                    }
                                    className="w-full h-11 px-5 py-3.5 text-sm bg-brand-500 text-white rounded-lg shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                >
                                    Рассчитать план рассрочки
                                </button>
                            </div>
                        </div>
                    </ComponentCard>

                    {/* Payment Plan */}
                    {(formData.contract_type === 1 ||
                        formData.contract_type === 2) && (
                        <ComponentCard title="План рассрочки">
                            <div className="space-y-4">
                                {formData.plan.map((planItem, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                    Дата платежа
                                                </label>
                                                <DatePicker
                                                    id={`payment-date-${index}`}
                                                    label=""
                                                    placeholder="Выберите дату платежа"
                                                    onChange={(
                                                        selectedDates
                                                    ) => {
                                                        if (
                                                            selectedDates &&
                                                            selectedDates.length >
                                                                0
                                                        ) {
                                                            const date =
                                                                new Date(
                                                                    selectedDates[0]
                                                                );
                                                            handlePlanChange(
                                                                index,
                                                                "date_of_payment",
                                                                date
                                                                    .toISOString()
                                                                    .split(
                                                                        "T"
                                                                    )[0]
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                    Ежемесячный платеж (сум)
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={planItem.monthly_fee}
                                                    onChange={(e) =>
                                                        handlePlanChange(
                                                            index,
                                                            "monthly_fee",
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        {formData.plan.length > 1 && (
                                            <Button
                                                onClick={() =>
                                                    removePlanItem(index)
                                                }
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Удалить
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    onClick={addPlanItem}
                                    variant="outline"
                                    className="w-full"
                                >
                                    + Добавить рассрочку
                                </Button>
                            </div>
                        </ComponentCard>
                    )}

                    {/* Laboratory Tests */}
                    {(formData.contract_type === 1 ||
                        formData.contract_type === 2) &&
                        formData.contract_tarif && (
                            <ComponentCard title="Лабораторные исследования">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {labTests.length > 0 ? (
                                        labTests.map((test) => (
                                            <label
                                                key={test.lab_test_id}
                                                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.laboratory.some(
                                                        (item) =>
                                                            item.lab_test_id ===
                                                            test.lab_test_id
                                                    )}
                                                    onChange={() =>
                                                        handleLabTestToggle(
                                                            test.lab_test_id
                                                        )
                                                    }
                                                    className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {test.tests_name}
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-full">
                                            Для этого тарифа лабораторные тесты
                                            не найдены
                                        </p>
                                    )}
                                </div>
                            </ComponentCard>
                        )}

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            onClick={() => {
                                const formEvent = new Event("submit") as any;
                                handleSubmit(formEvent);
                            }}
                            disabled={loading}
                            className="min-w-[120px]"
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddContract;
