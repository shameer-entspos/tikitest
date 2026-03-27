import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import { useState } from 'react';

export function JSASidebar() {
  const context = useJSAAppsCotnext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stepsList = [
    'Assign to Project',
    'JSA Details',
    'Steps & Hazards',
    'Emergency Plan',
    'Review & Submit',
  ];

  const validateStep = (index: number) => {
    // Validation for each step
    switch (index) {
      case 0:
        return (context.state.jsaSelectedProjects ?? []).length > 0; // Validate if projects are selected
      case 1:
        return !!(
          context.state.jsaCreateDetailPayload?.jsaName &&
          context.state.jsaCreateDetailPayload?.description &&
          context.state.jsaCreateDetailPayload?.customer &&
          context.state.jsaCreateDetailPayload?.contactName &&
          context.state.jsaCreateDetailPayload?.phone &&
          (context.state.jsaDetailSelectedManagers ?? []).length > 0
        ); // Validate if all required fields are filled
      case 2:
        const steps = context.state.steps ?? [];
        return (
          steps.length > 0 &&
          steps.every(
            (step) => step.description && step.description.trim() !== ''
          )
        );
      case 3:
        // Emergency plan is optional, but if filled, area should not be empty
        return true; // Emergency plan is optional
      case 4:
        return true; // Review step is always accessible
      default:
        return false;
    }
  };

  const setSeelctedValueOfSection = ({ index }: { index: number }) => {
    const currentIndex = checkTheSeelctedSectionValue({
      value: context.state.createNewSection ?? 'project',
    });

    // Allow going back to previous steps
    if (index < currentIndex) {
      // User is going back, allow it
    } else if (index > currentIndex && !validateStep(currentIndex)) {
      // User is trying to go forward but current step is not valid
      console.log(`Validation failed for step: ${stepsList[currentIndex]}`);
      return;
    }

    console.log('onselect ', index);
    switch (index) {
      case 0:
        context.dispatch({
          type: JSAAPPACTIONTYPE.CREATENEWSECTION,
          createNewSection: 'project',
        });
        break;

      case 1:
        context.dispatch({
          type: JSAAPPACTIONTYPE.CREATENEWSECTION,
          createNewSection: 'jsaDetail',
        });
        break;

      case 2:
        context.dispatch({
          type: JSAAPPACTIONTYPE.CREATENEWSECTION,
          createNewSection: 'step',
        });
        break;
      case 3:
        context.dispatch({
          type: JSAAPPACTIONTYPE.CREATENEWSECTION,
          createNewSection: 'emergency',
        });
        break;

      case 4:
        context.dispatch({
          type: JSAAPPACTIONTYPE.CREATENEWSECTION,
          createNewSection: 'review',
        });
        break;

      default:
        return null;
    }
  };

  const checkTheSelectedValue = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        return 'project';
      case 1:
        return 'jsaDetail';
      case 2:
        return 'step';
      case 3:
        return 'emergency';
      case 4:
        return 'review';
      default:
        return null;
    }
  };

  const checkTheSeelctedSectionValue = ({ value }: { value: string }) => {
    switch (value) {
      case 'project':
        return 0;
      case 'jsaDetail':
        return 1;
      case 'step':
        return 2;
      case 'emergency':
        return 3;
      case 'review':
        return 4;
      default:
        return 0;
    }
  };

  const checkListValue = ({
    stepIndex,
    value,
  }: {
    stepIndex: number;
    value: string;
  }) => {
    const selectedValueIndex = checkTheSeelctedSectionValue({ value });

    if (stepIndex < selectedValueIndex) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <button
        className="flex p-2 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="#000000"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
        </svg>
      </button>

      <aside
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } fixed left-0 top-14 z-50 h-full w-[50%] border-r-2 border-[#EEEEEE] bg-white sm:w-[40%] lg:static lg:block lg:w-1/6`}
      >
        <h3 className="px-2 pb-2 pt-3 text-base font-normal text-[#616161]">
          Create New
        </h3>
        <ul className="px-1">
          {stepsList.map((step, index) => (
            <li
              key={index}
              onClick={() => {
                setSeelctedValueOfSection({ index });
              }}
              className={`${
                context.state.createNewSection ==
                checkTheSelectedValue({ index })
                  ? 'bg-[#E2F3FF] font-semibold text-black'
                  : 'text-[#9E9E9E] hover:bg-[#fcfcfc]'
              } flex cursor-pointer items-center justify-between rounded-2xl py-2 pl-4 pr-2 text-base font-extralight`}
            >
              {step}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={`${
                  checkListValue({
                    stepIndex: index,
                    value: context.state.createNewSection!,
                  })
                    ? '#0063F7'
                    : '#9E9E9E'
                }`}
              >
                <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
              </svg>
            </li>
          ))}
        </ul>
      </aside>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
