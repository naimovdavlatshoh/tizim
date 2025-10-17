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
// import { formatCurrency } from "../../utils/numberFormat";

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
    business_name: string;
    object_address: string;
    client_id: number;
    contract_type: number;
    contract_tarif: number | null;
    contract_plan_months: number;
    contract_price: number;
    contract_date: string;
    expire_date: string;
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
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [searchingClients, setSearchingClients] = useState(false);
    const [lastnumber, setLastNumber] = useState(0);
    const [displayPrice, setDisplayPrice] = useState("");
    const [formData, setFormData] = useState<ContractFormData>({
        contract_number: "",
        business_name: "",
        object_address: "",
        client_id: 0,
        contract_type: 0,
        contract_tarif: null,
        contract_plan_months: 0,
        contract_price: 0,
        contract_date: "",
        expire_date: "",
        plan: [
            {
                date_of_payment: "",
                monthly_fee: 0,
            },
        ],
        laboratory: [],
    });

    // formatCurrency function is now imported from utils

    // fetchClients is now handled by searchClients

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

    const handlePriceChange = (value: string) => {
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
        setDisplayPrice(formattedValue);
        setFormData((prev) => ({
            ...prev,
            contract_price: parseFloat(numericValue) || 0,
        }));
    };

    // Initialize filtered clients when clients change
    useEffect(() => {
        setFilteredClients(clients);
    }, [clients]);

    // Initial load of all clients
    useEffect(() => {
        searchClients("");
    }, []);

    // Laboratoriya testlarini contract_tarif ga qarab yuklash
    useEffect(() => {
        if (
            formData.contract_tarif &&
            (formData.contract_type === 1 ||
                formData.contract_type === 2 ||
                formData.contract_type === 5)
        ) {
            fetchLabTests(formData.contract_tarif);
        }
    }, [formData.contract_tarif, formData.contract_type]);

    // fetchClients function is now replaced by searchClients

    const searchClients = async (keyword: string) => {
        setSearchingClients(true);

        try {
            if (keyword.trim().length === 0) {
                // Empty search - fetch all clients from backend
                const response = await GetDataSimple(
                    "api/clients/list?page=1&limit=100"
                );
                const allClients = response?.result || [];
                setClients(allClients);
                setFilteredClients(allClients);
            } else if (keyword.trim().length >= 3) {
                // Search with keyword
                const response = await PostDataTokenJson(
                    `api/clients/search?keyword=${encodeURIComponent(keyword)}`,
                    {}
                );
                const searchResults = response?.data?.result || [];
                setFilteredClients(searchResults);
            } else {
                // Less than 3 characters - show current clients
                setFilteredClients(clients);
            }
        } catch (error) {
            console.error("Error searching/fetching clients:", error);
            toast.error("Ошибка при загрузке клиентов");
            // Fallback to showing current clients
            setFilteredClients(clients);
        } finally {
            setSearchingClients(false);
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

    const handleMonthlyFeeChange = (index: number, value: string) => {
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

        // Update form data with numeric value
        handlePlanChange(index, "monthly_fee", parseFloat(numericValue) || 0);
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

    useEffect(() => {
        GetDataSimple("api/contracts/lastcontractnumber").then((response) => {
            if (response) {
                setLastNumber(response.last_contract_number);
            }
        });
    }, []);

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
                "Пожалуйста, введите стоимость договора и количество месяцев рассрочки"
            );
            return;
        }

        if (formData.contract_type !== 5) {
            toast.error("План рассрочки доступен только для типа договора 5");
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
                `План рассрочки создан! Ежемесячный платеж: ${monthlyFee.toLocaleString(
                    "ru-RU"
                )} сум`
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
                !formData.business_name ||
                !formData.object_address ||
                !formData.client_id ||
                !formData.contract_date
            ) {
                toast.error("Пожалуйста, заполните все обязательные поля");
                setLoading(false);
                return;
            }

            // Validate expire_date for contract types 1 and 2
            if (
                (formData.contract_type === 1 ||
                    formData.contract_type === 2) &&
                !formData.expire_date
            ) {
                toast.error("Пожалуйста, выберите дату окончания договора");
                setLoading(false);
                return;
            }

            if (formData.contract_price <= 0) {
                toast.error("Стоимость договора должна быть больше 0");
                setLoading(false);
                return;
            }

            // Prepare data based on contract type
            const submitData = {
                contract_number: formData.contract_number,
                business_name: formData.business_name,
                object_address: formData.object_address,
                client_id: formData.client_id,
                contract_type: formData.contract_type,
                contract_tarif:
                    formData.contract_type === 1 ||
                    formData.contract_type === 2 ||
                    formData.contract_type === 5
                        ? formData.contract_tarif
                        : null,
                contract_plan_months:
                    formData.contract_type === 5
                        ? formData.contract_plan_months
                        : 0,
                contract_price: formData.contract_price,
                contract_date: formData.contract_date,
                ...(formData.contract_type === 1 || formData.contract_type === 2
                    ? { expire_date: formData.expire_date }
                    : {}),
                ...(formData.contract_type === 5
                    ? { plan: formData.plan }
                    : {}),
                ...(formData.contract_type === 1 ||
                formData.contract_type === 2 ||
                formData.contract_type === 5
                    ? { laboratory: formData.laboratory }
                    : {}),
            };

            const response = await PostDataTokenJson(
                `api/contracts/create`,
                submitData
            );

            if (response) {
                toast.success("Договор успешно создан!");
                navigate("/contracts");
            }
        } catch (error: any) {
            console.error(
                "Error creating contract:",
                error?.response?.data?.error
            );
            toast.error(error?.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Новый Договор"
                description="Создание нового договора"
            />
            <PageBreadcrumb pageTitle="Новый Договор" />

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
                    {/* Contract Type and Settings */}
                    <ComponentCard title="Тип договора и настройки">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Тип договора
                                </label>
                                <Select
                                    options={[
                                        {
                                            value: 1,
                                            label: "Laboratoriya - Yuridik",
                                        },
                                        {
                                            value: 2,
                                            label: "Laboratoriya - Jismoniy",
                                        },
                                        {
                                            value: 3,
                                            label: "Texnik tekshiruv - Yuridik",
                                        },
                                        {
                                            value: 4,
                                            label: "Texnik tekshiruv - jismoniy",
                                        },
                                        {
                                            value: 5,
                                            label: "Beton zavod Laboratoriya oylik to'lov",
                                        },
                                    ]}
                                    placeholder="Выберите тип договора"
                                    onChange={(value) =>
                                        handleInputChange(
                                            "contract_type",
                                            parseInt(value)
                                        )
                                    }
                                />
                            </div>

                            {(formData.contract_type === 1 ||
                                formData.contract_type === 2 ||
                                formData.contract_type === 5) && (
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
                                    />
                                </div>
                            )}

                            {formData.contract_type === 5 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Количество месяцев рассрочки
                                    </label>
                                    <Input
                                        type="number"
                                        value={
                                            formData.contract_plan_months || ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "contract_plan_months",
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                        min="1"
                                        max="60"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </ComponentCard>

                    {/* Basic Contract Information */}
                    <ComponentCard title="Основная информация">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Номер договора *
                                </label>
                                <Input
                                    value={formData.contract_number}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "contract_number",
                                            e.target.value
                                        )
                                    }
                                    placeholder={`Последний номер договора: ${lastnumber}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Название компании *
                                </label>
                                <Input
                                    value={formData.business_name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "business_name",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Введите название компании"
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
                                    options={filteredClients.map((client) => ({
                                        value: client.client_id,
                                        label: client?.business_name
                                            ? client?.business_name +
                                              " " +
                                              client?.client_name
                                            : client.client_name,
                                    }))}
                                    placeholder="Выберите клиента"
                                    onChange={(value) => {
                                        handleInputChange(
                                            "client_id",
                                            parseInt(value)
                                        );
                                    }}
                                    defaultValue=""
                                    searchable={true}
                                    onSearch={searchClients}
                                    searching={searchingClients}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Дата договора *
                                </label>
                                <DatePicker
                                    id="contract-date"
                                    label=""
                                    placeholder="Выберите дату договора"
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
                            {(formData.contract_type === 1 ||
                                formData.contract_type === 2) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Дата окончания договора *
                                    </label>
                                    <DatePicker
                                        id="expire-date"
                                        label=""
                                        placeholder="Выберите дату окончания"
                                        onChange={(selectedDates) => {
                                            if (
                                                selectedDates &&
                                                selectedDates.length > 0
                                            ) {
                                                const date = new Date(
                                                    selectedDates[0]
                                                );
                                                handleInputChange(
                                                    "expire_date",
                                                    date
                                                        .toISOString()
                                                        .split("T")[0]
                                                );
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </ComponentCard>

                    {/* Contract Price */}
                    <ComponentCard title="Стоимость договора">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Стоимость договора (сум) *
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={displayPrice}
                                        onChange={(e) =>
                                            handlePriceChange(e.target.value)
                                        }
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                    />
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                        сум
                                    </span>
                                </div>
                            </div>
                            {formData.contract_type === 5 && (
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
                            )}
                        </div>
                    </ComponentCard>

                    {/* Payment Plan */}
                    {formData.contract_type === 5 && (
                        <ComponentCard title="План рассрочки">
                            <div className="space-y-4">
                                {formData.plan.map((planItem, index) => (
                                    <div
                                        key={index}
                                        className="flex items-end gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
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
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        value={
                                                            planItem.monthly_fee
                                                                ? formatNumberWithSpaces(
                                                                      planItem.monthly_fee.toString()
                                                                  )
                                                                : ""
                                                        }
                                                        onChange={(e) =>
                                                            handleMonthlyFeeChange(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                                    />
                                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                                                        сум
                                                    </span>
                                                </div>
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
                        formData.contract_type === 2 ||
                        formData.contract_type === 5) &&
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
