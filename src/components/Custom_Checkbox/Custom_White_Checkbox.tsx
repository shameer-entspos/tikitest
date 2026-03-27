const CustomWhiteCheckBox = ({
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
    <div className="flex gap-2">
      <div className="relative flex items-center justify-center gap-2">
        <input
          type="checkbox"
          name="user"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          id="some_id"
          className="peer h-6 w-6 appearance-none rounded-md border-2 border-[#9E9E9E] bg-white checked:border-[#9E9E9E] checked:bg-white"
        />
        <svg
          onClick={onChange}
          className="absolute inset-0 m-auto hidden h-4 w-4 text-[#9E9E9E] peer-checked:block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="text-[#555555]">{label}</div>
    </div>
  );
};

export { CustomWhiteCheckBox };
