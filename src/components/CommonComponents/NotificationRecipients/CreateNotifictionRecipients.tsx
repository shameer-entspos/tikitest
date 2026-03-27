import { Button } from '@/components/Buttons';
import { Input } from '@/components/Form/Input';
import { Form, Formik } from 'formik';
import { useQueryClient } from 'react-query';
import * as Yup from 'yup';
import { Recipient } from './NotificationRecipients';

interface CreateNotifictionRecipientsProps {
  handleShowCreate: () => void;
  queryKey: string;
  recipients: Recipient[];
}

export function CreateNotifictionRecipients({
  handleShowCreate,
  queryKey,
  recipients,
}: CreateNotifictionRecipientsProps) {
  const queryClient = useQueryClient();
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('first name is required'),
    lastName: Yup.string().required('last name is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('email is required')
      .test('email-exists', 'User already in list', function (value) {
        if (!value) return true;
        const emailExists = recipients.some(
          (r) => r.email.toLowerCase() === value.toLowerCase()
        );
        return !emailExists;
      }),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    {
      resetForm,
      setFieldError,
    }: {
      resetForm: () => void;
      setFieldError: (field: string, message: string) => void;
    }
  ) => {
    // Check if email already exists in recipients
    const emailExists = recipients.some(
      (r) => r.email.toLowerCase() === values.email.toLowerCase()
    );

    if (emailExists) {
      setFieldError('email', 'User already in list');
      return;
    }

    // Check if this is a contacts query (has data.contacts structure)
    const currentData = queryClient.getQueryData(queryKey);
    const isContactsQuery = currentData && typeof currentData === 'object' && 'data' in currentData;

    if (isContactsQuery) {
      // For contacts query, add to data.contacts array
      queryClient.setQueryData<any>(queryKey, (prev: any) => {
        if (!prev || !prev.data) {
          return {
            data: {
              contacts: [{
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
              }],
              externalFriends: [],
              teamRooms: [],
              projectChannels: [],
            },
          };
        }
        
        // Check if user already exists in contacts or externalFriends
        const existsInContacts = (prev.data.contacts ?? []).some(
          (u: any) => u.email?.toLowerCase() === values.email.toLowerCase()
        );
        const existsInExternal = (prev.data.externalFriends ?? []).some(
          (u: any) => u.email?.toLowerCase() === values.email.toLowerCase()
        );
        
        if (existsInContacts || existsInExternal) return prev;
        
        // Add to contacts array
        return {
          ...prev,
          data: {
            ...prev.data,
            contacts: [
              ...(prev.data.contacts ?? []),
              {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
              },
            ],
          },
        };
      });
    } else {
      // For org users query, add with UserDetail structure
      const randomNumber = Math.floor(Math.random() * 100000);
      const newUser: any = {
        _id: String(randomNumber),
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        photo: '',
        role: 2, // Set as manager role so it appears in filtered list
        userId: '',
        phone: '',
        varifiedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnline: false,
        organization: null,
        setting: null,
      };

      queryClient.setQueryData<any[]>(queryKey, (prev) => {
        if (!prev) return [newUser];
        // Check if user already exists in cache (by email)
        const exists = prev.some(
          (u: any) => u.email?.toLowerCase() === values.email.toLowerCase()
        );
        if (exists) return prev;
        return [...prev, newUser];
      });
    }

    // Reset form and go back to selection view
    resetForm();
    handleShowCreate();
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, handleSubmit, isValid }) => (
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
