const CustomBlueCheckBox = ({
  label,
  checked = false,
  disabled,
  onChange,
}: {
  checked?: boolean;
  disabled?: boolean;
  onChange?: any;
  label?: string;
}) => {
  return (
    <div className="relative flex items-center justify-center gap-2">
      <input
        type="checkbox"
        name="user"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        id="some_id"
        className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-none checked:bg-white"
      />

      <svg
        onClick={onChange}
        className="absolute inset-0 m-auto hidden h-6 w-6 text-[#9E9E9E] peer-checked:block"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="6" fill="#6990FF" />
        <path
          d="M5.4375 12.9375L9.8125 17.3125L18.5625 7.9375"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export { CustomBlueCheckBox };
