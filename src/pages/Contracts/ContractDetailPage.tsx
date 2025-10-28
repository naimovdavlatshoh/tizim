import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { GetDataSimple } from "../../service/data";
import { formatAmount, formatDate } from "../../utils/numberFormat";
import Button from "../../components/ui/button/Button";
import { toast } from "react-hot-toast";

interface LaboratoryTest {
    lab_test_id: number;
    tests_name: string;
    test_type: number;
}

interface MonthlyPayment {
    monthly_id: number;
    monthly_fee: number;
    month_of_payment: number;
    date_of_payment: string;
    given_amount: number;
    payment_status: number;
    created_at: string;
}

interface Payment {
    payment_id: number;
    amount: number;
    payment_type: string;
    payment_type_text: string;
    is_advance: number;
    comments?: string;
    created_at: string;
}

interface ContractDetail {
    contract_id: number;
    contract_number: string;
    object_address: string;
    client_id: number;
    contract_type: number;
    contract_tarif: number;
    contract_price: number;
    percent: string;
    contract_date: string;
    contract_effective_from: string;
    client_name: string;
    client_type: number;
    client_address?: string;
    business_name?: string;
    phone_number: string;
    bank_account?: string;
    bank_address?: string;
    inn?: number;
    mfo?: number;
    oked?: number;
    business_address?: string;
    contract_status: number;
    contract_status_text: string;
    contract_payment_status: number;
    contract_payment_status_text: string;
    contract_months: number;
    created_at: string;
    laboratory: LaboratoryTest[];
    monthlypayments: MonthlyPayment[];
    payments: Payment[];
}

const ContractDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contract, setContract] = useState<ContractDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchContractDetails();
        }
    }, [id]);

    const fetchContractDetails = async () => {
        setLoading(true);
        try {
            const response = await GetDataSimple(`api/contracts/read/${id}`);
            if (response) {
                setContract(response);
            } else {
                toast.error("Договор не найден");
                navigate(-1);
            }
        } catch (error) {
            console.error("Error fetching contract details:", error);
            toast.error("Ошибка при загрузке данных договора");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case 2:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case 3:
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const getPaymentStatusColor = (status: number) => {
        switch (status) {
            case 0:
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            case 1:
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const getPaymentStatusText = (status: number) => {
        switch (status) {
            case 0:
                return "Не оплачено";
            case 1:
                return "Оплачено";
            default:
                return "Неизвестно";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                        Загрузка...
                    </span>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Договор не найден
                    </h2>
                    <Button onClick={() => navigate(-1)}>
                        Вернуться назад
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Договор #{contract.contract_number}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Создан: {formatDate(contract.created_at)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    contract.contract_status
                                )}`}
                            >
                                {contract.contract_status_text}
                            </span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    contract.contract_payment_status
                                )}`}
                            >
                                {contract.contract_payment_status_text}
                            </span>
                            <button
                                className="bg-gray-500 hover:bg-gray-600 border-none text-white py-2 rounded-md px-5"
                                onClick={() => navigate(-1)}
                            >
                                Назад
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contract Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Информация о договоре
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Номер договора
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        #{contract.contract_number}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Сумма договора
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium text-lg">
                                        {formatAmount(contract.contract_price)}{" "}
                                        сум
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Процент
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {contract.percent}%
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Количество месяцев
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {contract.contract_months} месяцев
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Дата договора
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {formatDate(contract.contract_date)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Действует с
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {formatDate(
                                            contract.contract_effective_from
                                        )}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Адрес объекта
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {contract.object_address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Client Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Информация о клиенте
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Ф.И.О клиента
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {contract.client_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Тип клиента
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {contract.client_type === 1
                                            ? "Юридическое лицо"
                                            : "Физическое лицо"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Телефон
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {contract.phone_number}
                                    </p>
                                </div>
                                {contract.client_address && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Адрес клиента
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {contract.client_address}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Business Information for Legal Entities */}
                            {contract.client_type === 1 && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Информация о компании
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {contract.business_name && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Название компании
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.business_name}
                                                </p>
                                            </div>
                                        )}
                                        {contract.business_address && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Адрес компании
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.business_address}
                                                </p>
                                            </div>
                                        )}
                                        {contract.inn && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    ИНН
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.inn}
                                                </p>
                                            </div>
                                        )}
                                        {contract.mfo && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    МФО
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.mfo}
                                                </p>
                                            </div>
                                        )}
                                        {contract.oked && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    ОКЭД
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.oked}
                                                </p>
                                            </div>
                                        )}
                                        {contract.bank_account && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Банковский счет
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.bank_account}
                                                </p>
                                            </div>
                                        )}
                                        {contract.bank_address && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Адрес банка
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.bank_address}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Laboratory Tests */}
                        {contract.laboratory &&
                            contract.laboratory.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Лабораторные тесты
                                    </h2>
                                    <div className="space-y-3">
                                        {contract.laboratory.map((test) => (
                                            <div
                                                key={test.lab_test_id}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                                <div>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {test.tests_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        ID: {test.lab_test_id}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs">
                                                    Тип {test.test_type}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Monthly Payments */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Ежемесячные платежи
                            </h2>
                            <div className="space-y-3">
                                {contract.monthlypayments.map((payment) => (
                                    <div
                                        key={payment.monthly_id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Месяц {payment.month_of_payment}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                                    payment.payment_status
                                                )}`}
                                            >
                                                {getPaymentStatusText(
                                                    payment.payment_status
                                                )}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Сумма:
                                                </span>
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {formatAmount(
                                                        payment.monthly_fee
                                                    )}{" "}
                                                    сум
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Оплачено:
                                                </span>
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {formatAmount(
                                                        payment.given_amount
                                                    )}{" "}
                                                    сум
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            Дата платежа:{" "}
                                            {formatDate(
                                                payment.date_of_payment
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payments History */}
                        {contract.payments && contract.payments.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    История платежей
                                </h2>
                                <div className="space-y-3">
                                    {contract.payments.map((payment) => (
                                        <div
                                            key={payment.payment_id}
                                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Платеж #{payment.payment_id}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(
                                                        payment.created_at
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {formatAmount(
                                                        payment.amount
                                                    )}{" "}
                                                    сум
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {payment.payment_type_text}
                                                </p>
                                                {payment.comments && (
                                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                        {payment.comments}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Сводка
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Общая сумма:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formatAmount(contract.contract_price)}{" "}
                                        сум
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Ежемесячный платеж:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {contract.monthlypayments.length > 0
                                            ? formatAmount(
                                                  contract.monthlypayments[0]
                                                      .monthly_fee
                                              )
                                            : "0"}{" "}
                                        сум
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Количество месяцев:
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {contract.contract_months}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailPage;
