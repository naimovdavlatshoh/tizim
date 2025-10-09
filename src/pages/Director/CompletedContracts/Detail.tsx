import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import Badge from "../../../components/ui/badge/Badge";
import { formatCurrency } from "../../../utils/numberFormat";
import { GetDataSimple } from "../../../service/data";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

interface CompletedContract {
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

const CompletedContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState<CompletedContract | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchContractDetails();
        }
    }, [id]);

    const fetchContractDetails = async () => {
        try {
            const response: any = await GetDataSimple(
                `api/appointment/all/list?contract_status=6&page=1&limit=100`
            );
            const contractsData =
                response?.result || response?.data?.result || [];

            // Find the specific contract by ID
            const foundContract = contractsData.find(
                (contract: CompletedContract) => contract.contract_id == id
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
            case "6":
                return "success";
            default:
                return "light";
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
                description="Детали завершенного договора"
            />
            <PageBreadcrumb
                pageTitle={`Договор №${contract.contract_number}`}
            />

            <div className="space-y-6">
                {/* Contract Header */}
                <ComponentCard title={`Договор №${contract.contract_number}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Badge
                                color={getStatusColor(contract.contract_status)}
                            >
                                Завершен
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
                {contract.result_for_director &&
                    contract.result_for_director.task_status && (
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
        </>
    );
};

export default CompletedContractDetail;
