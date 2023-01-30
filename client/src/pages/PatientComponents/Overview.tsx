import Button from "../../components/shared/Button";
import TableField from "../../components/shared/TableField";

const Overview = () => {
  const relationships = JSON.parse(`[{
    "Relative": "Dr. John Doe",
    "Relationship": "Doctor",
    "Start Date": "03-Jun-2022",
    "End Date": "10-Jun-2022"           
  },
{
  "Relative": "Dr. John Doe",
  "Relationship": "Doctor",
  "Start Date": "03-Jun-2022",
  "End Date": "10-Jun-2022"
}
]`);
  const programs = JSON.parse(`[
    {
    "ID": 696969,
    "Name": "Annual Free Checkup Program",
    "Description":"Get free checkups in Radiology on this day of the year",
    "Concept Name":"Something",
    "Workflows":"Something",
    "Possible Outcomes Defined by":"Something"
    },
    {
    "ID": 696969,
    "Name": "Annual Free Checkup Program",
    "Description":"Get free checkups in Radiology on this day of the year",
    "Concept Name":"Something",
    "Workflows":"Something",
    "Possible Outcomes Defined by":"Something"
    },
    {
    "ID": 696969,
    "Name": "Annual Free Checkup Program",
    "Description":"Get free checkups in Radiology on this day of the year",
    "Concept Name":"Something",
    "Workflows":"Something",
    "Possible Outcomes Defined by":"Something"
    }

]`);
  return (
    <>
      <div className="m-4 p-4 space-y-6">
        <div className="min-h-[100px]">
          <p className="textSize-550 font-semibold text-gray-primary">
            Patient Actions
          </p>
          <p className="text-center text-gray-500 text-sm">
            No patient actions found
          </p>
        </div>
        <hr />
        <div className="space-y-6">
          <p className="textSize-550 text-gray-primary font-semibold">
            Programs
          </p>
          <TableField tableData={programs} actionsButton={true} />
          <Button text="+ Add Program" varientColor="primary" size="sm" />
        </div>
        <hr />
        <div className="space-y-6">
          <p className="textSize-550 font-semibold text-gray-primary">
            Relationships
          </p>
          <TableField tableData={relationships} actionsButton={true} />
          <Button text="+ Add Realtionship" varientColor="primary" size="sm" />
        </div>
      </div>
    </>
  );
};

export default Overview;
