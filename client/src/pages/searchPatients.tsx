import { useEffect, useState } from "react";
import { MdPersonSearch } from "react-icons/md";

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
  const [searchedText, setSearchedText] = useState();
  const [debouncedSearchedText, setDebouncedSearchedText] =
    useState(searchedText);
  const changeHandler = (e) => {
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
  }, [debouncedSearchedText]);

  return (
    <div className="m-4 lg:w-3/4">
      <h2 className="my-4">Search Patient</h2>
      <div className="flex items-center border p-2 rounded-lg md:w-2/3 bg-secondary mb-4">
        <MdPersonSearch className="text-primary text-3xl mr-2" />
        <input
          className="outline-none flex-grow  p-2"
          name="search"
          type="search"
          placeholder="Patient Id or Patient Name"
          value={searchedText}
          onChange={changeHandler}
        />
      </div>

      {searchedText&& <p className="text-end">
        Viewing result for <strong>"{searchedText}"</strong> - 1 page
      </p>}
      <div className="m-4 overflow-x-auto">
        <table className="mt-8 border-collapse shadow-md bg">
          <thead>
            <tr className="border-b bg-secondary text-gray-600 ">
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
                  <td>{patient?.patientId}</td>
                  <td>{patient?.name}</td>
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
        <p>Showing 1 to 3 of 3 entries</p>
      </div>
    </div>
  );
};

export default SearchPatients;
