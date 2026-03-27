import { AxiosError } from 'axios';

const ErrorMessageHandler = (error: AxiosError<{ message: string }>) => {
  if (error.response) {
    const { status, data } = error.response;

    if (data) {
      console.log(`Status code: ${status}`);
      console.log(`Error message: ${data.message}`);
      // Handle specific error codes here
      if (status === 401) {
        throw new Error('Unauthorized');
      } else if (status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error(data.message);
      }
    } else {
      throw new Error('Response data is undefined');
    }
  } else {
    throw new Error('Undefined Error');
  }
};

export { ErrorMessageHandler };
