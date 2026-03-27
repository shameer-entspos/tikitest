import { KioskSetting } from '@/app/type/KioskSetting';
import { RollCall } from '@/app/type/roll_call';
import { Site } from '@/app/type/Sign_Register_Sites';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';

/** Logbook list item; same shape as sign-in/register submission. */
export type SRLogs = SignInRegisterSubmission;

export const getAllSites = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/site/list/${isAdmin}`
    );
    return response.data['sites'] as Site[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const submitSite = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      'user/app/signinregister/site/create',
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateSite = async ({
  data,
  id,
  axiosAuth,
}: {
  data: any;
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/signinregister/site/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteSite = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/signinregister/site/delete/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const listOfSiteSignIn = async ({
  axiosAuth,
  siteId,
}: {
  axiosAuth: AxiosInstance;
  siteId: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/site/listOfSiteSigin/${siteId}`
    );
    return response.data['list'] as SignInRegisterSubmission[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteManySites = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `/user/app/signinregister/site/deleteMany`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSiteDetail = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/signinregister/site/${id}`);
    return response.data['site'] as Site;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllSitesByProjectId = async (
  axiosAuth: AxiosInstance,
  projectId: String
) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/site/sitesByProject/${projectId}`
    );
    return response.data['sites'] as {
      _id: string;
      siteName: string;
      addressLineOne: string;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const getAllSitesByProjectIds = async (
  axiosAuth: AxiosInstance,
  projectIds: string[]
) => {
  try {
    if ((projectIds ?? []).length == 0) {
      return null;
    }
    const response = await axiosAuth.post(
      `user/app/signinregister/site/sitesByProjects`,
      {
        projectIds,
      }
    );
    return response.data['sites'] as {
      _id: string;
      siteName: string;
      addressLineOne: string;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const signInSR = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      'user/app/signinregister/signin',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getAllSRList = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/list/${isAdmin}`
    );

    return response.data['list'] as SignInRegisterSubmission[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
// export const getAllSignIn = async (axiosAuth: AxiosInstance) => {
//   try {
//     const response = await axiosAuth.get(
//       `user/app/signinregister/listOfAllSignin`
//     );

//     return response.data['list'] as SignInRegisterSubmission[];
//   } catch (error: any) {
//     throw new Error(error.response.data.message);
//   }
// };

export const getAllSRLogs = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      'user/app/signinregister/logbook/list'
    );

    return response.data['list'] as SRLogs[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const submitSignOut = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/signinregister/signout/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const signOutMany = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    console.log('timesheet data to api', data);
    const response = await axiosAuth.put(
      `/user/app/signinregister/signout`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const searchKioskSigIn = async ({
  axiosAuth,
  query,
}: {
  axiosAuth: AxiosInstance;
  query: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/kioskListSignin/${query}`
    );
    return response.data['list'] as SignInRegisterSubmission[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createRollCall = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/signinregister/rollcall/create`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const deleteRollCall = async ({
  axiosAuth,
  query,
}: {
  axiosAuth: AxiosInstance;
  query: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/rollcall/delete/${query}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const rollcallDeleteMany = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.put(
      `/user/app/signinregister/rollcall/deleteMany`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getOneRollCall = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/rollcall/get/${id}`
    );
    return response.data['data'] as RollCall;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateRollCall = async ({
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
      `user/app/signinregister/rollcall/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const listRollCall = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/rollcall/list/${isAdmin}`
    );
    return response.data['data'] as RollCall[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// export const getOneRollCall = async ({
//   axiosAuth,
//   id,
// }: {
//   axiosAuth: AxiosInstance;
//   id: string;
// }) => {
//   try {
//     const response = await axiosAuth.get(
//       `user/app/signinregister/rollcall/get/${id}`
//     );
//     return response.data["data"] as RollCall;
//   } catch (error: any) {
//     throw new Error(error.response.data.message);
//   }
// };

export const getSRAppSetting = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/signinregister/SRSetting`);
    return response.data['setting'] as {
      _id: string;
      orgId: string;
      notifyMeWhenSignIn: boolean;
      notifyMeWhenSignOut: boolean;
      notifyMeWhenNewRollCall: boolean;
      tikiAIAssistant: boolean;
      emailNotification: boolean;
      adminMode: string[];
      kioskMode: string[];
      rollCall: string[];
      manageSites: string[];

      createdAt: Date;
      updatedAt: Date;
      recipients: UserDetail[];
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateSRSetting = async ({
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
      `user/app/signinregister/updateSRAppSettings/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getKioskSetting = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/kioskSetting`
    );
    return response.data['setting'] as KioskSetting;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateKioskSetting = async ({
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
      `user/app/signinregister/updatekioskSettings/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const checkSRPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(
      `user/app/signinregister/checkSRUserPermission`
    );
    return response.data as {
      adminMode: boolean;
      kioskMode: boolean;
      rollCall: boolean;
      manageSites: boolean;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const loginKioskMode = async ({
  axiosAuth,
  password,
}: {
  axiosAuth: AxiosInstance;
  password: string;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/signinregister/loginKioskMode`,
      { password }
    );
    return response.data['success'] as boolean;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const logoutKioskMode = async ({
  axiosAuth,
  password,
}: {
  axiosAuth: AxiosInstance;
  password: string;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/signinregister/logoutKioskMode`,
      { password }
    );
    return response.data['success'] as boolean;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteRollCallSubmission = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/signinregister/rollcall/delete/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
