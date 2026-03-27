import { useSafetyHubContext } from "@/app/(main)/(user-panel)/user/apps/sh/sh_context";
import { dateFormatWithoutYear, timeFormat } from "@/app/helpers/dateFormat";
import { generateSecureToken } from "@/app/helpers/token_generator";
import { LiveBoard } from "@/app/type/live_board";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Colors } from "react-select";
import { getPresignedFileUrl } from "@/app/(main)/(user-panel)/user/file/api";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useSession } from "next-auth/react";

const LiveBoardItem = ({ data }: { data: LiveBoard }) => {
  const router = useRouter();
  const { state } = useSafetyHubContext();
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const rawFirst = (data.images ?? [])?.[0];
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!rawFirst?.trim() || !accessToken?.trim()) {
      setResolvedUrl(null);
      return;
    }
    let cancelled = false;
    getPresignedFileUrl(axiosAuth, rawFirst, accessToken).then((url) => {
      if (!cancelled && url) setResolvedUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [rawFirst, accessToken, axiosAuth]);

  const bgImageUrl =
    (data.images ?? []).length > 0
      ? (resolvedUrl ?? rawFirst ?? "/images/nophotobg.jpeg")
      : "/images/nophotobg.jpeg";

  return (
    <div
      className="border relative rounded-lg overflow-hidden bg-cover bg-center w-full cursor-pointer max-w-[319px] max-h-[250px] hover:shadow-xl hover:shadow-primary-200"
      style={{
        paddingBottom: "78.5%",
        backgroundImage: `url(${bgImageUrl})`,
        objectFit: "cover",
      }}
      onClick={() => {
        const token = generateSecureToken({
          userId: data._id,
          readonly: false,
          expiresAt: Date.now() + 60 * 60 * 1000, // Expires in 1 hour
        });
        router.push(`/user/apps/sh/${state.appId}/hazard/${data._id}?token=${token}&from=liveboard`);
      }}
    >
      {/* Top-right Incident & Status */}
      <div className="absolute top-2 right-2 space-y-1 flex flex-col items-end">
        {checkLiveBoardType(data.isHazardOrIncident)}
        {checkLiveBoardStatus(data.status)}
      </div>

      {/* Bottom-center text */}
      <div className="absolute w-full bottom-0 text-center flex flex-col p-2 space-y-1 gap-1">
        <div className="flex justify-end space-x-1">
          <span className="bg-white bg-opacity-90 px-2 py-1 rounded-lg text-xs w-fit">
            {dateFormatWithoutYear(data.createdAt.toString())}
          </span>
          <span className="bg-white bg-opacity-90 px-2 py-1 rounded-lg text-xs w-fit">
            {timeFormat(data.createdAt.toString())}
          </span>
        </div>

        <span className="bg-white bg-opacity-90 font-bold text-left px-4 py-1 rounded-md text-xs w-full">
          {data.description}
        </span>
      </div>
    </div>
  );
};

export default LiveBoardItem;

export function checkLiveBoardType(type: string) {
  if (type == "hazard") {
    return (
      <span className="text-black px-2 py-1 bg-[#FFD597] rounded-md text-xs w-fit">
        Hazard
      </span>
    );
  } else {
    return (
      <span className="text-black px-2 py-1 bg-[#FFA8A8] rounded-md text-xs w-fit">
        Incident
      </span>
    );
  }
}

export function checkLiveBoardStatus(type: string) {
  if (type == "Unresolved") {
    return (
      <span className=" text-white bg-[#DC3F35] px-2 py-1 rounded-md text-xs w-fit">
        Unresolved
      </span>
    );
  } else if (type == "Resolved") {
    return (
      <span className="bg-[#28A745] text-white px-2 py-1 rounded-md text-xs w-fit">
        Resolved
      </span>
    );
  } else {
    return (
      <span className="bg-[#DF8E13] text-white px-2 py-1 rounded-md text-xs w-fit">
        Under Review
      </span>
    );
  }
}
