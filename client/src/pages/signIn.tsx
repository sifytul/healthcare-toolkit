import { ChangeEvent, FormEvent, useState } from "react";
import { BsFillPersonFill, CgKey, BsFillEnvelopeFill } from "../assets/icons/react-icons";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

import Button from "../components/shared/Button";
import Input from "../components/shared/Input";

type UserRole = "doctor" | "patient" | "diagnostic_center";

interface FormData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  role: UserRole;
  specialty?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  centerName?: string;
  centerLicense?: string;
}

const initialLogin = {
  email: "",
  password: "",
};

const initialRegister: FormData = {
  email: "",
  password: "",
  fullName: "",
  username: "",
  role: "patient",
};

const SignIn = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginData, setLoginData] = useState(initialLogin);
  const [registerData, setRegisterData] = useState<FormData>(initialRegister);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(loginData.email, loginData.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(registerData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleFields = () => {
    const { role } = registerData;

    if (role === "doctor") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="specialty"
              placeholder="Specialty (e.g., Cardiology)"
              value={registerData.specialty || ""}
              changeHandler={handleRegisterChange}
            />
            <Input
              name="licenseNumber"
              placeholder="License Number"
              value={registerData.licenseNumber || ""}
              changeHandler={handleRegisterChange}
            />
          </div>
        </>
      );
    }

    if (role === "patient") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="dateOfBirth"
              type="date"
              placeholder="Date of Birth"
              value={registerData.dateOfBirth || ""}
              changeHandler={handleRegisterChange}
            />
            <div className="flex items-center">
              <select
                name="gender"
                value={registerData.gender || ""}
                onChange={handleRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Input
            name="phone"
            placeholder="Phone Number"
            value={registerData.phone || ""}
            changeHandler={handleRegisterChange}
          />
          <Input
            name="address"
            placeholder="Address"
            value={registerData.address || ""}
            changeHandler={handleRegisterChange}
          />
        </>
      );
    }

    if (role === "diagnostic_center") {
      return (
        <>
          <Input
            name="centerName"
            placeholder="Diagnostic Center Name"
            value={registerData.centerName || ""}
            changeHandler={handleRegisterChange}
          />
          <Input
            name="centerLicense"
            placeholder="Center License Number"
            value={registerData.centerLicense || ""}
            changeHandler={handleRegisterChange}
          />
        </>
      );
    }

    return null;
  };

  return (
    <div className="max-w-screen-2xl mx-auto flex">
      {/* left div  */}
      <div className="h-screen bg-gradient-to-br from-[#F59130] to-[#FFBB78] flex items-center justify-center flex-col text-white p-8 hidden lg:flex">
        <img
          className="h-[250px] w-[200px] object-cover"
          src="https://i.pinimg.com/originals/2a/35/b1/2a35b15e65c10785fb21d0f7a63e1a72.jpg"
          alt="Healthcare"
        />
        <h1 className="m-0">
          HealthCARE
          <span className="text-3xl"> Toolkit</span>
        </h1>
        <p className="text-white/90 text-center max-w-md">
          The HealthCare Toolkit software serves as the foundational API and
          data model for Health IT applications
        </p>
      </div>

      {/* right div  */}
      <div className="w-full lg:w-3/4 h-screen overflow-y-auto">
        <nav className="flex justify-end gap-4 h-16 items-center text-xl font-bold px-8">
          <p className="text-gray-600">Help</p>
          {!isRegistering && (
            <button
              onClick={() => setIsRegistering(true)}
              className="text-primary px-4 py-2 border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
            >
              Register
            </button>
          )}
        </nav>

        <div className="flex justify-center items-center flex-col mx-auto mt-8 lg:mt-[60px] text-center w-full px-4 lg:w-1/2 space-y-6 pb-8">
          <div>
            <h2>HealthCare</h2>
            <h3 className="text-2xl text-gray-600">
              {isRegistering ? "Create Account" : "Welcome to HealthCare Toolkit"}
            </h3>
            <p className="font-extralight text-sm text-gray-500">
              {isRegistering
                ? "Fill in your details to register"
                : "Login to proceed"}
            </p>
          </div>

          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {isRegistering ? (
            <form
              onSubmit={handleRegisterSubmit}
              className="flex flex-col w-full space-y-3"
            >
              <Input
                name="fullName"
                placeholder="Full Name"
                Icon={BsFillPersonFill}
                value={registerData.fullName}
                changeHandler={handleRegisterChange}
                required
              />
              <Input
                name="username"
                placeholder="Username"
                Icon={BsFillPersonFill}
                value={registerData.username}
                changeHandler={handleRegisterChange}
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                Icon={BsFillEnvelopeFill}
                value={registerData.email}
                changeHandler={handleRegisterChange}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                passwordField
                Icon={CgKey}
                value={registerData.password}
                changeHandler={handleRegisterChange}
                required
              />

              <div className="flex items-center">
                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="diagnostic_center">Diagnostic Center</option>
                </select>
              </div>

              {renderRoleFields()}

              <Button
                text={isSubmitting ? "Registering..." : "REGISTER"}
                type="submit"
                varientColor="primary"
                disabled={isSubmitting}
              />

              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setIsRegistering(false);
                    setError("");
                  }}
                  className="text-primary underline cursor-pointer"
                >
                  Login
                </span>
              </p>
            </form>
          ) : (
            <form
              onSubmit={handleLoginSubmit}
              className="flex flex-col w-full space-y-3"
            >
              <Input
                name="email"
                type="email"
                placeholder="Email"
                Icon={BsFillEnvelopeFill}
                value={loginData.email}
                changeHandler={handleLoginChange}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                passwordField
                Icon={CgKey}
                value={loginData.password}
                changeHandler={handleLoginChange}
                required
              />

              <Button
                text={isSubmitting ? "Logging in..." : "LOGIN"}
                type="submit"
                varientColor="primary"
                disabled={isSubmitting}
              />

              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <span
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                  }}
                  className="text-primary underline cursor-pointer"
                >
                  Register
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;