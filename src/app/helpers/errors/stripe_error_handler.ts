import toast from 'react-hot-toast';

const stripeExceptionHandler = (err: any) => {
  switch (err.type) {
    case 'StripeCardError':
      // A declined card error
      err.message; // => e.g. "Your card's expiration year is invalid."
      toast.error(err.message);
      break;
    case 'StripeRateLimitError':
      // Too many requests made to the API too quickly
      toast.error(err.message);

      break;
    case 'StripeInvalidRequestError':
      toast.error(err.message);

      // Invalid parameters were supplied to Stripe's API
      break;
    case 'StripeAPIError':
      toast.error(err.message);

      // An error occurred internally with Stripe's API
      break;
    case 'StripeConnectionError':
      toast.error(err.message);

      // Some kind of error occurred during the HTTPS communication
      break;
    case 'StripeAuthenticationError':
      toast.error(err.message);

      // You probably used an incorrect API key
      break;
    default:
      toast.error('error', err.message);
      // Handle any other types of unexpected errors
      break;
  }
};

export { stripeExceptionHandler };
