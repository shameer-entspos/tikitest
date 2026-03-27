import React, { useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';

export default function SubmissionsModal({
  setSubmissions,
}: {
  setSubmissions: any;
}) {
  const [menu, showMenu] = useState(false);
  const handleToggleMenu = () => showMenu(!menu);
  const [signInRegisterModalShowModal, setSignInRegister] = useState(false);
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        {/* backdrop overlayer */}
        <div
          className="fixed inset-0 h-full w-full bg-black opacity-40"
          onClick={() => setSubmissions(false)}
        ></div>
        {/* backdrop overlayer */}
        <div className="flex min-h-screen items-center px-5 py-5 md:px-11">
          <div className="relative mx-auto w-full max-w-[600px] rounded-md bg-white shadow-lg">
            <div className="px-5 py-5 md:px-11">
              <button
                className="absolute right-8 top-8"
                onClick={() => setSubmissions(false)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.00005 8.3998L2.10005 13.2998C1.91672 13.4831 1.68338 13.5748 1.40005 13.5748C1.11672 13.5748 0.883382 13.4831 0.700048 13.2998C0.516715 13.1165 0.425049 12.8831 0.425049 12.5998C0.425049 12.3165 0.516715 12.0831 0.700048 11.8998L5.60005 6.9998L0.700048 2.0998C0.516715 1.91647 0.425049 1.68314 0.425049 1.3998C0.425049 1.11647 0.516715 0.883138 0.700048 0.699804C0.883382 0.516471 1.11672 0.424805 1.40005 0.424805C1.68338 0.424805 1.91672 0.516471 2.10005 0.699804L7.00005 5.5998L11.9 0.699804C12.0834 0.516471 12.3167 0.424805 12.6 0.424805C12.8834 0.424805 13.1167 0.516471 13.3 0.699804C13.4834 0.883138 13.575 1.11647 13.575 1.3998C13.575 1.68314 13.4834 1.91647 13.3 2.0998L8.40005 6.9998L13.3 11.8998C13.4834 12.0831 13.575 12.3165 13.575 12.5998C13.575 12.8831 13.4834 13.1165 13.3 13.2998C13.1167 13.4831 12.8834 13.5748 12.6 13.5748C12.3167 13.5748 12.0834 13.4831 11.9 13.2998L7.00005 8.3998Z"
                    fill="#616161"
                  />
                </svg>
              </button>

              <div className="relative flex w-full items-center rounded-lg bg-white">
                <div className="absolute right-3 top-3 z-10 text-right text-primary-500"></div>
                <div className="inline-flex h-20 w-20 min-w-[80px] items-center justify-center rounded-xl bg-orange-300 px-3 pb-5 pt-[19px] shadow">
                  <div className="text-center text-xl font-semibold text-black">
                    VC
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-semibold text-black">
                    Submissions
                  </div>
                  <div className="text-zinc-600 text-sm font-normal">
                    Vehicle Checklist
                  </div>
                </div>
              </div>

              <div className="mt-5 flex bg-white">
                <div className="h-[25px] w-1/2 border-b-0 border-blue-600 text-center text-base font-semibold text-black">
                  Create New
                </div>
                <div className="text-zinc-600 h-[25px] w-1/2 border-b-2 border-blue-600 text-center text-base font-semibold">
                  Subsmissions
                </div>
              </div>

              <div className="flex flex-col">
                <div className="">
                  <div className="inline-block max-h-[500px] min-h-[300px] w-full overflow-auto align-middle">
                    <div className="">
                      <table className="min-w-full border-separate border-spacing-y-2">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="w-96 truncate px-6 py-2 text-left text-sm font-normal text-black"
                            >
                              Submitted to Project
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-2 text-left text-sm font-normal text-black"
                            >
                              Time
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-2 text-left text-sm font-normal text-black"
                            ></th>
                          </tr>
                        </thead>
                        <tbody className="">
                          <tr className="w-full bg-white shadow">
                            <td
                              className={`mb-2 w-96 whitespace-nowrap rounded-l-md px-3 py-2 text-base font-normal text-[#616161]`}
                            >
                              Westgate Roadworks, +1
                            </td>
                            <td className="mb-2 whitespace-nowrap px-6 py-2 text-sm text-gray-800">
                              Today
                            </td>
                            <td className="mb-2 whitespace-nowrap rounded-r-md px-6 py-2 text-right text-sm font-medium">
                              <div className="relative">
                                <button
                                  onClick={handleToggleMenu}
                                  type="button"
                                  className="text-gray-500 hover:text-gray-900 focus:text-gray-900 focus:outline-none"
                                >
                                  <p className="mt-1 cursor-pointer text-2xl text-gray-500">
                                    <BsThreeDots />
                                  </p>
                                </button>
                                {menu && (
                                  <div className="absolute right-0 z-10 ml-8 mt-2 w-48 rounded-md bg-white shadow-lg">
                                    <button
                                      onClick={() => {
                                        setSignInRegister(true);
                                      }}
                                      className="block w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      View
                                    </button>
                                    <a
                                      href="#"
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Edit
                                    </a>
                                    <a
                                      href="#"
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Delete
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {signInRegisterModalShowModal && (
        <SubmissionsModal setSubmissions={setSignInRegister} />
      )}
    </>
  );
}
