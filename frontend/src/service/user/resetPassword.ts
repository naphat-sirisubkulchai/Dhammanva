import axios from "axios";
import { ERR_Messages, ToastStatus } from "../../constant";
import { CreateCustomError, ReturnError } from "../error";

export const verifyResetPasswordToken = async (token: string) => {
  try {
    //TODO : Test the environment mode
    const apiUrl =
      import.meta.env.MODE === "production"
        ? import.meta.env.VITE_AUTH_API_URL
        : "http://localhost:8082";
    const response = await axios.get(`${apiUrl}/verify-reset-token/${token}`);
    return response.data;
  } catch (error: unknown) {
    const requestError = CreateCustomError(error);
    let returnError: ReturnError;
    if (requestError.status === 404) {
      returnError = {
        message: ERR_Messages.NOT_FOUND_TOKEN,
        status: 404,
        toastStatus: ToastStatus.ERROR,
      };
    } else {
      returnError = {
        message: ERR_Messages.SYSTEM_ERROR,
        status: 500,
        toastStatus: ToastStatus.ERROR,
      };
    }
    throw returnError;
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    //TODO : Test the environment mode
    const apiUrl =
      import.meta.env.MODE === "production"
        ? import.meta.env.VITE_AUTH_API_URL
        : "http://localhost:8082";
    const response = await axios.post(`${apiUrl}/reset-password`, {
      token: token,
      password: password,
    });
    return response.data;
  } catch (error: unknown) {
    const requestError = CreateCustomError(error);
    let returnError: ReturnError;
    if (requestError.status == 400) {
      returnError = {
        message: ERR_Messages.INVALID_PASSWORD_FORMAT,
        status: 400,
        toastStatus: ToastStatus.ERROR,
      };
    } else if (requestError.status === 401) {
      returnError = {
        message: ERR_Messages.NOT_FOUND_TOKEN,
        status: 401,
        toastStatus: ToastStatus.ERROR,
      };
    }  else {
      returnError = {
        message: ERR_Messages.SYSTEM_ERROR,
        status: 500,
        toastStatus: ToastStatus.ERROR,
      };
    }
    throw returnError;
  }
};
