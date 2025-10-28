import { DownloadIcon, PencilIcon } from "../../icons";
import { FaRegEye } from "react-icons/fa";
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
import {
    DeleteData,
    GetDataSimpleBlob,
    GetDataSimple,
} from "../../service/data";
import { Modal } from "../../components/ui/modal";

interface Users {
    client_id: number;
    client_name: string;
    client_type: number;
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
    const [contractListModalOpen, setContractListModalOpen] = useState(false);
    const [contracts, setContracts] = useState<any[]>([]);
    const [loadingContracts, setLoadingContracts] = useState(false);
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

    const handleViewContracts = async (clientId: number) => {
        setContractListModalOpen(true);
        setLoadingContracts(true);
        try {
            const response = await GetDataSimple(
                `api/clients/contractlist/${clientId}`
            );
            const contractsData = response || response?.data || [];
            setContracts(contractsData);
        } catch (error:any) {
            setContractListModalOpen(false)
            toast.error(error?.response?.data?.error);
        } finally {
            setLoadingContracts(false);
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
                                            handleViewContracts(order.client_id)
                                        }
                                        size="xs"
                                        variant="primary"
                                        startIcon={
                                            <FaRegEye className="size-4" />
                                        }
                                    >
                                        {" "}
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
            <Modal
                isOpen={contractListModalOpen}
                onClose={() => setContractListModalOpen(false)}
                className="max-w-7xl p-6 lg:p-10"
            >
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                        Список договоров
                    </h2>
                    {loadingContracts ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : contracts.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            Нет договоров
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-200 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell
                                            isHeader
                                            className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            #
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Номер договора
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Название компании
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Дата
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Цена
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Статус
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Оплата
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {contracts.map(
                                        (contract: any, index: number) => (
                                            <TableRow
                                                key={
                                                    contract.contract_id ||
                                                    index
                                                }
                                            >
                                                <TableCell className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                                                    {contract.contract_number ||
                                                        "-"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 max-w-[200px] text-center text-gray-600 dark:text-gray-400">
                                                    {contract.business_name ||
                                                        "-"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                                                    {contract.contract_date ||
                                                        "-"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                                                    {contract.contract_price
                                                        ? `${contract.contract_price.toLocaleString()} сум`
                                                        : "-"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            contract.contract_status_text ===
                                                            "Активный"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                : contract.contract_status_text ===
                                                                  "Завершенный"
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                        }`}
                                                    >
                                                        {contract.contract_status_text ||
                                                            "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                        {contract.contract_payment_status_text ||
                                                            "-"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
