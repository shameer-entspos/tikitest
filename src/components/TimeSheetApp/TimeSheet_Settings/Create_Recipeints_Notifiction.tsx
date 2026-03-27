import { Button } from '@/components/Buttons';
import Loader from '@/components/DottedLoader/loader';
import { Input } from '@/components/Form/Input';
import { Form, Formik } from 'formik';
import { useQueryClient } from 'react-query';
import * as Yup from 'yup';

export function CreateNotifictionRecipients({
  handleShowCreate,
}: {
  handleShowCreate: () => void;
}) {
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
  };
  const queryClient = useQueryClient();
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('first name is required'),
    lastName: Yup.string().required('last name is required'),
    email: Yup.string().email().required('email is required'),
  });
  ///handles
  const handleSubmit = async (_values: any) => {
    // listofUsersForManagers
    const randomNumber = Math.floor(Math.random() * 100);
    const data = {
      _id: String(randomNumber),
      firstName: _values.firstName,
      lastName: _values.lastName,
      email: _values.email,
      photo: '',
    };
    queryClient.setQueryData<
      {
        _id: string;
        firstName: string;
        lastName: string;
        photo: string;
        email: string;
      }[]
    >(`listofUsersForApp`, (prev) => {
      return prev ? [...prev, data] : [data];
    });
    handleShowCreate();
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, handleSubmit, setFieldValue, isValid }) => (
          <>
            <Form onSubmit={handleSubmit}>
              <Input
                name="firstName"
                type="text"
                placeholder="First Name"
                label="First Name"
                errorMessage={errors?.firstName}
                isTouched={touched?.firstName}
              />
              <Input
                name="lastName"
                type="text"
                placeholder="Last Name"
                label="Last Name"
                errorMessage={errors?.lastName}
                isTouched={touched?.lastName}
              />
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter Email Address"
                name="email"
                errorMessage={errors.email}
                isTouched={touched.email}
              />

              <div className="mt-4 flex justify-center gap-16 border-t-2 border-gray-200 py-6">
                <Button
                  variant="simple"
                  className="cursor-pointer text-primary-700"
                  onClick={() => {
                    handleShowCreate();
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="simple"
                  className={'cursor-pointer text-primary-700'}
                  disabled={!isValid}
                >
                  Add To List
                </Button>
              </div>
            </Form>
          </>
        )}
      </Formik>
    </>
  );
}
