import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { formatCurrency } from "../../../utils/numberFormat";
import { GetDataSimple } from "../../../service/data";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AssignModal from "./AssignModal";

interface NewContract {
    contract_id: string;
    contract_number: string;
    contract_status: string;
    object_address: string;
    worker_price: string;
    deadline_date: string | null;
    days_diff: string | null;
    days_diff_text: string | null;
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
    result_for_director: Array<any>;
    final_document: boolean;
}

const NewContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState<NewContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchContractDetails();
        }
    }, [id]);

    const fetchContractDetails = async () => {
        try {
            const response: any = await GetDataSimple(
                `api/appointment/all/list?contract_status=2&page=1&limit=100`
            );
            const contractsData =
                response?.result || response?.data?.result || [];

            console.log(contractsData);

            // Find the specific contract by ID
            const foundContract = contractsData.find(
                (contract: NewContract) => contract.contract_id == id
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
            case "2":
                return "success";
            case "1":
                return "warning";
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
                description="Детали нового договора"
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
                            onClick={() => setAssignModalOpen(true)}
                            className="px-6 py-3"
                        >
                            Назначить
                        </Button>
                    }
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Badge
                                color={getStatusColor(contract.contract_status)}
                            >
                                Новый договор
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
                                        {contract.days_diff_text ||
                                            "Не указано"}
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
                    contract.result_for_director.length > 0 && (
                        <ComponentCard title="Результаты для директора">
                            <div className="space-y-3">
                                {contract.result_for_director.map(
                                    (result, index) => (
                                        <div
                                            key={index}
                                            className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium">
                                                    {JSON.stringify(result)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </ComponentCard>
                    )}

                {/* Final Document Status */}
                {contract.final_document && (
                    <ComponentCard title="Статус финального документа">
                        <div className="flex items-center justify-center p-6">
                            <Badge color="success" size="md">
                                Документ готов
                            </Badge>
                        </div>
                    </ComponentCard>
                )}
            </div>

            {/* Assign Modal */}
            <AssignModal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                contractId={contract.contract_id}
                contractNumber={contract.contract_number}
                onSuccess={() => {
                    // Refresh the contract details after successful assignment
                    fetchContractDetails();
                }}
            />
        </>
    );
};

export default NewContractDetail;
