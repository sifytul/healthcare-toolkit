import React from 'react'
import TableField from '../../components/shared/tableField'
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
  return (
    <div>
        <TableField tableData={tableData}/>
    </div>
  )
}

export default Visits