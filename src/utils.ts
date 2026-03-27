export function formatDateTime(dateString: string) {
  // Ensure the input is a valid date string
  if (!dateString) return { date: null, time: null };

  const date = new Date(dateString);

  // Format the date (e.g., 20 Jul 2024)
  const formattedDate = `${date.getDate()} ${date.toLocaleString('en-US', {
    month: 'short',
  })} ${date.getFullYear()}`;

  // Format the time (e.g., 10:15 AM)
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format
  });

  return { date: formattedDate, time: formattedTime }; // Return an object with date and time
}

export function formatDateTimeWithLabels(dateString: string) {
  // Ensure the input is a valid date string
  if (!dateString) return { date: null, time: null };

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { date: null, time: null }; // Handle invalid date

  // Get current date and tomorrow's date for comparison
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Reset time components for accurate date comparison
  const inputDateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const tomorrowDateOnly = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate()
  );

  // Determine the date label
  let dateLabel;
  if (inputDateOnly.getTime() === todayDateOnly.getTime()) {
    dateLabel = 'Today';
  } else if (inputDateOnly.getTime() === tomorrowDateOnly.getTime()) {
    dateLabel = 'Tomorrow';
  } else {
    // Format other dates as "20 Jul 2024"
    dateLabel = `${date.getDate()} ${date.toLocaleString('en-US', {
      month: 'short',
    })} ${date.getFullYear()}`;
  }

  // Format the time (e.g., 10:15 AM)
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format
  });

  return { date: dateLabel, time: formattedTime }; // Return an object with date label and time
}

export function checkDateIsDue(date: string) {
  if (!date) return false;

  const today = new Date();
  const dueDate = new Date(date);

  // Reset time components to compare only dates
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const dueDateOnly = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  // Return true only if due date is BEFORE today (not including today)
  return dueDateOnly.getTime() < todayDateOnly.getTime();
}

export function getDueDateLabel(date: string) {
  if (!date) return '';

  const today = new Date();
  const dueDate = new Date(date);

  // Reset time components to compare only dates
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const dueDateOnly = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const tomorrowDateOnly = new Date(todayDateOnly);
  tomorrowDateOnly.setDate(todayDateOnly.getDate() + 1);

  // Check if it's overdue
  if (dueDateOnly.getTime() < todayDateOnly.getTime()) {
    return 'Overdue';
  }

  // Check if it's today
  if (dueDateOnly.getTime() === todayDateOnly.getTime()) {
    return 'Today';
  }

  // Check if it's tomorrow
  if (dueDateOnly.getTime() === tomorrowDateOnly.getTime()) {
    return 'Tomorrow';
  }

  // Return formatted date for other dates
  return formatDateTime(date)?.date || '';
}
