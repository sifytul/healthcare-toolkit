import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MdPersonSearch } from "../assets/icons/react-icons";
import SearchField from "../components/shared/SearchField";

interface patientObj {
  patientId: number;
  name: string;
  age: number;
  dateofbirth: string;
  gender: string;
  dateofdeath: string;
  major_issue: string;
}
type patientDataType = {
  [key: number]: patientObj;
};
const patient: patientDataType = {
  1: {
    patientId: 1,
    name: "Elena Risteska",
    age: 27,
    dateofbirth: "11-11-1995",
    gender: "female",
    dateofdeath: "-",
    major_issue: "none",
  },
  2: {
    patientId: 2,
    name: "Steven Smith",
    age: 27,
    dateofbirth: "11-11-1995",
    gender: "male",
    dateofdeath: "-",
    major_issue: "none",
  },
  3: {
    patientId: 3,
    name: "Mujarabani",
    age: 27,
    dateofbirth: "11-11-1995",
    gender: "male",
    dateofdeath: "-",
    major_issue: "none",
  },
};

const SearchPatients = () => {
  const [patientData, setPatientData] = useState<patientObj[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [debouncedSearchedText, setDebouncedSearchedText] =
    useState(searchedText);

  const inputRef = useRef<HTMLInputElement>(null);

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchedText(searchedText);
    }, 300);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchedText]);

  useEffect(() => {
    const pt = patient[Number(debouncedSearchedText)];
    if (pt !== undefined) {
      setPatientData([patient[Number(debouncedSearchedText)]]);
    }

    // This is the code to fetch the data

    // if (!isNaN(Number(debouncedSearchedText))) {
    //   // If the search input is a number (ID), hit the search API with the ID parameter
    //   fetch(`api/search?id=${debouncedSearchedText}`)
    //     .then((response) => response.json())
    //     .then((data) => {
    //       // Do something with the search results
    //     });
    // } else {
    //   // If the search input is a string (name), hit the search API with the name parameter
    //   fetch(`api/search?name=${debouncedSearchedText}`)
    //     .then((response) => response.json())
    //     .then((data) => {
    //       // Do something with the search results
    //     });
    // }
  }, [debouncedSearchedText]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

      {searchedText && (
        <p className="text-end">
          Viewing result for <strong>"{searchedText}"</strong> - 1 page
        </p>
      )}
      <div className="m-4 overflow-x-auto">
        <table className="mt-8 border-collapse shadow-md">
          <thead>
            <tr className="border-b bg-secondary text-gray-600">
              <th>Id</th>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              {/* <th>Date of Death</th> */}
              <th>Major Issue</th>
            </tr>
          </thead>
          <tbody>
            {patientData &&
              patientData.map((patient) => (
                <tr key={patient.patientId}>
                  <td>
                    <Link to={`patient-dashboard/${patient.patientId}`}>
                      {patient?.patientId}
                    </Link>
                  </td>
                  <td>
                    <Link to={`patient-dashboard/${patient.patientId}`}>
                      {patient?.name}
                    </Link>
                  </td>
                  <td>{patient?.age}</td>
                  <td>{patient?.gender}</td>
                  <td>{patient?.dateofbirth}</td>
                  {/* <td>{patient.dateofdeath}</td> */}
                  <td>{patient?.major_issue}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between my-4">
        <p>
          Show
          <select>
            <option>10</option>
            <option>20</option>
            <option>30</option>
          </select>
          entries
        </p>
        <p>
          Showing {patientData.length} of {patientData.length} entries
        </p>
      </div>
    </div>
  );
};

export default SearchPatients;
