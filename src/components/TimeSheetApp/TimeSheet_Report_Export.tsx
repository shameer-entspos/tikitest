'use client';
import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import ReportExportExpensesModel from './Models/Expense_Report_Model';
import ReportTimeSheetModel from './Models/TimeSheet_Report_Dialog';

const TimeSheetReportExport = () => {
  const session = useSession();
  const { state, dispatch } = useTimeSheetAppsCotnext();

  return (
    <>
      <div className="h-[calc(var(--app-vh)- 151px)] flex w-full max-w-[668px] flex-col gap-5 overflow-auto border-[#EEEEEE] pl-5 pr-12 pt-5 lg:border-r-2">
        <div className="text-base font-semibold text-[#1e1e1e]">
          Report & Export
        </div>
        <div className="grid w-full grid-cols-2 gap-5">
          <div
            className="w-full cursor-pointer"
            onClick={() => {
              dispatch({
                type: TIMESHEETTYPE.REPORT_PAGES,
                reportPages: 'show_report_timesheet',
              });
            }}
          >
            <div className="inline-flex w-full max-w-[290px] items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Timesheets
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <path
                    d="M20.8307 8.33203L14.5807 2.08203H6.2474C5.69486 2.08203 5.16496 2.30152 4.77426 2.69223C4.38356 3.08293 4.16406 3.61283 4.16406 4.16536V20.832C4.16406 21.3846 4.38356 21.9145 4.77426 22.3052C5.16496 22.6959 5.69486 22.9154 6.2474 22.9154H18.7474C19.2999 22.9154 19.8298 22.6959 20.2205 22.3052C20.6112 21.9145 20.8307 21.3846 20.8307 20.832V8.33203ZM9.3724 19.7904H7.28906V10.4154H9.3724V19.7904ZM13.5391 19.7904H11.4557V13.5404H13.5391V19.7904ZM17.7057 19.7904H15.6224V16.6654H17.7057V19.7904ZM14.5807 9.3737H13.5391V4.16536L18.7474 9.3737H14.5807Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div
            className="w-full cursor-pointer"
            onClick={() => {
              dispatch({
                type: TIMESHEETTYPE.REPORT_PAGES,
                reportPages: 'show_report_expense',
              });
            }}
          >
            <div className="inline-flex w-full max-w-[290px] items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Expenses
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <path
                    d="M20.8307 8.33203L14.5807 2.08203H6.2474C5.69486 2.08203 5.16496 2.30152 4.77426 2.69223C4.38356 3.08293 4.16406 3.61283 4.16406 4.16536V20.832C4.16406 21.3846 4.38356 21.9145 4.77426 22.3052C5.16496 22.6959 5.69486 22.9154 6.2474 22.9154H18.7474C19.2999 22.9154 19.8298 22.6959 20.2205 22.3052C20.6112 21.9145 20.8307 21.3846 20.8307 20.832V8.33203ZM9.3724 19.7904H7.28906V10.4154H9.3724V19.7904ZM13.5391 19.7904H11.4557V13.5404H13.5391V19.7904ZM17.7057 19.7904H15.6224V16.6654H17.7057V19.7904ZM14.5807 9.3737H13.5391V4.16536L18.7474 9.3737H14.5807Z"
                    fill="black"
                  />
                </svg>
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

      {state.reportPages == 'show_report_expense' && (
        <ReportExportExpensesModel />
      )}
      {state.reportPages == 'show_report_timesheet' && <ReportTimeSheetModel />}
    </>
  );
};

export default TimeSheetReportExport;
