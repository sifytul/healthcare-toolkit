import {FaEdit, HiXCircle} from "../../assets/icons/react-icons"

type tableDataType = {
    [key:string] :string | number
}


const TableField: React.FC<{ tableData: tableDataType[], actionsButton?: Boolean }> = ({
  tableData,
  actionsButton
}) => {
    console.log(tableData)
  return (
    <>
      <table className="min-h-[100px] overflow-x-auto">
        <thead>
          <tr className="border-b bg-secondary text-gray-600">
            {Object.keys(tableData[0]).map((key, ind) => {
              console.log(key);
              return <th key={ind}>{key}</th>;
            })}
            {actionsButton && <th>actions</th>}
          </tr>
        </thead>
        <tbody className="text-sm">
          {tableData.map((obj: tableDataType, ind) => {
            console.log(obj);
            return (
              <tr key={ind}>
                {Object.keys(obj).map((key, ind) => (
                  <td key={ind}>{obj[key]}</td>
                ))}
                {actionsButton && (
                  <td className="tableActionsIcon flex gap-2">
                    <FaEdit className="text-primary" />
                    <HiXCircle className="text-red-600" />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default TableField;
