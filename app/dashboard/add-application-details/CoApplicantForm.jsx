// app/dashboard/add-application-details/CoApplicantForm.jsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

const CoApplicantForm = () => {
  const [saving, setSaving] = useState(false);
  const [dealInformationExpanded, setDealInformationExpanded] = useState(true);
  const [isCoApplicantActive, setIsCoApplicantActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState("co-applicant");
    const [isPersonalExpanded, setIsPersonalExpanded] = useState(true);
  const [isAddressExpanded, setIsAddressExpanded] = useState(true);
  const [isHomeDetailsExpanded, setIsHomeDetailsExpanded] = useState(true);
  const [isEmploymentExpanded, setIsEmploymentExpanded] = useState(true);
  const [isIncomeExpanded, setIsIncomeExpanded] = useState(true);
   const [isFinancialSummary, setIsisFinancialSummaryExpanded] = useState(true);
   const [isAssetsExpanded, setIsAssetsExpanded] = useState(true);

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
    }, 2000);
  };

  const handleSubmit = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Co-Applicant Deal Management</h1>
        <h3 className="text-gray-400">
          Manage co-applicant details for automative deals
        </h3>
      </div>
      
      {/* Deal Information Section */}
      <div className="mb-8">
        {/* Deal Information Header */}
        <div className="flex justify-between items-center mb-5">
          <h4 className="font-bold text-md">Deal Information</h4>
          <Button
            onClick={() => setDealInformationExpanded(!dealInformationExpanded)}
            className="p-2 h-auto"
            variant="ghost"
          >
            {dealInformationExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
          </Button>
        </div>

        {/* Deal Information Form */}
        {dealInformationExpanded && (
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold">Application #</label>
              <Input placeholder="Enter Application Number" />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold">Lender</label>
              <Input placeholder="Enter Lender Name" />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold">Dealership Name</label>
              <Input placeholder="Enter Dealership Name" />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold">Product</label>
              <Input placeholder="Product" />
            </div>
            <div className="space-y-2 flex flex-col col-span-2">
              <label className="text-[13px] font-semibold">Status</label>
              <select className="border border-gray-300 p-2 rounded-md">
                <option>Select Status</option>
                <option>Type 1</option>
                <option>Type 2</option>
              </select>
            </div>
            
            {/* Save and Submit Buttons - Positioned to the right of the form fields */}
            <div className="flex justify-end col-span-2 mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-500 text-white"
              >
                {saving ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant="outline">Print</Button>
        <Button variant="outline">Export</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="outline">View Log</Button>
        <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600">Delete Co-Applicant</Button>
      </div>

      {/* Tabs and Search */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 border-b border-gray-200 w-full">
          <button
            onClick={() => setSelectedTab("primary")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              selectedTab === "primary"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Primary Applicant
          </button>
          <button
            onClick={() => setSelectedTab("co-applicant")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              selectedTab === "co-applicant"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Co-Applicant
          </button>
          <button
            onClick={() => setSelectedTab("add-co-applicant")}
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-1 transition-colors duration-200 ${
              selectedTab === "add-co-applicant"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Plus size={16} />
            <span>Add Co-Applicant</span>
          </button>
        </div>
        <div className="relative ml-auto w-1/4 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search Co-Applicant" className="pl-9 pr-4 py-2 border rounded-md" />
        </div>
      </div>

      {/* Active Toggle and Timeline */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center  p-4  mb-6">
        <div className="flex items-center justify-between w-full mb-4 md:mb-0">
  <p className="font-semibold text-gray-700">This co-applicant is active</p>
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      value=""
      className="sr-only peer"
      checked={isCoApplicantActive}
      onChange={() => setIsCoApplicantActive(!isCoApplicantActive)}
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </label>
</div>

       
      </div>
       <div className="flex items-center justify-center w-full md:w-auto pt-4 md:pt-0">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <span className="text-xs font-medium ml-2 text-blue-600">Personal Information</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center font-bold">2</div>
            <span className="text-xs font-medium ml-2 text-gray-500">Workplace</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-14 h-14  rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center font-bold">3</div>
            <span className="text-xs font-medium ml-2 text-gray-500">Personal Information</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center font-bold">4</div>
            <span className="text-xs font-medium ml-2 text-gray-500">Personal Information</span>
          </div>
        </div>
         <div className="flex justify-between items-center mb-5">
                <h4 className="font-bold text-md">Personal Information:</h4>
                <Button
                  onClick={() => setIsPersonalExpanded(!isPersonalExpanded)}
                  className="p-2 h-auto"
                  variant="ghost"
                >
                  {isPersonalExpanded ? <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Hide</div> : <div className="bg-blue-500 px-2 py-1 text-white font-light rounded-sm shadow-md w-14">Show</div>}
                </Button>
              </div>
        
              {isPersonalExpanded && (
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Salutation </label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">First Name</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Middle Name</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Last Name</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Suffix</label>
                    <Input />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Gender</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Others</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Marital Status</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Status</option>
                      <option>Married</option>
                      <option>Not-Married</option>
                    </select>
                  </div>
        
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">
                      SIN (Social Insurance Number)
                    </label>
                    <Input />
                  </div>
        
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Phone</label>
                    <PhoneInput
                      country="ca"
                     
                      inputClass="!w-full !h-11 !text-[13px] !border border-gray-300 !rounded-md focus:ring-2 focus:ring-blue-500"
                      buttonClass="!border border-gray-300"
                      enableSearch
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Mobile Phone</label>
                    <PhoneInput
                      country="ca"
                      
                    
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
        
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Email</label>
                    <Input
                      type="email"
                    
                     
                      required
                    />
                  </div>
        
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">
                      Relation To Primary
                    </label>
                    <Input />
                  </div>
                  <div className="space-y-2">
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
                  <div className="space-y-2 mb-5">
                    <label className="text-[13px] font-semibold">Postal Code :</label>
                    <Input />
                  </div>
                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Address Type</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Suite No :</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Address No :</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Street Name :</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Street type </label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Direction</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">City</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Province</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Duration (Years)</label>
                      <Input />
                    </div>
                    <div className="space-y-2">
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
                  <div className="space-y-2 mb-5">
                    <label className="text-[13px] font-semibold">Home Type</label>
                    <Input />
                  </div>
                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Market Value </label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Mortgage Amount </label>
                      <Input />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold">Monthly Payment </label>
                      <Input />
                    </div>
                    <div className="space-y-2">
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
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Type</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Employer</label>
                    <Input />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Status</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Status</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Occupation</label>
                    <Input />
                  </div>
                  <div className="space-y-2 flex gap-6">
                    <div className="w-1/2">
                      <label className="text-[13px] font-semibold">Years</label>
                      <Input />
                    </div>
                    <div className="w-1/2">
                      <label className="text-[13px] font-semibold">Months</label>
                      <Input />
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Address Type</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Address Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Suite No.</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Address No.</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Street Name</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Street Type</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">City</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Province</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Postal Code </label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Phone</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Direction</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Duration (Years)</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
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
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Gross Income</label>
                    <Input />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Per</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Other Income Type</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Other Income</label>
                    <Input />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Per</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Other Description</label>
                    <Input />
                  </div>
                  <div className="space-y-2">
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
                <div className="grid grid-cols-1 gap-6">
                     <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Bank Name</label>
                    <Input
                    placeholder="Enter Bank Name" />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Contact Name</label>
                    <Input
                    placeholder="Enter Contact Name" />
                  </div>
                  <div className="space-y-2 flex gap-6">
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
                   <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Fax (Optional)</label>
                    <Input
                    placeholder="Enter Bank Name" />
                  </div>
                  <div className="space-y-2 flex gap-6">
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
                   <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Bank Name</label>
                    <Input
                    placeholder="Enter Bank Name" />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Account Type</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Account Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Bank number</label>
                    <Input
                    placeholder="Enter Bank Name" />
                  </div>
                   <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Address Type</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Address Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Suite No.</label>
                    <Input
                    placeholder="Enter Suite No." />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Address No.</label>
                    <Input
                    placeholder="Enter Address No." />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Street Name</label>
                    <Input
                    placeholder="Enter Street Name" />
                  </div>
                   <div className="space-y-2 flex flex-col">
                    <label className="text-[13px] font-semibold">Street Type</label>
                    <select className="border border-gray-300 p-2 rounded-md">
                      <option>Select Street Type</option>
                      <option>Type 1</option>
                      <option>Type 2</option>
                    </select>
                  </div>
                   <div className="space-y-2">
                    <label className="text-[13px] font-semibold">City</label>
                    <Input
                    placeholder="Enter City" />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[13px] font-semibold">Province</label>
                    <Input
                    placeholder="Province" />
                  </div>
                    <div className="space-y-2">
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
         <div className="grid grid-cols-1 gap-6">
             <h4 className="font-bold text-md my-5" >Assets</h4>
             <div className="space-y-2 flex flex-col">
            <label className="text-[13px] font-semibold"> Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select  Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold">Description</label>
            <Input
            placeholder="e.g., Toyota Corolla 2020" />
          </div>
           <div className="space-y-2">
            <label className="text-[13px] font-semibold">value</label>
            <Input
            placeholder="$0.00 " />
          </div>
          <h4 className="font-bold text-md my-5" >Liabilities</h4>
           <div className="space-y-2 flex flex-col">
            <label className="text-[13px] font-semibold"> Type</label>
            <select className="border border-gray-300 p-2 rounded-md">
              <option>Select  Type</option>
              <option>Type 1</option>
              <option>Type 2</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold">Description</label>
            <Input
            placeholder="e.g., Toyota Corolla 2020" />
          </div>
           <div className="space-y-2">
            <label className="text-[13px] font-semibold">Monthly Payment</label>
            <Input
            placeholder="$0.00 " />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold">Balance</label>
            <Input
            placeholder="$0.00 " />
          </div>
         </div>
         
      )}
    </div>
  );
};

export default CoApplicantForm;
