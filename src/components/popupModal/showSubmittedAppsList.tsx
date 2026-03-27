import { useAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/context";
import { APPACTIONTYPE } from "@/app/helpers/user/enums";
import { Button } from "../Buttons";






function ShowSubmittedAppsList() {
    const context = useAppsCotnext()
    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div
                className="fixed inset-0 w-full h-full bg-black opacity-40"
                onClick={() => {
                    context.dispatch({ type: APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION })
                }}
            ></div>

            <div className="flex items-center min-h-screen px-11 py-5">
                <div className="relative w-full max-w-[600px] mx-auto bg-white rounded-md shadow-lg">
                    <div className="shadow px-11 py-5">
                        <button
                            className="absolute top-8 right-8 z-10"
                            onClick={() => context.dispatch({
                                type: APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION
                            })}
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
                        <div className="w-full bg-white rounded-lg flex items-center relative">
                            <div className="text-right absolute top-3 right-3 z-10 text-primary-500"></div>
                            <div className="min-w-[80px] w-20 h-20 px-3 pt-[19px] pb-5 bg-orange-300 rounded-xl shadow justify-center items-center inline-flex">
                                <div className="text-center text-black text-xl font-semibold">
                                    {context.state.submitAppDetail?.app_id?.name.substring(0, 1)}
                                </div>
                            </div>
                            <div className=" w-full text-center text-black text-xl font-semibold">
                                {context.state.submitAppDetail?.app_id?.name}
                            </div>
                        </div>
                    </div>
                    <div className=" px-5 md:px-11 pt-6">

                        <div className="w-full bg-white rounded-lg shadow p-10 mb-10">
                            <div className="mb-6 text-center text-black  text-[22px] md:text-[32px] font-bold">{context.state.submitAppDetail?.type}</div>
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-2/3">
                                    <div className="mb-5">
                                        <div className="text-black text-sm font-normal underline">Full Name</div>
                                        <div className="text-black text-lg md:text-xl font-semibold">{`${context.state.submitAppDetail?.firstName} ${context.state.submitAppDetail?.lastName}`}</div>
                                    </div>
                                    {context.state.submitAppDetail?.company != "" &&
                                        < div className="mb-5">
                                            <div className="text-black text-sm font-normal underline">Company</div>
                                            <div className="text-black text-lg md:text-xl font-semibold">ABCD</div>
                                        </div>
                                    }
                                    <div className="mb-0">
                                        <div className="text-black text-sm font-normal underline">Date & Time</div>
                                        <div className="text-black text-lg md:text-xl font-semibold">{context.state.submitAppDetail?.createdAt.toString()}</div>
                                    </div>

                                </div>
                                <div className="w-full md:w-1/3 mt-5 md:mt-0">
                                    <div className="w-full md:w-[154px] h-[201px]">
                                        <img src="https://via.placeholder.com/154x201" alt="img" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="inline-block mb-11 text-center text-red-500 text-base font-semibold mx-auto">Delete Submission</div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-5 pb-6">
                        <Button variant="primaryOutLine" onClick={() => { context.dispatch({ type: APPACTIONTYPE.TOGGLE_SUBMITSUBMISSION }) }}>Back</Button>
                        <Button variant="primary" type="submit" disabled>Print</Button>
                    </div>
                </div>
            </div>


        </div >);



}


export { ShowSubmittedAppsList }