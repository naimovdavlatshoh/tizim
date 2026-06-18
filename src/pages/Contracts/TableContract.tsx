import { FaRegEye, FaTrash, FaBan } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useState } from "react";
import Button from "../../components/ui/button/Button";
import Linkto from "../../components/ui/link/LinkTo";
import { formatCurrency, formatDate } from "../../utils/numberFormat";
import DeleteContractModal from "./DeleteContract";
import TerminateContractModal from "./TerminateContractModal.tsx";

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
  client_type: number;
  inn: number;
  mfo: number;
  oked: number;
  business_address: string;
  contract_status: number;
  contract_status_text: string;
  contract_payment_status: number;
  contract_payment_status_text: string;
  created_at: string;
  termination_reason?: string;
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

// ── Статус договора ──────────────────────────────────────────
const CONTRACT_STATUS_STYLES: Record<
  number,
  { bg: string; text: string; label?: string }
> = {
  1: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-600 dark:text-gray-300",
  },
  2: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-300",
  },
  3: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  4: {
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  5: {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-700 dark:text-purple-300",
  },
  6: {
    bg: "bg-teal-100 dark:bg-teal-900/40",
    text: "text-teal-700 dark:text-teal-300",
  },
  7: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-300",
    label: "Расторгнут",
  },
};

// ── Статус оплаты ────────────────────────────────────────────
const PAYMENT_STATUS_STYLES: Record<number, { bg: string; text: string }> = {
  0: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-600 dark:text-gray-300",
  },
  1: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  2: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-700 dark:text-green-300",
  },
};

function StatusBadge({
  styleMap,
  statusKey,
  label,
}: {
  styleMap: Record<number, { bg: string; text: string; label?: string }>;
  statusKey: number;
  label: string;
}) {
  const style = styleMap[statusKey] ?? {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-600 dark:text-gray-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${style.bg} ${style.text}`}
    >
      {style.label ?? label}
    </span>
  );
}

export default function TableContract({
  contracts,
  changeStatus,
}: TableContractProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );

  const userRole = parseInt(localStorage.getItem("role_id") || "0");
  const canDelete = userRole === 1;
  const canTerminate = userRole === 1 || userRole === 2; // ROLE_ADMIN + ROLE_MANAGER

  const handleSuccess = () => changeStatus();

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-x-auto">
      <Table className="min-w-[1000px]">
        {/* ── Header ─────────────────────────────────────────── */}
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.02]">
          <TableRow>
            {[
              { label: "#", cls: "pl-4 pr-2 w-10" },
              { label: "№ договора", cls: "px-3 whitespace-nowrap" },
              { label: "Компания / Клиент", cls: "px-3 min-w-[180px]" },
              { label: "Тип", cls: "px-3 whitespace-nowrap" },
              { label: "Сумма", cls: "px-3 whitespace-nowrap text-right" },
              { label: "Дата", cls: "px-3 whitespace-nowrap" },
              { label: "Статус", cls: "px-3 whitespace-nowrap" },
              { label: "Оплата", cls: "px-3 whitespace-nowrap" },
              { label: "Телефон", cls: "px-3 whitespace-nowrap" },
              { label: "Действия", cls: "pl-3 pr-4 whitespace-nowrap" },
            ].map(({ label, cls }) => (
              <TableCell
                key={label}
                isHeader
                className={`py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 text-start ${cls}`}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        {/* ── Body ───────────────────────────────────────────── */}
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
          {contracts?.map((contract, index) => {
            const isTerminated = contract.contract_status === 7;
            return (
              <TableRow
                key={contract.contract_id}
                className={`transition-colors ${
                  isTerminated
                    ? "bg-red-50/40 dark:bg-red-900/10 opacity-80"
                    : "hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                }`}
              >
                {/* # */}
                <TableCell className="pl-4 pr-2 py-3 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                  {index + 1}
                </TableCell>

                {/* № договора */}
                <TableCell className="px-3 py-3">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                    {contract.contract_number}
                  </span>
                </TableCell>

                {/* Компания / Клиент */}
                <TableCell className="px-3 py-3 min-w-[180px]">
                  {contract.business_name && (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate max-w-[200px]">
                      {contract.business_name}
                    </p>
                  )}
                  <p
                    className={`text-xs truncate max-w-[200px] ${contract.business_name ? "text-gray-400 dark:text-gray-500 mt-0.5" : "text-sm text-gray-700 dark:text-gray-200"}`}
                  >
                    {contract.client_name}
                  </p>
                </TableCell>

                {/* Тип клиента */}
                <TableCell className="px-3 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      contract.client_type === 1
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    }`}
                  >
                    {contract.client_type === 1 ? "Юр." : "Физ."}
                  </span>
                </TableCell>

                {/* Сумма */}
                <TableCell className="px-3 py-3 text-right">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 tabular-nums whitespace-nowrap">
                    {formatCurrency(contract.contract_price)}
                  </span>
                </TableCell>

                {/* Дата */}
                <TableCell className="px-3 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(contract.contract_date)}
                  </span>
                </TableCell>

                {/* Статус договора */}
                <TableCell className="px-3 py-3">
                  <StatusBadge
                    styleMap={CONTRACT_STATUS_STYLES}
                    statusKey={contract.contract_status}
                    label={contract.contract_status_text}
                  />
                  {isTerminated && contract.termination_reason && (
                    <p
                      className="mt-1 text-xs text-red-500 dark:text-red-400 max-w-[140px] truncate"
                      title={contract.termination_reason}
                    >
                      {contract.termination_reason}
                    </p>
                  )}
                </TableCell>

                {/* Статус оплаты */}
                <TableCell className="px-3 py-3">
                  <StatusBadge
                    styleMap={PAYMENT_STATUS_STYLES}
                    statusKey={contract.contract_payment_status}
                    label={contract.contract_payment_status_text}
                  />
                </TableCell>

                {/* Телефон */}
                <TableCell className="px-3 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap tabular-nums">
                    {contract.phone_number || "—"}
                  </span>
                </TableCell>

                {/* Действия */}
                <TableCell className="pl-3 pr-4 py-3">
                  <div className="flex items-center gap-1.5 flex-nowrap">
                    {/* Просмотр */}
                    <Linkto
                      to={`/contract-details/${contract.contract_id}`}
                      size="xs"
                      variant="outline"
                      startIcon={<FaRegEye className="size-3.5" />}
                    >
                      {""}
                    </Linkto>

                    {/* Расторгнуть */}
                    {canTerminate &&
                      !isTerminated &&
                      contract.contract_status !== 6 && (
                        <span title="Расторгнуть договор">
                          <Button
                            onClick={() => {
                              setSelectedContract(contract);
                              setTerminateModalOpen(true);
                            }}
                            size="xs"
                            variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                            startIcon={<FaBan className="size-3.5" />}
                          >
                            {""}
                          </Button>
                        </span>
                      )}

                    {/* Удалить — нельзя удалить расторгнутый */}
                    {canDelete && (
                      <span
                        title={
                          isTerminated
                            ? "Нельзя удалить расторгнутый договор"
                            : "Удалить договор"
                        }
                      >
                        <Button
                          onClick={() => {
                            if (isTerminated) return;
                            setSelectedContract(contract);
                            setDeleteModalOpen(true);
                          }}
                          size="xs"
                          variant="danger"
                          disabled={isTerminated}
                          startIcon={<FaTrash className="size-3.5" />}
                        >
                          {""}
                        </Button>
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          {/* Пустое состояние */}
          {(!contracts || contracts.length === 0) && (
            <TableRow>
              <TableCell
                className="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                colSpan={10}
              >
                Договоры не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <DeleteContractModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedContract(null);
        }}
        contractNumber={selectedContract?.contract_number}
        contractId={selectedContract?.contract_id}
        onSuccess={handleSuccess}
      />

      <TerminateContractModal
        isOpen={terminateModalOpen}
        onClose={() => {
          setTerminateModalOpen(false);
          setSelectedContract(null);
        }}
        contractNumber={selectedContract?.contract_number}
        contractId={selectedContract?.contract_id}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
