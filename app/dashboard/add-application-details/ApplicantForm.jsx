// app/dashboard/add-application-details/ApplicantForm.jsx
"use client";

import { useState } from "react"; // Import useState
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { Plus, Minus } from "lucide-react"; // Import Plus and Minus icons

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

const ApplicantForm = ({ data, setData }) => {
  // State to manage the expanded/collapsed state of each section
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(true);
  const [isAddressExpanded, setIsAddressExpanded] = useState(true);
  const [isHomeDetailsExpanded, setIsHomeDetailsExpanded] = useState(true);
  const [isEmploymentExpanded, setIsEmploymentExpanded] = useState(true);
  const [isIncomeExpanded, setIsIncomeExpanded] = useState(true);
   const [isFinancialSummary, setIsisFinancialSummaryExpanded] = useState(true);
   const [isAssetsExpanded, setIsAssetsExpanded] = useState(true);

  return (
    <div>
      {/* Personal Information Section */}
      <div className="mb-10 space-y-1">
      <h1 className="font-bold text-3xl">Applicant Deal Management</h1>
      <h3 className="text-gray-400">Manage applicant details for automative deals</h3>
      </div>
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-bold text-md">Personal Information:</h4>
        <Button
          onClick={() => setIsPersonalExpanded(!isPersonalExpanded)}
          className="p-2 h-auto"
          variant="ghost"
        >
          {isPersonalExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md  w-14 ">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
        </Button>
      </div>

      {isPersonalExpanded && (
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Salutation </label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">First Name</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Middle Name</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Last Name</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Suffix</label>
            <Input />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Gender</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Others</option>
            </select>
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Marital Status</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Status</option>
              <option>Married</option>
              <option>Not-Married</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold">
              SIN (Social Insurance Number)
            </label>
            <Input />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Phone</label>
            <PhoneInput
              country="ca"
              value={data.phone}
              onChange={(val) => {
                const finalVal = val.startsWith("+") ? val : `+${val}`;
                setData({
                  ...data,
                  phone: finalVal,
                });
              }}
              inputClass="!w-full !h-11 !text-[13px] !border border-gray-300 !rounded-md focus:ring-2 focus:ring-blue-500"
              buttonClass="!border border-gray-300"
              enableSearch
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Mobile Phone</label>
            <PhoneInput
              country="ca"
              value={data.phone}
              onChange={(val) => {
                const finalVal = val.startsWith("+") ? val : `+${val}`;
                setData({
                  ...data,
                  phone: finalVal,
                });
              }}
              inputClass="!w-full !h-11 !text-[13px] !border border-gray-300 !rounded-md focus:ring-2 focus:ring-blue-500"
              buttonClass="!border border-gray-300"
              enableSearch
              required
            />
          </div>
          <div>
            <label className="text-[13px] font-semibold">Date Of Birth</label>
            <Input type="date" />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Email</label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold">
              Relation To Primary
            </label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">
              Language Of Correspondence
            </label>
            <Input />
          </div>
        </div>
      )}

      {/* Current Address Section */}
      <div className="flex justify-between items-center mt-10 mb-5">
        <h4 className="font-bold text-md">Current Address:</h4>
        <Button
          onClick={() => setIsAddressExpanded(!isAddressExpanded)}
          className="p-2 h-auto"
          variant="ghost"
        >
          {isAddressExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
        </Button>
      </div>

      {isAddressExpanded && (
        <>
          <div className="space-y-1 mb-5">
            <label className="text-[13px] font-semibold">Postal Code :</label>
            <Input />
          </div>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Address Type</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Suite No :</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Address No :</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Street Name :</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Street type </label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Direction</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">City</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Province</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Duration (Years)</label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Duration (Months)</label>
              <Input />
            </div>
            <Button className="w-40 bg-gray-200 rounded-md shadow-md">
              Pull Credit Report
            </Button>
          </div>
        </>
      )}

      {/* Home/Mortgage Details Section */}
      <div className="flex justify-between items-center mt-10 mb-5">
        <h4 className="font-bold text-md">Home/Mortgage Details :</h4>
        <Button
          onClick={() => setIsHomeDetailsExpanded(!isHomeDetailsExpanded)}
          className="p-2 h-auto"
          variant="ghost"
        >
          {isHomeDetailsExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
        </Button>
      </div>

      {isHomeDetailsExpanded && (
        <>
          <div className="space-y-1 mb-5">
            <label className="text-[13px] font-semibold">Home Type</label>
            <Input />
          </div>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Market Value </label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Mortgage Amount </label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Monthly Payment </label>
              <Input />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold">Mortgage Holder </label>
              <Input />
            </div>
          </div>
        </>
      )}

      {/* Current Employment Section */}
      <div className="flex justify-between items-center mt-10 mb-5">
        <h4 className="font-bold text-md">Current Employment :</h4>
        <Button
          onClick={() => setIsEmploymentExpanded(!isEmploymentExpanded)}
          className="p-2 h-auto"
          variant="ghost"
        >
          {isEmploymentExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
        </Button>
      </div>

      {isEmploymentExpanded && (
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Employer</label>
            <Input />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Status</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Status</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Occupation</label>
            <Input />
          </div>
          <div className="space-y-1 flex gap-4">
            <div className="w-1/2">
              <label className="text-[13px] font-semibold">Years</label>
              <Input />
            </div>
            <div className="w-1/2">
              <label className="text-[13px] font-semibold">Months</label>
              <Input />
            </div>
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Address Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Address Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Suite No.</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Address No.</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Street Name</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Street Type</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">City</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Province</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Postal Code </label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Phone</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Direction</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Duration (Years)</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Duration (Months)</label>
            <Input />
          </div>
        </div>
      )}

      {/* Income Details Section */}
      <div className="flex justify-between items-center mt-10 mb-5">
        <h4 className="font-bold text-md">Income Details :</h4>
        <Button
          onClick={() => setIsIncomeExpanded(!isIncomeExpanded)}
          className="p-2 h-auto"
          variant="ghost"
        >
          {isIncomeExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
        </Button>
      </div>

      {isIncomeExpanded && (
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Gross Income</label>
            <Input />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Per</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Other Income Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Other Income</label>
            <Input />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Per</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Other Description</label>
            <Input />
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Annual Total</label>
            <Input />
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mt-10 mb-5">
        <h4 className="font-bold text-md">Financial Summary :</h4>
        <Button
          onClick={() => setIsisFinancialSummaryExpanded(!isFinancialSummary)}
          className="p-2 h-auto"
          variant="ghost"
        >
          {isFinancialSummary ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
        </Button>
      </div>
      {isFinancialSummary && (
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
            <label className="text-[13px] font-semibold">Bank Name</label>
            <Input
            placeholder="Enter Bank Name" />
          </div>
           <div className="space-y-1">
            <label className="text-[13px] font-semibold">Contact Name</label>
            <Input
            placeholder="Enter Contact Name" />
          </div>
          <div className="space-y-1 flex gap-4">
            <div className="w-1/2">
              <label className="text-[13px] font-semibold">Phone</label>
              <Input
              placeholder="Enter Phone Number" />
            </div>
            <div className="w-1/2">
              <label className="text-[13px] font-semibold">Extension</label>
              <Input 
              placeholder="Ext"/>
            </div>
          </div>
           <div className="space-y-1">
            <label className="text-[13px] font-semibold">Fax (Optional)</label>
            <Input
            placeholder="Enter Bank Name" />
          </div>
          <div className="space-y-1 flex gap-4">
            <div className="w-1/2">
              <label className="text-[13px] font-semibold">Financial Year End Month</label>
              <Input
              placeholder="Select Month" />
            </div>
            <div className="w-1/2">
              <label className="text-[13px] font-semibold">Financial Year End Year</label>
              <Input 
              placeholder="Select Year"/>
            </div>
          </div>
           <div className="space-y-1">
            <label className="text-[13px] font-semibold">Bank Name</label>
            <Input
            placeholder="Enter Bank Name" />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Account Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Account Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Bank number</label>
            <Input
            placeholder="Enter Bank Name" />
          </div>
           <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Address Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Address Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[13px] font-semibold">Suite No.</label>
            <Input
            placeholder="Enter Suite No." />
          </div>
           <div className="space-y-1">
            <label className="text-[13px] font-semibold">Address No.</label>
            <Input
            placeholder="Enter Address No." />
          </div>
           <div className="space-y-1">
            <label className="text-[13px] font-semibold">Street Name</label>
            <Input
            placeholder="Enter Street Name" />
          </div>
           <div className="space-y-1 flex flex-col">
            <label className="text-[13px] font-semibold">Street Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select Street Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
           <div className="space-y-1">
            <label className="text-[13px] font-semibold">City</label>
            <Input
            placeholder="Enter City" />
          </div>
           <div className="space-y-1">
            <label className="text-[13px] font-semibold">Province</label>
            <Input
            placeholder="Province" />
          </div>
            <div className="space-y-1">
            <label className="text-[13px] font-semibold">Postal Code</label>
            <Input
            placeholder="Enter Postal Code" />
          </div>


        </div>
      )}
       <div className="flex justify-between items-center mt-10 mb-5">
        <h4 className="font-bold text-md">Assets and Liabilities :</h4>
        <Button
          onClick={() => setIsAssetsExpanded(!isAssetsExpanded)}
          className="p-2 h-auto"
          variant="ghost"
        >
          {isAssetsExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
        </Button>
      </div>
     
     {isAssetsExpanded && (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        {/* Assets Section */}
        <h4 className="font-bold text-md col-span-full">Assets :</h4>
        
        {/* Assets Form Fields */}
        <div className="space-y-1">
            <label className="text-[13px] font-semibold">Type</label>
            <select className="border border-gray-300 p-2 rounded-md w-full">
                <option>Select Type</option>
                <option>Type 1</option>
                <option>Type 2</option>
            </select>
        </div>
        <div className="space-y-1">
            <label className="text-[13px] font-semibold">Description</label>
            <Input placeholder="e.g., Toyota Corolla 2020" />
        </div>
        <div className="space-y-1">
            <label className="text-[13px] font-semibold">Value</label>
            <Input placeholder="$0.00" />
        </div>

        {/* Liabilities Section */}
        <h4 className="font-bold text-md  col-span-full">Liabilities :</h4>
        
        {/* Liabilities Form Fields */}
        <div className="space-y-1">
            <label className="text-[13px] font-semibold">Type</label>
            <select className="border border-gray-300 p-2 rounded-md w-full">
                <option>Select Type</option>
                <option>Type 1</option>
                <option>Type 2</option>
            </select>
        </div>
        <div className="space-y-1">
            <label className="text-[13px] font-semibold">Description</label>
            <Input placeholder="e.g., Toyota Corolla 2020" />
        </div>
        <div className="space-y-1">
            <label className="text-[13px] font-semibold">Monthly Payment</label>
            <Input placeholder="$0.00" />
        </div>
        <div className="space-y-1">
            <label className="text-[13px] font-semibold">Balance</label>
            <Input placeholder="$0.00" />
        </div>
    </div>
)}
    </div>
  );
};

export default ApplicantForm;