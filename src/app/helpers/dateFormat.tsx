import { format, isToday, isTomorrow, isYesterday, differenceInCalendarDays } from 'date-fns';
import { TimeSheet } from '../type/timesheet';


const dateFormat = (value: string) => {
    if(value === ""){
        return "";
    }
    // return format(new Date(value), "yyyy-MM-dd");
    return format(new Date(value), "dd MMM yyyy");
}
const dateFormatWithoutYear = (value: string) => {
    if(value === ""){
        return "";
    }
    // return format(new Date(value), "yyyy-MM-dd");
    return format(new Date(value), "dd MMM");
}

const timeFormat = (value: string) => {
    if(value === ""){
        return "";
    }
    // return format(new Date(value), "yyyy-MM-dd");
    return format(new Date(value), "hh:mm a");
}






export function formatDateWithDays({ date }: { date: Date }) {
    const today = new Date();


    if (isToday(date)) {
        return `Today      ${format(date, 'hh.mm a')}`;
    } else if (isTomorrow(date)) {
        return `Tomorrow      ${format(date, 'hh.mm a')}`;
    } else if (isYesterday(date)) {
        return `Yesterday      ${format(date, 'hh.mm a')}`;
    } else if (differenceInCalendarDays(today, date) < 7) {
        return `${format(date, 'dd MMM yyyy ')}      ${format(date, 'hh.mm a')}`; // Day of the week
    } else {
        return `${format(date, 'dd MMM yyyy   hh.mm a')}`; // Full date and time
    }
}


const generateRandomId = () => {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
};




const formatTimeTwoChar = (hours: string, minutes: string): string => {
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
};

const calculateTotalTime = (timeList: TimeSheet[]): string => {
    let totalHours = 0;
    let totalMinutes = 0;

    // Loop through each time object in the list
    timeList.forEach(({ timeTracker }) => {
        totalHours += Number(timeTracker.hours);
        totalMinutes += Number(timeTracker.minutes);
    });

    // Convert minutes greater than 60 to hours
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60; // Remaining minutes after conversion

    // Format the result to ensure two digits for both hours and minutes
    const formattedHours = totalHours.toString().padStart(2, '0');
    const formattedMinutes = totalMinutes.toString().padStart(2, '0');

    return `${formattedHours}: ${formattedMinutes}`;
};


export { dateFormat, timeFormat, generateRandomId, formatTimeTwoChar, calculateTotalTime,dateFormatWithoutYear };



