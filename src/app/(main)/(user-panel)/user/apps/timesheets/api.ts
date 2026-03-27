import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { Expanse } from '@/app/type/expanse';
import { ProjectDetail } from '@/app/type/projects';
import { TimeSheet } from '@/app/type/timesheet';
import { UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';

const createTimeSheetReport = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/timesheet/createTimeSheetReport`,
      data
    );
    return response.data['reports'] as TimeSheet[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

const createExpenseReport = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/timesheet/createExpenseReport`,
      data
    );
    return response.data['reports'] as Expanse[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

//TODO Time sheet section
const getAllTimeSheets = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/timesheet/list/${isAdmin}`);
    return response.data['timeSheet'] as TimeSheet[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

const createTimeSheet = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/timesheet/create`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
const updateTimeSheet = async ({
  id,
  data,
  axiosAuth,
}: {
  id: string;
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/timesheet/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update timesheet');
  }
};

const updateMultipleTimeSheets = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    console.log(data);
    const response = await axiosAuth.put(
      `user/app/timesheet/updateTimeSheets`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update timesheets');
  }
};

const deleteTimeSheet = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/timesheet/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete timesheet');
  }
};

// TODO Expanse section

const getAllExpanses = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/timesheet/getAllExpanse/${isAdmin}`
    );
    return response.data['expanses'] as Expanse[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

const createExpanse = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/timesheet/createExpense`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create expense');
  }
};
const updateExpanse = async ({
  id,
  data,
  axiosAuth,
}: {
  id: string;
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/timesheet/updateExpanse/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update expense');
  }
};

const updateMultipleExpenses = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    console.log(data);
    const response = await axiosAuth.put(
      `user/app/timesheet/updateExpanses`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update expenses');
  }
};

const deleteExpanse = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/timesheet/deleteExpanse/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete expense');
  }
};

/// review api section
const updateReviewStatus = async ({
  id,
  data,
  axiosAuth,
}: {
  id: string;
  data: {
    status: 'not' | 'approved' | 'review';
    type: 'timesheet' | 'expense';
  };
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/timesheet/updateStatus/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update status');
  }
};

const getTimesheetAppSetting = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/timesheet/timesheetSetting`);
    return response.data['setting'] as {
      _id: string;
      notifyMeWhenTimesheetCreated: boolean;
      notifyMeWhenTimesheetEdit: boolean;
      notifyMeWhenTimesheetDelete: boolean;
      notifyMeWhenExpenseCreated: boolean;
      notifyMeWhenExpenseDelete: boolean;
      notifyMeWhenExpenseEdit: boolean;
      tikiAIAssistant: boolean;
      emailNotification: boolean;
      adminMode: String[];
      timeSheets: String[];
      expenses: String[];
      reviewSubmission: String[];
      reportExport: String[];
      approvedtimeSheets: String[];
      approvedexpenses: String[];
      recipients: UserDetail[];
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

const updateTimesheetAppSetting = async ({
  axiosAuth,
  data,
  id,
}: {
  axiosAuth: AxiosInstance;
  data: any;
  id: string;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/timesheet/updateTimesheetSetting/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

const exportTimesheetToCSV = (jsonData: TimeSheet[]) => {
  if (!jsonData || jsonData.length === 0) {
    console.error('No data provided');
    return;
  }

  // Get CSV headers from the TimeSheet interface keys
  const headers = Object.keys(jsonData[0])
    .reduce<string[]>((acc, key) => {
      if (
        typeof jsonData[0][key as keyof TimeSheet] === 'object' &&
        jsonData[0][key as keyof TimeSheet] !== null
      ) {
        // Add keys from nested objects as well
        const nestedKeys = Object.keys(jsonData[0][key as keyof TimeSheet]).map(
          (nestedKey) => `${key}.${nestedKey}`
        );
        return [...acc, ...nestedKeys];
      }
      return [...acc, key];
    }, [])
    .join(',');

  const csvRows = jsonData.map((row) => {
    return Object.keys(row)
      .map((key) => {
        if (
          typeof row[key as keyof TimeSheet] === 'object' &&
          row[key as keyof TimeSheet] !== null
        ) {
          // If it's a nested object, join its values
          return Object.values(row[key as keyof TimeSheet])
            .map((value) => `"${value}"`) // Wrap values in quotes
            .join(',');
        }
        return `"${row[key as keyof TimeSheet]}"`; // Wrap other values in quotes
      })
      .join(',');
  });

  const csvContent = [headers, ...csvRows].join('\n'); // Combine headers and rows

  // Create a Blob object with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const timestamp = Date.now(); // Current timestamp in milliseconds
  // Create a temporary anchor element to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `timesheet_${timestamp}.csv`);

  // Append anchor to body, trigger click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const checkTSPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(
      `user/app/timesheet/checkTSUserPermission`
    );
    return response.data as {
      timeSheets: boolean;
      expenses: boolean;
      reviewSubmission: boolean;
      reportExport: boolean;
      adminMode: boolean;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export {
  createTimeSheetReport,
  createExpenseReport,
  // timesheet
  getAllTimeSheets,
  createTimeSheet,
  updateTimeSheet,
  deleteTimeSheet,
  // expanse
  getAllExpanses,
  createExpanse,
  updateExpanse,
  deleteExpanse,
  // review
  updateReviewStatus,
  getTimesheetAppSetting,
  updateTimesheetAppSetting,
  exportTimesheetToCSV,
  updateMultipleTimeSheets,
  updateMultipleExpenses,
};
