import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import {
    GetDataSimple,
    PostSimpleFormData,
    PostSimple,
    GetDataSimpleBlob,
    DeleteData,
} from "../../service/data.ts";
import Pagination from "../../components/common/Pagination.tsx";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

import Select from "../../components/form/Select";
import FileInput from "../../components/form/input/FileInput";
import { DownloadIcon } from "../../icons/index.ts";
import { formatDate } from "../../utils/numberFormat";

interface Report {
    report_id: string;
    report_text: string;
    contract_id: string;
    contract_number?: string;
    client_name?: string;
    created_at: string;
    files?: string[];
    user_name?: string;
}

interface Contract {
    contract_id: string;
    contract_number: string;
    client_name: string;
}

const Reports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedContract, setSelectedContract] = useState<string>("");
    const [reportText, setReportText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

    // Contract search states
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [contractSearching, setContractSearching] = useState(false);

    // User search states
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [userSearching, setUserSearching] = useState(false);
    const [filterContractId, setFilterContractId] = useState<string>("");
    const [filterUserId, setFilterUserId] = useState<string>("");

    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const isDirector = userRole === 1;
    const isLabarant = userRole === 4 || userRole === 2 || userRole === 3 || userRole === 5;

    useEffect(() => {
        fetchReports();
    }, [page, filterContractId, filterUserId]);

    useEffect(() => {
        fetchContracts();
    }, []);

    useEffect(() => {
        if (isDirector) {
            fetchUsers();
        }
    }, []);

    // Initialize filtered contracts when contracts are loaded
    useEffect(() => {
        setFilteredContracts(contracts);
    }, [contracts]);

    // Initialize filtered users when users are loaded
    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let url = `api/reports/list?page=${page}&limit=10`;

            // Add filters for director
            if (isDirector) {
                if (filterContractId) {
                    url += `&contract_id=${filterContractId}`;
                }
                if (filterUserId) {
                    url += `&user_id=${filterUserId}`;
                }
            }

            const response: any = await GetDataSimple(url);
            console.log("API Response:", response);

            const reportsData =
                response?.result || response?.data?.result || [];
            const totalPagesData =
                response?.pages || response?.data?.pages || 1;

            console.log("Reports Data:", reportsData);
            console.log("Total Pages:", totalPagesData);

            setReports(reportsData);
            setTotalPages(totalPagesData);
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Ошибка при загрузке отчетов");
            setReports([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchContracts = async () => {
        try {
            const response: any = await GetDataSimple(
                `api/contracts/list?page=1&limit=10`
            );
            const contractsData =
                response?.result || response?.data?.result || [];
            setContracts(contractsData);
        } catch (error) {
            console.error("Error fetching contracts:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response: any = await GetDataSimple(
                "api/user/list?page=1&limit=10"
            );
            const usersData = response?.result || response?.data?.result || [];
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleCreateReport = async () => {
        if (!reportText.trim()) {
            setCreateModalOpen(false);
            toast.error("Пожалуйста, введите текст отчета");
            return;
        }

        setSubmitting(true);
        try {
            const reportData = {
                report_text: reportText,
                ...(selectedContract && { contract_id: selectedContract }),
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(reportData));

            // Add files separately
            selectedFiles.forEach((file) => {
                formData.append("files", file);
            });

            await PostSimpleFormData("api/reports/create", formData);

            toast.success("Отчет успешно создан");
            setCreateModalOpen(false);
            setReportText("");
            setSelectedContract("");
            setSelectedFiles([]);
            fetchReports();
        } catch (error: any) {
            setCreateModalOpen(false);
            toast.error(error?.response?.data?.error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadReport = async (reportId: string) => {
        try {
            const response = await GetDataSimpleBlob(
                `api/reports/file/${reportId}`
            );

            // Create blob and download
            const blob = new Blob([response], {
                type: "application/octet-stream",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `report-${reportId}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Отчет загружен");
        } catch (error) {
            console.error("Error downloading report:", error);
            toast.error("Ошибка при загрузке отчета");
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        try {
            await DeleteData(`api/reports/delete/${reportId}`);
            toast.success("Отчет успешно удален");
            setDeleteModalOpen(false);
            setReportToDelete(null);
            fetchReports();
        } catch (error) {
            console.error("Error deleting report:", error);
            toast.error("Ошибка при удалении отчета");
        }
    };

    const openDeleteModal = (report: Report) => {
        setReportToDelete(report);
        setDeleteModalOpen(true);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
    };

    const handleContractSearch = async (searchTerm: string) => {
        setContractSearching(true);

        try {
            if (searchTerm.trim() === "") {
                // If search is empty, show all contracts
                setFilteredContracts(contracts);
            } else if (searchTerm.trim().length >= 3) {
                // Search via API with minimum 3 characters
                const response: any = await PostSimple(
                    `api/contracts/search?keyword=${encodeURIComponent(
                        searchTerm
                    )}`
                );
                const searchResults =
                    response?.result || response?.data?.result || [];
                setFilteredContracts(searchResults);
            } else {
                // If less than 3 characters, show all contracts
                setFilteredContracts(contracts);
            }
        } catch (error) {
            console.error("Error searching contracts:", error);
            setFilteredContracts(contracts);
        } finally {
            setContractSearching(false);
        }
    };

    const handleUserSearch = async (searchTerm: string) => {
        setUserSearching(true);

        try {
            if (searchTerm.trim() === "") {
                // If search is empty, show all users
                setFilteredUsers(users);
            } else if (searchTerm.trim().length >= 3) {
                // Search via API with minimum 3 characters
                const response: any = await PostSimple(
                    `api/user/search?keyword=${encodeURIComponent(searchTerm)}`
                );
                const searchResults =
                    response?.result || response?.data?.result || [];
                setFilteredUsers(searchResults);
            } else {
                // If less than 3 characters, show all users
                setFilteredUsers(users);
            }
        } catch (error) {
            console.error("Error searching users:", error);
            setFilteredUsers(users);
        } finally {
            setUserSearching(false);
        }
    };

    const contractOptions = filteredContracts.map((contract) => ({
        value: parseInt(contract.contract_id),
        label: `${contract.contract_number} - ${contract.client_name}`,
    }));

    const userOptions = filteredUsers.map((user) => ({
        value: parseInt(user.user_id || user.id),
        label: `${user.login || user.firstname || user.lastname}`,
    }));

    const filterContractOptions = [
        { value: 0, label: "Все договоры" },
        ...contractOptions,
    ];

    const filterUserOptions = [
        { value: 0, label: "Все пользователи" },
        ...userOptions,
    ];

    return (
        <>
            <PageMeta
                title="Отчеты"
                description="Управление отчетами лаборатории"
            />
            <PageBreadcrumb pageTitle="Отчеты" />

            <ComponentCard
                title="Отчеты"
                desc={
                    isLabarant ? (
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            + Создать отчет
                        </button>
                    ) : null
                }
            >
                {/* Filters for Director */}
                {isDirector && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Договор
                                </label>
                                <Select
                                    options={filterContractOptions}
                                    placeholder="Выберите договор"
                                    onChange={(value) =>
                                        setFilterContractId(
                                            value === "0" ? "" : value
                                        )
                                    }
                                    className="w-full"
                                    searchable={true}
                                    onSearch={handleContractSearch}
                                    searching={contractSearching}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Пользователь
                                </label>
                                <Select
                                    options={filterUserOptions}
                                    placeholder="Выберите пользователя"
                                    onChange={(value) =>
                                        setFilterUserId(
                                            value === "0" ? "" : value
                                        )
                                    }
                                    className="w-full"
                                    searchable={true}
                                    onSearch={handleUserSearch}
                                    searching={userSearching}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {/* Loading indicator */}
                {loading && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                            <span className="text-yellow-800 dark:text-yellow-200">
                                Загрузка...
                            </span>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="pl-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        #
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Отправитель
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Текст отчета
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-theme-xs dark:text-gray-400"
                                    >
                                        Номер договора
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Клиент
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Дата создания
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Действия
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {reports.length > 0 ? (
                                    reports.map((report, index) => (
                                        <TableRow
                                            key={report.report_id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <TableCell className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {report.user_name}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-xs">
                                                <div className="relative group">
                                                    <span className="cursor-help">
                                                        {report.report_text
                                                            .length > 20
                                                            ? `${report.report_text.substring(
                                                                  0,
                                                                  20
                                                              )}...`
                                                            : report.report_text}
                                                    </span>
                                                    {report.report_text.length >
                                                        20 && (
                                                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 max-w-xs break-words shadow-lg">
                                                            {report.report_text}
                                                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {report.contract_number ||
                                                    report.contract_id}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {report.client_name ||
                                                    "Не указан"}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {formatDate(report.created_at)}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <div className="flex gap-2">
                                                    <button
                                                        className="mr-2 cursor-pointer border border-gray-300 w-[30px] h-[30px] flex items-center justify-center rounded-md disabled:opacity-50 transition-colors"
                                                        onClick={() =>
                                                            handleDownloadReport(
                                                                report.report_id
                                                            )
                                                        }
                                                    >
                                                        <DownloadIcon
                                                            fontSize={20}
                                                        />
                                                    </button>
                                                    {isLabarant && (
                                                        <button
                                                            className="mr-2 cursor-pointer bg-red-500 text-white px-2 py-2 rounded-md disabled:opacity-50 transition-colors"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    report
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            {loading
                                                ? "Загрузка..."
                                                : "Отчеты не найдены"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </ComponentCard>

            {/* Create Report Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                className="max-w-2xl"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Создать новый отчет
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Договор (необязательно)
                            </label>
                            <Select
                                options={contractOptions}
                                placeholder="Выберите договор"
                                onChange={(value) => setSelectedContract(value)}
                                className="w-full"
                                searchable={true}
                                onSearch={handleContractSearch}
                                searching={contractSearching}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Текст отчета *
                            </label>
                            <textarea
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Введите текст отчета..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Файлы (необязательно)
                            </label>
                            <FileInput
                                onChange={handleFileChange}
                                className="w-full"
                                multiple
                            />
                            {selectedFiles.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Выбрано файлов: {selectedFiles.length}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setCreateModalOpen(false)}
                            disabled={submitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleCreateReport}
                            disabled={submitting}
                        >
                            {submitting ? "Создание..." : "Создать отчет"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setReportToDelete(null);
                }}
                className="max-w-md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Удалить отчет
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Вы уверены, что хотите удалить этот отчет?
                        {reportToDelete && (
                            <span className="block mt-2 text-sm">
                                <strong>Текст отчета:</strong>{" "}
                                {reportToDelete.report_text.length > 50
                                    ? `${reportToDelete.report_text.substring(
                                          0,
                                          50
                                      )}...`
                                    : reportToDelete.report_text}
                            </span>
                        )}
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setReportToDelete(null);
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                reportToDelete &&
                                handleDeleteReport(reportToDelete.report_id)
                            }
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </Modal>

            <Toaster position="top-right" />
        </>
    );
};

export default Reports;
