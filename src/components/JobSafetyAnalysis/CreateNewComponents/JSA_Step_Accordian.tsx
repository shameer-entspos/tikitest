import { HazardModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { useState } from 'react';

interface Section {
    title: string;
    content: string;
}

interface AccordionSectionProps {
    section: HazardModel;
    isOpen: boolean;
    onToggle: () => void;
    handleClickCancel: ({ hazard }: {
        hazard: HazardModel;
    }) => void
}
const AccordionSection: React.FC<AccordionSectionProps> = ({ section, isOpen, onToggle, handleClickCancel }) => {
    // Step 1: Create state for the select value
    const [initialRiskAssessment, setInitialRiskAssessment] = useState<string>((section.initialRiskAssessment ?? '').toString());
    const [residualRiskAssessment, setResidualRiskAssessment] = useState<string>((section.residualRiskAssessment ?? '').toString());


    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setInitialRiskAssessment(event.target.value);
    };
    const handleSelectResidualChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setResidualRiskAssessment(event.target.value);
    };
    return (
        <div className='flex'>
            <div className="flex-1 border-2 border-[#EEEEEE] rounded-lg shadow my-2">
                <button
                    className="w-full text-left p-4 focus:outline-none"
                    onClick={onToggle}
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{section.name}</h3>
                        <span>{
                            isOpen ?
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" /></svg> :
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg>}
                        </span>

                    </div>
                </button>
                <div
                    className={`overflow-hidden transition-max-height duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
                >
                    {isOpen && (
                        <div className="p-4">
                            <div className="mb-5">
                                <label
                                    htmlFor="initialRiskAssessment"
                                    className="block text-base font-normal text-gray-700"
                                >
                                    Initial Risk Assessment
                                    <span className="text-red-500">*</span>
                                </label>
                                <select id="initialRiskAssessment" name="initialRiskAssessment" className="mt-1 block w-full pl-3 pr-12 py-2 text-base border-2 rounded-md border-gray-300 shadow-sm sm:text-sm" placeholder="Select"
                                    value={initialRiskAssessment} // Step 3: Bind state to the select element
                                    onChange={handleSelectChange} >
                                    <option value="" hidden>Select</option>
                                    <option value="1">Negligible</option>
                                    <option value="2">Minor</option>
                                    <option value="3">Moderate</option>
                                    <option value="4">Significant</option>
                                    <option value="5">Severe</option>
                                </select>

                            </div>
                            <div className="mb-5">
                                <label className="block mb-2" htmlFor="description">
                                    Control Method

                                </label>
                                <textarea
                                    rows={3}
                                    id="description"
                                    name="description"
                                    value={section.controlMethod}
                                    placeholder="Describe activities and outcomes taking place"
                                    className={` ${false ? "border-red-500" : "border-[#EEEEEE]"} border-2 rounded-xl border-gray-300 p-2 w-full resize-none shadow-sm`}

                                />
                                {/* {organizationForm.errors.description && organizationForm.touched.description && (
                                <span className="text-red-500 text-xs">{organizationForm.errors.description}</span>
                            )} */}
                            </div>
                            <div className="mb-5">
                                <label
                                    htmlFor="initialRiskAssessment"
                                    className="block text-base font-normal text-gray-700"
                                >
                                    Residual Risk Assessment *
                                    <span className="text-red-500">*</span>
                                </label>
                                <select id="initialRiskAssessment" name="initialRiskAssessment" className="mt-1 block w-full pl-3 pr-12 py-2 text-base border-2 rounded-md border-gray-300 shadow-sm sm:text-sm" placeholder="Select"
                                    value={residualRiskAssessment} // Step 3: Bind state to the select element
                                    onChange={handleSelectResidualChange}
                                >
                                    <option value="" hidden>Select</option>
                                    <option value="1">Negligible</option>
                                    <option value="2">Minor</option>
                                    <option value="3">Moderate</option>
                                    <option value="4">Significant</option>
                                    <option value="5">Severe</option>
                                </select>

                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className='mt-4 cursor-pointer' onClick={() => handleClickCancel({ hazard: section })}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15 26.25C16.4774 26.25 17.9403 25.959 19.3052 25.3936C20.6701 24.8283 21.9103 23.9996 22.955 22.955C23.9996 21.9103 24.8283 20.6701 25.3936 19.3052C25.959 17.9403 26.25 16.4774 26.25 15C26.25 13.5226 25.959 12.0597 25.3936 10.6948C24.8283 9.3299 23.9996 8.08971 22.955 7.04505C21.9103 6.00039 20.6701 5.17172 19.3052 4.60636C17.9403 4.04099 16.4774 3.75 15 3.75C12.0163 3.75 9.15483 4.93526 7.04505 7.04505C4.93526 9.15483 3.75 12.0163 3.75 15C3.75 17.9837 4.93526 20.8452 7.04505 22.955C9.15483 25.0647 12.0163 26.25 15 26.25ZM8.75 16.25H21.25V13.75H8.75V16.25Z" fill="#616161" />
                </svg>
            </div>
        </div>

    );
};



const JSAAccordion = ({ sections, handleClickCancel }: {
    sections: HazardModel[], handleClickCancel: ({ hazard }: {
        hazard: HazardModel;
    }) => void
}) => {
    const [openSection, setOpenSection] = useState<number | null>(null);

    const toggleSection = (sectionIndex: number) => {
        setOpenSection(openSection === sectionIndex ? null : sectionIndex);
    };

    return (
        <div className="accordion">
            {sections.map((section, index) => (
                <AccordionSection
                    key={index}
                    section={section}
                    handleClickCancel={handleClickCancel}
                    isOpen={openSection === index}
                    onToggle={() => toggleSection(index)}
                />
            ))}
        </div>
    );
};

export default JSAAccordion;
