import {
  updateMultipleExpenses,
  updateMultipleTimeSheets,
} from "@/app/(main)/(user-panel)/user/apps/timesheets/api";
import Loader from "@/components/DottedLoader/loader";
import useAxiosAuth from "@/hooks/AxiosAuth";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Button } from "@/components/Buttons";
import { TimeSheet } from "@/app/type/timesheet";
import { Expanse } from "@/app/type/expanse";

interface ExpenseReviewMultiSelectModalProps {
  handleShowModel: () => void;
  selectedExpenses: Expanse[];
}

const EDIT_DELETE_BLOCKED_STATUSES = ["approved", "review"];

const ExpenseReviewMultiSelectModal: React.FC<
  ExpenseReviewMultiSelectModalProps
> = ({ handleShowModel, selectedExpenses }) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const updateMultipleTimeSheetMutation = useMutation(updateMultipleExpenses, {
    onSuccess: () => {
      handleShowModel();
      queryClient.invalidateQueries("expenses");
    },
  });

  // Disable delete when any selected expense is Approved or Under Review
  const hasBlockedStatusForDelete = (selectedExpenses ?? []).some((ex) =>
    EDIT_DELETE_BLOCKED_STATUSES.includes(ex.status)
  );

  const [selectedOption, setSelectedOption] = useState<
    "approved" | "review" | "not" | "delete"
  >("approved");

  const handleOptionChange = (
    option: "approved" | "review" | "not" | "delete",
  ) => {
    setSelectedOption(option);
  };

  return (
    <Modal
      isOpen={true}
      onOpenChange={handleShowModel}
      placement="auto"
      size="xl"
      className="absolute max-h-[700px] px-8 pt-2"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            {/* Conditionally render header based on selected option */}
            <ModalHeader className="flex flex-row items-center gap-2 px-1 py-5">
              <div className="flex w-fit gap-4">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M16.25 33.75H18.0312L30.25 21.5313L28.4688 19.75L16.25 31.9688V33.75ZM13.75 36.25V30.9375L30.25 14.4688C30.5 14.2396 30.7763 14.0625 31.0788 13.9375C31.3813 13.8125 31.6987 13.75 32.0312 13.75C32.3638 13.75 32.6867 13.8125 33 13.9375C33.3133 14.0625 33.5842 14.25 33.8125 14.5L35.5312 16.25C35.7812 16.4792 35.9638 16.75 36.0788 17.0625C36.1938 17.375 36.2508 17.6875 36.25 18C36.25 18.3333 36.1929 18.6513 36.0788 18.9538C35.9646 19.2562 35.7821 19.5321 35.5312 19.7812L19.0625 36.25H13.75ZM29.3438 20.6562L28.4688 19.75L30.25 21.5313L29.3438 20.6562Z"
                    fill="#0063F7"
                  />
                </svg>
                <div>
                  <h2 className="text-xl font-semibold">Bulk Select Options</h2>
                  <p className="mt-1 text-sm font-normal text-[#616161]">
                    Select an option below.
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="mt-0 flex flex-col justify-start overflow-y-scroll p-0 pb-8 pl-2 pr-4 pt-4 scrollbar-hide">
              <div className="mb-24 flex flex-col space-y-4 p-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="approveOption"
                    checked={selectedOption == "approved"}
                    onClick={() => handleOptionChange("approved")}
                    className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                  />
                  <span className="ml-2">Approved</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="optionUnderReview"
                    checked={selectedOption == "review"}
                    onClick={() => handleOptionChange("review")}
                    className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                  />
                  <span className="ml-2">Under Review</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="optionNotApproved"
                    checked={selectedOption == "not"}
                    onClick={() => handleOptionChange("not")}
                    className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                  />
                  <span className="ml-2">Not Approved</span>
                </label>
                <label
                  className={`inline-flex items-center ${
                    hasBlockedStatusForDelete ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="optionDeleteExpense"
                    checked={selectedOption == "delete"}
                    disabled={hasBlockedStatusForDelete}
                    onClick={() => !hasBlockedStatusForDelete && handleOptionChange("delete")}
                    className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                  />
                  <span className="ml-2">Delete Expense</span>
                </label>
              </div>
            </ModalBody>

            <ModalFooter className="m-0 p-0">
              <div className="flex w-full items-center justify-end gap-2 border-t-1 p-3">
                <Button variant="primaryOutLine" onClick={onCloseModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={
                    selectedOption === "delete" && hasBlockedStatusForDelete
                  }
                  onClick={() => {
                    if (
                      selectedOption === "delete" &&
                      hasBlockedStatusForDelete
                    ) {
                      return;
                    }
                    const data = {
                      status: selectedOption,
                      type: "expense",
                    };
                    updateMultipleTimeSheetMutation.mutate({
                      axiosAuth,
                      data: {
                        ids: (selectedExpenses ?? []).map((ts) => ts._id),
                        action:
                          selectedOption == "delete" ? "DELETE" : "UPDATE",
                        data,
                      },
                    });
                  }}
                >
                  {updateMultipleTimeSheetMutation.isLoading ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>Confirm</>
                  )}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExpenseReviewMultiSelectModal;
