import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import TableSalaryPayment from "./TableSalaryPayment.tsx";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddSalaryPaymentModal from "./AddSalaryPaymentModal.tsx";

interface SalaryPayment {
    id: number;
    user_id: number;
    user: {
        firstname: string;
        lastname: string;
        fathername: string;
    };
    year: string;
    month: number;
    amount: number;
    created_at?: string;
}

export default function SalaryPaymentList() {
    const [payments, setPayments] = useState<SalaryPayment[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await GetDataSimple(
                `api/user/salary-payments?page=${page}&limit=30`
            );
            const paymentsData = response?.result || response?.data?.result || response?.data || response || [];
            const totalPagesData = response?.pages || response?.data?.pages || 1;

            setPayments(Array.isArray(paymentsData) ? paymentsData : []);
            setTotalPages(totalPagesData);
            setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error fetching salary payments:", error);
            toast.error(
                error?.response?.data?.message || "Что-то пошло не так при загрузке зарплат"
            );
            setLoading(false);
        }
    }, [page]);

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchPayments();
    }, [status, fetchPayments]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    if (loading && payments.length === 0) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список реальных зарплат" />
            <PageBreadcrumb pageTitle="Реальные зарплаты" />
            <ComponentCard
                title="Список реальных зарплат"
                desc={
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Добавить зарплату
                        </button>
                    </div>
                }
            >
                {loading ? (
                    <div className="flex justify-center py-8"><Loader /></div>
                ) : (
                    <TableSalaryPayment
                        payments={payments}
                        changeStatus={changeStatus}
                    />
                )}

                {totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                )}
            </ComponentCard>

            <AddSalaryPaymentModal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                }}
                changeStatus={changeStatus}
            />

            <Toaster position="bottom-right" />
        </>
    );
}
