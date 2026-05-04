import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MdPersonSearch } from "../assets/icons/react-icons";
import SearchField from "../components/shared/SearchField";

const API_URL = "http://localhost:7000/api/v1/patients";

interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
}

const SearchPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [debouncedSearchedText, setDebouncedSearchedText] = useState(searchedText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(e.target.value);
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchedText(searchedText);
    }, 300);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchedText]);

  // Fetch patients on search
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError("");
      try {
        const url = debouncedSearchedText
          ? `${API_URL}?search=${encodeURIComponent(debouncedSearchedText)}&limit=10`
          : `${API_URL}?limit=10`;

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }

        const data = await response.json();
        setPatients(data.data.patients || []);
      } catch (err: any) {
        setError(err.message);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [debouncedSearchedText]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="m-4 lg:w-3/4">
      <h2 className="my-4">Search Patient</h2>
      <SearchField
        inputRef={inputRef}
        value={searchedText}
        placeholder="Patient Id or Patient Name"
        changeHandler={changeHandler}
        SearchIconComponent={MdPersonSearch}
      />

      {loading && (
        <p className="text-center py-4 text-gray-500">Loading patients...</p>
      )}

      {error && !loading && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!loading && !error && searchedText && (
        <p className="text-end">
          Viewing result for <strong>"{searchedText}"</strong> - {patients.length} patients found
        </p>
      )}

      {!loading && !error && patients.length > 0 && (
        <div className="m-4 overflow-x-auto">
          <table className="mt-8 border-collapse shadow-md w-full">
            <thead>
              <tr className="border-b bg-secondary text-gray-600">
                <th className="p-3 text-left">Id</th>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left">Gender</th>
                <th className="p-3 text-left">Date of Birth</th>
                <th className="p-3 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.patientId} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      to={`patient-dashboard/${patient.patientId}`}
                      className="text-primary hover:underline"
                    >
                      {patient.patientId}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link
                      to={`patient-dashboard/${patient.patientId}`}
                      className="text-primary hover:underline"
                    >
                      {patient.firstName} {patient.lastName}
                    </Link>
                  </td>
                  <td className="p-3">{calculateAge(patient.dateOfBirth)}</td>
                  <td className="p-3 capitalize">{patient.gender}</td>
                  <td className="p-3">{formatDate(patient.dateOfBirth)}</td>
                  <td className="p-3">{patient.phone || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && patients.length === 0 && searchedText && (
        <p className="text-center py-8 text-gray-500">No patients found</p>
      )}

      {!loading && !error && patients.length === 0 && !searchedText && (
        <p className="text-center py-8 text-gray-500">Start typing to search patients</p>
      )}

      {patients.length > 0 && (
        <div className="flex justify-between my-4">
          <p>
            Show
            <select className="ml-2 border rounded px-2 py-1">
              <option>10</option>
              <option>20</option>
              <option>30</option>
            </select>
            entries
          </p>
          <p>
            Showing {patients.length} patients
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPatients;