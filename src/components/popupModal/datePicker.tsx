

import React, { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { Input } from "../Form/Input";
import { string } from "yup";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

const TikiDatePicker = () => {
    const [startDate, setStartDate] = useState(new Date());
    return (
        <DatePicker selected={startDate} onChange={(date) => {
            setStartDate(date!)
            console.log('hit')
        }}
            dateFormat="MM/dd/yyyy"
            customInput={<CustomInput value={startDate.toString()} onClick={handleClick} />} />
    );
};

const CustomInput = ({ value, onClick }: { value: string, onClick: React.MouseEventHandler<HTMLInputElement>; }) => (

    <Input
        type="text"
        label="Due Date"
        className="p-2 border rounded-md w-full cursor-pointer"
        name="date"
        value={value}
        onClick={onClick}
        readOnly
    />
);

const handleClick: React.MouseEventHandler<HTMLInputElement> = (event) => {
    // Handle the click event here
    console.log('heel');
};

export { TikiDatePicker };