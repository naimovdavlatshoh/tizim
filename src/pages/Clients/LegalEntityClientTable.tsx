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

interface LegalEntityClient {
    client_id: number;
    client_type: number;
    client_name: string;
    business_name: string;
    phone_number: string;
    bank_account: string;
    bank_address: string;
    inn: string;
    mfo: string;
    oked: string;
    business_address: string;
}

interface LegalEntityClientTableProps {
    users: LegalEntityClient[];
    changeStatus: () => void;
}

export default function LegalEntityClientTable({
    users,
    changeStatus,
}: LegalEntityClientTableProps) {
    const { isOpen, openModal, closeModal } = useModal();
    const [response, setResponse] = useState("");
    const [selectedUser, setSelectedUser] = useState<LegalEntityClient | null>(
        null
    );
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [clientDetailsModalOpen, setClientDetailsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] =
        useState<LegalEntityClient | null>(null);

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

    console.log(response);

    const handleRowClick = (client: LegalEntityClient) => {
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
                                Название компании
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Имя клиента
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
                                Юридический адрес
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Банковский счет
                            </TableCell>
                            {/* <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                ИНН
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                МФО
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                ОКЭД
                            </TableCell> */}
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
                            (client: LegalEntityClient, index: number) => (
                                <TableRow
                                    key={client.client_id}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <TableCell
                                        className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {index + 1}
                                    </TableCell>
                                    <TableCell
                                        className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.business_name)}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 pr-5 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.client_name)}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 pr-5 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.phone_number)}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 pr-5 text-gray-500 text-theme-sm dark:text-gray-400 w-[250px]"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(
                                            client.business_address
                                        )}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 pr-5 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.bank_account)}
                                    </TableCell>
                                    {/* <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.inn)}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.mfo)}
                                    </TableCell>
                                    <TableCell
                                        className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                        onClick={() => handleRowClick(client)}
                                    >
                                        {renderFieldValue(client.oked)}
                                    </TableCell> */}
                                    <TableCell className="py-3 text-gray-500 text-theme-sm flex justify-end">
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
                userName={selectedUser ? `${selectedUser.business_name}` : ""}
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
