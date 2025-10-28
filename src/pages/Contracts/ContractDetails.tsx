import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { BASE_URL, GetDataSimple, PostDataToken } from "../../service/data";
// import generateChequeFromData from "../../utils/contractGeneratorFile";
import Loader from "../../components/ui/loader/Loader";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/numberFormat";
import axios from "axios";

// Beautiful outline icons
const ContractIcon = () => (
    <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
    </svg>
);

const UserIcon = () => (
    <svg
        className="w-5 h-5 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
    </svg>
);

const PhoneIcon = () => (
    <svg
        className="w-5 h-5 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
    </svg>
);

const BuildingIcon = () => (
    <svg
        className="w-5 h-5 text-purple-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
    </svg>
);

const LocationIcon = () => (
    <svg
        className="w-5 h-5 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
    </svg>
);

const BankIcon = () => (
    <svg
        className="w-5 h-5 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
    </svg>
);

const LabIcon = () => (
    <svg
        className="w-5 h-5 text-amber-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
    </svg>
);

const PaymentIcon = () => (
    <svg
        className="w-5 h-5 text-emerald-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
    </svg>
);

const DownloadIcon = () => (
    <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
    </svg>
);

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
        amount: number;
        payment_type_text: string;
        operator_name: string;
        comments: string;
        created_at: string;
    }>;
}

const ContractDetails = () => {
    const { id } = useParams();
    const [contracts, setContracts] = useState<Contract[]>([]);
    // @ts-ignore
    const [qrCode, setQrCode] = useState<string>("");
    const [currentContract, setCurrentContract] = useState<Contract | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    console.log(contracts);

    useEffect(() => {
        if (id) {
            GetDataSimple(`api/contracts/list?page=1&limit=30`)
                .then((res) => {
                    const contractsData = res?.result || [];
                    console.log("All contracts:", contractsData);
                    console.log(
                        "Contract IDs:",
                        contractsData.map((c: Contract) => c.contract_id)
                    );

                    setContracts(contractsData);

                    // Try different ways to find the contract
                    let filteredContract = contractsData.find(
                        (contract: Contract) => {
                            console.log(
                                "Comparing:",
                                contract.contract_id,
                                "with",
                                id,
                                "Types:",
                                typeof contract.contract_id,
                                typeof id
                            );
                            return contract.contract_id === parseInt(id);
                        }
                    );

                    // If not found, try string comparison
                    if (!filteredContract) {
                        filteredContract = contractsData.find(
                            (contract: Contract) =>
                                contract.contract_id.toString() === id
                        );
                        console.log(
                            "Trying string comparison, found:",
                            filteredContract
                        );
                    }

                    if (filteredContract) {
                        setCurrentContract(filteredContract);
                        console.log(
                            "Final filtered contract:",
                            filteredContract
                        );
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching contracts:", error);
                    setLoading(false);
                });
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            GetDataSimple(`api/contracts/qrcode/${id}`).then((res) => {
                console.log(res);
                setQrCode(res.success);
            });
        }
    }, [id]);

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is PDF
        if (file.type !== "application/pdf") {
            toast.error("Пожалуйста, выберите PDF файл");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await PostDataToken(
                `api/contracts/upload-pdf/${id}`,
                formData
            );

            if (response?.status === 200 || response?.data?.success) {
                toast.success("PDF файл успешно загружен!");
                // Reset file input
                event.target.value = "";
            } else {
                toast.error("Что-то пошло не так при загрузке файла");
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || "Ошибка при загрузке файла";
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "2":
                return "success";
            case "1":
                return "warning";
            default:
                return "error";
        }
    };

    const getPaymentStatusColor = (status: number) => {
        switch (status) {
            case 1:
                return "success";
            case 0:
                return "warning";
            default:
                return "error";
        }
    };

    // formatCurrency function is now imported from utils

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU");
    };

    const getMonthName = (monthNumber: number): string => {
        const months = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ];
        return months[monthNumber - 1] || `Месяц ${monthNumber}`;
    };

    if (loading) {
        return <Loader />;
    }

    if (!currentContract) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <div className="text-lg text-red-500 font-medium">
                        Договор не найден
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Contract Header */}
            <ComponentCard
                title={`Договор №${currentContract.contract_number}`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <ContractIcon />
                    <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-4">
                            <Badge
                                color={getStatusColor(
                                    currentContract.contract_status.toString()
                                )}
                            >
                                {currentContract.contract_status_text}
                            </Badge>
                            <Badge
                                color={getPaymentStatusColor(
                                    currentContract.contract_payment_status
                                )}
                            >
                                {currentContract.contract_payment_status_text}
                            </Badge>
                        </div>

                        <div className="text-right">
                            <p className="text-gray-600 text-sm">
                                Сумма договора
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(currentContract.contract_price)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    {/* File Upload Button */}
                    {currentContract?.contract_status == 1 && (
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="pdf-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="pdf-upload"
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium cursor-pointer transition-colors ${
                                    uploading
                                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Загрузка...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                            />
                                        </svg>
                                        Загрузить PDF
                                    </>
                                )}
                            </label>
                        </div>
                    )}

                    {/* Download Document Button */}
                    <button
                        onClick={async () => {
                            // if (
                            //     currentContract.contract_type === "1" ||
                            //     currentContract.contract_type === "2"
                            // ) {
                            //     // For contract_type 3, use template
                            //     generateChequeFromData({
                            //         ...currentContract,
                            //         qrCode: qrCode,
                            //     });
                            // } else {
                            // For other contract types, download from API
                            try {
                                const response = await axios.post(
                                    `${BASE_URL}api/contracts/wordcreate/${currentContract.contract_id}`,
                                    {},
                                    {
                                        responseType: "blob",

                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem(
                                                "token"
                                            )}`, // 🔑 token qo‘shildi
                                        },
                                    } // DOCX ni to‘g‘ri olish uchun
                                );

                                const blob = new Blob([response.data], {
                                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                });

                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `contract_${currentContract.contract_number}.docx`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            } catch (err) {
                                console.error("Download error:", err);
                            }
                            // }
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2 rounded-md font-medium flex items-center gap-2"
                    >
                        <DownloadIcon />
                        Скачать документ
                    </button>

                    {/* Download PDF Button */}
                    <button
                        onClick={async () => {
                            try {
                                const response = await axios.get(
                                    `${BASE_URL}api/contracts/pdf/${currentContract.contract_id}`,
                                    {
                                        responseType: "blob",
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem(
                                                "token"
                                            )}`,
                                        },
                                    }
                                );

                                const blob = new Blob([response.data], {
                                    type: "application/pdf",
                                });
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `contract_${currentContract.contract_number}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                            } catch (err: any) {
                                console.error(err);
                                toast.error(
                                    err.response.data.error ||
                                        "Ошибка при скачивании PDF"
                                );
                            }
                        }}
                        className="bg-red-600 text-white hover:bg-red-700 transition-colors px-4 py-2 rounded-md font-medium flex items-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Скачать PDF
                    </button>
                </div>
            </ComponentCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Information */}
                <ComponentCard title="Информация о клиенте">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <UserIcon />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Имя клиента
                                </p>
                                <p className="font-medium text-gray-900">
                                    {currentContract.client_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <PhoneIcon />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Телефон
                                </p>
                                <p className="font-medium text-gray-900">
                                    {currentContract.phone_number}
                                </p>
                            </div>
                        </div>
                        {currentContract.business_name && (
                            <div className="flex items-center gap-3">
                                <BuildingIcon />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Название компании
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {currentContract.business_name}
                                    </p>
                                </div>
                            </div>
                        )}
                        {currentContract.business_address && (
                            <div className="flex items-center gap-3">
                                <LocationIcon />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Адрес компании
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {currentContract.business_address}
                                    </p>
                                </div>
                            </div>
                        )}
                        {(currentContract.inn ||
                            currentContract.mfo ||
                            currentContract.oked) && (
                            <div className="grid grid-cols-3 gap-4">
                                {currentContract.inn && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            ИНН
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {currentContract.inn}
                                        </p>
                                    </div>
                                )}
                                {currentContract.mfo && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            МФО
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {currentContract.mfo}
                                        </p>
                                    </div>
                                )}
                                {currentContract.oked && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            ОКЭД
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {currentContract.oked}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ComponentCard>

                {/* Bank Information */}
                {(currentContract.bank_account ||
                    currentContract.bank_address) && (
                    <ComponentCard title="Банковская информация">
                        <div className="space-y-4">
                            {currentContract.bank_account && (
                                <div className="flex items-center gap-3">
                                    <BankIcon />
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Номер счета
                                        </p>
                                        <p className="font-mono font-medium text-gray-900">
                                            {currentContract.bank_account}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {currentContract.bank_address && (
                                <div className="flex items-center gap-3">
                                    <LocationIcon />
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Адрес банка
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {currentContract.bank_address}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ComponentCard>
                )}
            </div>

            {/* Laboratory Tests - Only show if contract_type is not 3 and has tests */}
            {currentContract &&
                currentContract.contract_type !== 3 &&
                currentContract.contract_type !== 4 &&
                currentContract.laboratory &&
                currentContract.laboratory.length > 0 && (
                    <ComponentCard title="Лабораторные тесты">
                        <div className="flex items-center gap-2 mb-4">
                            <LabIcon />
                            <span className="text-gray-600 font-medium">
                                {currentContract.laboratory.length} тестов
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentContract.laboratory.map((test, index) => (
                                <div
                                    key={test.lab_test_id}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                                            #{index + 1}
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${
                                                test.test_type === 1
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {test.test_type === 1
                                                ? "Основной"
                                                : "Дополнительный"}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900">
                                        {test.tests_name}
                                    </h4>
                                </div>
                            ))}
                        </div>
                    </ComponentCard>
                )}

            {/* Monthly Payments */}
            {currentContract.contract_type === 5 && (
                <ComponentCard title="Ежемесячные платежи">
                    <div className="flex items-center gap-2 mb-4">
                        <PaymentIcon />
                        <span className="text-gray-600 font-medium">
                            {currentContract.monthlypayments?.length || 0}{" "}
                            платежей
                        </span>
                    </div>
                    {currentContract.monthlypayments &&
                    currentContract.monthlypayments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Месяц
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Сумма
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Внесено
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Статус
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Дата
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentContract.monthlypayments.map(
                                        (payment, index) => (
                                            <tr
                                                key={payment.monthly_id}
                                                className={
                                                    index % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-gray-50"
                                                }
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {getMonthName(
                                                        payment.month_of_payment
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                        payment.monthly_fee
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                        payment.given_amount
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            payment.payment_status ===
                                                            1
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {payment.payment_status ===
                                                        1
                                                            ? "Оплачено"
                                                            : "Не оплачено"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(
                                                        payment.date_of_payment
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <PaymentIcon />
                            <p className="mt-2">
                                Ежемесячные платежи не настроены
                            </p>
                        </div>
                    )}
                </ComponentCard>
            )}

            {/* Payment History */}

            {currentContract && (
                <ComponentCard title="История платежей">
                    {currentContract.payments &&
                    currentContract.payments.length > 0 ? (
                        <div className="space-y-4">
                            {currentContract.payments.map((payment, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                                                #{index + 1}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(payment.created_at)}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-blue-600">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Тип платежа
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {payment.payment_type_text}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Оператор
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {payment.operator_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Комментарий
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {payment.comments ||
                                                    "Нет комментария"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="mt-2">История платежей пуста</p>
                        </div>
                    )}
                </ComponentCard>
            )}
        </div>
    );
};

export default ContractDetails;
