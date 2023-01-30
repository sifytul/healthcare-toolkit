import { ChangeEvent, useState } from "react";
import Button from "../../components/shared/Button";
import SearchField from "../../components/shared/SearchField";
import TableField from "../../components/shared/TableField";
type tableDataType = {
  [key: string]: any;
};

const tableData: tableDataType[] = [
  {
    visit: "Antibiogram Visit",
    encounter: "View",
    encounterDate: "03-Jun-2022",
    encounterType: "Antibiogram Order Encounter",
    providers: "John Doe",
    location: "Antibiogram Department",
    enterer: "Admin",
  },
  {
    visit: "Antibiogram Visit",
    encounter: "View",
    encounterDate: "03-Jun-2022",
    encounterType: "Antibiogram Order Encounter",
    providers: "John Doe",
    location: "Antibiogram Department",
    enterer: "Admin",
  },
  {
    visit: "Antibiogram Visit",
    encounter: "View",
    encounterDate: "03-Jun-2022",
    encounterType: "Antibiogram Order Encounter",
    providers: "John Doe",
    location: "Antibiogram Department",
    enterer: "Admin",
  },
];

const Visits = () => {
  const [searchedText, setSearchedText] = useState("");

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(e.target.value);
  };

  return (
    <div className="space-y-6 m-10">
      <SearchField
        placeholder="Search"
        value={searchedText}
        changeHandler={changeHandler}
      />
      <TableField tableData={tableData} />
      <Button text="+ Add Visit" varientColor="primary" size="sm" />
    </div>
  );
};

export default Visits;
