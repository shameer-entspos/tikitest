import { DiscussionTopic } from '@/app/type/discussion_topic';
import { LiveBoard } from '@/app/type/live_board';
import { SafetyMeetings } from '@/app/type/safety_meeting';
import { UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';

export interface SafetyHubComment {
  _id: string;
  content: string;
  user: UserDetail;
  appId: string;
  images: string[];
  likedBy: UserDetail[];
  createdAt: string;
  updatedAt: string;
}
export const getSHAppSetting = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/sh/SHSetting`);
    return response.data['setting'] as {
      notifyMeWhenNewHazard: boolean;
      notifyMeWhenNewSafetyMeeting: boolean;
      notifyMeWhenNewDiscussionPoint: boolean;
      tikiAIAssistant: boolean;
      emailNotification: boolean;
      _id: string;
      orgId: string;

      adminMode: string[];
      liveBoard: string[];
      hazards: string[];
      safetyMeetings: string[];
      createdAt: Date;
      updatedAt: Date;
      recipients: UserDetail[];
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateSHSetting = async ({
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
      `user/app/sh/updateSHAppSettings/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getLiveBoardList = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/sh/liveboards/list/${isAdmin}`
    );
    return response.data.data as LiveBoard[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSingleLiveBoardDetail = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(`user/app/sh/liveboards/getOne/${id}`);
    return response.data.data as LiveBoard;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createLiveBoard = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(
      'user/app/sh/liveboards/create',
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateLiveBoard = async ({
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
      `user/app/sh/liveboards/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateMultipleLiveBoard = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/sh/liveboards/updateMultiple`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteLiveBoard = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/sh/liveboards/delete/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

//////////////// Discussion Topic /////////////////////

export const getDiscussionTopicList = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/sh/discussionTopic/list/${isAdmin}`
    );
    return response.data.data as DiscussionTopic[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createDiscussionTopic = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/sh/discussionTopic/create`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteDiscussionTopic = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/sh/discussionTopic/delete/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateDiscussionTopic = async ({
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
      `user/app/sh/discussionTopic/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateMultipleDiscussionTopic = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/sh/discussionTopic/updateMultiple`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getOneDiscussionTopic = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/sh/discussionTopic/getOne/${id}`
    );
    return response.data.data as DiscussionTopic;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSafetyMeetings = async ({
  axiosAuth,
  isAdmin = false,
}: {
  axiosAuth: AxiosInstance;
  isAdmin?: boolean;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/sh/safetyMeeting/list/${isAdmin}`
    );
    return response.data.data as SafetyMeetings[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getOneSafetyMeeting = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.get(
      `user/app/sh/safetyMeeting/getOne/${id}`
    );
    return response.data.data as SafetyMeetings;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createSafetyMeeting = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/sh/safetyMeeting/create`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateSafetyMeeting = async ({
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
      `user/app/sh/safetyMeeting/update/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const updateMultipleSafetyMeeting = async ({
  axiosAuth,
  data,
}: {
  axiosAuth: AxiosInstance;
  data: any;
}) => {
  try {
    const response = await axiosAuth.put(
      `user/app/sh/safetyMeeting/updateMultiple`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteSafetyMeeting = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(
      `user/app/sh/safetyMeeting/delete/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getSHCommentList = async (
  id: string,
  axiosAuth: AxiosInstance
) => {
  try {
    if (id == '') {
      return [];
    }
    const response = await axiosAuth.get(`user/app/sh/getComments/${id}`);

    return response.data.comments as SafetyHubComment[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteteSHComment = async ({
  id,
  axiosAuth,
}: {
  id: string;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.delete(`user/app/sh/deleteComment/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const createSHComment = async ({
  data,
  axiosAuth,
}: {
  data: any;
  axiosAuth: AxiosInstance;
}) => {
  try {
    const response = await axiosAuth.post(`user/app/sh/createComment`, data);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const toggleSHLikedComment = async ({
  axiosAuth,
  Id,
}: {
  axiosAuth: AxiosInstance;
  Id: string;
}) => {
  try {
    const response = await axiosAuth.post(
      `user/app/sh/toggleCommentLike/${Id}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const checkSHPermission = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/app/sh/checkUserPermission`);
    return response.data as {
      adminMode: boolean;
      liveBoard: boolean;
      hazards: boolean;
      safetyMeetings: boolean;
    };
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
