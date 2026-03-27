import React from 'react';

interface FilterButtonProps {
  isApplyFilter: boolean;
  setShowModel: React.Dispatch<React.SetStateAction<boolean>>;
  showModel: boolean;
  setOpenDropdown: React.Dispatch<React.SetStateAction<string>>;
  clearFilters: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  isApplyFilter,
  setShowModel,
  showModel,
  setOpenDropdown,
  clearFilters,
}) => {
  return (
    <>
      <button
        className={`rounded-lg p-2 ${
          isApplyFilter ? 'bg-[#E2F3FF]' : 'bg-[#EEEEEE]'
        }`}
        onClick={() => {
          setShowModel(!showModel);
          setOpenDropdown('');
        }}
      >
        {isApplyFilter ? (
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.5004 15V24.85C17.5504 25.225 17.4254 25.625 17.1379 25.8875C17.0223 26.0034 16.8849 26.0953 16.7337 26.158C16.5825 26.2208 16.4204 26.2531 16.2567 26.2531C16.0929 26.2531 15.9308 26.2208 15.7796 26.158C15.6284 26.0953 15.491 26.0034 15.3754 25.8875L12.8629 23.375C12.7267 23.2417 12.623 23.0787 12.5602 22.8987C12.4973 22.7187 12.4768 22.5267 12.5004 22.3375V15H12.4629L5.26291 5.775C5.05992 5.51441 4.96833 5.18407 5.00814 4.85616C5.04796 4.52825 5.21595 4.22943 5.47541 4.025C5.71291 3.85 5.97541 3.75 6.25041 3.75H23.7504C24.0254 3.75 24.2879 3.85 24.5254 4.025C24.7849 4.22943 24.9529 4.52825 24.9927 4.85616C25.0325 5.18407 24.9409 5.51441 24.7379 5.775L17.5379 15H17.5004Z"
              fill="#0063F7"
            />
          </svg>
        ) : (
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.5004 15V24.85C17.5504 25.225 17.4254 25.625 17.1379 25.8875C17.0223 26.0034 16.8849 26.0953 16.7337 26.158C16.5825 26.2208 16.4204 26.2531 16.2567 26.2531C16.0929 26.2531 15.9308 26.2208 15.7796 26.158C15.6284 26.0953 15.491 26.0034 15.3754 25.8875L12.8629 23.375C12.7267 23.2417 12.623 23.0787 12.5602 22.8987C12.4973 22.7187 12.4768 22.5267 12.5004 22.3375V15H12.4629L5.26291 5.775C5.05992 5.51441 4.96833 5.18407 5.00814 4.85616C5.04796 4.52825 5.21595 4.22943 5.47541 4.025C5.71291 3.85 5.97541 3.75 6.25041 3.75H23.7504C24.0254 3.75 24.2879 3.85 24.5254 4.025C24.7849 4.22943 24.9529 4.52825 24.9927 4.85616C25.0325 5.18407 24.9409 5.51441 24.7379 5.775L17.5379 15H17.5004Z"
              fill="#616161"
            />
          </svg>
        )}
      </button>
      {isApplyFilter && (
        <div
          onClick={clearFilters}
          className="mx-3 cursor-pointer whitespace-nowrap rounded-md bg-[#E2F3FF] px-6 py-3 text-sm text-primary-500"
        >
          Clear Filter
        </div>
      )}
    </>
  );
};

export default FilterButton;
