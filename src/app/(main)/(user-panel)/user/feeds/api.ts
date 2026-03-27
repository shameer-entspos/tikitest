import { UserDetail } from '@/types/interfaces';
import { AxiosInstance } from 'axios';

export interface Post {
  _id: string;
  createdBy: UserDetail;
  orgId: string;
  content: string;
  title: string;
  sharedWith: string;
  images: string[];
  createdAt: string;
  likes: string[];
  teams: string[];
  comments: string[];
}

export interface Comment {
  _id: string;
  postId: string;
  text: string;
  createdAt: string;
  userId: { firstName: string; lastName: string; _id: string; photo: string };
}

export const getAllPost = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get(`user/post/list`);
    return response.data['posts'] as Post[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const toggleLikedPost = async ({
  axiosAuth,
  postId,
}: {
  axiosAuth: AxiosInstance;
  postId: string;
}) => {
  try {
    const response = await axiosAuth.post(`user/post/like/${postId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deletePost = async ({
  axiosAuth,
  postId,
}: {
  axiosAuth: AxiosInstance;
  postId: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/post/delete/${postId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getUserTeams = async (axiosAuth: AxiosInstance) => {
  try {
    const response = await axiosAuth.get('user/getUserTeams');

    return response.data['teams'] as {
      _id: string;
      name: string;
      members: string[];
      teamId: string;
    }[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const createUserPost = async ({
  axiosAuth,
  content,
  images,
  teams,
  sharedWith,
}: {
  axiosAuth: AxiosInstance;
  content: string;

  sharedWith: 'everyone' | 'organization' | 'team';
  teams: string[];
  images: File[] | [];
}) => {
  try {
    const _formData = new FormData();
    if (images && images.length > 0) {
      for (const imageFile of images) {
        _formData.append('images', imageFile);
      }
    }

    _formData.append('content', content);

    _formData.append('sharedWith', sharedWith);

    if (teams && teams.length > 0) {
      teams.forEach((team) => {
        _formData.append('teams[]', team); // Append each team to the FormData
      });
    }

    const response = await axiosAuth.post(`user/post/create`, _formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getPostComments = async (axiosAuth: AxiosInstance, id: string) => {
  try {
    const response = await axiosAuth.get(`user/post/comment/list/${id}`);
    return response.data['comments'] as Comment[];
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deltePostComment = async ({
  axiosAuth,
  id,
}: {
  axiosAuth: AxiosInstance;
  id: string;
}) => {
  try {
    const response = await axiosAuth.delete(`user/post/comment/delete/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createPostComment = async ({
  axiosAuth,
  content,
  id,
}: {
  axiosAuth: AxiosInstance;
  content: string;
  id: string;
}) => {
  try {
    const response = await axiosAuth.post(`user/post/comment/create`, {
      postId: id,
      text: content,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
