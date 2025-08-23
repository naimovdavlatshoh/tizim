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
import { DeleteData } from "../../service/data";

interface IndividualClient {
    client_id: number;
    client_type: string;
    client_name: string;
    client_address: string;
    passport_series: string;
    passport_given_by: string;
    passport_given_date: string;
    phone_number: string;
}

interface IndividualClientTableProps {
    users: IndividualClient[];
    changeStatus: () => void;
}

export default function IndividualClientTable({
    users,
    changeStatus,
}: IndividualClientTableProps) {
    const { isOpen, openModal, closeModal } = useModal();
    const [response, setResponse] = useState("");
    const [selectedUser, setSelectedUser] = useState<IndividualClient | null>(
        null
    );
    console.log(response);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [clientDetailsModalOpen, setClientDetailsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] =
        useState<IndividualClient | null>(null);

    const onDeleteUser = () => {
        DeleteData(`api/user/delete/${selectedUser?.client_id}`)
            .then(() => {
                toast.success("Пользователь успешно удален!");
                changeStatus();
            })
            .catch(() => {
                toast.error("Что-то пошло не так при удалении пользователя");
            });

        setDeleteModalOpen(false);
    };

    const handleRowClick = (client: IndividualClient) => {
        setSelectedClient(client);
        setClientDetailsModalOpen(true);
    };

    // Helper function to render field value or "Не указано" badge
    const renderFieldValue = (value: any) => {
        if (!value || value === "" || value === null || value === undefined) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Не указано
                </span>
            );
        }
        return value;
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
                                ФИО
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Номер телефона
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Адрес клиента
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Серия паспорта
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Кем выдан паспорт
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Дата выдачи паспорта
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
                        {users?.map(
                            (client: IndividualClient, index: number) => (
                                <TableRow
                                    key={client.client_id}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <TableCell
                                        className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {index + 1}
                                    </TableCell>
                                    <TableCell
                                        className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.client_name)}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.phone_number)}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(
                                            client.client_address
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(
                                            client.passport_series
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(
                                            client.passport_given_by
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(
                                            client.passport_given_date
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        <Button
                                            className="mr-2"
                                            onClick={() => {
                                                openModal();
                                                setSelectedUser(client);
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
                                            // onClick={() => {
                                            //     openModal();
                                            //     setSelectedUser(order);
                                            // }}
                                            size="xs"
                                            variant="primary"
                                            startIcon={
                                                <DownloadIcon className="size-4" />
                                            }
                                        >
                                            {""}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        )}
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
                userName={selectedUser ? `${selectedUser.client_name}` : ""}
            />
            <ClientDetailsModal
                isOpen={clientDetailsModalOpen}
                onClose={() => setClientDetailsModalOpen(false)}
                client={selectedClient}
            />
        </div>
    );
}
