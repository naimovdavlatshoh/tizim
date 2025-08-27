import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearch } from "../../context/SearchContext";
import { GetDataSimple } from "../../service/data";
import { toast } from "react-hot-toast";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/ui/loader/Loader";
import TableFaceId from "./TableFaceId";

interface FaceId {
    face_id: number;
    name: string;
    work_date: string;
    arrival_time: string;
    leave_time: string;
}

interface Employee {
    employeeNoString: string;
    name: string;
}

const FaceIdList: React.FC = () => {
    const { searchQuery, currentPage } = useSearch();
    const [filteredFaceIds, setFilteredFaceIds] = useState<FaceId[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const employeeDropdownRef = useRef<HTMLDivElement>(null);
    console.log(searchQuery);

    const [status, setStatus] = useState(0);

    const fetchEmployees = useCallback(async () => {
        try {
            const response: any = await GetDataSimple("api/faceid/employee");
            const employeesData = response || response || [];
            console.log(response);

            setEmployees(employeesData);
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast.error("Что-то пошло не так при загрузке сотрудников");
        }
    }, []);

    const fetchFaceIds = useCallback(async () => {
        setLoading(true);
        try {
            let url = `api/faceid/list?page=${page}&limit=10`;

            if (selectedEmployee) {
                url += `&employeeNoString=${selectedEmployee}`;
            }

            const response: any = await GetDataSimple(url);

            const faceIdsData = response?.result || response?.result || [];
            const totalPagesData = response?.pages || response?.pages || 1;

            setFilteredFaceIds(faceIdsData);
            setTotalPages(totalPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching face IDs:", error);
            toast.error("Что-то пошло не так при загрузке Face ID");
            setLoading(false);
        }
    }, [page, selectedEmployee]);

    const changeStatus = () => {
        setStatus((prev) => prev + 1);
    };

    const handleEmployeeChange = (value: string) => {
        setSelectedEmployee(value);
        setPage(1); // Reset to first page when filtering
        setIsEmployeeDropdownOpen(false);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchFaceIds();
    }, [currentPage, status, page, selectedEmployee, fetchFaceIds]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                employeeDropdownRef.current &&
                !employeeDropdownRef.current.contains(event.target as Node)
            ) {
                setIsEmployeeDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const selectedEmployeeName =
        employees.find((emp) => emp.employeeNoString === selectedEmployee)
            ?.name || "";

    return (
        <>
            <PageMeta
                title="BNM Tizim"
                description="Управление Face ID пользователей"
            />
            <PageBreadCrumb pageTitle="Face ID" />

            <div className="mx-auto max-w-screen-2xl">
                <ComponentCard
                    title="Face ID"
                    desc={
                        <div className="flex items-center gap-4">
                            <div className="w-64">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Сотрудник
                                </label>
                                <div
                                    className="relative"
                                    ref={employeeDropdownRef}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEmployeeDropdownOpen(
                                                !isEmployeeDropdownOpen
                                            )
                                        }
                                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 text-left"
                                    >
                                        {selectedEmployeeName ||
                                            "Выберите сотрудника"}
                                    </button>

                                    {/* Dropdown Arrow */}
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                        <svg
                                            className="h-4 w-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>

                                    {/* Dropdown Options */}
                                    {isEmployeeDropdownOpen && (
                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEmployeeChange("")
                                                }
                                                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                            >
                                                Все сотрудники
                                            </button>
                                            {employees.map((employee) => (
                                                <button
                                                    key={
                                                        employee.employeeNoString
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleEmployeeChange(
                                                            employee.employeeNoString
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                                >
                                                    {employee.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    }
                >
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <TableFaceId
                                faceIds={filteredFaceIds}
                                changeStatus={changeStatus}
                            />

                            {totalPages > 1 && (
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </ComponentCard>
            </div>
        </>
    );
};

export default FaceIdList;
