import { useAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/context";
import { APPACTIONTYPE } from "@/app/helpers/user/enums";
import { Button } from "../Buttons";
import { Search } from "../Form/search";
import { Fragment, useState } from "react";
import { useQuery } from "react-query";
import {
  SubmitAppDetail,
  getSingleAppSubmission,
} from "@/app/(main)/(user-panel)/user/apps/api";
import useAxiosAuth from "@/hooks/AxiosAuth";
import Loader from "../DottedLoader/loader";
import { Menu, Transition } from "@headlessui/react";
import { ShowSubmitAppDetail } from "./showSubmitAppDetail";

function ShowSingleAppSubmission() {
  const axiosAuth = useAxiosAuth();
  const context = useAppsCotnext();
  const [searchStarred, setSearchStarred] = useState("");
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: "singleAppSubmission",
    queryFn: () =>
      getSingleAppSubmission(axiosAuth, context.state.appModel?._id ?? ""),
  });

  if (isLoading) {
    return (
      <div className="h-52 flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (isSuccess) {
    const filteredData =
      data.filter((e) =>
        (e.projects ?? [])?.some((ee) =>
          `${ee.name}`.toLowerCase().includes(searchStarred.toLowerCase())
        )
      ) ?? [];

    return (
      <div className=" items-center  px-2 md:px-11 py-5 h-auto">
        <div className="mb-2">
          <label className="px-3 font-medium">Search Submissions</label>
          <div className="mt-2">
            <Search
              type="text"
              className="bg-[#EEEEEE] placeholder:text-[#616161] text-xs rounded-lg mt-2"
              name="search"
              inputRounded={true}
              value={searchStarred}
              onChange={(event) => {
                setSearchStarred(event.target.value);
              }}
              placeholder="Search by Project Name, User, or Email"
            />
          </div>
        </div>
        {/* //////// */}

        <div className="flex flex-col ">
          <div className="p-1.5 w-full inline-block align-middle overflow-auto scrollbar-hide">
            <div className="h-96 overflow-y-scroll  scrollbar-hide px-4 pb-4">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-0 py-2 text-xs md:text-sm  font-medium text-left text-black w-1/2"
                    >
                      Submitted to Project
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-xs md:text-sm  font-medium text-left text-black w-1/2"
                    >
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {filteredData.map((e: SubmitAppDetail) => {
                    return (
                      <tr className="bg-white shadow-md w-full" key={e._id}>
                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap mb-2">
                          {e.projects!.at(0)?.name!}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap mb-2">
                          {e.createdAt.toString()}
                        </td>
                        <td className="rounded-r-md px-6 py-4 text-sm font-medium text-right whitespace-nowrap mb-2">
                          <div className="max-w-4xl w-full">
                            <Menu
                              as="div"
                              className="relative inline-block text-left"
                            >
                              <div>
                                <Menu.Button>
                                  <svg
                                    width="19"
                                    height="5"
                                    viewBox="0 0 19 5"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9.201 5.68597e-08C8.91196 5.07687e-08 8.62575 0.0569305 8.35871 0.167541C8.09168 0.278152 7.84904 0.440276 7.64466 0.644658C7.44028 0.84904 7.27815 1.09168 7.16754 1.35871C7.05693 1.62575 7 1.91196 7 2.201C7 2.49004 7.05693 2.77625 7.16754 3.04329C7.27815 3.31032 7.44028 3.55296 7.64466 3.75734C7.84904 3.96172 8.09168 4.12385 8.35871 4.23446C8.62575 4.34507 8.91196 4.402 9.201 4.402C9.78474 4.40187 10.3445 4.16985 10.7572 3.75699C11.1699 3.34413 11.4016 2.78424 11.4015 2.2005C11.4014 1.61676 11.1693 1.05698 10.7565 0.644304C10.3436 0.231631 9.78374 -0.000132534 9.2 5.68597e-08H9.201ZM2.201 5.68597e-08C1.91196 5.07687e-08 1.62575 0.0569305 1.35871 0.167541C1.09168 0.278152 0.84904 0.440276 0.644658 0.644658C0.440276 0.84904 0.278152 1.09168 0.167541 1.35871C0.0569305 1.62575 0 1.91196 0 2.201C0 2.49004 0.0569305 2.77625 0.167541 3.04329C0.278152 3.31032 0.440276 3.55296 0.644658 3.75734C0.84904 3.96172 1.09168 4.12385 1.35871 4.23446C1.62575 4.34507 1.91196 4.402 2.201 4.402C2.78474 4.40187 3.34452 4.16985 3.7572 3.75699C4.16987 3.34413 4.40163 2.78424 4.4015 2.2005C4.40137 1.61676 4.16935 1.05698 3.75649 0.644304C3.34363 0.231631 2.78474 -0.000132534 2.201 5.68597e-08ZM16.201 5.68597e-08C15.912 5.07687e-08 15.6258 0.0569305 15.3587 0.167541C15.0917 0.278152 14.849 0.440276 14.6447 0.644658C14.4403 0.84904 14.2782 1.09168 14.1675 1.35871C14.0569 1.62575 14 1.91196 14 2.201C14 2.49004 14.0569 2.77625 14.1675 3.04329C14.2782 3.31032 14.4403 3.55296 14.6447 3.75734C14.849 3.96172 15.0917 4.12385 15.3587 4.23446C15.6258 4.34507 15.912 4.402 16.201 4.402C16.7847 4.40187 17.3445 4.16985 17.7572 3.75699C18.1699 3.34413 18.4016 2.78424 18.4015 2.2005C18.4014 1.61676 18.1693 1.05698 17.7565 0.644304C17.3436 0.231631 16.7847 -0.000132534 16.201 5.68597e-08Z"
                                      fill="#0063F7"
                                    />
                                  </svg>
                                </Menu.Button>
                              </div>

                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          className={classNames(
                                            active
                                              ? "bg-gray-100 text-gray-900"
                                              : "text-gray-700",
                                            "flex px-4 py-2 text-sm  items-center"
                                          )}
                                          onClick={() => {
                                            context.dispatch({
                                              type: APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION,
                                              submitAppDetail: e,
                                            });
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-3"
                                            width="30"
                                            height="23"
                                            viewBox="0 5 21 23"
                                            version="1.1"
                                          >
                                            <title>view</title>
                                            <path
                                              d="M12.406 13.844c1.188 0 2.156 0.969 2.156 2.156s-0.969 2.125-2.156 2.125-2.125-0.938-2.125-2.125 0.938-2.156 2.125-2.156zM12.406 8.531c7.063 0 12.156 6.625 12.156 6.625 0.344 0.438 0.344 1.219 0 1.656 0 0-5.094 6.625-12.156 6.625s-12.156-6.625-12.156-6.625c-0.344-0.438-0.344-1.219 0-1.656 0 0 5.094-6.625 12.156-6.625zM12.406 21.344c2.938 0 5.344-2.406 5.344-5.344s-2.406-5.344-5.344-5.344-5.344 2.406-5.344 5.344 2.406 5.344 5.344 5.344z"
                                              fill="#616161"
                                            />
                                          </svg>
                                          View
                                        </button>
                                      )}
                                    </Menu.Item>
                                    {/* <Menu.Item>
                                                                            {({ active }) => (
                                                                                <button
                                                                                    className={classNames(
                                                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                                                        'flex px-4 py-2 text-sm  items-center'
                                                                                    )}
                                                                                    onClick={
                                                                                        () => { }
                                                                                    }
                                                                                >
                                                                                    <svg
                                                                                        className="mr-3"
                                                                                        width="30"
                                                                                        height="23"
                                                                                        viewBox="0 0 21 23"
                                                                                        fill="none"
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                    >
                                                                                        <path
                                                                                            d="M19.0938 4.6875H15.5781V3.51562C15.5781 2.79042 15.29 2.09492 14.7772 1.58213C14.2645 1.06934 13.569 0.78125 12.8438 0.78125H8.15625C7.43105 0.78125 6.73555 1.06934 6.22275 1.58213C5.70996 2.09492 5.42188 2.79042 5.42188 3.51562V4.6875H1.90625C1.59545 4.6875 1.29738 4.81097 1.07761 5.03073C0.85784 5.2505 0.734375 5.54857 0.734375 5.85938C0.734375 6.17018 0.85784 6.46825 1.07761 6.68802C1.29738 6.90778 1.59545 7.03125 1.90625 7.03125H2.29688V20.3125C2.29688 20.8305 2.50265 21.3273 2.86893 21.6936C3.23521 22.0599 3.732 22.2656 4.25 22.2656H16.75C17.268 22.2656 17.7648 22.0599 18.1311 21.6936C18.4974 21.3273 18.7031 20.8305 18.7031 20.3125V7.03125H19.0938C19.4046 7.03125 19.7026 6.90778 19.9224 6.68802C20.1422 6.46825 20.2656 6.17018 20.2656 5.85938C20.2656 5.54857 20.1422 5.2505 19.9224 5.03073C19.7026 4.81097 19.4046 4.6875 19.0938 4.6875ZM7.76562 3.51562C7.76562 3.41202 7.80678 3.31267 7.88004 3.23941C7.95329 3.16616 8.05265 3.125 8.15625 3.125H12.8438C12.9474 3.125 13.0467 3.16616 13.12 3.23941C13.1932 3.31267 13.2344 3.41202 13.2344 3.51562V4.6875H7.76562V3.51562ZM16.3594 19.9219H4.64062V7.03125H16.3594V19.9219ZM9.32812 10.1562V16.4062C9.32812 16.7171 9.20466 17.0151 8.98489 17.2349C8.76512 17.4547 8.46705 17.5781 8.15625 17.5781C7.84545 17.5781 7.54738 17.4547 7.32761 17.2349C7.10784 17.0151 6.98438 16.7171 6.98438 16.4062V10.1562C6.98438 9.84545 7.10784 9.54738 7.32761 9.32761C7.54738 9.10784 7.84545 8.98438 8.15625 8.98438C8.46705 8.98438 8.76512 9.10784 8.98489 9.32761C9.20466 9.54738 9.32812 9.84545 9.32812 10.1562ZM14.0156 10.1562V16.4062C14.0156 16.7171 13.8922 17.0151 13.6724 17.2349C13.4526 17.4547 13.1546 17.5781 12.8438 17.5781C12.5329 17.5781 12.2349 17.4547 12.0151 17.2349C11.7953 17.0151 11.6719 16.7171 11.6719 16.4062V10.1562C11.6719 9.84545 11.7953 9.54738 12.0151 9.32761C12.2349 9.10784 12.5329 8.98438 12.8438 8.98438C13.1546 8.98438 13.4526 9.10784 13.6724 9.32761C13.8922 9.54738 14.0156 9.84545 14.0156 10.1562Z"
                                                                                            fill="#616161"
                                                                                        />
                                                                                    </svg>
                                                                                    Delete app
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item> */}
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ///////// */}
        <div className="flex justify-center gap-5">
          <button
            className="text-sm font-bold text-[#0063F7] border-3  border-[#0063F7] leading-[22px] min-w-[188px] py-[8px] px-[20px] h-[47px] rounded-lg mt-[24px]"
            onClick={() => {
              context.dispatch({ type: APPACTIONTYPE.CHANGESHOWMODEL });
            }}
          >
            Back
          </button>
        </div>
        {context.state.showSubmitAppDetail && <ShowSubmitAppDetail />}
      </div>
    );
  }

  return <></>;
}

export { ShowSingleAppSubmission };

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
