import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { dateFormat, timeFormat } from "@/app/helpers/dateFormat";
import { JSAAPPACTIONTYPE } from "@/app/helpers/user/enums";
import { Switch } from "@material-tailwind/react";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import React, { useState } from "react";
import { Search } from "../Form/search";
import { useQuery } from "react-query";
import { activitiesList } from "@/app/(main)/(user-panel)/user/apps/api";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { PresignedUserAvatar } from "@/components/common/PresignedUserAvatar";
import { getTypeColor } from "./recentActivity";
import Loader from "../DottedLoader/loader";
import { RecentAppActivity } from "@/app/type/recent_app_activity";

type Props = {};

const ActivityLog = (props: Props) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [selected, setSelected] = useState("Past 30 Days");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const context = useJSAAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const handleGoBack = () => {
    context.dispatch({ type: JSAAPPACTIONTYPE.SHOWPAGES });
  };
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const getButtons = (type: string) => {
    switch (type) {
      case "Created":
        return "border-[#3BB66C] text-[#3BB66C] border-2 bg-white";
      case "Edited":
        return "border-[#E49E36] text-[#E49E36] border-2 bg-white";
      case "Deleted":
        return "border-[#E55B5B] text-[#E55B5B] border-2 bg-white";
      case "Comment":
        return "border-[#1C90FB] text-[#1C90FB] border-2 bg-white";
      default:
        return "bg-gray-200";
    }
  };
  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };
  const { data, isLoading } = useQuery({
    queryFn: () => activitiesList({ axiosAuth, appType: "JSA" }),
    queryKey: "activitiesLogList",
  });
  const filterData = (data: RecentAppActivity[] | undefined) => {
    const now = new Date();
    const startDate = new Date(
      now.getTime() - parseInt(selected.split(" ")[1]) * 24 * 60 * 60 * 1000
    );
    return (data ?? [])
      .filter(
        (entry) =>
          new Date(entry.createdAt).setHours(0, 0, 0, 0) >=
            startDate.setHours(0, 0, 0, 0) &&
          new Date(entry.createdAt).setHours(0, 0, 0, 0) <=
            now.setHours(0, 0, 0, 0)
      )
      .filter((activity) => {
        if (searchQuery !== "") {
          return activity.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  };
  return (
    <div className="absolute inset-0 z-10 bg-green-300 top-4 w-full p-4 pt-0  max-w-[1360px] h-full overflow-scroll">
      <div className="flex justify-between items-center">
        <div className="breadCrumbs">
          <Breadcrumbs className="font-semibold">
            <BreadcrumbItem>Tiki Apps</BreadcrumbItem>
            <BreadcrumbItem>Job Safety Analysis</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <button
          className="text-[#0063F7] text-sm font-semibold"
          onClick={handleGoBack}
        >
          &lt; Go Back
        </button>
      </div>
      <div className="flex items-center justify-between mb-4 mt-4 ">
        <div className="flex items-center">
          <div className="bg-[#F1CD70] px-3 py-3 rounded font-semibold">
            JSA
          </div>
          <h2 className="text-2xl font-bold ml-2">Activity Log</h2>
        </div>
        <div className="flex items-center ">
          <label className="flex items-center space-x-2 mx-2">
            <span>Admin Mode</span>
            <Switch
              id="custom-switch-component"
              ripple={false}
              className="h-full w-full bg-red-300 checked:bg-red-300"
              containerProps={{
                className: "w-11 h-6",
              }}
              circleProps={{
                className: "before:hidden left-0.5 border-none",
              }}
              crossOrigin={undefined}
            />
          </label>

          {/* DropDown Custom */}
          <div className="z-50 DropDownn relative inline-block text-left mx-3">
            <div>
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-[#E2F3FF] text-sm font-medium text-gray-700 hover:bg-[#e1f0fa] focus:outline-none"
                id="options-menu"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={handleToggle}
              >
                {selected}
                <svg
                  className="-mr-1 ml-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {isOpen && (
              <div
                className="z-50 origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-[#E2F3FF] ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <div className="py-1" role="none">
                  <button
                    onClick={() => handleSelect("Past 30 Days")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    role="menuitem"
                  >
                    Past 30 Days
                  </button>
                  <button
                    onClick={() => handleSelect("Past 60 Days")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    role="menuitem"
                  >
                    Past 60 Days
                  </button>
                  <button
                    onClick={() => handleSelect("Past 90 Days")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    role="menuitem"
                  >
                    Past 90 Days
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="filterButton p-2 bg-gray-200 rounded mx-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#616161"
            >
              <path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Z" />
            </svg>
          </button>
          <div className="Search team-actice flex items-center justify-between ">
            <Search
              inputRounded={true}
              type="search"
              className="bg-[#eeeeee] placeholder:text-[#616161] rounded-md "
              name="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead className="text-sm font-normal text-[#616161] bg-[#F5F5F5] ">
          <tr>
            <th className="px-2 py-3 text-left flex ">Title/Name</th>
            <th className="px-2 py-3 text-left">Entry</th>
            <th className="px-2 py-3 text-left">Action</th>
            <th className="px-2 py-3 text-left">User</th>
            <th className="px-2 py-3 text-left flex">
              Date & Time
              <img
                src="/images/fluent_arrow-sort-24-regular.svg"
                className="px-4"
                alt="img"
              />
            </th>
          </tr>
        </thead>
        {!isLoading && (
          <tbody className=" text-sm font-normal text-[#1E1E1E] ">
            {(filterData(data) ?? []).map((item) => (
              <tr
                key={item._id}
                className="even:bg-[#F5F5F5] border-b relative"
              >
                <td className=" p-2">{item.title}</td>
                <td className="p-2">
                  <div
                    className={`rounded-md py-1 px-2 text-sm w-fit ${getTypeColor(
                      item.entry
                    )}`}
                  >
                    {item.entry}
                  </div>
                </td>
                <td className="p-2">
                  <button
                    className={`${getButtons(
                      item.action
                    )} rounded-md w-fit py-1 px-2`}
                  >
                    {item.action}
                  </button>
                </td>
                {/* <div className="relative"> */}
                <td
                  className=" p-2 flex items-center"
                  onMouseEnter={() => setHoveredUser(item._id)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <PresignedUserAvatar
                    photo={item?.userId?.photo}
                    fallback="/images/user.png"
                    alt="avatar"
                    className="h-8 w-8 rounded-full mr-2"
                  />
                  {item?.userId.firstName + " " + item?.userId.lastName}
                  {hoveredUser === item._id && (
                    <div className="absolute z-20 top-8 mt-2 w-128 p-4 bg-gray-200 border rounded-lg shadow-lg">
                      <div className="flex items-start">
                        <PresignedUserAvatar
                          photo={item?.userId?.photo}
                          fallback="/images/user.png"
                          alt="Avatar"
                          className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200"
                        />

                        <div className="ml-4 space-y-2">
                          <p className="font-semibold text-[#605f5f] text-sm">
                            {item?.userId.firstName +
                              " " +
                              item?.userId.lastName}
                          </p>
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="20px"
                              viewBox="0 -960 960 960"
                              width="20px"
                              fill="#616161"
                            >
                              <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280 320-200v-80L480-520 160-720v80l320 200Z" />
                            </svg>
                            <p className="text-sm whitespace-normal break-words">
                              {item.userId.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="20px"
                              viewBox="0 -960 960 960"
                              width="20px"
                              fill="#616161"
                            >
                              <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z" />
                            </svg>
                            <p className="text-sm ">
                              {item.userId.organization?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                {/* </div> */}
                <td className="p-2">{`${dateFormat(
                  item.createdAt.toString()
                )}   ${timeFormat(item.createdAt.toString())}`}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {isLoading && <Loader />}
      {(filterData ?? []).length < 1 && !isLoading && (
        <div className="flex justify-center w-full">
          <div className="w-1/2 flex items-center justify-center flex-col p-5">
            <img
              src="/images/empty-box.svg"
              className="w-[20%] m-2"
              alt="img"
            />
            <p className="text-1xl m-2">Nothing to see here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
