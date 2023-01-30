import { FiEdit } from "../../assets/icons/react-icons";
import Button from "../../components/shared/Button";
import TableField from "../../components/shared/TableField";

const Demographics = () => {
  const addresses = JSON.parse(`[
    {
        "type": "present",
        "address": "Somewhere in somewhere",
        "city/Village": "Somecity",
        "state/Province": "Somestate",
        "country": "Bangladesh",
        "postal code": "4331"
    },
    {
        "type": "parmanent",
        "address": "Somewhere in somewhere",
        "city/Village": "Somecity",
        "state/Province": "Somestate",
        "country": "Bangladesh",
        "postal code": "4331"
    }
]`);
  return (
    <div className="space-y-6 m-10">
      <p className="textSize-550 text-gray-primary font-semibold">Programs</p>
      <TableField tableData={addresses} />
      <hr />
      <div className="flex gap-4">
        <Button
          text="Edit this patient"
          varientColor="primary"
          size="sm"
          Icon={FiEdit}
        />
        <Button
          text="Edit this patient (short form)"
          varientColor="primary"
          size="sm"
          Icon={FiEdit}
        />
      </div>
    </div>
  );
};

export default Demographics;
