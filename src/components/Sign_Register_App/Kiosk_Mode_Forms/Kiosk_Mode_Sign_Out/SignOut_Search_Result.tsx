import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { useState, useMemo } from 'react';
import SignOutModel from '../../Models/Sign_Out_Model';

type SortField = 'firstName' | 'lastName' | 'siteName' | 'date';
type SortDirection = 'asc' | 'desc';

export function SignOutSearchResult({
  dataList,
  onBack,
}: {
  dataList: SignInRegisterSubmission[] | undefined;
  onBack?: () => void;
}) {
  const [showModel, setShowModel] = useState(false);
  const [details, setDetails] = useState<
    SignInRegisterSubmission | undefined
  >();
  const [sorting, setSorting] = useState<{
    field: SortField;
    direction: SortDirection;
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!dataList || dataList.length === 0) return [];
    if (!sorting) return dataList;

    const sorted = [...dataList].sort((a, b) => {
      switch (sorting.field) {
        case 'firstName': {
          const aFirstName = (a.firstName || '').toLowerCase();
          const bFirstName = (b.firstName || '').toLowerCase();
          if (aFirstName < bFirstName)
            return sorting.direction === 'asc' ? -1 : 1;
          if (aFirstName > bFirstName)
            return sorting.direction === 'asc' ? 1 : -1;
          return 0;
        }
        case 'lastName': {
          const aLastName = (a.lastName || '').toLowerCase();
          const bLastName = (b.lastName || '').toLowerCase();
          if (aLastName < bLastName)
            return sorting.direction === 'asc' ? -1 : 1;
          if (aLastName > bLastName)
            return sorting.direction === 'asc' ? 1 : -1;
          return 0;
        }
        case 'siteName': {
          const aSiteName = (a.site?.siteName || '').toLowerCase();
          const bSiteName = (b.site?.siteName || '').toLowerCase();
          if (aSiteName < bSiteName)
            return sorting.direction === 'asc' ? -1 : 1;
          if (aSiteName > bSiteName)
            return sorting.direction === 'asc' ? 1 : -1;
          return 0;
        }
        case 'date': {
          const aDate = a.signInAt
            ? new Date(a.signInAt).getTime()
            : new Date(a.createdAt).getTime();
          const bDate = b.signInAt
            ? new Date(b.signInAt).getTime()
            : new Date(b.createdAt).getTime();
          return sorting.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [dataList, sorting]);

  const handleSort = (field: SortField) => {
    if (sorting?.field === field) {
      setSorting({
        field,
        direction: sorting.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSorting({ field, direction: 'asc' });
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sorting?.field !== field) {
      return (
        <img
          src="/images/fluent_arrow-sort-24-regular.svg"
          className="h-4 w-4"
          alt="sort"
        />
      );
    }
    return sorting.direction === 'asc' ? (
      <img
        src="/images/fluent_arrow-sort-24-regular.svg"
        className="h-4 w-4"
        alt="sort"
      />
    ) : (
      <img
        src="/images/fluent_arrow-sort-24-regular.svg"
        className="h-4 w-4"
        alt="sort"
      />
    );
  };
  console.log(dataList);
  if (!dataList || dataList.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center overflow-auto scrollbar-hide">
        <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-50 p-8">
          <svg
            className="h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              No records found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              No sign-in records match your search criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Search Results Header */}
        <div className="border-b-2 border-[#EEEEEE] px-4 py-3">
          <h2 className="text-lg font-semibold text-[#1E1E1E]">
            Search Results
          </h2>
          <p className="text-sm text-[#616161]">
            Showing signed in results from all sites.
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full border-collapse font-Open-Sans">
            <thead className="sticky top-0 z-10 bg-[#F5F5F5]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#616161]">
                  <span
                    className="flex cursor-pointer items-center gap-1"
                    onClick={() => handleSort('firstName')}
                  >
                    First Name
                    <SortIcon field="firstName" />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#616161]">
                  <span
                    className="flex cursor-pointer items-center gap-1"
                    onClick={() => handleSort('lastName')}
                  >
                    Last Name
                    <SortIcon field="lastName" />
                  </span>
                </th>
                {/* <th className="px-4 py-3 text-left text-sm font-semibold text-[#616161]">
                  <span className="flex cursor-pointer items-start gap-1">
                    Site Name
                  </span>
                </th> */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#616161]">
                  <span
                    className="flex cursor-pointer items-center gap-1"
                    onClick={() => handleSort('date')}
                  >
                    Date & Time
                    <SortIcon field="date" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#616161]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedData.map((item) => (
                <tr
                  key={item._id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1E1E1E]">
                    {item?.firstName ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1E1E1E]">
                    {item?.lastName ?? 'N/A'}
                  </td>
                  {/* <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-[#E2F3FF] px-3 py-1 text-xs font-medium text-[#0063F7]">
                      {item?.site?.siteName ?? 'N/A'}
                    </span>
                  </td> */}
                  <td className="px-4 py-3 text-sm text-[#1E1E1E]">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {dateFormat(
                          item?.signInAt?.toString() ??
                            item?.createdAt?.toString() ??
                            ''
                        )}
                      </span>
                      <span className="text-xs text-[#616161]">
                        {timeFormat(
                          item?.signInAt?.toString() ??
                            item?.createdAt?.toString() ??
                            ''
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="flex justify-end px-4 py-3">
                    <div
                      onClick={() => {
                        setShowModel(true);
                        setDetails(item);
                      }}
                    >
                      <svg
                        width="104"
                        height="30"
                        viewBox="0 0 104 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="104" height="30" rx="8" fill="#E2F3FF" />
                        <path
                          d="M17.082 17.7793C17.082 18.3717 16.9362 18.8822 16.6445 19.3105C16.3574 19.7389 15.9427 20.0671 15.4004 20.2949C14.8626 20.5228 14.2201 20.6367 13.4727 20.6367C13.1081 20.6367 12.7594 20.6162 12.4268 20.5752C12.0941 20.5342 11.7796 20.4749 11.4834 20.3975C11.1917 20.3154 10.9251 20.2174 10.6836 20.1035V18.5586C11.0892 18.7363 11.5426 18.8981 12.0439 19.0439C12.5452 19.1852 13.0557 19.2559 13.5752 19.2559C13.999 19.2559 14.3499 19.2012 14.6279 19.0918C14.9105 18.9779 15.1201 18.8184 15.2568 18.6133C15.3936 18.4036 15.4619 18.1598 15.4619 17.8818C15.4619 17.5856 15.3822 17.335 15.2227 17.1299C15.0632 16.9248 14.8216 16.738 14.498 16.5693C14.179 16.3962 13.778 16.2116 13.2949 16.0156C12.9668 15.8835 12.6523 15.7331 12.3516 15.5645C12.0553 15.3958 11.791 15.1976 11.5586 14.9697C11.3262 14.7419 11.1416 14.473 11.0049 14.1631C10.8727 13.8486 10.8066 13.4795 10.8066 13.0557C10.8066 12.4906 10.9411 12.0075 11.21 11.6064C11.4834 11.2054 11.8662 10.8978 12.3584 10.6836C12.8551 10.4694 13.4339 10.3623 14.0947 10.3623C14.6188 10.3623 15.111 10.417 15.5713 10.5264C16.0361 10.6357 16.4919 10.7907 16.9385 10.9912L16.4189 12.3105C16.0088 12.1419 15.61 12.0075 15.2227 11.9072C14.8398 11.807 14.4479 11.7568 14.0469 11.7568C13.7005 11.7568 13.4066 11.8092 13.165 11.9141C12.9235 12.0189 12.7389 12.167 12.6113 12.3584C12.4883 12.5452 12.4268 12.7686 12.4268 13.0283C12.4268 13.32 12.4974 13.5661 12.6387 13.7666C12.7845 13.9626 13.0078 14.1426 13.3086 14.3066C13.6139 14.4707 14.0059 14.653 14.4844 14.8535C15.0358 15.0814 15.5029 15.3206 15.8857 15.5713C16.2731 15.8219 16.5693 16.1227 16.7744 16.4736C16.9795 16.82 17.082 17.2552 17.082 17.7793ZM20.4521 12.9326V20.5H18.8457V12.9326H20.4521ZM19.6592 10.0342C19.9053 10.0342 20.1172 10.1003 20.2949 10.2324C20.4772 10.3646 20.5684 10.5924 20.5684 10.916C20.5684 11.235 20.4772 11.4629 20.2949 11.5996C20.1172 11.7318 19.9053 11.7979 19.6592 11.7979C19.404 11.7979 19.1875 11.7318 19.0098 11.5996C18.8366 11.4629 18.75 11.235 18.75 10.916C18.75 10.5924 18.8366 10.3646 19.0098 10.2324C19.1875 10.1003 19.404 10.0342 19.6592 10.0342ZM24.916 23.8633C23.8906 23.8633 23.1045 23.6787 22.5576 23.3096C22.0107 22.9404 21.7373 22.4232 21.7373 21.7578C21.7373 21.293 21.8831 20.8988 22.1748 20.5752C22.4665 20.2562 22.8835 20.0352 23.4258 19.9121C23.2207 19.821 23.043 19.6797 22.8926 19.4883C22.7467 19.2923 22.6738 19.0758 22.6738 18.8389C22.6738 18.5563 22.7536 18.3148 22.9131 18.1143C23.0726 17.9137 23.3118 17.7201 23.6309 17.5332C23.2344 17.3646 22.9154 17.0911 22.6738 16.7129C22.4368 16.3301 22.3184 15.8812 22.3184 15.3662C22.3184 14.8193 22.4346 14.3545 22.667 13.9717C22.8994 13.5843 23.2389 13.2904 23.6855 13.0898C24.1322 12.8848 24.6722 12.7822 25.3057 12.7822C25.4424 12.7822 25.5905 12.7913 25.75 12.8096C25.9141 12.8232 26.0645 12.8415 26.2012 12.8643C26.3424 12.8825 26.4495 12.903 26.5225 12.9258H29.1406V13.8213L27.8555 14.0605C27.9785 14.2337 28.0765 14.432 28.1494 14.6553C28.2223 14.874 28.2588 15.1133 28.2588 15.373C28.2588 16.1569 27.9876 16.7744 27.4453 17.2256C26.9076 17.6722 26.1647 17.8955 25.2168 17.8955C24.9889 17.8864 24.7679 17.8682 24.5537 17.8408C24.3896 17.9411 24.2643 18.0527 24.1777 18.1758C24.0911 18.2943 24.0479 18.4287 24.0479 18.5791C24.0479 18.7021 24.0911 18.8024 24.1777 18.8799C24.2643 18.9528 24.3919 19.0075 24.5605 19.0439C24.7337 19.0804 24.9434 19.0986 25.1895 19.0986H26.4951C27.3245 19.0986 27.958 19.2741 28.3955 19.625C28.833 19.9759 29.0518 20.4909 29.0518 21.1699C29.0518 22.0312 28.6963 22.6943 27.9854 23.1592C27.2744 23.6286 26.2513 23.8633 24.916 23.8633ZM24.9775 22.7354C25.5381 22.7354 26.0098 22.6807 26.3926 22.5713C26.7754 22.4619 27.0648 22.3047 27.2607 22.0996C27.4567 21.8991 27.5547 21.6598 27.5547 21.3818C27.5547 21.1357 27.4932 20.9466 27.3701 20.8145C27.2471 20.6823 27.0625 20.5911 26.8164 20.541C26.5703 20.4909 26.265 20.4658 25.9004 20.4658H24.7109C24.4147 20.4658 24.1527 20.5114 23.9248 20.6025C23.6969 20.6982 23.5192 20.835 23.3916 21.0127C23.2686 21.1904 23.207 21.4046 23.207 21.6553C23.207 22.0016 23.3597 22.2682 23.665 22.4551C23.9749 22.6419 24.4124 22.7354 24.9775 22.7354ZM25.292 16.8428C25.7614 16.8428 26.11 16.7152 26.3379 16.46C26.5658 16.2002 26.6797 15.8356 26.6797 15.3662C26.6797 14.8558 26.5612 14.473 26.3242 14.2178C26.0918 13.9626 25.7454 13.835 25.2852 13.835C24.834 13.835 24.4899 13.9648 24.2529 14.2246C24.0205 14.4844 23.9043 14.8695 23.9043 15.3799C23.9043 15.8402 24.0205 16.2002 24.2529 16.46C24.4899 16.7152 24.8363 16.8428 25.292 16.8428ZM34.4658 12.7891C35.318 12.7891 35.9811 13.0101 36.4551 13.4521C36.9336 13.8896 37.1729 14.5938 37.1729 15.5645V20.5H35.5664V15.8652C35.5664 15.2773 35.4456 14.8376 35.2041 14.5459C34.9626 14.2497 34.5889 14.1016 34.083 14.1016C33.3493 14.1016 32.8389 14.3271 32.5518 14.7783C32.2692 15.2295 32.1279 15.8835 32.1279 16.7402V20.5H30.5215V12.9326H31.7725L31.998 13.958H32.0869C32.251 13.6937 32.4538 13.4772 32.6953 13.3086C32.9414 13.1354 33.2148 13.0055 33.5156 12.9189C33.821 12.8324 34.1377 12.7891 34.4658 12.7891ZM49.7578 16.6992C49.7578 17.3281 49.6758 17.8864 49.5117 18.374C49.3477 18.8617 49.1084 19.2741 48.7939 19.6113C48.4795 19.944 48.1012 20.1992 47.6592 20.377C47.2171 20.5501 46.7181 20.6367 46.1621 20.6367C45.6426 20.6367 45.1663 20.5501 44.7334 20.377C44.3005 20.1992 43.9245 19.944 43.6055 19.6113C43.291 19.2741 43.0472 18.8617 42.874 18.374C42.7008 17.8864 42.6143 17.3281 42.6143 16.6992C42.6143 15.8652 42.7578 15.1589 43.0449 14.5801C43.3366 13.9967 43.7513 13.5524 44.2891 13.2471C44.8268 12.9417 45.4671 12.7891 46.21 12.7891C46.9072 12.7891 47.5225 12.9417 48.0557 13.2471C48.5889 13.5524 49.0059 13.9967 49.3066 14.5801C49.6074 15.1634 49.7578 15.8698 49.7578 16.6992ZM44.2686 16.6992C44.2686 17.2507 44.3346 17.7223 44.4668 18.1143C44.6035 18.5062 44.8132 18.807 45.0957 19.0166C45.3783 19.2217 45.7428 19.3242 46.1895 19.3242C46.6361 19.3242 47.0007 19.2217 47.2832 19.0166C47.5658 18.807 47.7731 18.5062 47.9053 18.1143C48.0374 17.7223 48.1035 17.2507 48.1035 16.6992C48.1035 16.1478 48.0374 15.6807 47.9053 15.2979C47.7731 14.9105 47.5658 14.6165 47.2832 14.416C47.0007 14.2109 46.6338 14.1084 46.1826 14.1084C45.5173 14.1084 45.0319 14.3317 44.7266 14.7783C44.4212 15.2249 44.2686 15.8652 44.2686 16.6992ZM58.2002 12.9326V20.5H56.9355L56.7168 19.4814H56.6279C56.4684 19.7412 56.2656 19.9577 56.0195 20.1309C55.7734 20.2995 55.5 20.4248 55.1992 20.5068C54.8984 20.5934 54.5817 20.6367 54.249 20.6367C53.6794 20.6367 53.1917 20.541 52.7861 20.3496C52.3851 20.1536 52.0775 19.8529 51.8633 19.4473C51.6491 19.0417 51.542 18.5176 51.542 17.875V12.9326H53.1553V17.5742C53.1553 18.1621 53.2738 18.6019 53.5107 18.8936C53.7523 19.1852 54.126 19.3311 54.6318 19.3311C55.1195 19.3311 55.5068 19.2308 55.7939 19.0303C56.0811 18.8298 56.2839 18.5335 56.4023 18.1416C56.5254 17.7497 56.5869 17.2689 56.5869 16.6992V12.9326H58.2002ZM63.3203 19.3379C63.5299 19.3379 63.7373 19.3197 63.9424 19.2832C64.1475 19.2422 64.3343 19.1943 64.5029 19.1396V20.3564C64.3252 20.4339 64.0951 20.5 63.8125 20.5547C63.5299 20.6094 63.236 20.6367 62.9307 20.6367C62.5023 20.6367 62.1172 20.5661 61.7754 20.4248C61.4336 20.279 61.1624 20.0306 60.9619 19.6797C60.7614 19.3288 60.6611 18.8434 60.6611 18.2236V14.1562H59.6289V13.4385L60.7363 12.8711L61.2627 11.251H62.2744V12.9326H64.4414V14.1562H62.2744V18.2031C62.2744 18.5859 62.3701 18.8708 62.5615 19.0576C62.7529 19.2445 63.0059 19.3379 63.3203 19.3379Z"
                          fill="#0063F7"
                        />
                        <path
                          d="M87 5H77C75.3 5 74 6.3 74 8V14H82.6L80.3 11.7C79.9 11.3 79.9 10.7 80.3 10.3C80.7 9.9 81.3 9.9 81.7 10.3L85.7 14.3C86.1 14.7 86.1 15.3 85.7 15.7L81.7 19.7C81.3 20.1 80.7 20.1 80.3 19.7C79.9 19.3 79.9 18.7 80.3 18.3L82.6 16H74V22C74 23.7 75.3 25 77 25H87C88.7 25 90 23.7 90 22V8C90 6.3 88.7 5 87 5Z"
                          fill="#0063F7"
                        />
                      </svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModel && details && (
        <SignOutModel
          handleClose={() => {
            setShowModel(false);
            setDetails(undefined);
          }}
          details={details}
        />
      )}
    </>
  );
}
