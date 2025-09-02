import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { formatCurrency } from "../../utils/numberFormat";
import { GetDataSimple } from "../../service/data";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import SendResultModal from "./SendResultModal";

import toast from "react-hot-toast";

interface MyContract {
    contract_id: string;
    contract_number: string;
    contract_status: string;
    object_address: string;
    worker_price: string;
    deadline_date: string;
    days_diff: string;
    days_diff_text: string;
    client_id: string;
    client_name: string;
    client_type: string;
    business_name: string;
    phone_number: string;
    bank_account: string;
    bank_address: string;
    inn: string;
    mfo: string;
    oked: string;
    business_address: string;
    worker_user_id: string | null;
    worker_name: string | null;
    comments: string | null;
    laboratory: Array<{
        lab_test_id: string;
        tests_name: string;
        test_type: string;
    }>;
    result_for_worker: boolean;
    final_document: boolean;
}

const MyContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState<MyContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendResultModalOpen, setSendResultModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [appointmentInfo, setAppointmentInfo] = useState<any>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);

    useEffect(() => {
        if (id) {
            fetchContractDetails();
        }
    }, [id]);

    const fetchContractDetails = async () => {
        try {
            const response: any = await GetDataSimple(
                `api/appointment/my/list?contract_status=5&page=1&limit=100`
            );
            const contractsData =
                response?.result || response?.data?.result || [];

            // Find the specific contract by ID
            const foundContract = contractsData.find(
                (contract: MyContract) => contract.contract_id === id
            );

            if (foundContract) {
                setContract(foundContract);
            } else {
                console.log("Contract not found with ID:", id);
            }
        } catch (error) {
            console.error("Error fetching contract details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "5":
                return "success";
            case "4":
                return "info";
            case "3":
                return "warning";
            default:
                return "error";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "5":
                return "Завершено";
            case "4":
                return "На проверке";
            case "3":
                return "В процессе";
            default:
                return "Неизвестно";
        }
    };

    const getClientTypeText = (type: string) => {
        switch (type) {
            case "1":
                return "Физическое лицо";
            case "2":
                return "Юридическое лицо";
            default:
                return "Неизвестно";
        }
    };

    const getTestTypeText = (type: string) => {
        switch (type) {
            case "1":
                return "Основной";
            case "2":
                return "Дополнительный";
            default:
                return "Неизвестно";
        }
    };

    // formatCurrency function is now imported from utils

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Не указано";
        return new Date(dateString).toLocaleDateString("ru-RU");
    };

    const handleGetAppointmentInfo = async () => {
        if (!id) return;

        setLoadingInfo(true);
        try {
            const response = await GetDataSimple(
                `api/appointment/info?contract_id=${id}`
            );
            setAppointmentInfo(response);
            setIsInfoModalOpen(true);
        } catch (error) {
            console.error("Error fetching appointment info:", error);
            toast.error("Ошибка при загрузке информации");
        } finally {
            setLoadingInfo(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Загрузка...</div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-500">Контракт не найден</div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Мой контракт №${contract.contract_number}`}
                description="Детали моего назначенного контракта"
            />
            <PageBreadcrumb
                pageTitle={`Мой контракт №${contract.contract_number}`}
            />

            <div className="space-y-6">
                {/* Contract Header */}
                <ComponentCard
                    title={`Мой контракт №${contract.contract_number}`}
                    desc={
                        <div className="flex gap-3">
                            <Button
                                onClick={handleGetAppointmentInfo}
                                disabled={loadingInfo}
                                className="px-6 py-3"
                                
                            >
                                {loadingInfo ? "Загрузка..." : "Информация"}
                            </Button>
                            {/* <Button
                                onClick={() => setSendResultModalOpen(true)}
                                className="px-6 py-3"
                            >
                                Отправить результаты директору
                            </Button> */}
                        </div>
                    }
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Badge
                                color={getStatusColor(contract.contract_status)}
                            >
                                {getStatusText(contract.contract_status)}
                            </Badge>
                            <Badge color="light">
                                {getClientTypeText(contract.client_type)}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Моя доля</p>
                            <p className="text-2xl font-bold text-brand-500">
                                {formatCurrency(contract.worker_price)}
                            </p>
                        </div>
                    </div>
                </ComponentCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Client Information */}
                    <ComponentCard title="Информация о клиенте">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Имя клиента
                                    </p>
                                    <p className="font-medium">
                                        {contract.client_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Телефон
                                    </p>
                                    <p className="font-medium">
                                        {contract.phone_number}
                                    </p>
                                </div>
                            </div>
                            {contract.business_name && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Название компании
                                    </p>
                                    <p className="font-medium">
                                        {contract.business_name}
                                    </p>
                                </div>
                            )}
                            {contract.business_address && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Адрес компании
                                    </p>
                                    <p className="font-medium">
                                        {contract.business_address}
                                    </p>
                                </div>
                            )}
                            {(contract.inn ||
                                contract.mfo ||
                                contract.oked) && (
                                <div className="grid grid-cols-3 gap-4">
                                    {contract.inn && (
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                ИНН
                                            </p>
                                            <p className="font-medium">
                                                {contract.inn}
                                            </p>
                                        </div>
                                    )}
                                    {contract.mfo && (
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                МФО
                                            </p>
                                            <p className="font-medium">
                                                {contract.mfo}
                                            </p>
                                        </div>
                                    )}
                                    {contract.oked && (
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                ОКЕД
                                            </p>
                                            <p className="font-medium">
                                                {contract.oked}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {contract.bank_account && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Банковский счет
                                    </p>
                                    <p className="font-medium">
                                        {contract.bank_account}
                                    </p>
                                </div>
                            )}
                            {contract.bank_address && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Адрес банка
                                    </p>
                                    <p className="font-medium">
                                        {contract.bank_address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ComponentCard>

                    {/* Contract Information */}
                    <ComponentCard title="Информация о контракте">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Номер контракта
                                    </p>
                                    <p className="font-medium">
                                        {contract.contract_number}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        ID клиента
                                    </p>
                                    <p className="font-medium">
                                        {contract.client_id}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Адрес объекта
                                </p>
                                <p className="font-medium">
                                    {contract.object_address}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Срок выполнения
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(contract.deadline_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Осталось дней
                                    </p>
                                    <p className="font-medium">
                                        {contract.days_diff_text}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Моя доля
                                </p>
                                <p className="font-medium">
                                    {formatCurrency(contract.worker_price)}
                                </p>
                            </div>
                            {contract.worker_name && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Я назначен как
                                    </p>
                                    <p className="font-medium">
                                        {contract.worker_name}
                                    </p>
                                </div>
                            )}
                            {contract.comments && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Комментарии
                                    </p>
                                    <p className="font-medium">
                                        {contract.comments}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ComponentCard>
                </div>

                {/* Laboratory Tests */}
                {contract.laboratory && contract.laboratory.length > 0 && (
                    <ComponentCard title="Мои лабораторные тесты">
                        <div className="space-y-3">
                            {contract.laboratory.map((test, index) => (
                                <div
                                    key={test.lab_test_id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium">
                                            {test.tests_name}
                                        </span>
                                    </div>
                                    <Badge color="light">
                                        {getTestTypeText(test.test_type)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </ComponentCard>
                )}

                {/* My Work Status */}
                <ComponentCard title="Статус моей работы">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Результаты моей работы
                            </h4>
                            <div className="flex items-center gap-2">
                                <Badge
                                    color={
                                        contract.result_for_worker
                                            ? "success"
                                            : "warning"
                                    }
                                >
                                    {contract.result_for_worker
                                        ? "Готово"
                                        : "В процессе"}
                                </Badge>
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                    {contract.result_for_worker
                                        ? "Результаты готовы для отправки"
                                        : "Работа в процессе выполнения"}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                                Финальный документ
                            </h4>
                            <div className="flex items-center gap-2">
                                <Badge
                                    color={
                                        contract.final_document
                                            ? "success"
                                            : "warning"
                                    }
                                >
                                    {contract.final_document
                                        ? "Готов"
                                        : "В процессе"}
                                </Badge>
                                <span className="text-sm text-green-700 dark:text-green-300">
                                    {contract.final_document
                                        ? "Документ готов"
                                        : "Документ в процессе подготовки"}
                                </span>
                            </div>
                        </div>
                    </div>
                </ComponentCard>

                {/* Progress Summary */}
                <ComponentCard title="Сводка по прогрессу">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-brand-500">
                                    {contract.laboratory
                                        ? contract.laboratory.length
                                        : 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Всего тестов
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-green-500">
                                    {contract.days_diff}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Дней осталось
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-blue-500">
                                    {formatCurrency(contract.worker_price)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Моя доля
                                </div>
                            </div>
                        </div>
                    </div>
                </ComponentCard>
            </div>

            {/* Send Result Modal */}
            <SendResultModal
                isOpen={sendResultModalOpen}
                onClose={() => setSendResultModalOpen(false)}
                contractId={contract.contract_id}
                onSuccess={() => {
                    // Refresh the contract details after successful submission
                    fetchContractDetails();
                }}
            />

            {/* Information Modal */}
            <Modal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
            >
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Информация о назначении
                    </h3>
                    <div className="space-y-4">
                        {loadingInfo ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                                <p className="mt-2 text-gray-500">
                                    Загрузка информации...
                                </p>
                            </div>
                        ) : appointmentInfo ? (
                            <div className="space-y-4">
                                {/* Display appointment info here */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Детали назначения
                                    </h4>
                                    <div className="space-y-4">
                                        {/* Main Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {appointmentInfo.comments && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Комментарии
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {
                                                            appointmentInfo.comments
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            {appointmentInfo.object_address && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Адрес объекта
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {
                                                            appointmentInfo.object_address
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            {appointmentInfo.contract_price && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Стоимость контракта
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {formatCurrency(
                                                            Number(
                                                                appointmentInfo.contract_price
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {appointmentInfo.worker_price && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Стоимость работ
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {formatCurrency(
                                                            Number(
                                                                appointmentInfo.worker_price
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {appointmentInfo.deadline_date && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Срок выполнения
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {new Date(
                                                            appointmentInfo.deadline_date
                                                        ).toLocaleDateString(
                                                            "ru-RU"
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {appointmentInfo.days_diff_text && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Статус
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {
                                                            appointmentInfo.days_diff_text
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Users Info */}
                                        {(appointmentInfo.from_user_name ||
                                            appointmentInfo.to_user_name) && (
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                                    Участники
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {appointmentInfo.from_user_name && (
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Отправитель
                                                            </div>
                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                {
                                                                    appointmentInfo.from_user_name
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                    {appointmentInfo.to_user_name && (
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Получатель
                                                            </div>
                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                {
                                                                    appointmentInfo.to_user_name
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tasks Info */}
                                        {appointmentInfo.tasks &&
                                            appointmentInfo.tasks.length >
                                                0 && (
                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                                        Задачи
                                                    </h5>
                                                    <div className="space-y-4">
                                                        {appointmentInfo.tasks.map(
                                                            (
                                                                task: any,
                                                                index: number
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                                >
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            Задача
                                                                            #
                                                                            {index +
                                                                                1}
                                                                        </h6>
                                                                        {task.task_status_text && (
                                                                            <Badge
                                                                                color={
                                                                                    task.task_status ===
                                                                                    "2"
                                                                                        ? "success"
                                                                                        : task.task_status ===
                                                                                          "3"
                                                                                        ? "error"
                                                                                        : "warning"
                                                                                }
                                                                            >
                                                                                {
                                                                                    task.task_status_text
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {task.comments && (
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Комментарии
                                                                                    задачи
                                                                                </div>
                                                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                    {
                                                                                        task.comments
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {task.created_at && (
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Дата
                                                                                    создания
                                                                                </div>
                                                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                    {new Date(
                                                                                        task.created_at
                                                                                    ).toLocaleDateString(
                                                                                        "ru-RU"
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {task.from_user_name && (
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    От
                                                                                    кого
                                                                                </div>
                                                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                    {
                                                                                        task.from_user_name
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {task.to_user_name && (
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                    Кому
                                                                                </div>
                                                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                    {
                                                                                        task.to_user_name
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Task Items */}
                                                                    {task.task_item &&
                                                                        task
                                                                            .task_item
                                                                            .length >
                                                                            0 && (
                                                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                                                <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                                                    Элементы
                                                                                    задачи
                                                                                </h6>
                                                                                <div className="space-y-2">
                                                                                    {task.task_item.map(
                                                                                        (
                                                                                            item: any,
                                                                                            itemIndex: number
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    itemIndex
                                                                                                }
                                                                                                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                                                                                            >
                                                                                                {/* Item Header */}
                                                                                                <div className="flex items-center justify-between mb-2">
                                                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                                        Элемент
                                                                                                        #
                                                                                                        {itemIndex +
                                                                                                            1}
                                                                                                    </div>
                                                                                                    {item.task_status_text && (
                                                                                                        <Badge
                                                                                                            color={
                                                                                                                item.task_status ===
                                                                                                                "2"
                                                                                                                    ? "success"
                                                                                                                    : item.task_status ===
                                                                                                                      "3"
                                                                                                                    ? "error"
                                                                                                                    : "warning"
                                                                                                            }
                                                                                                            size="sm"
                                                                                                        >
                                                                                                            {
                                                                                                                item.task_status_text
                                                                                                            }
                                                                                                        </Badge>
                                                                                                    )}
                                                                                                </div>

                                                                                                {/* Item Content */}
                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                                    {item.comments && (
                                                                                                        <div>
                                                                                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                                Комментарии
                                                                                                            </div>
                                                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                                {
                                                                                                                    item.comments
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {item.created_at && (
                                                                                                        <div>
                                                                                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                                Дата
                                                                                                                создания
                                                                                                            </div>
                                                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                                {new Date(
                                                                                                                    item.created_at
                                                                                                                ).toLocaleDateString(
                                                                                                                    "ru-RU"
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {item.from_user_name && (
                                                                                                        <div>
                                                                                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                                От
                                                                                                                кого
                                                                                                            </div>
                                                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                                {
                                                                                                                    item.from_user_name
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {item.to_user_name && (
                                                                                                        <div>
                                                                                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                                Кому
                                                                                                            </div>
                                                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                                {
                                                                                                                    item.to_user_name
                                                                                                                }
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Информация не найдена
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={() => {
                                setIsInfoModalOpen(false);
                                setSendResultModalOpen(true);
                            }}
                            className="px-6 py-3"
                        >
                            Назначить
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default MyContractDetail;
