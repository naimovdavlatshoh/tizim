// components/modals/AddUserModal.tsx

import React, { useState } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { PostDataToken } from "../../service/data";
import { toast } from "react-hot-toast";

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    setResponse: (value: string) => void;
}

interface IndividualClientData {
    client_type: 2;
    client_name: string;
    client_address: string;
    passport_series: string;
    passport_given_by: string;
    passport_given_date: string;
    phone_number: string;
    pinfl: string;
}

interface LegalEntityClientData {
    client_type: 1;
    client_name: string;
    business_name: string;
    phone_number: string;
    bank_account: string;
    bank_address: string;
    inn: number;
    mfo: number;
    oked: number;
    business_address: string;
    // client_address: string; // Commented out - not needed for legal entities
    // passport_series: string; // Commented out - not needed for legal entities
    // passport_given_by: string; // Commented out - not needed for legal entities
    // passport_given_date: string; // Commented out - not needed for legal entities
}

type ClientData = IndividualClientData | LegalEntityClientData;

const AddClientModal: React.FC<AddClientModalProps> = ({
    isOpen,
    onClose,
    changeStatus,
    setResponse,
}) => {
    const [activeTab, setActiveTab] = useState<"individual" | "legal">(
        "individual"
    );
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string>("");

    // Individual client form data
    const [individualData, setIndividualData] = useState({
        client_name: "",
        client_address: "",
        passport_series: "",
        passport_given_by: "",
        passport_given_date: "",
        phone_number: "",
        pinfl: "",
    });

    // Legal entity client form data
    const [legalData, setLegalData] = useState({
        client_name: "",
        business_name: "",
        phone_number: "",
        bank_account: "",
        bank_address: "",
        inn: "",
        mfo: "",
        oked: "",
        business_address: "",
        // client_address: "", // Commented out - not needed for legal entities
        // passport_series: "", // Commented out - not needed for legal entities
        // passport_given_by: "", // Commented out - not needed for legal entities
        // passport_given_date: "", // Commented out - not needed for legal entities
    });

    // File state for both forms
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleIndividualInputChange = (field: string, value: string) => {
        setIndividualData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleLegalInputChange = (field: string, value: string) => {
        setLegalData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const validateIndividualForm = (): boolean => {
        const requiredFields = [
            "client_name",
            "client_address",
            "passport_series",
            "passport_given_by",
            "passport_given_date",
            "phone_number",
            "pinfl",
        ];

        for (const field of requiredFields) {
            if (!individualData[field as keyof typeof individualData]) {
                setFormError(`Пожалуйста, заполните поле: ${field}`);
                return false;
            }
        }

        if (!selectedFile) {
            setFormError("Пожалуйста, загрузите файл");
            return false;
        }

        return true;
    };

    const validateLegalForm = (): boolean => {
        const requiredFields = [
            "client_name",
            "business_name",
            "phone_number",
            "bank_account",
            "bank_address",
            "inn",
            "mfo",
            "oked",
            "business_address",
        ];

        for (const field of requiredFields) {
            if (!legalData[field as keyof typeof legalData]) {
                setFormError(`Пожалуйста, заполните поле: ${field}`);
                return false;
            }
        }

        if (!selectedFile) {
            setFormError("Пожалуйста, загрузите файл");
            return false;
        }

        return true;
    };

    const handleClose = () => {
        // Reset forms when closing without saving
        setFormError("");
        resetForms();
        onClose();
    };

    const handleSubmit = async () => {
        setFormError("");
        if (activeTab === "individual") {
            if (!validateIndividualForm()) return;

            const payload: IndividualClientData = {
                client_type: 2,
                client_name: individualData.client_name,
                client_address: individualData.client_address,
                passport_series: individualData.passport_series,
                passport_given_by: individualData.passport_given_by,
                passport_given_date: individualData.passport_given_date,
                phone_number: individualData.phone_number,
                pinfl: individualData.pinfl,
            };

            await submitClientData(payload);
        } else {
            if (!validateLegalForm()) return;

            const payload: LegalEntityClientData = {
                client_type: 1,
                client_name: legalData.client_name,
                business_name: legalData.business_name,
                phone_number: legalData.phone_number,
                bank_account: legalData.bank_account,
                bank_address: legalData.bank_address,
                inn: Number(legalData.inn),
                mfo: Number(legalData.mfo),
                oked: Number(legalData.oked),
                business_address: legalData.business_address,
                // client_address: legalData.client_address, // Commented out - not needed for legal entities
                // passport_series: legalData.passport_series, // Commented out - not needed for legal entities
                // passport_given_by: legalData.passport_given_by, // Commented out - not needed for legal entities
                // passport_given_date: legalData.passport_given_date, // Commented out - not needed for legal entities
            };

            await submitClientData(payload);
        }
    };

    const submitClientData = async (payload: ClientData) => {
        setIsLoading(true);

        try {
            let response;

            if (activeTab === "individual") {
                // For individual clients, use FormData and post to fizcreate endpoint
                const formData = new FormData();
                formData.append("file", selectedFile!);

                // Create data object and append as JSON string
                const individualPayload = payload as IndividualClientData;
                const data = {
                    client_type: individualPayload.client_type,
                    client_name: individualPayload.client_name,
                    client_address: individualPayload.client_address,
                    passport_series: individualPayload.passport_series,
                    passport_given_by: individualPayload.passport_given_by,
                    passport_given_date: individualPayload.passport_given_date,
                    phone_number: individualPayload.phone_number,
                    pinfl: individualPayload.pinfl,
                };
                formData.append("data", JSON.stringify(data));

                response = await PostDataToken(
                    "api/clients/fizcreate",
                    formData
                );
            } else {
                // For legal entities, use FormData and post to yurcreate endpoint
                const formData = new FormData();
                formData.append("file", selectedFile!);

                // Create data object and append as JSON string
                const legalPayload = payload as LegalEntityClientData;
                const data = {
                    client_type: legalPayload.client_type,
                    client_name: legalPayload.client_name,
                    business_name: legalPayload.business_name,
                    phone_number: legalPayload.phone_number,
                    bank_account: legalPayload.bank_account,
                    bank_address: legalPayload.bank_address,
                    inn: legalPayload.inn,
                    mfo: legalPayload.mfo,
                    oked: legalPayload.oked,
                    business_address: legalPayload.business_address,
                    // client_address: legalPayload.client_address, // Commented out - not needed for legal entities
                    // passport_series: legalPayload.passport_series, // Commented out - not needed for legal entities
                    // passport_given_by: legalPayload.passport_given_by, // Commented out - not needed for legal entities
                    // passport_given_date: legalPayload.passport_given_date, // Commented out - not needed for legal entities
                };
                formData.append("data", JSON.stringify(data));

                response = await PostDataToken(
                    "api/clients/yurcreate",
                    formData
                );
            }

            if (response?.status === 200 || response?.data?.success) {
                resetForms();
                changeStatus();
                onClose();
                // Toast faqat backend dan response kelganda
                toast.success("Клиент успешно добавлен!");
            } else {
                // Toast faqat backend dan response kelganda
                setFormError("Что-то пошло не так при добавлении клиента");
            }
        } catch (error: any) {
            console.error("Ошибка:", error);
            const errorMessage =
                error?.response?.data?.error || "Что-то пошло не так";
            setResponse(errorMessage);
            // Toast faqat backend dan response kelganda
            setFormError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForms = () => {
        setIndividualData({
            client_name: "",
            client_address: "",
            passport_series: "",
            passport_given_by: "",
            passport_given_date: "",
            phone_number: "",
            pinfl: "",
        });

        setLegalData({
            client_name: "",
            business_name: "",
            phone_number: "",
            bank_account: "",
            bank_address: "",
            inn: "",
            mfo: "",
            oked: "",
            business_address: "",
            // client_address: "", // Commented out - not needed for legal entities
            // passport_series: "", // Commented out - not needed for legal entities
            // passport_given_by: "", // Commented out - not needed for legal entities
            // passport_given_date: "", // Commented out - not needed for legal entities
        });

        setSelectedFile(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-[900px] max-h-[90vh] p-6 lg:p-10"
        >
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Добавить клиента
            </h2>

            {formError && (
                <div className="mb-4 p-3 rounded-md border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                    {formError}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab("individual")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === "individual"
                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                >
                    Физическое лицо
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("legal")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === "legal"
                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                >
                    Юридическое лицо
                </button>
            </div>

            {/* Individual Client Form */}
            {activeTab === "individual" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                    <div>
                        <Label htmlFor="clientName">Ф.И.О клиента *</Label>
                        <Input
                            type="text"
                            id="clientName"
                            placeholder="Ф.И.О клиента"
                            value={individualData.client_name}
                            onChange={(e) =>
                                handleIndividualInputChange(
                                    "client_name",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="clientAddress">Адрес клиента *</Label>
                        <Input
                            type="text"
                            id="clientAddress"
                            placeholder="Адрес клиента"
                            value={individualData.client_address}
                            onChange={(e) =>
                                handleIndividualInputChange(
                                    "client_address",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="passportSeries">Серия паспорта *</Label>
                        <Input
                            type="text"
                            id="passportSeries"
                            placeholder="AA1234567"
                            value={individualData.passport_series}
                            onChange={(e) =>
                                handleIndividualInputChange(
                                    "passport_series",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="passportGivenBy">
                            Кем выдан паспорт *
                        </Label>
                        <Input
                            type="text"
                            id="passportGivenBy"
                            placeholder="Buxoro viloyati Buxoro shahar IIB"
                            value={individualData.passport_given_by}
                            onChange={(e) =>
                                handleIndividualInputChange(
                                    "passport_given_by",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="passportGivenDate">
                            Дата выдачи паспорта *
                        </Label>
                        <Input
                            type="date"
                            id="passportGivenDate"
                            value={individualData.passport_given_date}
                            onChange={(e) =>
                                handleIndividualInputChange(
                                    "passport_given_date",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="phoneNumber">Номер телефона *</Label>
                        <Input
                            type="text"
                            id="phoneNumber"
                            placeholder="+998931234567"
                            value={individualData.phone_number}
                            onChange={(e) =>
                                handleIndividualInputChange(
                                    "phone_number",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="pinfl">ПИНФЛ *</Label>
                        <Input
                            type="text"
                            id="pinfl"
                            placeholder="12345678901234"
                            value={individualData.pinfl}
                            onChange={(e) =>
                                handleIndividualInputChange(
                                    "pinfl",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="fileUpload">Файл *</Label>
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {selectedFile && (
                            <p className="text-sm text-green-600 mt-1">
                                Файл выбран: {selectedFile.name}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Legal Entity Client Form */}
            {activeTab === "legal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                    <div>
                        <Label htmlFor="legalClientName">Ф.И.О клиента *</Label>
                        <Input
                            type="text"
                            id="legalClientName"
                            placeholder="Ф.И.О клиента"
                            value={legalData.client_name}
                            onChange={(e) =>
                                handleLegalInputChange(
                                    "client_name",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalPhoneNumber">
                            Номер телефона *
                        </Label>
                        <Input
                            type="text"
                            id="legalPhoneNumber"
                            placeholder="+998931234567"
                            value={legalData.phone_number}
                            onChange={(e) =>
                                handleLegalInputChange(
                                    "phone_number",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalBusinessName">
                            Название компании *
                        </Label>
                        <Input
                            type="text"
                            id="legalBusinessName"
                            placeholder="Название компании"
                            value={legalData.business_name}
                            onChange={(e) =>
                                handleLegalInputChange(
                                    "business_name",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalBusinessAddress">
                            Адрес компании *
                        </Label>
                        <Input
                            type="text"
                            id="legalBusinessAddress"
                            placeholder="Адрес компании"
                            value={legalData.business_address}
                            onChange={(e) =>
                                handleLegalInputChange(
                                    "business_address",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalBankAccount">
                            Банковский счет *
                        </Label>
                        <Input
                            type="text"
                            id="legalBankAccount"
                            placeholder="Банковский счет"
                            value={legalData.bank_account}
                            onChange={(e) =>
                                handleLegalInputChange(
                                    "bank_account",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalBankAddress">Адрес банка *</Label>
                        <Input
                            type="text"
                            id="legalBankAddress"
                            placeholder="Адрес банка"
                            value={legalData.bank_address}
                            onChange={(e) =>
                                handleLegalInputChange(
                                    "bank_address",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalInn">ИНН *</Label>
                        <Input
                            type="text"
                            id="legalInn"
                            placeholder="ИНН"
                            value={legalData.inn}
                            onChange={(e) =>
                                handleLegalInputChange("inn", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalMfo">МФО *</Label>
                        <Input
                            type="text"
                            id="legalMfo"
                            placeholder="МФО"
                            value={legalData.mfo}
                            onChange={(e) =>
                                handleLegalInputChange("mfo", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="legalOked">ОКЕД *</Label>
                        <Input
                            type="text"
                            id="legalOked"
                            placeholder="ОКЕД"
                            value={legalData.oked}
                            onChange={(e) =>
                                handleLegalInputChange("oked", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="fileUpload">Файл *</Label>
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {selectedFile && (
                            <p className="text-sm text-green-600 mt-1">
                                Файл выбран: {selectedFile.name}
                            </p>
                        )}
                    </div>
                    {/*
                    // Commented out - not needed for legal entities:
                    // - Адрес клиента (client_address)
                    // - Серия паспорта (passport_series)
                    // - Кем выдан паспорт (passport_given_by)
                    // - Дата выдачи паспорта (passport_given_date)
                    */}
                </div>
            )}

            <div className="flex justify-end gap-2 pt-6">
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md text-white transition-colors ${
                        isLoading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Сохранение...
                        </div>
                    ) : (
                        "Сохранить"
                    )}
                </button>
            </div>
        </Modal>
    );
};

export default AddClientModal;
