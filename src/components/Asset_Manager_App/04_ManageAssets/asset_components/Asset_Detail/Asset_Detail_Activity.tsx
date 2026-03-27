import { activitiesList } from '@/app/(main)/(user-panel)/user/apps/api';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import { SingleAsset } from '@/app/type/single_asset';
import { PaginationComponent } from '@/components/pagination';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import Loader from '@/components/DottedLoader/loader';
import { PresignedUserAvatar } from '@/components/common/PresignedUserAvatar';

export default function AssetDetailActivity({
  data,
}: {
  data: SingleAsset | undefined;
}) {
  const axiosAuth = useAxiosAuth();
  const {
    data: assetActivities,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['AMactivitiesList', data?._id],
    queryFn: () =>
      activitiesList({ axiosAuth, appType: 'AM', body: { id: data?._id } }),
    enabled: !!data?._id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Refetch when component mounts or data._id changes
  useEffect(() => {
    if (data?._id) {
      refetch();
    }
  }, [data?._id, refetch]);

  const allDocs = assetActivities ?? [];
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 10;
  const totalPages = Math.ceil(allDocs.length / projectsPerPage);
  const paginatedDocs = allDocs.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [allDocs.length]);
  return (
    <>
      <div className="mx-2 my-2 flex flex-col rounded-lg border-2 bg-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        <div className="grid grid-cols-2 flex-wrap items-start px-4 py-2 font-semibold">
          <span className="flex grid-cols-8 px-2">Actioned By</span>

          <span className="flex grid-cols-4 items-center justify-center gap-1">
            Date & Time
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9373 3L12.8623 3.00525C12.7274 3.0234 12.6036 3.08988 12.5139 3.19236C12.4243 3.29483 12.3749 3.42635 12.3748 3.5625V13.0815L9.9598 10.668L9.8968 10.614C9.78265 10.5292 9.64059 10.4907 9.49922 10.5064C9.35786 10.5221 9.22768 10.5907 9.1349 10.6985C9.04212 10.8063 8.99362 10.9453 8.99917 11.0874C9.00471 11.2295 9.0639 11.3643 9.1648 11.4645L12.5428 14.8395L12.6058 14.8935C12.7142 14.9735 12.8476 15.012 12.982 15.002C13.1163 14.9919 13.2426 14.934 13.3378 14.8387L16.7106 11.4637L16.7646 11.4008C16.8448 11.2923 16.8834 11.1587 16.8734 11.0242C16.8633 10.8897 16.8053 10.7633 16.7098 10.668L16.6468 10.614C16.5384 10.5338 16.4048 10.4951 16.2703 10.5052C16.1357 10.5152 16.0093 10.5733 15.9141 10.6688L13.4998 13.0845V3.5625L13.4953 3.486C13.4768 3.35133 13.4102 3.22792 13.3077 3.13858C13.2053 3.04923 13.0732 3.00001 12.9373 3ZM4.66105 3.165L1.2898 6.53625L1.23505 6.59925C1.15501 6.7076 1.11652 6.84108 1.12657 6.97541C1.13661 7.10974 1.19454 7.23601 1.2898 7.33125L1.3528 7.386C1.46115 7.46603 1.59463 7.50453 1.72896 7.49448C1.86329 7.48443 1.98956 7.42651 2.0848 7.33125L4.49755 4.91775V14.4412L4.50355 14.5177C4.52204 14.6524 4.58866 14.7758 4.6911 14.8652C4.79354 14.9545 4.92487 15.0037 5.0608 15.0037L5.13655 14.9985C5.27135 14.9802 5.39495 14.9136 5.48444 14.8112C5.57394 14.7087 5.62327 14.5773 5.6233 14.4412L5.62255 4.91925L8.0398 7.332L8.1028 7.386C8.21703 7.46979 8.35867 7.50739 8.49942 7.49128C8.64016 7.47518 8.76965 7.40657 8.86201 7.29915C8.95437 7.19173 9.00279 7.05342 8.99761 6.91185C8.99243 6.77028 8.93402 6.63588 8.83405 6.5355L5.45605 3.165L5.3923 3.111C5.28395 3.03096 5.15047 2.99247 5.01614 3.00252C4.88181 3.01257 4.75554 3.07049 4.6603 3.16575"
                fill="#0063F7"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="mx-2 my-4 flex flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2">
        {/* form top  */}

        <div className="h-[600px] overflow-y-auto">
          {isLoading || isRefetching ? (
            <Loader />
          ) : (
            <>
              {paginatedDocs.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No activities found</p>
                </div>
              ) : (
                paginatedDocs.map((item, index) => {
                  return (
                    <div
                      key={item._id || index}
                      className="relative grid cursor-pointer grid-cols-3 flex-wrap items-start border-b py-2"
                    >
                      <span className="flex grid-cols-6 px-2">
                        <PresignedUserAvatar
                          photo={item?.userId?.photo}
                          fallback="/images/User-profile.png"
                          alt="avatar"
                          className="mr-2 h-8 w-8 rounded-full border border-gray-500 object-cover text-[#1E1E1E]"
                        />
                        {`${item?.userId?.firstName || ''} ${item?.userId?.lastName || ''}`}
                      </span>
                      <span className="flex grid-cols-2 justify-end px-2 text-center">
                        {checkActionAndReturnValue(item.action)}
                      </span>
                      <span className="grid-cols-2 px-2">
                        <div className="flex justify-between px-4">
                          <span>
                            {dateFormat(item.createdAt?.toString() ?? '')}
                          </span>
                          <span>
                            {timeFormat(item.createdAt?.toString() ?? '')}
                          </span>
                        </div>
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        <div className="flex justify-between border-t-2 border-gray-200 px-3 py-2">
          <div className="font-Open-Sans text-sm font-normal text-[#616161]">
            Items per page: 10
          </div>
          <div>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
}

function checkActionAndReturnValue(status: string) {
  if (status == 'Created') {
    return (
      <span className="w-28 rounded-md bg-primary-500 px-2 py-1 text-sm text-white">
        {status}
      </span>
    );
  } else if (status == 'Update') {
    return (
      <span className="w-28 rounded-md bg-primary-500 px-2 py-1 text-sm text-white">
        {status}
      </span>
    );
  } else if (status == 'Checked in') {
    return (
      <span className="w-28 rounded-md border-2 border-primary-500 px-2 py-1 text-sm text-primary-400">
        {status}
      </span>
    );
  } else if (status == 'Checked Out') {
    return (
      <span className="w-28 rounded-md border-2 border-[#EA4E4E] px-2 py-1 text-sm text-[#EA4E4E]">
        {status}
      </span>
    );
  } else {
    return (
      <span className="rounded-md border-2 border-[#EA4E4E] px-2 py-1 text-sm text-[#EA4E4E]">
        Retired
      </span>
    );
  }
}
