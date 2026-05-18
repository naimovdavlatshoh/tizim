import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster, toast } from "react-hot-toast";
import TableAbsences from "./TableAbsences.tsx";
import Loader from "../../components/ui/loader/Loader.tsx";
import { useModal } from "../../hooks/useModal.ts";
import AddAbsenceModal from "./AddAbsenceModal.tsx";

interface Absence {
    id: number;
    user_id: number;
    user?: {
        firstname: string;
        lastname: string;
        fathername: string;
    };
    full_name?: string;
    to_user_name?: string;
    absence_type: string;
    date_from: string;
    date_to: string;
}

export default function AbsenceList() {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, openModal, closeModal } = useModal();

    const fetchAbsences = useCallback(async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await GetDataSimple(
                `api/user/employee-absences?page=${page}&limit=30`
            );
            const absencesData = response?.result || response?.data?.result || response?.data || response || [];
            const totalPagesData = response?.pages || response?.data?.pages || 1;

            setAbsences(Array.isArray(absencesData) ? absencesData : []);
            setTotalPages(totalPagesData);
            setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error fetching absences:", error);
            toast.error(
                error?.response?.data?.message || "Что-то пошло не так при загрузке"
            );
            setLoading(false);
        }
    }, [page]);

    const changeStatus = useCallback(() => {
        setStatus(!status);
        fetchAbsences();
    }, [status, fetchAbsences]);

    useEffect(() => {
        fetchAbsences();
    }, [fetchAbsences]);

    if (loading && absences.length === 0) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список Больничных / отпросился" />
            <PageBreadcrumb pageTitle="Больничные / отпросился" />
            <ComponentCard
                title="Список записей об отсутствии"
                desc={
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Добавить запись
                        </button>
                    </div>
                }
            >
                {loading ? (
                    <div className="flex justify-center py-8"><Loader /></div>
                ) : (
                    <TableAbsences
                        absences={absences}
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

            <AddAbsenceModal
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
