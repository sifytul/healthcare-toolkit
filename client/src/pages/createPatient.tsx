import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/shared/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";


const API_URL = "http://localhost:7000/api/v1/patients";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;


const initialFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  height: "",
  weight: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
};

const CreatePatient = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("")


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialFormData,
  });


  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const onSubmit = async (formData: PatientFormData) => {
    setIsSubmitting(true);
    setServerError("")

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        emergencyContact: formData.emergencyContactName
          ? {
              name: formData.emergencyContactName,
              relationship: formData.emergencyContactRelationship,
              phone: formData.emergencyContactPhone,
            }
          : undefined,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create patient");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/search-patient/patient-dashboard/${data.data.patient.patientId}`);
      }, 1500);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Patient</h2>

      {serverError && (
        <div className="mb-4 w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {serverError}
        </div>
      )}

      {success && (
        <div className="mb-4 w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Patient created successfully! Redirecting to patient dashboard...
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClassName}>
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                {...register("firstName")}
                className={inputClassName}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClassName}>
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                {...register("lastName")}
                className={inputClassName}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="dateOfBirth" className={labelClassName}>
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                {...register("dateOfBirth")}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="gender" className={labelClassName}>
                Gender *
              </label>
              <select
                id="gender"
                {...register("gender")}
                className={inputClassName}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelClassName}>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                {...register("phone")}
                className={inputClassName}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClassName}>
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={inputClassName}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="address" className={labelClassName}>
              Address
            </label>
            <textarea
              id="address"
              {...register("address")}
              rows={2}
              className={inputClassName}
              placeholder="Enter address"
            />
          </div>
        </div>

        {/* Physical Measurements */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Physical Measurements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="height" className={labelClassName}>
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                {...register("height")}
                className={inputClassName}
                placeholder="Enter height in cm"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="weight" className={labelClassName}>
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                {...register("weight")}
                className={inputClassName}
                placeholder="Enter weight in kg"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="emergencyContactName" className={labelClassName}>
                Contact Name
              </label>
              <input
                type="text"
                id="emergencyContactName"
                {...register("emergencyContactName")}
                className={inputClassName}
                placeholder="Enter name"
              />
            </div>
            <div>
              <label htmlFor="emergencyContactRelationship" className={labelClassName}>
                Relationship
              </label>
              <input
                type="text"
                id="emergencyContactRelationship"
                {...register("emergencyContactRelationship")}
                className={inputClassName}
                placeholder="e.g., Spouse, Parent"
              />
            </div>
            <div>
              <label htmlFor="emergencyContactPhone" className={labelClassName}>
                Phone
              </label>
              <input
                type="tel"
                id="emergencyContactPhone"
                {...register("emergencyContactPhone")}
                className={inputClassName}
                placeholder="Enter phone"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            text="Cancel"
            varientColor="secondary"
          />
          <Button
            type="submit"
            text={isSubmitting ? "Creating..." : "Create Patient"}
            varientColor="primary"
          />
        </div>
      </form>
    </div>
  );
};

export default CreatePatient;