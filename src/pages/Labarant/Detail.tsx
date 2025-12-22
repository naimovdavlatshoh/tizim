import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { formatCurrency, formatDate } from "../../utils/numberFormat";
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
    created_at: string;
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

            const foundContract = contractsData.find(
                (contract: MyContract) => contract.contract_id == id
            );
            console.log(foundContract);


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

    // const getStatusColor = (status: string) => {
    //     switch (status) {
    //         case "5":
    //             return "success";
    //         case "4":
    //             return "info";
    //         case "3":
    //             return "warning";
    //         default:
    //             return "error";
    //     }
    // };

    // const getStatusText = (status: string) => {
    //     switch (status) {
    //         case "5":
    //             return "Завершено";
    //         case "4":
    //             return "На проверке";
    //         case "3":
    //             return "В процессе";
    //         default:
    //             return "Неизвестно";
    //     }
    // };

    // const getClientTypeText = (type: string) => {
    //     switch (type) {
    //         case "1":
    //             return "Физическое лицо";
    //         case "2":
    //             return "Юридическое лицо";
    //         default:
    //             return "Неизвестно";
    //     }
    // };

    // const getTestTypeText = (type: string) => {
    //     switch (type) {
    //         case "1":
    //             return "Основной";
    //         case "2":
    //             return "Дополнительный";
    //         default:
    //             return "Неизвестно";
    //     }
    // };

    // formatCurrency function is now imported from utils

    const handleGetAppointmentInfo = async () => {
        if (!id) return;

        setLoadingInfo(true);
        try {
            const response = await GetDataSimple(
                `api/appointment/info?contract_id=${id}`
            );
            setAppointmentInfo(response);

            // Проверяем, пустой ли массив tasks
            const tasks = response?.tasks || [];
            if (tasks.length === 0) {
                // Если tasks пустой, сразу открываем модал отправки результатов
                setIsInfoModalOpen(false);
                setSendResultModalOpen(true);
            } else {
                // Если tasks не пустой, показываем информацию
                setIsInfoModalOpen(true);
            }
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
                <div className="text-lg text-red-500">Договор не найден</div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Мой договор №${contract.contract_number}`}
                description="Детали моего назначенного договора"
            />
            <PageBreadcrumb
                pageTitle={`Мой договор №${contract.contract_number}`}
            />

            <div className="space-y-6">
                {/* Contract Header */}
                <ComponentCard
                    title={`Договор №${contract.contract_number}, Создано  ${formatDate(contract?.created_at || "")}`}
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
                    <div className="f">
                        {/* <div className="flex items-center gap-4">
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
                        </div> */}
                    </div>
                </ComponentCard>

                {/* Essential Information Only */}
                <ComponentCard title="Основная информация">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Клиент
                            </p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {contract.client_name}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Адрес объекта
                            </p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400 break-words">
                                {contract.object_address}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Срок выполнения
                            </p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {contract.deadline_date
                                    ? formatDate(contract.deadline_date)
                                    : "-"}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Моя доля
                            </p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {formatCurrency(contract.worker_price)}
                            </p>
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
                                    <div className="space-y-4">
                                        {/* Main Info */}

                                        {/* Users Info */}

                                        {/* Tasks Info */}
                                        {appointmentInfo.tasks &&
                                            appointmentInfo.tasks.length >
                                                0 && (
                                                <div className=" pt-4">
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
                                                                                    {formatDate(
                                                                                        task.created_at
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
                                                                                                                {formatDate(
                                                                                                                    item.created_at
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
                            Отправить результаты
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default MyContractDetail;
