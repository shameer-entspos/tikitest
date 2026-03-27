import { createDuplicateOfSubmission } from "@/app/(main)/(user-panel)/user/apps/api";
import { useJSAAppsCotnext } from "@/app/(main)/(user-panel)/user/apps/jsa/jsaContext";
import { JSAAPPACTIONTYPE } from "@/app/helpers/user/enums";
import Loader from "@/components/DottedLoader/loader";
import { SimpleInput } from "@/components/Form/simpleInput";
import useAxiosAuth from "@/hooks/AxiosAuth";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

const JSADuplicateModal = () => {
  const { state, dispatch } = useJSAAppsCotnext();
  const axiosAuth = useAxiosAuth();
  const queryclient = useQueryClient();
  const createDuplicateMutation = useMutation(createDuplicateOfSubmission, {
    onSuccess: () => {
      dispatch({ type: JSAAPPACTIONTYPE.SHOW_DUPLICATE_MODEL });
      queryclient.invalidateQueries("JSATemplates");
      queryclient.invalidateQueries("JSADraft");
      queryclient.invalidateQueries("JSASubmissions");
    },
  });
  const formValidator = (values: any) => {
    const errors: any = {};

    if (!values.jsaName) {
      errors.jsaName = "JSA Name is required";
    }

    if (
      state.selectLocationForDuplicate == "my" ||
      state.selectLocationForDuplicate == "shared"
    ) {
      if (!values.templateName) {
        errors.templateName = "Template Name is required";
      }
    }
    return errors;
  };

  const formIk = useFormik({
    initialValues: {
      jsaName: state.showDuplicateModel?.name ?? "",
      templateName: "",
    },
    validate: formValidator,
    onSubmit: (values) => {
      createDuplicateMutation.mutate({
        axiosAuth,
        data: {
          jsaName: values.jsaName,
          duplicateAs: state.selectLocationForDuplicate,
          subId: state.showDuplicateModel?._id,
          templateName: values.templateName,
        },
      });
    },
  });
  return (
    <Modal
      isOpen={true}
      onOpenChange={() => {
        dispatch({ type: JSAAPPACTIONTYPE.SHOW_DUPLICATE_MODEL });
      }}
      placement="top-center"
      size="xl"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-8 pt-5">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                <path
                  d="M33.8477 17.5H20.8398C18.9953 17.5 17.5 18.9953 17.5 20.8398V33.8477C17.5 35.6922 18.9953 37.1875 20.8398 37.1875H33.8477C35.6922 37.1875 37.1875 35.6922 37.1875 33.8477V20.8398C37.1875 18.9953 35.6922 17.5 33.8477 17.5Z"
                  stroke="#0063F7"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M32.4707 17.5L32.5 16.0938C32.4975 15.2243 32.151 14.3911 31.5362 13.7763C30.9214 13.1615 30.0882 12.815 29.2188 12.8125H16.5625C15.5688 12.8154 14.6167 13.2115 13.9141 13.9141C13.2115 14.6167 12.8154 15.5688 12.8125 16.5625V29.2188C12.815 30.0882 13.1615 30.9214 13.7763 31.5362C14.3911 32.151 15.2243 32.4975 16.0938 32.5H17.5M27.3438 22.6562V32.0312M32.0312 27.3438H22.6562"
                  stroke="#0063F7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div>
                <h2 className="text-xl font-semibold text-[#1E1E1E]">
                  {"Duplicate"}
                </h2>
                <span className="mt-1 text-base font-normal text-[#616161]">
                  {"Select one of the following locations to duplicate entry."}
                </span>
              </div>
            </ModalHeader>
            <ModalBody className="px-10 pb-12">
              <div className="ml-3 flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                  name="Submission"
                  value="1"
                  checked={state.selectLocationForDuplicate == "Submission"}
                  onChange={() => {
                    dispatch({
                      type: JSAAPPACTIONTYPE.TOGGLE_DUPLICATE_LOCATION,
                      selectLocationForDuplicate: "Submission",
                    });
                  }}
                />
                <span className="ml-2 text-gray-600">Submission</span>
              </div>{" "}
              <div className="ml-3 mt-1 flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                  name="Draft"
                  value="2"
                  checked={state.selectLocationForDuplicate == "Draft"}
                  onChange={() => {
                    dispatch({
                      type: JSAAPPACTIONTYPE.TOGGLE_DUPLICATE_LOCATION,
                      selectLocationForDuplicate: "Draft",
                    });
                  }}
                />
                <span className="ml-2 text-gray-600">Drafts</span>
              </div>{" "}
              <div className="ml-3 mt-1 flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                  name="my"
                  value="3"
                  checked={state.selectLocationForDuplicate == "my"}
                  onChange={() => {
                    dispatch({
                      type: JSAAPPACTIONTYPE.TOGGLE_DUPLICATE_LOCATION,
                      selectLocationForDuplicate: "my",
                    });
                  }}
                />
                <span className="ml-2 text-gray-600">My Template</span>
              </div>{" "}
              <div className="ml-3 mt-1 flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  className="h-4 w-4 border-2 border-black checked:bg-black checked:text-black"
                  name="shared"
                  value="4"
                  checked={state.selectLocationForDuplicate == "shared"}
                  onChange={() => {
                    dispatch({
                      type: JSAAPPACTIONTYPE.TOGGLE_DUPLICATE_LOCATION,
                      selectLocationForDuplicate: "shared",
                    });
                  }}
                />
                <span className="ml-2 text-gray-600">Shared Template</span>
              </div>
              <form onSubmit={formIk.handleSubmit}>
                <SimpleInput
                  type="text"
                  label="JSA Name"
                  placeholder=""
                  name="jsaName"
                  className="w-full"
                  errorMessage={formIk.errors.jsaName}
                  value={formIk.values.jsaName}
                  isTouched={formIk.touched.jsaName}
                  onChange={formIk.handleChange}
                />
                {(state.selectLocationForDuplicate == "my" ||
                  state.selectLocationForDuplicate == "shared") && (
                  <SimpleInput
                    type="text"
                    label="Template Name"
                    placeholder=""
                    name="templateName"
                    className="w-full"
                    errorMessage={formIk.errors.templateName}
                    value={formIk.values.templateName}
                    isTouched={formIk.touched.templateName}
                    onChange={formIk.handleChange}
                  />
                )}
              </form>
            </ModalBody>
            <ModalFooter className="border-t-2 border-gray-200">
              <Button
                className="border-2 border-[#0063F7] bg-white px-10 font-semibold text-[#0063F7]"
                onPress={() => {
                  dispatch({ type: JSAAPPACTIONTYPE.SHOW_DUPLICATE_MODEL });
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#0063F7] px-10 font-semibold text-white disabled:bg-gray-300"
                disabled={!formIk.isValid}
                onPress={() => {
                  formIk.handleSubmit();
                }}
              >
                {createDuplicateMutation.isLoading ? <Loader /> : <>Save</>}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default JSADuplicateModal;
