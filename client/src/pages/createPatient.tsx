import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

const CreatePatient = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
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
    },
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        height: data.height ? parseFloat(data.height) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        emergencyContact: data.emergencyContactName
          ? {
              name: data.emergencyContactName,
              relationship: data.emergencyContactRelationship,
              phone: data.emergencyContactPhone,
            }
          : undefined,
      };

      console.log("submitted data: ", payload)
      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create patient");
      }

      const result = await response.json();
      setSuccess(true);
      setTimeout(() => {
        navigate(`/patient/${result.data.patient._id}`);
      }, 1500);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Patient</CardTitle>
          <CardDescription>Enter patient details to create a new record</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {serverError}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">
                Patient created successfully! Redirecting to patient dashboard...
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={errors.dateOfBirth ? "border-destructive" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={watch("gender") || ""}
                    onValueChange={(value: string | null) => value && setValue("gender", value)}
                  >
                    <SelectTrigger id="gender" className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-destructive">{errors.gender.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email address"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Physical Measurements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Physical Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    {...register("height")}
                    placeholder="Enter height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    {...register("weight")}
                    placeholder="Enter weight"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    {...register("emergencyContactName")}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    {...register("emergencyContactRelationship")}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    {...register("emergencyContactPhone")}
                    placeholder="Enter phone"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link to="/" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted hover:text-foreground h-8 gap-1.5">
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Patient"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePatient;
