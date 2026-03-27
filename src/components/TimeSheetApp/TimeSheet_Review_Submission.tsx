'use client';
import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import ExpenseReviewListView from './Expense_Review_List';
import TimeSheetReviewListView from './TimeSheet_Review_List';

const TimeSheetReviewSubmission = () => {
  const session = useSession();
  const { state, dispatch } = useTimeSheetAppsCotnext();

  return (
    <>
      <div className="h-[calc(var(--app-vh)- 151px)] flex w-full max-w-[668px] flex-col gap-5 overflow-auto border-[#EEEEEE] pl-5 pr-12 pt-5 lg:border-r-2">
        <div className="text-base font-semibold text-[#1e1e1e]">
          Review Submission
        </div>

        <div className="grid-col-1 grid w-full gap-5 xl:grid-cols-2">
          <div
            className="w-full cursor-pointer"
            onClick={() => {
              dispatch({
                type: TIMESHEETTYPE.REVIEW_PAGES,
                reviewPages: 'show_timesheet_review',
              });
            }}
          >
            <div className="inline-flex w-full items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow xl:max-w-[290px]">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Timesheets
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <div className="w-[20px] xl:w-[25px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M17.9948 21.0938L21.6146 17.5L20.5208 16.4063L17.9948 18.8802L16.9792 17.8646L15.8854 18.9844L17.9948 21.0938ZM6.25 9.375H18.75V7.29167H6.25V9.375ZM18.75 23.9583C17.309 23.9583 16.0809 23.4503 15.0656 22.4344C14.0503 21.4184 13.5424 20.1903 13.5417 18.75C13.541 17.3097 14.049 16.0816 15.0656 15.0656C16.0823 14.0497 17.3104 13.5417 18.75 13.5417C20.1896 13.5417 21.4181 14.0497 22.4354 15.0656C23.4528 16.0816 23.9604 17.3097 23.9583 18.75C23.9562 20.1903 23.4483 21.4188 22.4344 22.4354C21.4205 23.4521 20.1924 23.9597 18.75 23.9583ZM3.125 22.9167V5.20833C3.125 4.63542 3.32917 4.14514 3.7375 3.7375C4.14583 3.32986 4.63611 3.12569 5.20833 3.125H19.7917C20.3646 3.125 20.8552 3.32917 21.2635 3.7375C21.6719 4.14583 21.8757 4.63611 21.875 5.20833V12.1615C21.3889 11.9184 20.8809 11.7403 20.351 11.6271C19.8212 11.5139 19.2875 11.4576 18.75 11.4583H6.25V13.5417H13.6458C13.3507 13.8368 13.0774 14.158 12.826 14.5052C12.5747 14.8524 12.3531 15.2257 12.1615 15.625H6.25V17.7083H11.5365C11.5017 17.8819 11.4802 18.0514 11.4719 18.2167C11.4635 18.3819 11.459 18.5597 11.4583 18.75C11.4583 19.4792 11.5583 20.1781 11.7583 20.8469C11.9583 21.5156 12.2576 22.1535 12.6562 22.7604L12.5 22.9167L10.9375 21.3542L9.375 22.9167L7.8125 21.3542L6.25 22.9167L4.6875 21.3542L3.125 22.9167Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-full cursor-pointer"
            onClick={() => {
              dispatch({
                type: TIMESHEETTYPE.REVIEW_PAGES,
                reviewPages: 'show_expense_review',
              });
            }}
          >
            <div className="inline-flex w-full items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow xl:max-w-[290px]">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Expenses
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <div className="w-[20px] xl:w-[25px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M17.9948 21.0938L21.6146 17.5L20.5208 16.4063L17.9948 18.8802L16.9792 17.8646L15.8854 18.9844L17.9948 21.0938ZM6.25 9.375H18.75V7.29167H6.25V9.375ZM18.75 23.9583C17.309 23.9583 16.0809 23.4503 15.0656 22.4344C14.0503 21.4184 13.5424 20.1903 13.5417 18.75C13.541 17.3097 14.049 16.0816 15.0656 15.0656C16.0823 14.0497 17.3104 13.5417 18.75 13.5417C20.1896 13.5417 21.4181 14.0497 22.4354 15.0656C23.4528 16.0816 23.9604 17.3097 23.9583 18.75C23.9562 20.1903 23.4483 21.4188 22.4344 22.4354C21.4205 23.4521 20.1924 23.9597 18.75 23.9583ZM3.125 22.9167V5.20833C3.125 4.63542 3.32917 4.14514 3.7375 3.7375C4.14583 3.32986 4.63611 3.12569 5.20833 3.125H19.7917C20.3646 3.125 20.8552 3.32917 21.2635 3.7375C21.6719 4.14583 21.8757 4.63611 21.875 5.20833V12.1615C21.3889 11.9184 20.8809 11.7403 20.351 11.6271C19.8212 11.5139 19.2875 11.4576 18.75 11.4583H6.25V13.5417H13.6458C13.3507 13.8368 13.0774 14.158 12.826 14.5052C12.5747 14.8524 12.3531 15.2257 12.1615 15.625H6.25V17.7083H11.5365C11.5017 17.8819 11.4802 18.0514 11.4719 18.2167C11.4635 18.3819 11.459 18.5597 11.4583 18.75C11.4583 19.4792 11.5583 20.1781 11.7583 20.8469C11.9583 21.5156 12.2576 22.1535 12.6562 22.7604L12.5 22.9167L10.9375 21.3542L9.375 22.9167L7.8125 21.3542L6.25 22.9167L4.6875 21.3542L3.125 22.9167Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex w-full items-start">
          <div
            className="flex w-full cursor-pointer justify-start"
            onClick={() => {
              dispatch({
                type: TIMESHEETTYPE.SHOWPAGES,
              });
            }}
          >
            <img
              src="/svg/timesheet_app/arrow_with_back.svg"
              alt="arrow_with_back"
            />

            <div></div>
          </div>
        </div>
      </div>

      {state.reviewPages == 'show_expense_review' && <ExpenseReviewListView />}
      {state.reviewPages == 'show_timesheet_review' && (
        <TimeSheetReviewListView />
      )}
    </>
  );
};

export default TimeSheetReviewSubmission;
