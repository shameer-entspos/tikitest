type Props = {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
};

function PaginationComponent({
  currentPage,
  totalPages,
  handlePageChange,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <svg
        onClick={() => handlePageChange(currentPage - 1)}
        className="cursor-pointer"
        width="8"
        height="13"
        viewBox="0 0 8 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.03636 12.4677C7.21212 12.2919 7.31085 12.0535 7.31085 11.8049C7.31085 11.5563 7.21212 11.3179 7.03636 11.1421L2.39574 6.50145L7.03636 1.86082C7.20713 1.68401 7.30163 1.4472 7.29949 1.20139C7.29736 0.955577 7.19876 0.72044 7.02494 0.546619C6.85112 0.372799 6.61598 0.274204 6.37018 0.272068C6.12437 0.269933 5.88755 0.364428 5.71074 0.5352L0.4073 5.83864C0.231546 6.01445 0.132813 6.25286 0.132813 6.50145C0.132813 6.75004 0.231546 6.98846 0.4073 7.16426L5.71074 12.4677C5.88654 12.6435 6.12496 12.7422 6.37355 12.7422C6.62214 12.7422 6.86055 12.6435 7.03636 12.4677Z"
          fill="#616161"
        />
      </svg>
      <div className="rounded-lg border-1 border-[#616161] px-4 py-2">
        {currentPage}
      </div>
      <div>
        of <span>{totalPages}</span>
      </div>
      <svg
        onClick={() => handlePageChange(currentPage + 1)}
        className="cursor-pointer"
        width="8"
        height="13"
        viewBox="0 0 8 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.963637 0.540112C0.787883 0.71592 0.68915 0.954333 0.68915 1.20292C0.68915 1.45152 0.787883 1.68993 0.963637 1.86574L5.60426 6.50636L0.963637 11.147C0.792864 11.3238 0.69837 11.5606 0.700506 11.8064C0.702642 12.0522 0.801237 12.2874 0.975057 12.4612C1.14888 12.635 1.38401 12.7336 1.62982 12.7357C1.87563 12.7379 2.11245 12.6434 2.28926 12.4726L7.5927 7.16918C7.76845 6.99337 7.86719 6.75495 7.86719 6.50636C7.86719 6.25777 7.76845 6.01936 7.5927 5.84355L2.28926 0.540112C2.11346 0.364358 1.87504 0.265625 1.62645 0.265625C1.37786 0.265625 1.13944 0.364358 0.963637 0.540112Z"
          fill="#616161"
        />
      </svg>
    </div>
  );
}

export { PaginationComponent };
