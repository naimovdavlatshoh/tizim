import { Modal } from "../../components/ui/modal";

// Minimalist icons for different sections
const UserIcon = () => (
    <svg
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
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

const CalendarIcon = () => (
    <svg
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
    </svg>
);

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

interface ClientDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Users | null;
}

export default function ClientDetailsModal({
    isOpen,
    onClose,
    client,
}: ClientDetailsModalProps) {
    if (!client) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return "Не указано";
        return new Date(dateString).toLocaleDateString("ru-RU");
    };

    // Helper function to render field only if value exists
    const renderField = (
        value: any,
        label: string,
        icon: React.ReactNode,
        bgClass: string,
        borderClass: string
    ) => {
        if (!value || value === "" || value === null || value === undefined)
            return null;

        return (
            <div className={`${bgClass} p-4 rounded-lg border ${borderClass}`}>
                <div className="flex items-center gap-3 mb-2">
                    {icon}
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-500">
                        {label}
                    </label>
                </div>
                <p className="text-blue-800 dark:text-blue-200 font-normal text-lg">
                    {value}
                </p>
            </div>
        );
    };

    // Helper function for small fields (INN, MFO, OKED)
    const renderSmallField = (value: any, label: string) => {
        if (!value || value === "" || value === null || value === undefined)
            return null;

        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center flex items-center justify-between">
                <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">
                    {label}
                </label>
                <p className="text-blue-800 dark:text-blue-200 font-normal text-lg">
                    {value}
                </p>
            </div>
        );
    };

    const isIndividual = client.client_type === "2";
    const isLegalEntity = client.client_type === "1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl mx-4">
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isIndividual
                                ? "bg-blue-100 dark:bg-blue-900/30"
                                : "bg-blue-100 dark:bg-blue-900/30"
                        }`}
                    >
                        {isIndividual ? <UserIcon /> : <BuildingIcon />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-normal text-blue-600 dark:text-blue-400">
                            {isIndividual
                                ? "Физическое лицо"
                                : "Юридическое лицо"}
                        </h2>
                        <p className="text-blue-500 dark:text-blue-300 font-light">
                            {isIndividual
                                ? "Информация о физическом лице"
                                : "Информация о юридическом лице"}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Client Information - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Always show client name */}
                        {renderField(
                            client.client_name,
                            isIndividual ? "ФИО" : "Название компании",
                            isIndividual ? <UserIcon /> : <BuildingIcon />,
                            "bg-gray-50 dark:bg-gray-800/50",
                            "border-gray-200 dark:border-gray-700"
                        )}

                        {/* Always show phone if exists */}
                        {renderField(
                            client.phone_number,
                            "Номер телефона",
                            <PhoneIcon />,
                            "bg-gray-50 dark:bg-gray-800/50",
                            "border-gray-200 dark:border-gray-700"
                        )}

                        {/* For individuals - show personal fields */}
                        {isIndividual && (
                            <>
                                {renderField(
                                    client.client_address,
                                    "Адрес клиента",
                                    <LocationIcon />,
                                    "bg-gray-50 dark:bg-gray-800/50",
                                    "border-gray-200 dark:border-gray-700"
                                )}
                                {renderField(
                                    client.passport_series,
                                    "Серия паспорта",
                                    <UserIcon />,
                                    "bg-gray-50 dark:bg-gray-800/50",
                                    "border-gray-200 dark:border-gray-700"
                                )}
                                {renderField(
                                    client.passport_given_by,
                                    "Кем выдан паспорт",
                                    <BuildingIcon />,
                                    "bg-gray-50 dark:bg-gray-800/50",
                                    "border-gray-200 dark:border-gray-700"
                                )}
                                {renderField(
                                    client.passport_given_date,
                                    "Дата выдачи паспорта",
                                    <CalendarIcon />,
                                    "bg-gray-50 dark:bg-gray-800/50",
                                    "border-gray-200 dark:border-gray-700"
                                )}
                            </>
                        )}

                        {/* For legal entities - show business fields */}
                        {isLegalEntity && (
                            <>
                                {renderField(
                                    client.business_name,
                                    "Официальное название",
                                    <BuildingIcon />,
                                    "bg-gray-50 dark:bg-gray-800/50",
                                    "border-gray-200 dark:border-gray-700"
                                )}
                                {renderField(
                                    client.business_address,
                                    "Юридический адрес",
                                    <LocationIcon />,
                                    "bg-gray-50 dark:bg-gray-800/50",
                                    "border-gray-200 dark:border-gray-700"
                                )}
                            </>
                        )}

                        {/* Bank account - show if exists */}
                        {renderField(
                            client.bank_account,
                            "Банковский счет",
                            <BankIcon />,
                            "bg-gray-50 dark:bg-gray-800/50",
                            "border-gray-200 dark:border-gray-700"
                        )}

                        {/* Bank address - show if exists */}
                        {renderField(
                            client.bank_address,
                            "Адрес банка",
                            <BankIcon />,
                            "bg-gray-50 dark:bg-gray-800/50",
                            "border-gray-200 dark:border-gray-700"
                        )}

                        {/* Document numbers - show only if they exist */}
                        {renderSmallField(client.inn, "ИНН")}
                        {client.mfo && renderSmallField(client.mfo, "МФО")}
                        {isLegalEntity &&
                            client.oked &&
                            renderSmallField(client.oked, "ОКЭД")}

                        {/* Creation date - show if exists */}
                        {client.created_at && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Дата регистрации
                                    </label>
                                    <p className="text-blue-800 dark:text-white font-normal text-lg">
                                        {formatDate(client.created_at)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
