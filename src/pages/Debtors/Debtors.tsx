import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { GetDataSimple, GetDataSimpleBlob, getStoredYear } from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";

// import { useSearch } from "../../context/SearchContext";
import { toast } from "react-hot-toast";
import Loader from "../../components/ui/loader/Loader.tsx";
import DebtorsTable from "./DebtorsTable";
import { FaDownload } from "react-icons/fa";

export default function Debtors() {
    // const { searchQuery, currentPage, setIsSearching } = useSearch();
    const currentPage = "debtors";
    const [debtors, setDebtors] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);

    useEffect(() => {
        if (currentPage === "debtors") {
            fetchDebtors();
        }
    }, [currentPage, status, page]);

    const fetchDebtors = async () => {
        setLoading(true);
        try {
            const response: any = await GetDataSimple(
                `api/debtors/list?page=${page}&limit=30&year=${getStoredYear()}`
            );
            const debtorsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            setDebtors(debtorsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching debtors:", error);
            toast.error("Что-то пошло не так при загрузке должников");
            setLoading(false);
        }
    };

    const changeStatus = () => {
        setStatus(!status);
    };

    const handleDownloadExcel = async () => {
        setDownloadingExcel(true);
        try {
            const blob = await GetDataSimpleBlob("api/excel/debtors", {
                responseType: "blob",
            });
            if (blob && blob instanceof Blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `Должники-${getStoredYear() || "export"}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success("Файл успешно загружен");
            } else {
                toast.error("Ошибка при загрузке файла");
            }
        } catch (error) {
            console.error("Error downloading Excel:", error);
            toast.error("Ошибка при загрузке Excel");
        } finally {
            setDownloadingExcel(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <PageMeta title="BNM Tizim" description="Список должников" />
            <PageBreadcrumb pageTitle="Должники" />
            <ComponentCard
                title="Список должников"
                desc={
                    <button
                        onClick={handleDownloadExcel}
                        disabled={downloadingExcel}
                        className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaDownload />
                        {downloadingExcel ? "Загрузка..." : "Excel"}
                    </button>
                }
            >
                <DebtorsTable debtors={debtors} changeStatus={changeStatus} />

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </ComponentCard>

            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}
