import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { GetDataSimple } from "../../service/data";
import { useModal } from "../../hooks/useModal";
import AddUserModal from "./AddUser";
import TableUser from "./TableUser";
import Pagination from "../../components/common/Pagination.tsx"; // 👈 yangi component
import { Toaster } from "react-hot-toast";

export default function ClientList() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1); // 👈 pagination uchun
    const [totalPages, setTotalPages] = useState(1);
    const { isOpen, openModal, closeModal } = useModal();
    const [status, setStatus] = useState(false);
    const [response, setResponse] = useState("");
    console.log(response);

    useEffect(() => {
        GetDataSimple(`api/user/list?page=${page}&limit=10`).then((res) => {
            setUsers(res?.result || []);
            setTotalPages(res?.pages || 1);
        });
    }, [status, page]);

    const changeStatus = () => {
        setStatus(!status);
    };

    return (
        <>
            <PageMeta title="Users" description="User list with pagination" />
            <PageBreadcrumb pageTitle="Пользователи" />
            <div className="space-y-6">
                <ComponentCard
                    title="Пользователи"
                    desc={
                        <button
                            onClick={openModal}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md"
                        >
                            + Добавить пользователя
                        </button>
                    }
                >
                    <TableUser users={users} changeStatus={changeStatus} />
                    <div className="mt-4">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </ComponentCard>
            </div>

            <AddUserModal
                isOpen={isOpen}
                onClose={closeModal}
                changeStatus={changeStatus}
                setResponse={setResponse}
            />
            <Toaster position="top-right" reverseOrder={false} />
        </>
    );
}
