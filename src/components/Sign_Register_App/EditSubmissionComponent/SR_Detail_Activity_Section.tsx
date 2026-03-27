import { getOneSubmissionactivitiesList } from "@/app/(main)/(user-panel)/user/apps/api";
import { useSRAppCotnext } from "@/app/(main)/(user-panel)/user/apps/sr/sr_context";
import { dateFormat, timeFormat } from "@/app/helpers/dateFormat";
import { RollCall } from "@/app/type/roll_call";
import Loader from "@/components/DottedLoader/loader";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { PresignedUserAvatar } from "@/components/common/PresignedUserAvatar";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";

export function SRDetailActivitySection({
  SRSubmissionDetail,
}: {
  SRSubmissionDetail: RollCall | undefined;
}) {
  const axiosAuth = useAxiosAuth();
  const context = useSRAppCotnext();
  const { data, isLoading } = useQuery({
    queryFn: () =>
      getOneSubmissionactivitiesList({
        axiosAuth,
        id: SRSubmissionDetail?._id ?? "",
      }),
    queryKey: [`getSingleSubmissionActivites${SRSubmissionDetail?._id}`],
    onSuccess: () => {},
  });
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

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
        toast.error(`not found ${type}`);
        return "bg-gray-200";
    }
  };
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className=" h-full overflow-auto scrollbar-hide mx-4 my-4">
      <div className=" flex justify-between items-center  flex-wrap border-2 border-[#EEEEEE] rounded-lg shadow cursor-pointer">
        <div className="flex justify-between px-4 py-5 border w-full">
          <table className="w-full border-collapse">
            <tbody className=" text-sm font-normal text-[#1E1E1E] ">
              {(data ?? []).map((item) => {
                return (
                  <tr key={item._id} className=" border-b relative">
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
                    <td className="p-2">
                      {timeFormat(item.createdAt.toString())}
                    </td>
                    <td className="p-2">
                      {dateFormat(item.createdAt.toString())}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
