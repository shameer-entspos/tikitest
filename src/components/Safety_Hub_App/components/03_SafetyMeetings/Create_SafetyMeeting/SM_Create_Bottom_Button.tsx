import { useSafetyHubContext } from "@/app/(main)/(user-panel)/user/apps/sh/sh_context";
import { useSRAppCotnext } from "@/app/(main)/(user-panel)/user/apps/sr/sr_context";
import { Button } from "@/components/Buttons";
import Loader from "@/components/DottedLoader/loader";

export function SMBottomButton({
  onNextClick,
  onCancel,
  nextValue = "Next",
  isDisabled = false,
  loading = false,
}: {
  onNextClick: any;
  onCancel: any;
  isDisabled?: boolean;
  loading?: boolean;
  nextValue?: string;
}) {
  const context = useSafetyHubContext();

  return (
    <div className="flex justify-between border-2 p-2 border-[#EEEEEE]">
      {context.state.show_safety_meeting_create_model == "project" ? (
        <>
          <Button variant="primaryOutLine" onClick={onCancel}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button variant="primaryOutLine" onClick={onCancel}>
            Back
          </Button>
        </>
      )}
      <div className="flex gap-5">
        <Button
          variant="primary"
          className={`${isDisabled ? "bg-gray-500" : "bg-primary-500"}`}
          disabled={isDisabled}
          onClick={onNextClick}
        >
          {loading ? (
            <Loader />
          ) : context.state.selected_safety_meeting_model ? (
            "Save"
          ) : (
            nextValue
          )}
        </Button>
      </div>
    </div>
  );
}
