import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { AMAPPACTIONTYPE } from "@/app/helpers/user/enums";
import { useState } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { SimpleInput } from "@/components/Form/simpleInput";
import { useMutation } from "react-query";
import useAxiosAuth from "@/hooks/AxiosAuth";
import {
  createjSASubmision,
  updatejSASubmision,
} from "@/app/(main)/(user-panel)/user/apps/api";
import { JSAAppState } from "@/app/helpers/user/states";
import Loader from "@/components/DottedLoader/loader";
import { useTimeSheetAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context";
import { useAssetManagerAppsContext } from "@/app/(main)/(user-panel)/user/apps/am/am_context";

export function AssetManagerTopBar() {
  const { state, dispatch } = useAssetManagerAppsContext();

  const handleGoBack = () => {
    dispatch({
      type: AMAPPACTIONTYPE.SHOWPAGES,
    });
  };

  return (
    <>
      <div className="breadCrumbs p-2 flex justify-between">
        <img src="/svg/asset_manager/logo.svg" alt="show logo" />
        {/* <div className="bg-[#F1CD70] px-3 py-2 rounded font-semibold">JSA</div> */}
        {/* <Link href={'/use /apps'}> */}
        <button onClick={handleGoBack}>
          <img src="/svg/timesheet_app/go_back.svg" alt="show logo" />
        </button>
        {/* </Link> */}
      </div>
    </>
  );
}
