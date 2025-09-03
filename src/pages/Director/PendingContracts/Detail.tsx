import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import Badge from "../../../components/ui/badge/Badge";
import { formatCurrency } from "../../../utils/numberFormat";
import {
    GetDataSimple,
    PostDataTokenJson,
    GetDataSimpleBlob,
} from "../../../service/data";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import TextArea from "../../../components/form/input/TextArea";
import Label from "../../../components/form/Label";

import { toast } from "react-hot-toast";

interface PendingContract {
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
    result_for_director: {
        result_id: string;
        task_status: string;
        contract_id: string;
        from_user_id: string;
        from_user_name: string;
        to_user_id: string;
        to_user_name: string;
        document_id: string;
        comments: string;
        created_at: string;
    } | null;
    final_document: {
        document_id: string;
        created_at: string;
    } | null;
}

const PendingContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState<PendingContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [appointmentInfo, setAppointmentInfo] = useState<any>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [comments, setComments] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
    // const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            fetchContractDetails();
        }
    }, [id]);

    const fetchContractDetails = async () => {
        try {
            const response: any = await GetDataSimple(
                `api/appointment/all/list?contract_status=5&page=1&limit=100`
            );
            const contractsData =
                response?.result || response?.data?.result || [];

            // Find the specific contract by ID
            const foundContract = contractsData.find(
                (contract: PendingContract) => contract.contract_id === id
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

    const handleGetAppointmentInfo = async () => {
        if (!contract) return;

        setLoadingInfo(true);
        try {
            const response = await GetDataSimple(
                `api/appointment/info?contract_id=${contract.contract_id}`
            );

            if (response) {
                setAppointmentInfo(response);
                setIsInfoModalOpen(true);
            } else {
                toast.error("Информация не найдена");
            }
        } catch (error) {
            console.error("Error fetching appointment info:", error);
            toast.error("Ошибка при получении информации");
        } finally {
            setLoadingInfo(false);
        }
    };

    const handleAcceptContract = async (taskId: string) => {
        const comment = comments[taskId];
        if (!comment?.trim()) {
            toast.error("Пожалуйста, введите комментарии");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await PostDataTokenJson(
                "api/appointment/accept/result",
                {
                    contract_id: parseInt(contract!.contract_id),
                    task_id: parseInt(taskId),
                    comments: comment.trim(),
                }
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Договор успешно одобрен!");
                setIsInfoModalOpen(false);
                setComments({});
                // Refresh contract data
                fetchContractDetails();
            } else {
                toast.error("Ошибка при одобрении договора");
            }
        } catch (error) {
            console.error("Error accepting contract:", error);
            toast.error("Произошла ошибка при одобрении договора");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelContract = async (taskId: string) => {
        const comment = comments[taskId];
        if (!comment?.trim()) {
            toast.error("Пожалуйста, введите комментарии");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await PostDataTokenJson(
                "api/appointment/cancel/result",
                {
                    contract_id: parseInt(contract!.contract_id),
                    task_id: parseInt(taskId),
                    comments: comment.trim(),
                }
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("Договор успешно отклонен!");
                setIsInfoModalOpen(false);
                setComments({});
                // Refresh contract data
                fetchContractDetails();
            } else {
                toast.error("Ошибка при отклонении договора");
            }
        } catch (error) {
            console.error("Error canceling contract:", error);
            toast.error("Произошла ошибка при отклонении договора");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadDocument = async (documentId: string) => {
        setDownloadingDoc(documentId);
        try {
            const response = await GetDataSimpleBlob(
                `api/appointment/result/pdf/${documentId}`
            );
            const blob = new Blob([response.data], {
                type: "application/pdf",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `document_${documentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Документ успешно скачан!");
        } catch (error) {
            console.error("Error downloading document:", error);
            toast.error("Ошибка при скачивании документа");
        } finally {
            setDownloadingDoc(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "3":
                return "warning";
            case "4":
                return "info";
            case "5":
                return "success";
            default:
                return "error";
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

    const getTaskStatusText = (status: string) => {
        switch (status) {
            case "1":
                return "В процессе";
            case "2":
                return "Завершено";
            case "3":
                return "Отклонено";
            default:
                return "Неизвестно";
        }
    };

    const getTaskStatusColor = (status: string) => {
        switch (status) {
            case "1":
                return "warning";
            case "2":
                return "success";
            case "3":
                return "error";
            default:
                return "light";
        }
    };

    // formatCurrency function is now imported from utils

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Не указано";
        return new Date(dateString).toLocaleDateString("ru-RU");
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
                <div className="text-lg text-red-500">Договор не найден</div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Договор №${contract.contract_number}`}
                description="Детали договора в процессе"
            />
            <PageBreadcrumb
                pageTitle={`Договор №${contract.contract_number}`}
            />

            <div className="space-y-6">
                {/* Contract Header */}
                <ComponentCard
                    title={`Договор №${contract.contract_number}`}
                    desc={
                        <Button
                            variant="primary"
                            onClick={handleGetAppointmentInfo}
                            disabled={loadingInfo}
                        >
                            {loadingInfo ? "Загрузка..." : "Информация"}
                        </Button>
                    }
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Badge
                                color={getStatusColor(contract.contract_status)}
                            >
                                В процессе
                            </Badge>
                            <Badge color="light">
                                {getClientTypeText(contract.client_type)}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                Стоимость работ
                            </p>
                            <p className="text-2xl font-bold text-brand-500">
                                {formatCurrency(contract.worker_price)}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"></div>
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
                    <ComponentCard title="Информация о договоре">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Номер договора
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
                                    Стоимость работ
                                </p>
                                <p className="font-medium">
                                    {formatCurrency(contract.worker_price)}
                                </p>
                            </div>
                            {contract.worker_name && (
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Исполнитель
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
                    <ComponentCard title="Лабораторные тесты">
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

                {/* Results for Director */}
                {contract.result_for_director && (
                    <ComponentCard title="Результаты для директора">
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Статус задачи
                                        </p>
                                        <Badge
                                            color={getTaskStatusColor(
                                                contract.result_for_director
                                                    .task_status
                                            )}
                                        >
                                            {getTaskStatusText(
                                                contract.result_for_director
                                                    .task_status
                                            )}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            ID документа
                                        </p>
                                        <p className="font-medium">
                                            {
                                                contract.result_for_director
                                                    .document_id
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            От кого
                                        </p>
                                        <p className="font-medium">
                                            {
                                                contract.result_for_director
                                                    .from_user_name
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Кому
                                        </p>
                                        <p className="font-medium">
                                            {
                                                contract.result_for_director
                                                    .to_user_name
                                            }
                                        </p>
                                    </div>
                                </div>
                                {contract.result_for_director.comments && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500">
                                            Комментарии
                                        </p>
                                        <p className="font-medium">
                                            {
                                                contract.result_for_director
                                                    .comments
                                            }
                                        </p>
                                    </div>
                                )}
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">
                                        Дата создания
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(
                                            contract.result_for_director
                                                .created_at
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ComponentCard>
                )}

                {/* Final Document Status */}
                {contract.final_document && (
                    <ComponentCard title="Финальный документ">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        ID документа
                                    </p>
                                    <p className="font-medium">
                                        {contract.final_document.document_id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Дата создания
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(
                                            contract.final_document.created_at
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ComponentCard>
                )}
            </div>

            {/* Appointment Info Modal */}
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
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Комментарии
                                                </div>
                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {appointmentInfo.comments ||
                                                        "Не указано"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Адрес объекта
                                                </div>
                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {appointmentInfo.object_address ||
                                                        "Не указано"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Стоимость договора
                                                </div>
                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {appointmentInfo.contract_price
                                                        ? formatCurrency(
                                                              Number(
                                                                  appointmentInfo.contract_price
                                                              )
                                                          )
                                                        : "Не указано"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Стоимость работ
                                                </div>
                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {appointmentInfo.worker_price
                                                        ? formatCurrency(
                                                              Number(
                                                                  appointmentInfo.worker_price
                                                              )
                                                          )
                                                        : "Не указано"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Срок выполнения
                                                </div>
                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {appointmentInfo.deadline_date
                                                        ? new Date(
                                                              appointmentInfo.deadline_date
                                                          ).toLocaleDateString(
                                                              "ru-RU"
                                                          )
                                                        : "Не указано"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Статус
                                                </div>
                                                <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {appointmentInfo.days_diff_text ||
                                                        "Не указано"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Users Info */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                                Участники
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Отправитель
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {appointmentInfo.from_user_name ||
                                                            "Не указано"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Получатель
                                                    </div>
                                                    <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                        {appointmentInfo.to_user_name ||
                                                            "Не указано"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tasks Info */}
                                        {appointmentInfo.tasks &&
                                            appointmentInfo.tasks.length >
                                                0 && (
                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                                        Задачи
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {appointmentInfo.tasks.map(
                                                            (
                                                                task: any,
                                                                index: number
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                                                                >
                                                                    {/* Task Header with Status */}
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h6 className="font-medium text-gray-900 dark:text-white">
                                                                            Задача
                                                                            #
                                                                            {index +
                                                                                1}
                                                                        </h6>
                                                                        {task.task_status_text && (
                                                                            <Badge
                                                                                color={getTaskStatusColor(
                                                                                    task.task_status ||
                                                                                        "1"
                                                                                )}
                                                                            >
                                                                                {
                                                                                    task.task_status_text
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Комментарии
                                                                                задачи
                                                                            </div>
                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                {task.comments ||
                                                                                    "Не указано"}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Дата
                                                                                создания
                                                                            </div>
                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                {task.created_at
                                                                                    ? new Date(
                                                                                          task.created_at
                                                                                      ).toLocaleDateString(
                                                                                          "ru-RU"
                                                                                      )
                                                                                    : "Не указано"}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                От
                                                                                кого
                                                                            </div>
                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                {task.from_user_name ||
                                                                                    "Не указано"}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Кому
                                                                            </div>
                                                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                {task.to_user_name ||
                                                                                    "Не указано"}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Task Items */}
                                                                    {task.task_item &&
                                                                        task
                                                                            .task_item
                                                                            .length >
                                                                            0 && (
                                                                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                                    Элементы
                                                                                    задачи
                                                                                </div>
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
                                                                                                            color={getTaskStatusColor(
                                                                                                                item.task_status ||
                                                                                                                    "1"
                                                                                                            )}
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
                                                                                                    <div>
                                                                                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                            Комментарии
                                                                                                        </div>
                                                                                                        <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                            {item.comments ||
                                                                                                                "Не указано"}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                            Дата
                                                                                                            создания
                                                                                                        </div>
                                                                                                        <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                            {item.created_at
                                                                                                                ? new Date(
                                                                                                                      item.created_at
                                                                                                                  ).toLocaleDateString(
                                                                                                                      "ru-RU"
                                                                                                                  )
                                                                                                                : "Не указано"}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                            От
                                                                                                            кого
                                                                                                        </div>
                                                                                                        <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                            {item.from_user_name ||
                                                                                                                "Не указано"}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                                                            Кому
                                                                                                        </div>
                                                                                                        <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                                                                            {item.to_user_name ||
                                                                                                                "Не указано"}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                    {/* Download Button for Document */}
                                                                    {task.document_id && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    handleDownloadDocument(
                                                                                        task.document_id
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    downloadingDoc ===
                                                                                    task.document_id
                                                                                }
                                                                                className="flex items-center gap-2"
                                                                            >
                                                                                {downloadingDoc ===
                                                                                task.document_id ? (
                                                                                    <>
                                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                                                                        Скачивание...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <svg
                                                                                            className="w-4 h-4"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            viewBox="0 0 24 24"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                strokeWidth={
                                                                                                    2
                                                                                                }
                                                                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                                            />
                                                                                        </svg>
                                                                                        Скачать
                                                                                        документ
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                    )}

                                                                    {/* Comment Input and Action Buttons only for the last task */}
                                                                    {index ===
                                                                        appointmentInfo
                                                                            .tasks
                                                                            .length -
                                                                            1 && (
                                                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                                            <div className="space-y-3">
                                                                                <div>
                                                                                    <Label>
                                                                                        Комментарии
                                                                                        *
                                                                                    </Label>
                                                                                    <TextArea
                                                                                        placeholder="Введите комментарии..."
                                                                                        value={
                                                                                            comments[
                                                                                                task
                                                                                                    .task_id
                                                                                            ] ||
                                                                                            ""
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            setComments(
                                                                                                (
                                                                                                    prev
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    [task.task_id]:
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                })
                                                                                            )
                                                                                        }
                                                                                        rows={
                                                                                            2
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                                <div className="flex justify-end gap-2">
                                                                                    <Button
                                                                                        variant="primary"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            handleAcceptContract(
                                                                                                task.task_id
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            isSubmitting
                                                                                        }
                                                                                    >
                                                                                        {isSubmitting
                                                                                            ? "Обработка..."
                                                                                            : "Одобрить"}
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="danger"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            handleCancelContract(
                                                                                                task.task_id
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                            isSubmitting
                                                                                        }
                                                                                    >
                                                                                        {isSubmitting
                                                                                            ? "Обработка..."
                                                                                            : "Отказать"}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Created Date */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Дата создания
                                            </div>
                                            <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                {appointmentInfo.created_at
                                                    ? new Date(
                                                          appointmentInfo.created_at
                                                      ).toLocaleDateString(
                                                          "ru-RU"
                                                      )
                                                    : "Не указано"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Информация не найдена
                            </div>
                        )}

                        {/* Close Button */}
                        {appointmentInfo && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setIsInfoModalOpen(false)
                                        }
                                    >
                                        Закрыть
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PendingContractDetail;
