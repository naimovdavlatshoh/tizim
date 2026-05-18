import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import Badge from "../../../components/ui/badge/Badge";
import { formatCurrency } from "../../../utils/numberFormat";
import { BASE_URL, GetDataSimple } from "../../../service/data";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import axios from "axios";
import { DownloadIcon } from "../../../icons";
import { toast } from "react-hot-toast";
import { GrEdit } from "react-icons/gr";

interface Worker {
    worker_entry_id: number;
    user_id: number;
    full_name: string;
    worker_role: number;
    worker_role_text: string;
    percent: string;
    reward_amount: string;
    created_at: string;
}

interface PdfHistory {
    pdf_id: number;
    file_path: string;
    attempt_number: number;
    is_current: number;
    uploaded_by: number;
    uploaded_by_name: string;
    created_at: string;
}

interface CompletedContract {
    appointment_id: number;
    contract_id: number;
    director_user_id: number;
    director_name: string;
    deadline_date: string;
    status: number;
    status_text: string;
    director_comment: string | null;
    created_at: string;
    updated_at: string;
    contract_number: number;
    client_name: string;
    object_address: string;
    contract_price: number;
    contract_status: number;
    days_left: number;
    workers: Worker[];
    pdf_history: PdfHistory[];
    current_pdf: {
        pdf_id: number;
        file_path: string;
        attempt_number: number;
        created_at: string;
    } | null;
}

interface ContractPaymentItem {
    payment_id: number;
    amount: number;
    payment_type_text: string;
    comments?: string;
    created_at: string;
}

interface ContractReadPaymentInfo {
    contract_price: number;
    payments: ContractPaymentItem[];
}

const CompletedContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState<CompletedContract | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingPdfId, setUploadingPdfId] = useState<number | null>(null);
    const [selectedPdfIdForReplace, setSelectedPdfIdForReplace] = useState<
        number | null
    >(null);
    const [paymentInfo, setPaymentInfo] = useState<ContractReadPaymentInfo | null>(
        null
    );
    const [paymentInfoLoading, setPaymentInfoLoading] = useState(false);
    const replacePdfInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            fetchContractDetails();
        }
    }, [id]);

    const fetchContractDetails = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(`api/appointment/info/${id}`);
            if (response) {
                setContract(response);
                if (response?.contract_id) {
                    fetchContractPaymentInfo(response.contract_id);
                } else {
                    setPaymentInfo(null);
                }
            } else {
                console.log("Contract not found with ID:", id);
            }
        } catch (error) {
            console.error("Error fetching contract details:", error);
            toast.error("Ошибка при загрузке данных");
        } finally {
            setLoading(false);
        }
    };

    const fetchContractPaymentInfo = async (contractId: number) => {
        setPaymentInfoLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/contracts/read/${contractId}`
            );
            const data = response?.data || response;
            setPaymentInfo({
                contract_price: Number(data?.contract_price) || 0,
                payments: Array.isArray(data?.payments) ? data.payments : [],
            });
        } catch (error) {
            console.error("Error fetching contract payments:", error);
            setPaymentInfo(null);
        } finally {
            setPaymentInfoLoading(false);
        }
    };

    const getTaskStatusColor = (status: number) => {
        switch (status) {
            case 1: return "info";     // Назначено
            case 2: return "warning";  // PDF загружен
            case 3: return "success";  // Одобрено
            case 4: return "error";    // Отклонено
            default: return "light";
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

    const handleDownloadDocument = async (pdfId: number) => {
        try {
            const response = await axios.get(
                `${BASE_URL}api/appointment/result/pdf/${pdfId}`,
                {
                    responseType: "blob",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || error?.response?.data?.message || "Ошибка: Протокол не найден!");
        }
    };

    const downloadContractPdf = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}api/contracts/pdf/${contract.contract_id}`,
                {
                    responseType: "blob",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        } catch (err: any) {
            console.error(err);
            toast.error("Ошибка при открытии PDF договора");
        }
    };

    const openReplacePdfPicker = (pdfId: number) => {
        setSelectedPdfIdForReplace(pdfId);
        if (replacePdfInputRef.current) {
            replacePdfInputRef.current.value = "";
            replacePdfInputRef.current.click();
        }
    };

    const handleReplacePdfUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file || !selectedPdfIdForReplace) return;

        if (file.type !== "application/pdf") {
            toast.error("Пожалуйста, выберите PDF файл");
            return;
        }

        setUploadingPdfId(selectedPdfIdForReplace);
        try {
            const formData = new FormData();
            formData.append("file", file);

            await axios.post(
                `${BASE_URL}api/appointment/replace/pdf/${selectedPdfIdForReplace}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("PDF файл успешно обновлен");
            fetchContractDetails();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Ошибка при обновлении PDF файла"
            );
        } finally {
            setUploadingPdfId(null);
            setSelectedPdfIdForReplace(null);
            if (replacePdfInputRef.current) {
                replacePdfInputRef.current.value = "";
            }
        }
    };

    const totalPaid = (paymentInfo?.payments || []).reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0
    );
    const contractPriceFromRead =
        paymentInfo?.contract_price || Number(contract.contract_price) || 0;
    const remainingAmount = contractPriceFromRead - totalPaid;

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
                <input
                    ref={replacePdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleReplacePdfUpload}
                />
                {/* Header Card */}
                <ComponentCard title={`Договор №${contract.contract_number}`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={downloadContractPdf}
                                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Копия договора
                            </button>
                            {contract.current_pdf && (
                                <button
                                    onClick={() => handleDownloadDocument(contract.current_pdf!.pdf_id)}
                                    className="bg-green-600 text-white hover:bg-green-700 transition-colors px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm"
                                >
                                    <DownloadIcon />
                                    Текущий отчёт
                                </button>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 uppercase tracking-wider">Стоимость договора</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(contract.contract_price)}
                            </p>
                        </div>
                    </div>
                </ComponentCard>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left & Middle: Info & History */}
                    <div className="lg:col-span-2 space-y-6">
                        <ComponentCard title="Основная информация">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Клиент</p>
                                        <p className="font-medium">{contract.client_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Адрес объекта</p>
                                        <p className="font-medium">{contract.object_address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Директор</p>
                                        <p className="font-medium">{contract.director_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Дата создания</p>
                                        <p className="font-medium">{formatDate(contract.created_at)}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Срок выполнения</p>
                                        <p className="font-medium">{formatDate(contract.deadline_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Осталось дней</p>
                                        <Badge color={contract.days_left > 0 ? "info" : "error"}>
                                            {contract.days_left} дн.
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Статус</p>
                                        <Badge color={getTaskStatusColor(contract.status)}>
                                            {contract.status_text}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            {contract.director_comment && (
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 mb-1">Комментарий директора</p>
                                    <p className="italic text-gray-700 dark:text-gray-300">"{contract.director_comment}"</p>
                                </div>
                            )}
                        </ComponentCard>

                        <ComponentCard title="История PDF файлов">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800">
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Попытка</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Загрузил</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Дата</th>
                                            <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Действие</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {contract.pdf_history.map((pdf) => (
                                            <tr key={pdf.pdf_id} className={pdf.is_current ? "bg-green-50/50 dark:bg-green-900/10" : ""}>
                                                <td className="py-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>№{pdf.attempt_number}</span>
                                                        {pdf.is_current ? <Badge color="success" size="sm">Текущий</Badge> : null}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {pdf.uploaded_by_name}
                                                </td>
                                                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(pdf.created_at)}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="inline-flex items-center gap-3">
                                                        <button
                                                            onClick={() =>
                                                                handleDownloadDocument(
                                                                    pdf.pdf_id
                                                                )
                                                            }
                                                            className="text-brand-500 hover:text-brand-600 font-medium text-sm inline-flex items-center gap-1"
                                                        >
                                                            Посмотреть PDF
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openReplacePdfPicker(
                                                                    pdf.pdf_id
                                                                )
                                                            }
                                                            disabled={
                                                                uploadingPdfId ===
                                                                pdf.pdf_id
                                                            }
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 transition-colors disabled:opacity-50"
                                                            aria-label="Обновить PDF"
                                                            title="Обновить PDF"
                                                        >
                                                            <GrEdit size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ComponentCard>

                        <ComponentCard title="История оплаты">
                            {paymentInfoLoading ? (
                                <div className="py-6 text-sm text-gray-500">
                                    Загрузка истории оплат...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                                            <p className="text-xs text-gray-500">
                                                Сумма договора
                                            </p>
                                            <p className="font-semibold">
                                                {formatCurrency(
                                                    contractPriceFromRead
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                                            <p className="text-xs text-gray-500">
                                                Оплачено
                                            </p>
                                            <p className="font-semibold text-green-600">
                                                {formatCurrency(totalPaid)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                                            <p className="text-xs text-gray-500">
                                                Остаток
                                            </p>
                                            <p className="font-semibold text-amber-600">
                                                {formatCurrency(
                                                    Math.max(remainingAmount, 0)
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {paymentInfo?.payments?.length ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">
                                                            Дата
                                                        </th>
                                                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">
                                                            Тип
                                                        </th>
                                                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">
                                                            Комментарий
                                                        </th>
                                                        <th className="pb-2 text-xs font-semibold text-gray-500 uppercase text-right">
                                                            Сумма
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                                    {paymentInfo.payments.map(
                                                        (payment) => (
                                                            <tr
                                                                key={
                                                                    payment.payment_id
                                                                }
                                                            >
                                                                <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatDate(
                                                                        payment.created_at
                                                                    )}
                                                                </td>
                                                                <td className="py-3 text-sm">
                                                                    {payment.payment_type_text ||
                                                                        "-"}
                                                                </td>
                                                                <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    {payment.comments ||
                                                                        "-"}
                                                                </td>
                                                                <td className="py-3 text-sm text-right font-medium">
                                                                    {formatCurrency(
                                                                        Number(
                                                                            payment.amount
                                                                        ) || 0
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-sm text-gray-500">
                                            История оплат пока пуста
                                        </div>
                                    )}
                                </div>
                            )}
                        </ComponentCard>
                    </div>

                    {/* Right: Workers */}
                    <div className="space-y-6">
                        <ComponentCard title="Исполнители">
                            <div className="space-y-4">
                                {contract.workers.map((worker) => (
                                    <div key={worker.worker_entry_id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{worker.full_name}</p>
                                                <p className="text-xs text-gray-500">{worker.worker_role_text}</p>
                                            </div>
                                            <Badge color="info" size="sm">{worker.percent}%</Badge>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Вознаграждение:</span>
                                            <span className="font-semibold">{formatCurrency(parseFloat(worker.reward_amount))}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ComponentCard>

                        <div className="bg-brand-500 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-brand-100 text-sm mb-1 uppercase tracking-wider font-medium">Сумма договора</p>
                                <h4 className="text-2xl font-bold">{formatCurrency(contract.contract_price)}</h4>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompletedContractDetail;
