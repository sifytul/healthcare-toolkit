import { NavLink } from "react-router-dom";
import classnames from 'classnames'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SecondaryNavbar() {
  const basePath = "/search-patient/patient-dashboard/1";

  const tabs = [
    { value: "overview", label: "Overview", path: `${basePath}/overview` },
    { value: "visits", label: "Visits", path: `${basePath}/visits` },
    { value: "demographics", label: "Demographics", path: `${basePath}/demographics` },
    { value: "graphs", label: "Graphs", path: `${basePath}/graphs` },
    { value: "form-entry", label: "Form Entry", path: `${basePath}/form-entry` },
    { value: "antibiogram", label: "Antibiogram", path: `${basePath}/antibiogram` },
    { value: "radiology", label: "Radiology", path: `${basePath}/radiology` },
  ];

  return (
    <nav className="flex items-center p-4 bg-secondary">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent">
          {tabs.map((tab) => (
            <NavLink key={tab.value} to={tab.path} className="flex-1 min-w-fit">
              <TabsTrigger
                value={tab.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            </NavLink>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  );
}

export default SecondaryNavbar;
