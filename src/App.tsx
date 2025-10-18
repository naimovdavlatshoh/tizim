import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserList from "./pages/Users/UserList";
import { Toaster } from "react-hot-toast";
import ClientList from "./pages/Clients/ClientList";
import Debtors from "./pages/Debtors/Debtors";
import ContractList from "./pages/Contracts/ContractList";
import ContractDetails from "./pages/Contracts/ContractDetails";
import ContractDetailPage from "./pages/Contracts/ContractDetailPage";
import AddContract from "./pages/Contracts/AddContract";
import PaymentList from "./pages/Payments/PaymentList";
import ExpenseCategoryList from "./pages/ExpenseCategories/ExpenseCategoryList";
import ExpenseList from "./pages/Expenses";
import FaceIdList from "./pages/FaceId";
import { SearchProvider } from "./context/SearchContext";
import NewContracts from "./pages/Director/NewContracts/NewContracts";
import NewContractDetail from "./pages/Director/NewContracts/Detail";
import PendingContracts from "./pages/Director/PendingContracts/PendingContracts";
import PendingContractDetail from "./pages/Director/PendingContracts/Detail";
import CompletedContracts from "./pages/Director/CompletedContracts/CompletedContracts";
import CompletedContractDetail from "./pages/Director/CompletedContracts/Detail";
import MyContracts from "./pages/Labarant/MyContracts";
import MyContractDetail from "./pages/Labarant/Detail";
import Reports from "./pages/Labarant/Reports";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (for auth pages)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default function App() {
    return (
        <>
            <SearchProvider>
                <Router>
                    <ScrollToTop />
                    <Routes>
                        {/* Dashboard Layout - Protected Routes */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index path="/" element={<Home />} />

                            {/* Others Page */}
                            <Route path="/profile" element={<UserProfiles />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/blank" element={<Blank />} />

                            {/* Forms */}
                            <Route
                                path="/form-elements"
                                element={<FormElements />}
                            />

                            {/* Tables */}
                            <Route
                                path="/basic-tables"
                                element={<BasicTables />}
                            />
                            <Route path="/users" element={<UserList />} />
                            <Route path="/clients" element={<ClientList />} />
                            <Route path="/debtors" element={<Debtors />} />
                            <Route
                                path="/contracts"
                                element={<ContractList />}
                            />
                            <Route
                                path="/contracts/add"
                                element={<AddContract />}
                            />
                            <Route
                                path="/contract-details/:id"
                                element={<ContractDetails />}
                            />
                            <Route
                                path="/contracts/detail/:id"
                                element={<ContractDetailPage />}
                            />
                            <Route
                                path="/new-contracts"
                                element={<NewContracts />}
                            />
                            <Route
                                path="/new-contracts/:id"
                                element={<NewContractDetail />}
                            />
                            <Route
                                path="/pending-contracts"
                                element={<PendingContracts />}
                            />
                            <Route
                                path="/pending-contracts/:id"
                                element={<PendingContractDetail />}
                            />
                            <Route
                                path="/completed-contracts"
                                element={<CompletedContracts />}
                            />
                            <Route
                                path="/completed-contracts/:id"
                                element={<CompletedContractDetail />}
                            />
                            <Route
                                path="/my-contracts"
                                element={<MyContracts />}
                            />
                            <Route
                                path="/my-contracts/:id"
                                element={<MyContractDetail />}
                            />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/payments" element={<PaymentList />} />
                            <Route
                                path="/expense-categories"
                                element={<ExpenseCategoryList />}
                            />
                            <Route path="/expenses" element={<ExpenseList />} />
                            <Route path="/face-id" element={<FaceIdList />} />

                            {/* Ui Elements */}
                            <Route path="/alerts" element={<Alerts />} />
                            <Route path="/avatars" element={<Avatars />} />
                            <Route path="/badge" element={<Badges />} />
                            <Route path="/buttons" element={<Buttons />} />
                            <Route path="/images" element={<Images />} />
                            <Route path="/videos" element={<Videos />} />

                            {/* Charts */}
                            <Route path="/line-chart" element={<LineChart />} />
                            <Route path="/bar-chart" element={<BarChart />} />
                        </Route>

                        {/* Auth Layout - Public Routes */}
                        <Route
                            path="/signin"
                            element={
                                <PublicRoute>
                                    <SignIn />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <PublicRoute>
                                    <SignUp />
                                </PublicRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster position="bottom-right" reverseOrder={false} />
                </Router>
            </SearchProvider>
        </>
    );
}
