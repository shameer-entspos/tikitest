interface OrganisationData {
  data: {
    title: string | undefined;
    details: string | undefined;
    secondDetails: string | undefined;
    secondTitle: string | undefined;
    showCopyButton?: boolean;
  };
}

const OrganisationList = ({ data }: OrganisationData) => {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 [&:not(:last-child)]:mb-7">
        <div className="org-list w-[90%] sm:w-1/2">
          <div className="text-xs font-normal text-gray-700 md:text-sm">
            {data.title}
          </div>
          <div className="text-base font-normal text-black md:text-base">
            {data.details}
          </div>
        </div>
        <div className="org-list w-1/2">
          <div className="text-xs font-normal text-gray-700 md:text-sm">
            {data.secondTitle}
          </div>
          <div className="flex items-center gap-2 text-base font-normal text-black md:text-base">
            {data.secondDetails}
            {data.showCopyButton && (
              <svg
                onClick={() => {
                  navigator.clipboard.writeText(data.secondDetails!);
                }}
                className="cursor-pointer"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.525 1.25H7.09125C5.98875 1.25 5.115 1.25 4.43187 1.3425C3.72812 1.4375 3.15875 1.6375 2.71 2.08813C2.26062 2.53875 2.06125 3.11062 1.96688 3.81687C1.875 4.50312 1.875 5.38 1.875 6.48687V10.1356C1.875 11.0781 2.45 11.8856 3.26688 12.2244C3.225 11.6556 3.225 10.8588 3.225 10.195V7.06375C3.225 6.26312 3.225 5.5725 3.29875 5.02C3.37812 4.4275 3.55687 3.86 4.01562 3.39937C4.47437 2.93875 5.04 2.75938 5.63 2.67938C6.18 2.60563 6.8675 2.60563 7.66562 2.60563H9.58437C10.3819 2.60563 11.0681 2.60563 11.6187 2.67938C11.4537 2.25836 11.1657 1.89681 10.7923 1.64185C10.4188 1.38689 9.9772 1.25034 9.525 1.25Z"
                  fill="#616161"
                />
                <path
                  d="M4.125 7.12316C4.125 5.41941 4.125 4.56754 4.6525 4.03816C5.17937 3.50879 6.0275 3.50879 7.725 3.50879H9.525C11.2219 3.50879 12.0706 3.50879 12.5981 4.03816C13.125 4.56754 13.125 5.41941 13.125 7.12316V10.1357C13.125 11.8394 13.125 12.6913 12.5981 13.2207C12.0706 13.75 11.2219 13.75 9.525 13.75H7.725C6.02812 13.75 5.17937 13.75 4.6525 13.2207C4.125 12.6913 4.125 11.8394 4.125 10.1357V7.12316Z"
                  fill="#616161"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export { OrganisationList };
