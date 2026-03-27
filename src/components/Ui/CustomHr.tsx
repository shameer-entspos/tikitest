import React from "react";

interface CustomHrProps {
  size?: "small" | "large";
  className?: string;
}

const CustomHr: React.FC<CustomHrProps> = ({
  size = "large",
  className = "",
}) => {
  const heightClass =
    size === "small" ? "h-[1px] bg-gray-300" : "h-[2px] bg-gray-200";
  return <div className={`${className} ${heightClass} w-full rounded-full`} />;
};

export default CustomHr;
