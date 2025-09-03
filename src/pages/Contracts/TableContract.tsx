// import { EyeIcon } from "../../icons";
import { FaRegEye } from "react-icons/fa";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
// import { useModal } from "../../hooks/useModal";
// import EditClientModal from "./EditClient";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import Button from "../../components/ui/button/Button";
// import DeleteUserModal from "./DeleteClient";
// import ClientDetailsModal from "./ClientDetailsModal";
// import { DeleteData } from "../../service/data";
// import { Link } from "react-router";
import Linkto from "../../components/ui/link/LinkTo";
import { formatCurrency } from "../../utils/numberFormat";

interface Contract {
    contract_id: number;
    contract_number: string;
    client_id: number;
    contract_type: number;
    contract_price: number;
    percent: number;
    contract_date: string;
    client_name: string;
    business_name: string;
    phone_number: string;
    bank_account: string;
    bank_address: string;
    inn: number;
    mfo: number;
    oked: number;
    business_address: string;
    contract_status: number;
    contract_status_text: string;
    contract_payment_status: number;
    contract_payment_status_text: string;
    created_at: string;
    laboratory: Array<{
        lab_test_id: number;
        tests_name: string;
        test_type: number;
    }>;
    monthlypayments: Array<{
        monthly_id: number;
        monthly_fee: number;
        month_of_payment: number;
        date_of_payment: string;
        given_amount: number;
        payment_status: number;
        created_at: string;
    }>;
    payments: Array<{
        payment_id: number;
        amount: number;
        payment_type: number;
        payment_type_text: string;
        comments: string;
        contract_id: number;
        contract_number: string;
        client_id: number;
        client_name: string;
        business_name: string;
        operator_name: string;
        created_at: string;
    }>;
}

interface TableContractProps {
    contracts: Contract[];
    changeStatus: () => void;
}

export default function TableContract({
    contracts,
}: // changeStatus,
TableContractProps) {
    // const { isOpen, openModal, closeModal } = useModal();

    // const [response, setResponse] = useState("");
    // const [selectedContract, setSelectedContract] = useState<Contract | null>(
    //     null
    // );

    const handleRowClick = (contract: Contract) => {
        // Handle row click if needed
        console.log("Contract clicked:", contract);
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
                                Сумма договора
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Дата договора
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Статус договора
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Статус оплаты
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Телефон
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Компания
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
                        {contracts?.map((contract: Contract) => (
                            <TableRow
                                key={contract.contract_id}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <TableCell
                                    className="pl-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    {contract.contract_number}
                                </TableCell>

                                <TableCell
                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    {contract.client_name}
                                </TableCell>
                                <TableCell
                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    {formatCurrency(contract.contract_price)}
                                </TableCell>
                                <TableCell
                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    {new Date(
                                        contract.contract_date
                                    ).toLocaleDateString("ru-RU")}
                                </TableCell>
                                <TableCell
                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            contract.contract_status === 2
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                        }`}
                                    >
                                        {contract.contract_status_text}
                                    </span>
                                </TableCell>
                                <TableCell
                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            contract.contract_payment_status ===
                                            1
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                        }`}
                                    >
                                        {contract.contract_payment_status_text}
                                    </span>
                                </TableCell>
                                <TableCell
                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    {contract.phone_number}
                                </TableCell>
                                <TableCell
                                    className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"
                                    onClick={() => handleRowClick(contract)}
                                >
                                    {contract.business_name}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {/* <Button
                                        className="mr-2"
                                        onClick={() => {
                                            openModal();
                                            setSelectedContract(contract);
                                        }}
                                        size="xs"
                                        variant="outline"
                                        startIcon={
                                            <PencilIcon className="size-4" />
                                        }
                                    >
                                        {""}
                                    </Button> */}
                                    <Linkto
                                        to={`/contract-details/${contract.contract_id}`}
                                        className="mr-2"
                                        size="xs"
                                        variant="outline"
                                        startIcon={
                                            <FaRegEye className="size-4" />
                                        }
                                    >
                                        {""}
                                    </Linkto>
                                    {/* <Button
                                        onClick={() => {
                                            setDeleteModalOpen(true);
                                            setSelectedContract(contract);
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
            {/* <EditClientModal
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
            />
            <ClientDetailsModal
                isOpen={clientDetailsModalOpen}
                onClose={() => setClientDetailsModalOpen(false)}
                client={selectedClient}
            /> */}
        </div>
    );
}
