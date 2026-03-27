'use client';
import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';
import { AMAPPACTIONTYPE, TIMESHEETTYPE } from '@/app/helpers/user/enums';
import ExpenseReviewListView from '../../TimeSheetApp/Expense_Review_List';
import TimeSheetReviewListView from '../../TimeSheetApp/TimeSheet_Review_List';
import { useAssetManagerAppsContext } from '@/app/(main)/(user-panel)/user/apps/am/am_context';

const CheckInOutOptions = () => {
  const session = useSession();
  const { state, dispatch } = useAssetManagerAppsContext();

  return (
    <>
      <div className="h-[calc(var(--app-vh)- 151px)] flex w-full max-w-[668px] flex-col gap-5 overflow-auto border-[#EEEEEE] pl-5 pr-12 pt-5 lg:border-r-2">
        <div className="grid-col-1 grid w-full gap-5 xl:grid-cols-2">
          <div
            className="w-full cursor-pointer"
            onClick={() => {
              dispatch({
                type: AMAPPACTIONTYPE.SHOWPAGES,
                showPages: 'show_checkout',
              });
            }}
          >
            <div className="inline-flex w-full items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow xl:max-w-[290px]">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Check out
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <div className="w-[20px] xl:w-[25px]">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.90625 21.0938L21.0938 21.0938C21.5082 21.0938 21.9056 20.9291 22.1986 20.6361C22.4916 20.3431 22.6562 19.9457 22.6562 19.5312L22.6562 5.46875C22.6562 5.05435 22.4916 4.65692 22.1986 4.3639C21.9056 4.07087 21.5082 3.90625 21.0937 3.90625L3.90625 3.90625C3.49185 3.90625 3.09442 4.07087 2.8014 4.3639C2.50837 4.65692 2.34375 5.05435 2.34375 5.46875L2.34375 19.5313C2.34375 19.9457 2.50837 20.3431 2.8014 20.6361C3.09442 20.9291 3.49185 21.0938 3.90625 21.0938ZM7.03125 11.7188C7.03125 11.5115 7.11356 11.3128 7.26007 11.1663C7.40658 11.0198 7.6053 10.9375 7.8125 10.9375H15.3018L14.291 9.92773C14.2184 9.85515 14.1609 9.76898 14.1216 9.67414C14.0823 9.5793 14.0621 9.47765 14.0621 9.375C14.0621 9.27235 14.0823 9.1707 14.1216 9.07586C14.1609 8.98102 14.2184 8.89485 14.291 8.82227C14.3636 8.74968 14.4498 8.6921 14.5446 8.65282C14.6395 8.61353 14.7411 8.59332 14.8437 8.59332C14.9464 8.59332 15.048 8.61353 15.1429 8.65282C15.2377 8.6921 15.3239 8.74968 15.3965 8.82227L17.7402 11.166C17.8129 11.2386 17.8705 11.3247 17.9098 11.4196C17.9491 11.5144 17.9694 11.6161 17.9694 11.7188C17.9694 11.8214 17.9491 11.9231 17.9098 12.0179C17.8705 12.1128 17.8129 12.1989 17.7402 12.2715L15.3965 14.6152C15.2499 14.7618 15.0511 14.8442 14.8438 14.8442C14.6364 14.8442 14.4376 14.7618 14.291 14.6152C14.1444 14.4686 14.0621 14.2698 14.0621 14.0625C14.0621 13.8552 14.1444 13.6564 14.291 13.5098L15.3018 12.5H8.59375L8.59375 14.8438C8.59375 15.051 8.51144 15.2497 8.36493 15.3962C8.21842 15.5427 8.0197 15.625 7.8125 15.625C7.6053 15.625 7.40658 15.5427 7.26007 15.3962C7.11356 15.2497 7.03125 15.051 7.03125 14.8438L7.03125 11.7188Z"
                      fill="#1E1E1E"
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
                type: AMAPPACTIONTYPE.SHOWPAGES,
                showPages: 'show_checkin',
              });
            }}
          >
            <div className="inline-flex w-full items-end justify-between gap-[45px] self-stretch rounded-2xl border border-[#e0e0e0] px-5 py-[25px] shadow xl:max-w-[290px]">
              <div className="text-base font-semibold text-[#1e1e1e]">
                Return / Check in
              </div>
              <div className="relative flex flex-col items-start justify-start">
                <div className="w-[20px] xl:w-[25px]">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21.0938 3.90625H3.90625C3.49185 3.90625 3.09442 4.07087 2.8014 4.3639C2.50837 4.65692 2.34375 5.05435 2.34375 5.46875V19.5312C2.34375 19.9457 2.50837 20.3431 2.8014 20.6361C3.09442 20.9291 3.49185 21.0938 3.90625 21.0938H21.0938C21.5082 21.0938 21.9056 20.9291 22.1986 20.6361C22.4916 20.3431 22.6562 19.9457 22.6562 19.5312V5.46875C22.6562 5.05435 22.4916 4.65692 22.1986 4.3639C21.9056 4.07087 21.5082 3.90625 21.0938 3.90625ZM17.9688 13.2812C17.9688 13.4885 17.8864 13.6872 17.7399 13.8337C17.5934 13.9802 17.3947 14.0625 17.1875 14.0625H9.69824L10.709 15.0723C10.7816 15.1449 10.8391 15.231 10.8784 15.3259C10.9177 15.4207 10.9379 15.5223 10.9379 15.625C10.9379 15.7277 10.9177 15.8293 10.8784 15.9241C10.8391 16.019 10.7816 16.1051 10.709 16.1777C10.6364 16.2503 10.5502 16.3079 10.4554 16.3472C10.3605 16.3865 10.2589 16.4067 10.1562 16.4067C10.0536 16.4067 9.95195 16.3865 9.85711 16.3472C9.76227 16.3079 9.6761 16.2503 9.60352 16.1777L7.25977 13.834C7.18713 13.7614 7.1295 13.6753 7.09019 13.5804C7.05087 13.4856 7.03064 13.3839 7.03064 13.2812C7.03064 13.1786 7.05087 13.0769 7.09019 12.9821C7.1295 12.8872 7.18713 12.8011 7.25977 12.7285L9.60352 10.3848C9.75011 10.2382 9.94893 10.1558 10.1562 10.1558C10.3636 10.1558 10.5624 10.2382 10.709 10.3848C10.8556 10.5314 10.9379 10.7302 10.9379 10.9375C10.9379 11.1448 10.8556 11.3436 10.709 11.4902L9.69824 12.5H16.4062V10.1562C16.4062 9.94905 16.4886 9.75034 16.6351 9.60382C16.7816 9.45731 16.9803 9.375 17.1875 9.375C17.3947 9.375 17.5934 9.45731 17.7399 9.60382C17.8864 9.75034 17.9688 9.94905 17.9688 10.1562V13.2812Z"
                      fill="#1E1E1E"
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
                type: AMAPPACTIONTYPE.SHOWPAGES,
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

      {/* {state.checkinoutPages == "show_checkin" && <ExpenseReviewListView />}
      {state.checkinoutPages == "show_checkout" && <TimeSheetReviewListView />} */}
    </>
  );
};

export default CheckInOutOptions;
