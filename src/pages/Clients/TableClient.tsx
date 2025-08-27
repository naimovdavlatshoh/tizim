import { DownloadIcon, PencilIcon } from "../../icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useModal } from "../../hooks/useModal";
import EditClientModal from "./EditClient";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import DeleteUserModal from "./DeleteClient";
import ClientDetailsModal from "./ClientDetailsModal";
import { DeleteData, GetDataSimpleBlob } from "../../service/data";

interface Users {
    client_id: number;
    client_name: string;
    client_type: string;
    phone_number: string;
    business_name?: string;
    business_address?: string;
    bank_account?: string;
    bank_address?: string;
    inn?: string;
    mfo?: string;
    oked?: string;
    client_address?: string;
    passport_series?: string;
    passport_given_by?: string;
    passport_given_date?: string;
    firstname?: string;
    lastname?: string;
    fathername?: string;
    login?: string;
    role_id?: number;
    role_name?: string;
    created_at?: string;
}
interface TableUserProps {
    users: Users[];
    changeStatus: () => void;
}

export default function TableUser({ users, changeStatus }: TableUserProps) {
    const { isOpen, openModal, closeModal } = useModal();

    const [response, setResponse] = useState("");
    const [selectedUser, setSelectedUser] = useState<Users | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [clientDetailsModalOpen, setClientDetailsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Users | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [downloadingClientId, setDownloadingClientId] = useState<
        number | null
    >(null);
    console.log(response);

    // Helper function to render field value or "Не указано" badge
    const renderFieldValue = (value: any, fieldName: string) => {
        console.log(fieldName);

        if (!value || value === "" || value === null || value === undefined) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Не указано
                </span>
            );
        }
        return value;
    };

    const onDeleteUser = async () => {
        setIsDeleting(true);
        try {
            await DeleteData(`api/user/delete/${selectedUser?.client_id}`);
            toast.success("Пользователь успешно удален!");
            changeStatus();
        } catch (error) {
            toast.error("Что-то пошло не так при удалении пользователя");
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
        }
    };

    const handleRowClick = (client: Users) => {
        setSelectedClient(client);
        setClientDetailsModalOpen(true);
    };

    const handleDownloadClientDocument = async (clientId: number) => {
        setDownloadingClientId(clientId);
        try {
            const response = await GetDataSimpleBlob(
                `api/clients/document/${clientId}`,
                { responseType: "blob" }
            );

            if (response && response instanceof Blob) {
                // Create download link
                const url = window.URL.createObjectURL(response);
                const link = document.createElement("a");
                link.href = url;
                link.download = `client_document_${clientId}.pdf`; // or appropriate filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success("Документ успешно загружен!");
            } else {
                toast.error("Ошибка при загрузке документа");
            }
        } catch (error) {
            console.error("Error downloading client document:", error);
            toast.error("Ошибка при загрузке документа");
        } finally {
            setDownloadingClientId(null);
        }
    };

    return (
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
                                className="pl-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Имя клиента
                            </TableCell>
                            <TableCell
                                isHeader
                                className=" py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Номер телефона
                            </TableCell>
                            {/* <TableCell
                                isHeader
                                className=" py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Название компании
                            </TableCell> */}

                            <TableCell
                                isHeader
                                className=" py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Действия
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {users?.map((order: Users, index: number) => (
                            <TableRow
                                key={order.client_id}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <TableCell
                                    className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(order)}
                                >
                                    {index + 1}
                                </TableCell>
                                <TableCell
                                    className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(order)}
                                >
                                    {renderFieldValue(
                                        order.client_name,
                                        "client_name"
                                    )}
                                </TableCell>

                                <TableCell
                                    className=" py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(order)}
                                >
                                    {renderFieldValue(
                                        order.phone_number,
                                        "phone_number"
                                    )}
                                </TableCell>
                                {/* <TableCell
                                    className=" py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(order)}
                                >
                                    {renderFieldValue(
                                        order.business_name,
                                        "business_name"
                                    )}
                                </TableCell> */}

                                <TableCell className=" py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Button
                                        className="mr-2"
                                        onClick={() => {
                                            openModal();
                                            setSelectedUser(order);
                                        }}
                                        size="xs"
                                        variant="outline"
                                        startIcon={
                                            <PencilIcon className="size-4" />
                                        }
                                    >
                                        {""}
                                    </Button>
                                    <Button
                                        className="mr-2"
                                        onClick={() =>
                                            handleDownloadClientDocument(
                                                order.client_id
                                            )
                                        }
                                        size="xs"
                                        variant="primary"
                                        startIcon={
                                            <DownloadIcon className="size-4" />
                                        }
                                        disabled={
                                            downloadingClientId ===
                                            order.client_id
                                        }
                                    >
                                        {downloadingClientId === order.client_id
                                            ? "..."
                                            : ""}
                                    </Button>
                                    {/* <Button
                                        onClick={() => {
                                            setDeleteModalOpen(true);
                                            setSelectedUser(order);
                                        }}
                                        size="xs"
                                        variant="danger"
                                        startIcon={
                                            <TrashBinIcon className="size-4" />
                                        }
                                    >
                                        {""}
                                    </Button> */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <EditClientModal
                isOpen={isOpen}
                onClose={closeModal}
                changeStatus={changeStatus}
                setResponse={setResponse}
                client={selectedUser}
            />
            <DeleteUserModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onDelete={onDeleteUser}
                userName={
                    selectedUser
                        ? `${selectedUser.firstname} ${selectedUser.lastname}`
                        : ""
                }
                isDeleting={isDeleting}
            />
            <ClientDetailsModal
                isOpen={clientDetailsModalOpen}
                onClose={() => setClientDetailsModalOpen(false)}
                client={selectedClient}
            />
        </div>
    );
}
