type tableDataType = {
    [key:string] :string
}

// const tableData:tableDataType[] = [
//   {
//     visit: "Antibiogram Visit",
//     encounter: "View",
//     encounterDate: "03-Jun-2022",
//     encounterType: "Antibiogram Order Encounter",
//     providers: "John Doe",
//     location: "Antibiogram Department",
//     enterer: "Admin",
//   },
//   {
//     visit: "Antibiogram Visit",
//     encounter: "View",
//     encounterDate: "03-Jun-2022",
//     encounterType: "Antibiogram Order Encounter",
//     providers: "John Doe",
//     location: "Antibiogram Department",
//     enterer: "Admin",
//   },
//   {
//     visit: "Antibiogram Visit",
//     encounter: "View",
//     encounterDate: "03-Jun-2022",
//     encounterType: "Antibiogram Order Encounter",
//     providers: "John Doe",
//     location: "Antibiogram Department",
//     enterer: "Admin",
//   },
// ];

const TableField: React.FC<{ tableData: tableDataType[] }> = ({
  tableData,
}) => {
    console.log(tableData)
  return (
    <>
      <table className="min-h-[100px] overflow-x-auto my-4">
        <thead>
          <tr className="border-b bg-secondary text-gray-600">
            {Object.keys(tableData[0]).map((key, ind) => {
              console.log(key);
              return <th key={ind}>{key}</th>;
            })}
          </tr>
        </thead>
        <tbody className="text-sm">
          {tableData.map((obj: tableDataType, ind) => {
            console.log(obj)
            return <tr key={ind}>
              {Object.keys(obj).map((key, ind) => (
                <td key={ind}>{obj[key]}</td>
          ))}
              {/* <td className="tableActionsIcon flex gap-2">
              <FaEdit className="text-primary" />
              <HiXCircle className="text-red-600" />
            </td> */}
            </tr>
})}
        </tbody>
      </table>
    </>
  );
};

export default TableField;
