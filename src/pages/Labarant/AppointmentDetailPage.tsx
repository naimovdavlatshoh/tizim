import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { GetDataSimple, GetDataSimplePDF } from "../../service/data";
import { toast } from "react-hot-toast";
import Badge from "../../components/ui/badge/Badge";
import { formatCurrency, formatDate } from "../../utils/numberFormat";
import { TbDownload } from "react-icons/tb";
import Button from "../../components/ui/button/Button";
import Loader from "../../components/ui/loader/Loader";

interface AppointmentInfo {
    appointment_id: number;
    contract_id: number;
    director_name: string;
    deadline_date: string;
    status: number;
    status_text: string;
    director_comment: string | null;
    created_at: string;
    updated_at: string;
    contract_number: string | number;
    object_address: string;
    contract_price: number;
    days_left: number;
    workers: Array<{
        full_name: string;
        worker_role_text: string;
        percent: string;
        reward_amount: string;
    }>;
    pdf_history: Array<{
        pdf_id: number;
        file_path: string;
        attempt_number: number;
        is_current: number;
        uploaded_by_name: string;
        created_at: string;
    }>;
    current_pdf: {
        pdf_id: number;
        file_path: string;
        attempt_number: number;
        created_at: string;
    } | null;
}

const AppointmentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [info, setInfo] = useState<AppointmentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchInfo();
        }
    }, [id]);

    const fetchInfo = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(`api/appointment/info/${id}`);
            setInfo(response?.data || response || null);
        } catch (error) {
            console.error("Error fetching appointment info:", error);
            toast.error("Ошибка при загрузке информации");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (pdfId: number, attempt: number) => {
        setDownloadingId(pdfId);
        try {
            const response = await GetDataSimplePDF(`api/appointment/result/pdf/${id}?pdf_id=${pdfId}`);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `result-attempt-${attempt}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("PDF скачан");
        } catch (error) {
            toast.error("Ошибка при скачивании");
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 2:
            case 3: return "success";
            case 4: return "error";
            default: return "warning";
        }
    };

    if (loading) return <Loader />;

    if (!info) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <h2 className="text-2xl font-bold text-gray-400">Назначение не найдено</h2>
                <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <>
            {/* <PageMeta title={`BNM | Назначение №${info.contract_number}`} /> */}
            <PageBreadcrumb pageTitle={`Назначение №${info.contract_number}`} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Status Header */}
                    <ComponentCard title="Статус задачи" desc="Текущий статус и детали выполнения">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-2">
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Текущий статус</span>
                                <div>
                                    <Badge color={getStatusColor(info.status)} variant="light">
                                        {info.status_text}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Кrajний срок</span>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatDate(info.deadline_date)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Осталось</span>
                                <div className="text-lg font-bold text-brand-600 dark:text-brand-400">
                                    {info.days_left} дней
                                </div>
                            </div>
                        </div>

                        {info.director_comment && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                                <h5 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    Комментарий директора:
                                </h5>
                                <p className="text-red-800 dark:text-red-200 italic">"{info.director_comment}"</p>
                            </div>
                        )}
                    </ComponentCard>

                    {/* PDF History Area */}
                    <ComponentCard title="История загруженных файлов (PDF)" desc="Список bsex попыток загрузки результата">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b dark:border-gray-800 bg-gray-50 dark:bg-dark-900">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Попытка</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Автор</th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Дата</th>
                                        <th className="px-4 py-3 text-right">Файл</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-800">
                                    {info.pdf_history.map((pdf) => (
                                        <tr key={pdf.pdf_id} className={pdf.is_current ? "bg-brand-50/20 dark:bg-brand-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 dark:text-white">№{pdf.attempt_number}</span>
                                                    {pdf.is_current ? <Badge color="success" size="sm">Текущий</Badge> : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{pdf.uploaded_by_name}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(pdf.created_at)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => handleDownloadPdf(pdf.pdf_id, pdf.attempt_number)}
                                                    disabled={downloadingId === pdf.pdf_id}
                                                >
                                                    {downloadingId === pdf.pdf_id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent" />
                                                    ) : (
                                                        <TbDownload className="size-4" />
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ComponentCard>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <ComponentCard title="Детали объекта" desc="Информация o договоре и адресе">
                        <div className="space-y-4">
                            <InfoBox label="Номер договора" value={info.contract_number} />
                            <InfoBox label="Стоимость работ" value={formatCurrency(info.contract_price)} />
                            <InfoBox label="Адрес объекта" value={info.object_address} isFullWidth />
                            <InfoBox label="Директор" value={info.director_name} />
                        </div>
                    </ComponentCard>

                    <ComponentCard title="Исполнители" desc="Список сотрудников, назначенных на задачу">
                        <div className="space-y-4">
                            {info.workers.map((worker, i) => (
                                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-800">
                                    <div className="font-bold text-gray-900 dark:text-white mb-1">
                                        {worker.full_name}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{worker.worker_role_text} • {worker.percent}%</span>
                                        <span className="font-bold text-brand-600 dark:text-brand-400">
                                            {formatCurrency(Number(worker.reward_amount))}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ComponentCard>
                </div>
            </div>
        </>
    );
};

const InfoBox = ({ label, value, isFullWidth = false }: { label: string; value: string | number; isFullWidth?: boolean }) => (
    <div className={`p-3 rounded-lg border border-gray-100 dark:border-gray-800 ${isFullWidth ? "col-span-full" : ""}`}>
        <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
        <p className="font-semibold text-gray-900 dark:text-white break-words">{value}</p>
    </div>
);

export default AppointmentDetailPage;
