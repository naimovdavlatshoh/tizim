import { PencilIcon, TrashBinIcon, UserIcon } from "../../icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useModal } from "../../hooks/useModal";
import EditUserModal from "./EditUser";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/button/Button";
import DeleteUserModal from "./DeleteUser";
import { DeleteData } from "../../service/data";
import { Modal } from "../../components/ui/modal";
import { useNavigate } from "react-router";
import { FiEye } from "react-icons/fi";

interface Users {
    user_id: number;
    firstname: string;
    lastname: string;
    fathername: string;
    login: string;
    role_id: number;
    role_name: string;
    created_at: string;
    photo_url?: string | null;
}
interface TableUserProps {
    users: Users[];
    changeStatus: () => void;
}

const getRoleName = (roleId: number): string => {
    const roleMap: { [key: number]: string } = {
        1: "Директор",
        2: "Бухгалтер",
        3: "Эксперт",
        4: "Лаборант",
        5: "Брокер",
        6: "Начальник лаборатория",
    };
    return roleMap[roleId] || "Неизвестная роль";
};

export default function TableUser({ users, changeStatus }: TableUserProps) {
    const { isOpen, openModal, closeModal } = useModal();
    const navigate = useNavigate();

    const [response, setResponse] = useState("");
    const [selectedUser, setSelectedUser] = useState<Users | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
    const [previewUserName, setPreviewUserName] = useState<string>("");
    console.log(response);

    // Get user role from localStorage
    const userRole = parseInt(localStorage.getItem("role_id") || "0");
    const canDelete = userRole === 1;

    const onDeleteUser = async () => {
        setIsDeleting(true);
        try {
            await DeleteData(`api/user/delete/${selectedUser?.user_id}`);
            toast.success("Пользователь успешно удален!");
            changeStatus();
        } catch (error) {
            toast.error("Что-то пошло не так при удалении пользователя");
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
            <Table className="min-w-[640px]">
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                        <TableCell
                            isHeader
                            className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            #
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Имя пользователя
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Логин
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Роль
                        </TableCell>
                        <TableCell
                            isHeader
                            className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                            Действия
                        </TableCell>
                    </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {users?.map((order: Users, index: number) => (
                        <TableRow key={order.user_id}>
                            <TableCell className="pl-3 sm:pl-5 pr-2 sm:pr-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {index + 1}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-start">
                                <div className="flex items-center gap-3">
                                    {order.photo_url ? (
                                        <img
                                            src={order.photo_url}
                                            alt={`${order.firstname} ${order.lastname}`}
                                            onClick={() => {
                                                setPreviewImageUrl(
                                                    order.photo_url!
                                                );
                                                setPreviewUserName(
                                                    `${order.firstname} ${order.lastname}`
                                                );
                                                setImagePreviewOpen(true);
                                            }}
                                            className="size-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                    ) : (
                                        <div className="overflow-hidden rounded-full bg-gray-100 p-3 text-blue-500 text-xl">
                                            <UserIcon />
                                        </div>
                                    )}
                                    <div>
                                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {order.firstname}
                                        </span>
                                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                            {order.lastname +
                                                " " +
                                                order.fathername}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {order.login}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {getRoleName(order.role_id)}
                            </TableCell>
                            <TableCell className="pl-2 sm:pl-4 pr-3 sm:pr-5 py-2 sm:py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                <div className="flex flex-row items-center gap-2 flex-nowrap">
                                    <Button
                                        className="mr-2"
                                        onClick={() => {
                                            navigate(
                                                `/employees?user_id=${order.user_id}`
                                            );
                                        }}
                                        size="xs"
                                        variant="outline"
                                        startIcon={<FiEye className="size-4" />}
                                    >
                                        {""}
                                    </Button>
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
                                    {canDelete && (
                                        <Button
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
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <EditUserModal
                isOpen={isOpen}
                onClose={closeModal}
                changeStatus={changeStatus}
                setResponse={setResponse}
                user={selectedUser}
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
            <Modal
                isOpen={imagePreviewOpen}
                onClose={() => setImagePreviewOpen(false)}
                className="max-w-4xl p-6"
            >
                <div className="relative">
                    <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                        {previewUserName}
                    </h2>
                    <img
                        src={previewImageUrl}
                        alt={previewUserName}
                        className="w-full h-auto rounded-lg"
                    />
                </div>
            </Modal>
        </div>
    );
}
