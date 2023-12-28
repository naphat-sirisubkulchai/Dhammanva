import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SearchMiddleware } from "./pages/Search";
import {
  ForgetPasswordPage,
  UserMiddleware,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  ChangePasswordPage,
} from "./pages/User";
import {
  PendingRequestPage,
  EditRecordPage
} from "./pages/Contributor";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchMiddleware />} />
        <Route path="/user/">
          <Route path="" element={<UserMiddleware />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forget-password" element={<ForgetPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
        <Route path="/contributor/">
          <Route path="pending-request" element={<PendingRequestPage />} />
          <Route path="edit-record/:recordID" element={<EditRecordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
