import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export default axios.create({
  baseURL: `${BASE_URL}/v1/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosAuth = axios.create({
  baseURL: `${BASE_URL}/v1/`,
  headers: {
    'Content-Type': 'application/json',
    // "Content-Type": "multipart/mixed",
  },
});
