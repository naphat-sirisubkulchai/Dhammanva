import axios from '../axiosInstance';
import { CreateCustomError, ReturnError } from "../error";
import { LoginDTO } from "../../models/user";
import { ToastStatus, ERR_Messages } from "../../constant";
import { authURL } from '../../constant/serviceURL';
/**
 * Authenticates a user by sending a login request to the server.
 *
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<any>} - A promise that resolves with the response data from the server.
 */
export const loginService = async (loginDTO: LoginDTO) => {
  try {
    const response = await axios.post(`${authURL}/login`, {
      username: loginDTO.username,
      password: loginDTO.password,
    });
    axios.defaults.headers.common["Authorization"] = `${response.data.token}`;
    return response.data;
  } catch (error: unknown) {
    const requestError = CreateCustomError(error);
    let returnError: ReturnError;
    if (requestError.status == 400) {
      returnError = {
        message: ERR_Messages.FILL_ALL_FIELDS,
        status: 400,
        toastStatus: ToastStatus.ERROR,
      };
    } else if (requestError.status === 401) {
      returnError = {
        message: ERR_Messages.INVALID_USERNAME_OR_PASSWORD,
        status: 401,
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
