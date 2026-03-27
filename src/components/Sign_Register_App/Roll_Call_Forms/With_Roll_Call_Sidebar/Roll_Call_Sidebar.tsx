import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { useSRAppCotnext } from "@/app/(main)/(user-panel)/user/apps/sr/sr_context";
import { SR_APP_ACTION_TYPE } from "@/app/helpers/user/enums";
import { useState } from "react";

export function SRSidebar() {
  const context = useSRAppCotnext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stepsList = [
    "Assign to Project",
    "Select Site",
    "Details",
    "Attendance",
    "Review & Submit",
  ];

  const setSeelctedValueOfSection = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        context.dispatch({
          type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
          createNewRollCall: "project",
        });
        break;

      case 1:
        context.dispatch({
          type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
          createNewRollCall: "site",
        });
        break;

      case 2:
        context.dispatch({
          type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
          createNewRollCall: "details",
        });
        break;
      case 3:
        context.dispatch({
          type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
          createNewRollCall: "attendance",
        });
        break;

      case 4:
        context.dispatch({
          type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
          createNewRollCall: "review",
        });
        break;

      default:
        return null;
    }
  };

  const checkTheSelectedValue = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        return "project";
      case 1:
        return "site";
      case 2:
        return "details";
      case 3:
        return "attendance";
      case 4:
        return "review";
      default:
        return null;
    }
  };

  const checkTheSeelctedSectionValue = ({ value }: { value: string }) => {
    switch (value) {
      case "project":
        return 0;
      case "jsaDetail":
        return 1;
      case "step":
        return 2;
      case "emergency":
        return 3;
      case "review":
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
        className="lg:hidden p-2 flex "
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
          isSidebarOpen ? "block" : "hidden"
        } lg:block fixed lg:static top-14 left-0 w-[50%] sm:w-[40%] lg:w-1/6 h-full bg-white border-r-2 border-[#EEEEEE] z-50`}
      >
        <h3 className="text-[#616161] font-semibold text-base pt-3 px-2">
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
                context.state.createNewRollCall ==
                checkTheSelectedValue({ index })
                  ? "bg-[#E2F3FF] text-black"
                  : "text-[#9E9E9E]"
              } rounded-full  px-4 py-2 flex items-center   justify-between  text-xs font-normal`}
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
                    value: context.state.createNewRollCall!,
                  })
                    ? "#0063F7"
                    : "#9E9E9E"
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
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
