import React from 'react'
import { FaEdit, HiXCircle } from '../../assets/icons/react-icons';
import SecondaryNavbar from '../../components/SecondaryNavbar';
import Button from '../../components/shared/Button';

const Overview = () => {
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
        <div>
          <p className="textSize-550 text-gray-primary font-semibold">
            Programs
          </p>
          <div>
            <table className="min-h-[100px] overflow-x-auto my-4">
              <thead>
                <tr className="border-b bg-secondary text-gray-600">
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Concept Name</th>
                  <th>Workflows</th>
                  <th>Possible Outcomes Defined by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td>696969</td>
                  <td>Annual Free Checkup Program</td>
                  <td>
                    Get free checkups in Radiology on this day of the year
                  </td>
                  <td>Something</td>
                  <td>Something</td>
                  <td>Something</td>
                  <td className="tableActionsIcon flex gap-2">
                    <FaEdit className="text-primary" />
                    <HiXCircle className="text-red-600" />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>Annual Free Checkup Program</td>
                  <td>
                    Get free checkups in Radiology on this day of the year
                  </td>
                  <td>Something</td>
                  <td>Something</td>
                  <td>Something</td>
                  <td className="tableActionsIcon flex gap-2">
                    <FaEdit className="text-primary" />
                    <HiXCircle className="text-red-600" />
                  </td>
                </tr>
              </tbody>
            </table>
            <Button text="+ Add Program" varientColor="primary" size="sm" />
          </div>
        </div>
        <hr />
        <div>
          <p className="textSize-550 font-semibold text-gray-primary">
            Relationships
          </p>
          <table className="min-h-[100px] overflow-x-auto my-4">
            <thead>
              <tr className="border-b bg-secondary text-gray-600">
                <th>Relative</th>
                <th>Relationship</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td>Dr. John Doe</td>
                <td>Doctor</td>
                <td>03-Jun-2022</td>
                <td>10-Jun-2022</td>
                <td className="tableActionsIcon flex gap-2">
                  <FaEdit className="text-primary" />
                  <HiXCircle className="text-red-600" />
                </td>
              </tr>
              <tr>
                <td>Dr. John Doe</td>
                <td>Doctor</td>
                <td>03-Jun-2022</td>
                <td>10-Jun-2022</td>
                <td className="tableActionsIcon flex gap-2">
                  <FaEdit className="text-primary" />
                  <HiXCircle className="text-red-600" />
                </td>
              </tr>
            </tbody>
          </table>
          <Button text="+ Add Realtionship" varientColor="primary" size="sm" />
        </div>
      </div>
    </>
  );
}

export default Overview