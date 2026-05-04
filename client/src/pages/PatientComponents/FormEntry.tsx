import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Search, Download, Eye, FlaskConical, Activity, Droplets, Heart, Moon } from "lucide-react";

const API_URL = "http://localhost:7000/api/v1/reports";

interface LabResultReport {
  _id: string;
  reportType: string;
  labResult?: {
    testType: string;
    testDate: string;
    cbc?: {
      rbc?: number;
      wbc?: number;
      platelet?: number;
      hb?: number;
      esr?: number;
      hct?: number;
      mcv?: number;
    };
    bloodSugar?: {
      fasting?: number;
      random?: number;
      postPrandial?: number;
      hba1c?: number;
    };
    lipidProfile?: {
      totalCholesterol?: number;
      ldl?: number;
      hdl?: number;
      triglycerides?: number;
      vldl?: number;
    };
    electrolytes?: {
      sodium?: number;
      potassium?: number;
      chloride?: number;
      bicarbonate?: number;
    };
    liverFunction?: {
      alt?: number;
      ast?: number;
      bilirubin?: number;
      albumin?: number;
    };
    kidneyFunction?: {
      creatinine?: number;
      bun?: number;
      egfr?: number;
    };
    labName?: string;
    reportFileUrl?: string;
  };
  createdAt: string;
  uploadedBy?: {
    fullName: string;
  };
}

const testTypes = [
  { value: "cbc", label: "Complete Blood Count (CBC)" },
  { value: "blood_sugar", label: "Blood Sugar" },
  { value: "lipid_profile", label: "Lipid Profile" },
  { value: "electrolytes", label: "Electrolytes" },
  { value: "liver_function", label: "Liver Function Test" },
  { value: "kidney_function", label: "Kidney Function Test" },
  { value: "full", label: "Full Lab Report" },
];

interface LabFormData {
  testType: string;
  testDate: string;
  labName: string;
  cbc: {
    rbc: string;
    wbc: string;
    platelet: string;
    hb: string;
    esr: string;
    hct: string;
    mcv: string;
  };
  bloodSugar: {
    fasting: string;
    random: string;
    postPrandial: string;
    hba1c: string;
  };
  lipidProfile: {
    totalCholesterol: string;
    ldl: string;
    hdl: string;
    triglycerides: string;
    vldl: string;
  };
  electrolytes: {
    sodium: string;
    potassium: string;
    chloride: string;
    bicarbonate: string;
  };
  liverFunction: {
    alt: string;
    ast: string;
    bilirubin: string;
    albumin: string;
  };
  kidneyFunction: {
    creatinine: string;
    bun: string;
    egfr: string;
  };
}

const initialFormData: LabFormData = {
  testType: "",
  testDate: "",
  labName: "",
  cbc: { rbc: "", wbc: "", platelet: "", hb: "", esr: "", hct: "", mcv: "" },
  bloodSugar: { fasting: "", random: "", postPrandial: "", hba1c: "" },
  lipidProfile: { totalCholesterol: "", ldl: "", hdl: "", triglycerides: "", vldl: "" },
  electrolytes: { sodium: "", potassium: "", chloride: "", bicarbonate: "" },
  liverFunction: { alt: "", ast: "", bilirubin: "", albumin: "" },
  kidneyFunction: { creatinine: "", bun: "", egfr: "" },
};

const FormEntry = () => {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<LabResultReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<LabResultReport | null>(null);
  const [activeTab, setActiveTab] = useState("cbc");
  const [formData, setFormData] = useState<LabFormData>(initialFormData);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    fetchReports();
  }, [id]);

  const fetchReports = async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/patient/${id}?reportType=lab_result`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch lab results");
      }

      const data = await response.json();
      setReports(data.data.reports || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: keyof LabFormData, field: string, value: string) => {
    if (section === "testType" || section === "testDate" || section === "labName") {
      setFormData({ ...formData, [field]: value });
    } else {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof Omit<LabFormData, "testType" | "testDate" | "labName">],
          [field]: value,
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Build the labResult object
    const labResult: Record<string, unknown> = {
      testType: formData.testType,
      testDate: formData.testDate,
      labName: formData.labName,
    };

    // Only include non-empty values
    const cbc = Object.entries(formData.cbc).reduce((acc, [key, value]) => {
      if (value) acc[key] = parseFloat(value);
      return acc;
    }, {} as Record<string, number>);
    if (Object.keys(cbc).length > 0) labResult.cbc = cbc;

    const bloodSugar = Object.entries(formData.bloodSugar).reduce((acc, [key, value]) => {
      if (value) acc[key] = parseFloat(value);
      return acc;
    }, {} as Record<string, number>);
    if (Object.keys(bloodSugar).length > 0) labResult.bloodSugar = bloodSugar;

    const lipidProfile = Object.entries(formData.lipidProfile).reduce((acc, [key, value]) => {
      if (value) acc[key] = parseFloat(value);
      return acc;
    }, {} as Record<string, number>);
    if (Object.keys(lipidProfile).length > 0) labResult.lipidProfile = lipidProfile;

    const electrolytes = Object.entries(formData.electrolytes).reduce((acc, [key, value]) => {
      if (value) acc[key] = parseFloat(value);
      return acc;
    }, {} as Record<string, number>);
    if (Object.keys(electrolytes).length > 0) labResult.electrolytes = electrolytes;

    const liverFunction = Object.entries(formData.liverFunction).reduce((acc, [key, value]) => {
      if (value) acc[key] = parseFloat(value);
      return acc;
    }, {} as Record<string, number>);
    if (Object.keys(liverFunction).length > 0) labResult.liverFunction = liverFunction;

    const kidneyFunction = Object.entries(formData.kidneyFunction).reduce((acc, [key, value]) => {
      if (value) acc[key] = parseFloat(value);
      return acc;
    }, {} as Record<string, number>);
    if (Object.keys(kidneyFunction).length > 0) labResult.kidneyFunction = kidneyFunction;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patient: id,
          reportType: "lab_result",
          labResult,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create lab result");
      }

      setIsDialogOpen(false);
      setFormData(initialFormData);
      fetchReports();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredReports = reports.filter((report) =>
    report.labResult?.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.labResult?.labName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCBCFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>RBC (million/μL)</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="4.5-6.0"
          value={formData.cbc.rbc}
          onChange={(e) => handleInputChange("cbc", "rbc", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>WBC (/μL)</Label>
        <Input
          type="number"
          placeholder="4000-11000"
          value={formData.cbc.wbc}
          onChange={(e) => handleInputChange("cbc", "wbc", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Platelet (/μL)</Label>
        <Input
          type="number"
          placeholder="150000-400000"
          value={formData.cbc.platelet}
          onChange={(e) => handleInputChange("cbc", "platelet", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Hemoglobin (g/dL)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="12-17"
          value={formData.cbc.hb}
          onChange={(e) => handleInputChange("cbc", "hb", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>ESR (mm/hr)</Label>
        <Input
          type="number"
          placeholder="0-20"
          value={formData.cbc.esr}
          onChange={(e) => handleInputChange("cbc", "esr", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>HCT (%)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="36-50"
          value={formData.cbc.hct}
          onChange={(e) => handleInputChange("cbc", "hct", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>MCV (fL)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="80-100"
          value={formData.cbc.mcv}
          onChange={(e) => handleInputChange("cbc", "mcv", e.target.value)}
        />
      </div>
    </div>
  );

  const renderBloodSugarFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Fasting (mg/dL)</Label>
        <Input
          type="number"
          placeholder="70-100"
          value={formData.bloodSugar.fasting}
          onChange={(e) => handleInputChange("bloodSugar", "fasting", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Random (mg/dL)</Label>
        <Input
          type="number"
          placeholder="70-140"
          value={formData.bloodSugar.random}
          onChange={(e) => handleInputChange("bloodSugar", "random", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Post Prandial (mg/dL)</Label>
        <Input
          type="number"
          placeholder="<140"
          value={formData.bloodSugar.postPrandial}
          onChange={(e) => handleInputChange("bloodSugar", "postPrandial", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>HbA1c (%)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="<5.7"
          value={formData.bloodSugar.hba1c}
          onChange={(e) => handleInputChange("bloodSugar", "hba1c", e.target.value)}
        />
      </div>
    </div>
  );

  const renderLipidProfileFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Total Cholesterol (mg/dL)</Label>
        <Input
          type="number"
          placeholder="<200"
          value={formData.lipidProfile.totalCholesterol}
          onChange={(e) => handleInputChange("lipidProfile", "totalCholesterol", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>LDL (mg/dL)</Label>
        <Input
          type="number"
          placeholder="<100"
          value={formData.lipidProfile.ldl}
          onChange={(e) => handleInputChange("lipidProfile", "ldl", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>HDL (mg/dL)</Label>
        <Input
          type="number"
          placeholder=">40"
          value={formData.lipidProfile.hdl}
          onChange={(e) => handleInputChange("lipidProfile", "hdl", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Triglycerides (mg/dL)</Label>
        <Input
          type="number"
          placeholder="<150"
          value={formData.lipidProfile.triglycerides}
          onChange={(e) => handleInputChange("lipidProfile", "triglycerides", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>VLDL (mg/dL)</Label>
        <Input
          type="number"
          placeholder="<30"
          value={formData.lipidProfile.vldl}
          onChange={(e) => handleInputChange("lipidProfile", "vldl", e.target.value)}
        />
      </div>
    </div>
  );

  const renderElectrolytesFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Sodium (mEq/L)</Label>
        <Input
          type="number"
          placeholder="135-145"
          value={formData.electrolytes.sodium}
          onChange={(e) => handleInputChange("electrolytes", "sodium", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Potassium (mEq/L)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="3.5-5.0"
          value={formData.electrolytes.potassium}
          onChange={(e) => handleInputChange("electrolytes", "potassium", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Chloride (mEq/L)</Label>
        <Input
          type="number"
          placeholder="96-106"
          value={formData.electrolytes.chloride}
          onChange={(e) => handleInputChange("electrolytes", "chloride", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Bicarbonate (mEq/L)</Label>
        <Input
          type="number"
          placeholder="22-28"
          value={formData.electrolytes.bicarbonate}
          onChange={(e) => handleInputChange("electrolytes", "bicarbonate", e.target.value)}
        />
      </div>
    </div>
  );

  const renderLiverFunctionFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>ALT (U/L)</Label>
        <Input
          type="number"
          placeholder="7-56"
          value={formData.liverFunction.alt}
          onChange={(e) => handleInputChange("liverFunction", "alt", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>AST (U/L)</Label>
        <Input
          type="number"
          placeholder="10-40"
          value={formData.liverFunction.ast}
          onChange={(e) => handleInputChange("liverFunction", "ast", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Bilirubin (mg/dL)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="0.1-1.2"
          value={formData.liverFunction.bilirubin}
          onChange={(e) => handleInputChange("liverFunction", "bilirubin", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Albumin (g/dL)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="3.5-5.5"
          value={formData.liverFunction.albumin}
          onChange={(e) => handleInputChange("liverFunction", "albumin", e.target.value)}
        />
      </div>
    </div>
  );

  const renderKidneyFunctionFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Creatinine (mg/dL)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="0.6-1.2"
          value={formData.kidneyFunction.creatinine}
          onChange={(e) => handleInputChange("kidneyFunction", "creatinine", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>BUN (mg/dL)</Label>
        <Input
          type="number"
          placeholder="7-20"
          value={formData.kidneyFunction.bun}
          onChange={(e) => handleInputChange("kidneyFunction", "bun", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>eGFR (mL/min)</Label>
        <Input
          type="number"
          placeholder=">90"
          value={formData.kidneyFunction.egfr}
          onChange={(e) => handleInputChange("kidneyFunction", "egfr", e.target.value)}
        />
      </div>
    </div>
  );

  if (loading && reports.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lab Results</h2>
          <p className="text-gray-500">View and manage patient lab reports</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Lab Result
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Lab Result</DialogTitle>
                <DialogDescription>
                  Enter the lab test results for this patient.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Test Type</Label>
                    <Select
                      value={formData.testType}
                      onValueChange={(value) => setFormData({ ...formData, testType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        {testTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Test Date</Label>
                    <Input
                      type="date"
                      value={formData.testDate}
                      onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lab Name</Label>
                    <Input
                      placeholder="Lab/Hospital name"
                      value={formData.labName}
                      onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="cbc">CBC</TabsTrigger>
                    <TabsTrigger value="blood_sugar">Blood Sugar</TabsTrigger>
                    <TabsTrigger value="lipid_profile">Lipid</TabsTrigger>
                    <TabsTrigger value="electrolytes">Electrolytes</TabsTrigger>
                    <TabsTrigger value="liver_function">Liver</TabsTrigger>
                    <TabsTrigger value="kidney_function">Kidney</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cbc" className="mt-4">{renderCBCFields()}</TabsContent>
                  <TabsContent value="blood_sugar" className="mt-4">{renderBloodSugarFields()}</TabsContent>
                  <TabsContent value="lipid_profile" className="mt-4">{renderLipidProfileFields()}</TabsContent>
                  <TabsContent value="electrolytes" className="mt-4">{renderElectrolytesFields()}</TabsContent>
                  <TabsContent value="liver_function" className="mt-4">{renderLiverFunctionFields()}</TabsContent>
                  <TabsContent value="kidney_function" className="mt-4">{renderKidneyFunctionFields()}</TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
                  {loading ? "Saving..." : "Save Results"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search reports..."
          className="pl-10 max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FlaskConical className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No lab results found</p>
            <Button
              variant="link"
              onClick={() => setIsDialogOpen(true)}
              className="text-orange-500"
            >
              Add your first lab result
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card key={report._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FlaskConical className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {testTypes.find((t) => t.value === report.labResult?.testType)?.label || "Lab Report"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {report.labResult?.labName && (
                          <span className="flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" />
                            {report.labResult.labName}
                          </span>
                        )}
                        <span>{formatDate(report.labResult?.testDate || report.createdAt)}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* CBC Results */}
                  {report.labResult?.cbc && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Complete Blood Count</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {report.labResult.cbc.rbc && <span>RBC: {report.labResult.cbc.rbc}</span>}
                        {report.labResult.cbc.wbc && <span>WBC: {report.labResult.cbc.wbc}</span>}
                        {report.labResult.cbc.platelet && <span>Platelet: {report.labResult.cbc.platelet}</span>}
                        {report.labResult.cbc.hb && <span>Hb: {report.labResult.cbc.hb}</span>}
                        {report.labResult.cbc.esr && <span>ESR: {report.labResult.cbc.esr}</span>}
                        {report.labResult.cbc.hct && <span>HCT: {report.labResult.cbc.hct}</span>}
                        {report.labResult.cbc.mcv && <span>MCV: {report.labResult.cbc.mcv}</span>}
                      </div>
                    </div>
                  )}

                  {/* Blood Sugar Results */}
                  {report.labResult?.bloodSugar && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Blood Sugar</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {report.labResult.bloodSugar.fasting !== undefined && <span>Fasting: {report.labResult.bloodSugar.fasting}</span>}
                        {report.labResult.bloodSugar.random !== undefined && <span>Random: {report.labResult.bloodSugar.random}</span>}
                        {report.labResult.bloodSugar.postPrandial !== undefined && <span>PP: {report.labResult.bloodSugar.postPrandial}</span>}
                        {report.labResult.bloodSugar.hba1c !== undefined && <span>HbA1c: {report.labResult.bloodSugar.hba1c}</span>}
                      </div>
                    </div>
                  )}

                  {/* Lipid Profile */}
                  {report.labResult?.lipidProfile && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Lipid Profile</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {report.labResult.lipidProfile.totalCholesterol && <span>Cholesterol: {report.labResult.lipidProfile.totalCholesterol}</span>}
                        {report.labResult.lipidProfile.ldl && <span>LDL: {report.labResult.lipidProfile.ldl}</span>}
                        {report.labResult.lipidProfile.hdl && <span>HDL: {report.labResult.lipidProfile.hdl}</span>}
                        {report.labResult.lipidProfile.triglycerides && <span>TG: {report.labResult.lipidProfile.triglycerides}</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {report.labResult?.reportFileUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-blue-500" />
                  {testTypes.find((t) => t.value === selectedReport.labResult?.testType)?.label || "Lab Report"}
                </DialogTitle>
                <DialogDescription>
                  Test Date: {formatDate(selectedReport.labResult?.testDate || selectedReport.createdAt)}
                  {selectedReport.labResult?.labName && ` | Lab: ${selectedReport.labResult.labName}`}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {selectedReport.labResult?.cbc && (
                  <div className="space-y-2">
                    <p className="font-medium">Complete Blood Count</p>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">RBC</TableCell>
                          <TableCell>{selectedReport.labResult.cbc.rbc} million/μL</TableCell>
                          <TableCell className="text-gray-500">4.5-6.0</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">WBC</TableCell>
                          <TableCell>{selectedReport.labResult.cbc.wbc} /μL</TableCell>
                          <TableCell className="text-gray-500">4000-11000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Platelet</TableCell>
                          <TableCell>{selectedReport.labResult.cbc.platelet} /μL</TableCell>
                          <TableCell className="text-gray-500">150000-400000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Hemoglobin</TableCell>
                          <TableCell>{selectedReport.labResult.cbc.hb} g/dL</TableCell>
                          <TableCell className="text-gray-500">12-17</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}

                {selectedReport.labResult?.bloodSugar && (
                  <div className="space-y-2">
                    <p className="font-medium">Blood Sugar</p>
                    <Table>
                      <TableBody>
                        {selectedReport.labResult.bloodSugar.fasting !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium">Fasting</TableCell>
                            <TableCell>{selectedReport.labResult.bloodSugar.fasting} mg/dL</TableCell>
                            <TableCell className="text-gray-500">70-100</TableCell>
                          </TableRow>
                        )}
                        {selectedReport.labResult.bloodSugar.hba1c !== undefined && (
                          <TableRow>
                            <TableCell className="font-medium">HbA1c</TableCell>
                            <TableCell>{selectedReport.labResult.bloodSugar.hba1c}%</TableCell>
                            <TableCell className="text-gray-500">&lt;5.7</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                {selectedReport.labResult?.reportFileUrl && (
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormEntry;