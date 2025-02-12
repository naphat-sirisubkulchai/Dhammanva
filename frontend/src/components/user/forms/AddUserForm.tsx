import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  isValueExist,
  isLengthEnough,
  isValidEmail,
  handleEnterKeyPress,
} from "../../../functions";
import { PASSWORD_REQUIRED_LENGTH, Role } from "../../../constant";
interface FormProps {
  submit: (
    username: string,
    email: string,
    password: string,
    role: string
  ) => void;
  closeModal: () => void;
  usernameError: boolean;
  emailError: boolean;
}

export default function AddUserForm({
  submit,
  usernameError,
  emailError,
  closeModal,
}: FormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [tempCredential, setTempCredential] = useState({
    username: "",
    password: "",
    email: "",
    selectedRole: Role.USER,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitCount, SetsubmitCount] = useState(0);
  const verifyChangeCredential =
    tempCredential.username != username ||
    tempCredential.password != password ||
    tempCredential.email != email;

  const isUsernameInvalid =
    (submitCount > 0 && !isValueExist(username)) ||
    (usernameError && !verifyChangeCredential);

  const userNameErrorMessage = usernameError
    ? "ชื่อผู้ใช้งานนี้มีผู้ใช้งานแล้ว"
    : "กรุณากรอกชื่อผู้ใช้งาน";

  const isEmailInvalid =
    (submitCount > 0 && !isValidEmail(email)) ||
    (emailError && !verifyChangeCredential);
  const emailErrorMessage = emailError
    ? "อีเมลนี้มีผู้ใช้งานแล้ว"
    : "อีเมลไม่ถูกต้อง";

  const isPasswordInValid =
    submitCount > 0 &&
    (!isValueExist(password) ||
      !isLengthEnough(password, PASSWORD_REQUIRED_LENGTH));

  const isConfirmPasswordInvalid =
    submitCount > 0 && password !== confirmPassword;

  const passwordErrorMessage = "รหัสผ่านต้องมีความยาวมากกว่า 8 ตัวอักษร";

  const [selectedRole, setSelectedRole] = useState(Role.USER);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const submitForm = () => {
    SetsubmitCount(submitCount + 1);
    if (
      isUsernameInvalid ||
      isPasswordInValid ||
      isConfirmPasswordInvalid ||
      isEmailInvalid ||
      !isValueExist(username) ||
      !isLengthEnough(password, PASSWORD_REQUIRED_LENGTH) ||
      !isValidEmail(email) ||
      !isValueExist(confirmPassword)
    ) {
      return;
    }
    submit(username, email, password, selectedRole);
    setTempCredential({
      username: username,
      password: password,
      email: email,
      selectedRole: selectedRole,
    });
  };

  return (
    <Box p={8} w="full">
      <Stack spacing={2} w="full">
        <FormControl id="username" isRequired isInvalid={isUsernameInvalid}>
          <FormLabel fontWeight={"light"}>ชื่อผู้ใช้งาน</FormLabel>
          <Input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            variant={"authen_field"}
            onKeyDown={handleEnterKeyPress(submitForm)}
          />
          <FormErrorMessage>{userNameErrorMessage}</FormErrorMessage>
        </FormControl>

        <FormControl id="email" isRequired isInvalid={isEmailInvalid}>
          <FormLabel fontWeight={"light"}>อีเมล</FormLabel>
          <Input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            variant={"authen_field"}
            onKeyDown={handleEnterKeyPress(submitForm)}
          />
          <FormErrorMessage>{emailErrorMessage}</FormErrorMessage>
        </FormControl>

        <FormControl id="password" isRequired isInvalid={isPasswordInValid}>
          <FormLabel fontWeight={"light"}>รหัสผ่าน</FormLabel>
          <InputGroup>
            <Input
              pr="3rem"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              variant={"authen_field"}
              onKeyDown={handleEnterKeyPress(submitForm)}
            />

            <InputRightElement width="3rem">
              <IconButton
                size="sm"
                h="1.75rem"
                aria-label="View/Hide password"
                onClick={() => setShowPassword(!showPassword)}
                icon={showPassword ? <ViewIcon /> : <ViewOffIcon />}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{passwordErrorMessage}</FormErrorMessage>
        </FormControl>

        <FormControl
          id="confirm-password"
          isRequired
          isInvalid={isConfirmPasswordInvalid || isPasswordInValid}
        >
          <FormLabel fontWeight={"light"}>ยืนยันรหัสผ่าน</FormLabel>
          <InputGroup>
            <Input
              pr="3rem"
              type={showConfirmPassword ? "text" : "password"}
              onChange={() => setConfirmPassword(password)}
              variant={"authen_field"}
              onKeyDown={handleEnterKeyPress(submitForm)}
            />

            <InputRightElement width="3rem">
              <IconButton
                size="sm"
                h="1.75rem"
                aria-label="View/Hide password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                icon={showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>
            {isConfirmPasswordInvalid
              ? "รหัสผ่านไม่ตรงกัน"
              : "กรุณากรอกรหัสผ่าน"}
          </FormErrorMessage>
        </FormControl>

        <FormControl id="role" isRequired>
          <FormLabel fontWeight={"light"}>ชนิดของผู้ใช้</FormLabel>
          <Select
            placeholder="Role"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            <option value={Role.USER}>User</option>
            <option value={Role.ADMIN}>Admin</option>
          </Select>
        </FormControl>

        <Flex justify={"flex-end"} gap={2} pt={4}>
          <Button variant="cancel" onClick={closeModal}>
            ยกเลิก
          </Button>
          <Button variant="success" onClick={submitForm}>
            ยืนยัน
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}
