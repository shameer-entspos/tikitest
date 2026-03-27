'use client';
import { Search } from '@/components/Form/search';
import SignInRegisterModal from '@/components/popupModal/signInRegister';
import { useReducer, useState } from 'react';

import {
  AppContext,
  AppContextProps,
  appsReducer,
  initialAppState,
  useAppsCotnext,
} from './context';

import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQuery } from 'react-query';
import { getAllSubmittedApps } from './api';
import { useSession } from 'next-auth/react';

import Loader from '@/components/DottedLoader/loader';
import AllApps from '@/components/popupModal/appListinApp';
import { ShowSubmitAppDetail } from '@/components/popupModal/showSubmitAppDetail';
import { APPACTIONTYPE } from '@/app/helpers/user/enums';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="mx-auto max-w-[1360px] px-3 md:px-4 lg:px-5">
      <div className="page-heading-edit mb-6 flex flex-col items-center justify-between sm:flex-row sm:items-center">
        <div className="flex items-center text-2xl font-semibold text-black">
          {/* tiki logo */}
          <div
            className="mr-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e2f3ff] p-[5px] lg:h-[55px] lg:w-[55px]"
            style={{
              boxShadow: '0px 0px 2px 2px #0000001d',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M11.2513 4.16797C12.1815 4.16797 13.1026 4.35118 13.962 4.70716C14.8214 5.06313 15.6022 5.58488 16.26 6.24263C16.9177 6.90038 17.4395 7.68124 17.7955 8.54063C18.1514 9.40002 18.3346 10.3211 18.3346 11.2513V18.3346H11.2513C9.37269 18.3346 7.57101 17.5884 6.24263 16.26C4.91425 14.9316 4.16797 13.1299 4.16797 11.2513C4.16797 9.37268 4.91425 7.57101 6.24263 6.24263C7.57101 4.91425 9.37269 4.16797 11.2513 4.16797ZM11.2513 21.668H18.3346V28.7513C18.3346 30.1523 17.9192 31.5217 17.1409 32.6866C16.3626 33.8514 15.2563 34.7593 13.962 35.2954C12.6677 35.8316 11.2434 35.9718 9.86942 35.6985C8.49538 35.4252 7.23325 34.7506 6.24263 33.76C5.25201 32.7694 4.57739 31.5072 4.30408 30.1332C4.03076 28.7592 4.17104 27.3349 4.70716 26.0406C5.24328 24.7463 6.15117 23.6401 7.31602 22.8617C8.48086 22.0834 9.85035 21.668 11.2513 21.668ZM28.7513 4.16797C30.6299 4.16797 32.4316 4.91425 33.76 6.24263C35.0884 7.57101 35.8346 9.37268 35.8346 11.2513C35.8346 13.1299 35.0884 14.9316 33.76 16.26C32.4316 17.5884 30.6299 18.3346 28.7513 18.3346H21.668V11.2513C21.668 9.37268 22.4142 7.57101 23.7426 6.24263C25.071 4.91425 26.8727 4.16797 28.7513 4.16797ZM21.668 21.668H28.7513C30.1523 21.668 31.5217 22.0834 32.6866 22.8617C33.8514 23.6401 34.7593 24.7463 35.2955 26.0406C35.8316 27.3349 35.9718 28.7592 35.6985 30.1332C35.4252 31.5072 34.7506 32.7694 33.76 33.76C32.7694 34.7506 31.5072 35.4252 30.1332 35.6985C28.7592 35.9718 27.3349 35.8316 26.0406 35.2954C24.7463 34.7593 23.6401 33.8514 22.8617 32.6866C22.0834 31.5217 21.668 30.1523 21.668 28.7513V21.668Z"
                fill="#0063F7"
              />
            </svg>
          </div>
          <p className="text-xl font-bold text-[#1e1e1e] lg:text-2xl">
            Tiki Apps
          </p>
        </div>

        <div className="mt-5 flex w-full items-center gap-12 sm:mt-0 sm:w-auto">
          {/* <h1 className="text-base text-[#0063F7]">Submissions</h1> */}
          <Search
            className="inline-flex h-[49px] w-full items-center justify-start rounded-lg bg-[#eeeeee] pb-3.5 pl-5 pr-[109px] pt-[13px] text-base font-normal text-[#616161] md:w-[253px]"
            inputRounded={true}
            type="text"
            name="search"
            placeholder="Search App"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <AllApps searchQuery={searchQuery} />

      {/* <div className="text-right">
          <Pagination />
        </div> */}
    </div>
  );
}
