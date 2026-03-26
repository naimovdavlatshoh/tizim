import React, { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import { GetDataSimple, GetDataSimplePDF } from "../../service/data";
import { toast } from "react-hot-toast";
import Badge from "../../components/ui/badge/Badge";
import { formatCurrency, formatDate } from "../../utils/numberFormat";
import { TbDownload } from "react-icons/tb";
import Button from "../../components/ui/button/Button";

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: number | string;
}

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
    client_name: string;
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

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
}) => {
    const [info, setInfo] = useState<AppointmentInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && appointmentId) {
            fetchInfo();
        }
    }, [isOpen, appointmentId]);

    const fetchInfo = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(`api/appointment/info/${appointmentId}`);
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
            const response = await GetDataSimplePDF(`api/appointment/result/pdf/${appointmentId}?pdf_id=${pdfId}`);
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
            case 2: return "success";
            case 3:
            case 4: return "error";
            default: return "warning";
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Детали назначения №{info?.contract_number || "..."}
                </h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                ) : info ? (
                    <div className="space-y-8">
                        {/* Status Section */}
                        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Текущий статус</span>
                                <Badge color={getStatusColor(info.status)} variant="light">
                                    {info.status_text}
                                </Badge>
                            </div>
                            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Крайний срок</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatDate(info.deadline_date)}</span>
                            </div>
                            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                            <div className="flex flex-col gap-1 text-right ml-auto">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold text-right">Осталось</span>
                                <span className="font-bold text-brand-600 dark:text-brand-400">{info.days_left} дней</span>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 text-brand-500"></span>
                                    Общая информация
                                </h4>
                                <div className="space-y-3 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <InfoRow label="Клиент" value={info.client_name} />
                                    <InfoRow label="Адрес объекта" value={info.object_address} />
                                    <InfoRow label="Стоимость договора" value={formatCurrency(info.contract_price)} />
                                    <InfoRow label="Директор" value={info.director_name} />
                                    <InfoRow label="Создано" value={formatDate(info.created_at)} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 text-brand-500"></span>
                                    Исполнители
                                </h4>
                                <div className="space-y-3 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    {info.workers.map((worker, i) => (
                                        <div key={i} className="flex flex-col pb-3 border-b last:border-0 last:pb-0 border-gray-50 dark:border-gray-800">
                                            <span className="font-semibold text-gray-900 dark:text-white">{worker.full_name}</span>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">{worker.worker_role_text} ({worker.percent}%)</span>
                                                <span className="font-medium text-brand-600">{formatCurrency(Number(worker.reward_amount))}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Comment Section */}
                        {info.director_comment && (
                            <div className="space-y-2">
                                <h4 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                                    Комментарий директора
                                </h4>
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-200 italic shadow-sm">
                                    "{info.director_comment}"
                                </div>
                            </div>
                        )}

                        {/* History Table */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                                История файлов (PDF)
                            </h4>
                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Попытка</th>
                                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Загрузил</th>
                                            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Дата</th>
                                            <th className="px-4 py-3 text-right">Действие</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {info.pdf_history.map((pdf) => (
                                            <tr key={pdf.pdf_id} className={pdf.is_current ? "bg-brand-50/30 dark:bg-brand-900/10" : ""}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        №{pdf.attempt_number}
                                                        {pdf.is_current ? <Badge color="success" size="sm">Текущий</Badge> : null}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{pdf.uploaded_by_name}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(pdf.created_at)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 w-8 p-0"
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
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">Нет данных</div>
                )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/30">
                <Button variant="outline" onClick={onClose} className="px-8 shadow-sm">
                    Закрыть
                </Button>
            </div>
        </Modal>
    );
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start gap-4">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white text-right max-w-[200px]">{value}</span>
    </div>
);

export default AppointmentDetailModal;
