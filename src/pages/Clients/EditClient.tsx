import React, { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { PostDataTokenJson, PostDataToken } from "../../service/data";
import { toast } from "react-hot-toast";

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
    pinfl?: string;
    firstname?: string;
    lastname?: string;
    fathername?: string;
    login?: string;
    role_id?: number;
    role_name?: string;
    created_at?: string;
}

interface EditClientModalProps {
    client: Users | null;
    isOpen: boolean;
    onClose: () => void;
    changeStatus: () => void;
    setResponse: (value: string) => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({
    isOpen,
    onClose,
    changeStatus,
    setResponse,
    client,
}) => {
    const [clientName, setClientName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankAddress, setBankAddress] = useState("");
    const [inn, setInn] = useState("");
    const [mfo, setMfo] = useState("");
    const [oked, setOked] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [passportSeries, setPassportSeries] = useState("");
    const [passportGivenBy, setPassportGivenBy] = useState("");
    const [passportGivenDate, setPassportGivenDate] = useState("");
    const [pinfl, setPinfl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Client ma'lumotlarini yuklash
    useEffect(() => {
        if (client) {
            setClientName(client?.client_name || "");
            setPhoneNumber(client?.phone_number || "");
            setBusinessName(client?.business_name || "");
            setBusinessAddress(client?.business_address || "");
            setBankAccount(client?.bank_account || "");
            setBankAddress(client?.bank_address || "");
            setInn(client?.inn || "");
            setMfo(client?.mfo || "");
            setOked(client?.oked || "");
            setClientAddress(client?.client_address || "");
            setPassportSeries(client?.passport_series || "");
            setPassportGivenBy(client?.passport_given_by || "");
            setPassportGivenDate(client?.passport_given_date || "");
            setPinfl(client?.pinfl || "");
        }
    }, [client]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = () => {
        if (!clientName || !phoneNumber) {
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        setIsLoading(true);

        const payload = {
            client_name: clientName,
            phone_number: phoneNumber,
            business_name: businessName || undefined,
            business_address: businessAddress || undefined,
            bank_account: bankAccount || undefined,
            bank_address: bankAddress || undefined,
            inn: inn || undefined,
            mfo: mfo || undefined,
            oked: oked || undefined,
            client_address: clientAddress || undefined,
            passport_series: passportSeries || undefined,
            passport_given_by: passportGivenBy || undefined,
            passport_given_date: passportGivenDate || undefined,
            pinfl: pinfl || undefined,
        };
        const payload2 = {
            client_name: clientName,
            phone_number: phoneNumber,
            business_name: businessName || undefined,
            business_address: businessAddress || undefined,
            bank_account: bankAccount || undefined,
            bank_address: bankAddress || undefined,
            inn: inn || undefined,
            mfo: mfo || undefined,
            oked: oked || undefined,
            // client_address: clientAddress || undefined,
            // passport_series: passportSeries || undefined,
            // passport_given_by: passportGivenBy || undefined,
            // passport_given_date: passportGivenDate || undefined,
        };

        // For individual clients with file upload, use FormData
        if (client?.client_type === 2 && selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("data", JSON.stringify(payload));

            PostDataToken(
                `api/clients/fizupdate/${client?.client_id}`,
                formData
            )
                .then((res: any) => {
                    if (res?.status === 200 || res?.success) {
                        changeStatus();
                        onClose();
                        console.log("Обновлено успешно");
                        toast.success("Клиент успешно обновлен!");
                    } else {
                        toast.error(
                            "Что-то пошло не так при обновлении клиента"
                        );
                    }
                })
                .catch((error: any) => {
                    onClose();
                    const errorMessage =
                        error?.response?.data?.error || "Что-то пошло не так";
                    setResponse(errorMessage);
                    toast.error(errorMessage);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            // For legal entities or individual clients without file, use JSON
            PostDataTokenJson(
                `api/clients/update/${client?.client_id}`,
                client?.client_type === 1 ? payload2 : payload
            )
                .then((res: any) => {
                    if (res?.status === 200 || res?.success) {
                        changeStatus();
                        onClose();
                        console.log("Обновлено успешно");
                        // Toast faqat backend dan response kelganda
                        toast.success("Клиент успешно обновлен!");
                    } else {
                        // Toast faqat backend dan response kelganda
                        toast.error(
                            "Что-то пошло не так при обновлении клиента"
                        );
                    }
                })
                .catch((error: any) => {
                    onClose();
                    const errorMessage =
                        error?.response?.data?.error || "Что-то пошло не так";
                    setResponse(errorMessage);
                    // console.log(error);

                    // Toast faqat backend dan response kelganda
                    toast.error(errorMessage);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[800px] p-6 lg:p-10"
        >
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Редактировать клиента
            </h2>
            {client && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <span className="font-medium">Тип клиента:</span>{" "}
                        {client.client_type === 1
                            ? "Юридическое лицо"
                            : "Физическое лицо"}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                <div>
                    <Label htmlFor="clientName">Ф.И.О клиента</Label>
                    <Input
                        type="text"
                        id="clientName"
                        placeholder="Ф.И.О клиента"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="phoneNumber">Номер телефона</Label>
                    <Input
                        type="text"
                        id="phoneNumber"
                        placeholder="Номер телефона"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                {/* Business fields - Юридическое лицо (client_type: 1) */}
                {client?.client_type === 1 && (
                    <>
                        <div>
                            <Label htmlFor="businessName">
                                Название компании
                            </Label>
                            <Input
                                type="text"
                                id="businessName"
                                placeholder="Название компании"
                                value={businessName}
                                onChange={(e) =>
                                    setBusinessName(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="businessAddress">
                                Адрес компании
                            </Label>
                            <Input
                                type="text"
                                id="businessAddress"
                                placeholder="Адрес компании"
                                value={businessAddress}
                                onChange={(e) =>
                                    setBusinessAddress(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="bankAccount">Банковский счет</Label>
                            <Input
                                type="text"
                                id="bankAccount"
                                placeholder="Банковский счет"
                                value={bankAccount}
                                onChange={(e) => setBankAccount(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="bankAddress">Адрес банка</Label>
                            <Input
                                type="text"
                                id="bankAddress"
                                placeholder="Адрес банка"
                                value={bankAddress}
                                onChange={(e) => setBankAddress(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="inn">ИНН</Label>
                            <Input
                                type="text"
                                id="inn"
                                placeholder="ИНН"
                                value={inn}
                                onChange={(e) => setInn(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="mfo">МФО</Label>
                            <Input
                                type="text"
                                id="mfo"
                                placeholder="МФО"
                                value={mfo}
                                onChange={(e) => setMfo(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="oked">ОКЭД</Label>
                            <Input
                                type="text"
                                id="oked"
                                placeholder="ОКЭД"
                                value={oked}
                                onChange={(e) => setOked(e.target.value)}
                            />
                        </div>
                        {/*
                        // Commented out - not needed for legal entities:
                        // - Адрес клиента (client_address)
                        // - Серия паспорта (passport_series)
                        // - Кем выдан паспорт (passport_given_by)
                        // - Дата выдачи паспорта (passport_given_date)
                        */}
                        <div className="md:col-span-2">
                            <Label htmlFor="file">Файл</Label>
                            <input
                                type="file"
                                id="file"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </>
                )}

                {/* Passport fields - Физическое лицо (client_type: 2) */}
                {client?.client_type === 2 && (
                    <>
                        <div>
                            <Label htmlFor="clientAddress">Адрес клиента</Label>
                            <Input
                                type="text"
                                id="clientAddress"
                                placeholder="Адрес клиента"
                                value={clientAddress}
                                onChange={(e) =>
                                    setClientAddress(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="passportSeries">
                                Серия паспорта
                            </Label>
                            <Input
                                type="text"
                                id="passportSeries"
                                placeholder="AA1234567"
                                value={passportSeries}
                                onChange={(e) =>
                                    setPassportSeries(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="passportGivenBy">
                                Кем выдан паспорт
                            </Label>
                            <Input
                                type="text"
                                id="passportGivenBy"
                                placeholder="Кем выдан паспорт"
                                value={passportGivenBy}
                                onChange={(e) =>
                                    setPassportGivenBy(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="passportGivenDate">
                                Дата выдачи паспорта
                            </Label>
                            <Input
                                type="date"
                                id="passportGivenDate"
                                value={passportGivenDate}
                                onChange={(e) =>
                                    setPassportGivenDate(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="pinfl">ПИНФЛ</Label>
                            <Input
                                type="text"
                                id="pinfl"
                                placeholder="12345678901234"
                                value={pinfl}
                                onChange={(e) => setPinfl(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="fileUpload">Файл</Label>
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
                    </>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-6">
                <button
                    type="button"
                    onClick={onClose}
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
                        "Сохранить изменения"
                    )}
                </button>
            </div>
        </Modal>
    );
};

export default EditClientModal;
