import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, User, Stethoscope, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(loginData.email, loginData.password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(registerData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleFields = () => {
    const { role } = registerData;

    if (role === "doctor") {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              name="specialty"
              placeholder="e.g., Cardiology"
              value={registerData.specialty || ""}
              onChange={handleRegisterChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              placeholder="License Number"
              value={registerData.licenseNumber || ""}
              onChange={handleRegisterChange}
            />
          </div>
        </div>
      );
    }

    if (role === "patient") {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={registerData.dateOfBirth || ""}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={registerData.gender || ""}
                onValueChange={(value) => setRegisterData({ ...registerData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={registerData.phone || ""}
              onChange={handleRegisterChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Address"
              value={registerData.address || ""}
              onChange={handleRegisterChange}
            />
          </div>
        </>
      );
    }

    if (role === "diagnostic_center") {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="centerName">Diagnostic Center Name</Label>
            <Input
              id="centerName"
              name="centerName"
              placeholder="Diagnostic Center Name"
              value={registerData.centerName || ""}
              onChange={handleRegisterChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="centerLicense">Center License Number</Label>
            <Input
              id="centerLicense"
              name="centerLicense"
              placeholder="Center License Number"
              value={registerData.centerLicense || ""}
              onChange={handleRegisterChange}
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* left div - only visible on lg screens */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-300 items-center justify-center flex-col text-white p-8">
        <div className="max-w-md text-center">
          <img
            className="h-[250px] w-[200px] object-cover mx-auto mb-6 rounded-lg shadow-lg"
            src="https://i.pinimg.com/originals/2a/35/b1/2a35b15e65c10785fb21d0f7a63e1a72.jpg"
            alt="Healthcare"
          />
          <h1 className="text-4xl font-bold mb-4">
            Health<span className="text-3xl">Care</span> Toolkit
          </h1>
          <p className="text-white/90">
            The HealthCare Toolkit software serves as the foundational API and
            data model for Health IT applications
          </p>
        </div>
      </div>

      {/* right div */}
      <div className="w-full lg:w-1/2 min-h-screen overflow-y-auto bg-gray-50">
        <nav className="flex justify-end gap-4 h-16 items-center text-xl font-bold px-8">
          <p className="text-gray-600">Help</p>
          {!isRegistering && (
            <Button
              variant="outline"
              onClick={() => setIsRegistering(true)}
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            >
              Register
            </Button>
          )}
        </nav>

        <div className="flex justify-center items-center mx-auto mt-8 lg:mt-[60px] px-4 pb-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isRegistering
                  ? "Fill in your details to register"
                  : "Login to your account to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {isRegistering ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Full Name"
                        className="pl-10"
                        value={registerData.fullName}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        name="username"
                        placeholder="Username"
                        className="pl-10"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(value: UserRole) => setRegisterData({ ...registerData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Patient
                          </div>
                        </SelectItem>
                        <SelectItem value="doctor">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Doctor
                          </div>
                        </SelectItem>
                        <SelectItem value="diagnostic_center">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Diagnostic Center
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {renderRoleFields()}

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>

                  <p className="text-sm text-center text-gray-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        setError("");
                      }}
                      className="text-orange-500 hover:underline font-medium"
                    >
                      Login
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="loginEmail"
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="loginPassword"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>

                  <p className="text-sm text-center text-gray-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(true);
                        setError("");
                      }}
                      className="text-orange-500 hover:underline font-medium"
                    >
                      Register
                    </button>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;