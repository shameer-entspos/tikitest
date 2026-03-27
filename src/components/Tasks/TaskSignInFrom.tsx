import * as Yup from "yup";
import { Form, Formik } from "formik";
import { Input } from "../Form/Input";
import { useTaskCotnext } from "@/app/(main)/(user-panel)/user/tasks/context";
import useAxiosAuth from "@/hooks/AxiosAuth";
import { useSession } from "next-auth/react";
import { Button } from "../Buttons";
import { TASKTYPE } from "@/app/helpers/user/enums";
import CustomHr from "../Ui/CustomHr";
export function TaskSignInForm() {
  const context = useTaskCotnext();
  const axiosAuth = useAxiosAuth();
  const { data: session } = useSession();
  //////// Form Data
  const initialValues = {
    firstName:
      context.state.signAs == "user"
        ? session?.user.user.firstName ?? ""
        : context.state.formPayload?.firstName,
    lastName:
      context.state.signAs == "user"
        ? session?.user.user.lastName ?? ""
        : context.state.formPayload?.lastName,
    email:
      context.state.signAs == "user"
        ? session?.user.user.email ?? ""
        : context.state.formPayload?.email,
    phone: context.state.formPayload?.phone,
    reason: context.state.formPayload?.reason,
    company: context.state.formPayload?.company,
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("first name is required"),
    lastName: Yup.string().required("last name is required"),
    email: Yup.string().email().required("email is required"),
    phone: Yup.number().required("contact is required"),
    reason: Yup.string().required("Reason of visit is required"),
    company:
      context.state.formType == "contractor"
        ? Yup.string().required("company is required")
        : Yup.string().optional(),
  });
  const handleSubmit = async (_values: any) => {
    context.dispatch({
      type: TASKTYPE.FORMPAYLOAD,
      showSignIn: "selfie",
      formPayload: {
        firstName: _values?.firstName,
        lastName: _values?.lastName,
        email: _values?.email,
        phone: _values?.phone,
        reason: _values?.reason,
        company: _values?.company,
      },
    });
  };
  return (
    <>
      <div className=" py-0 md:py-4">
        <div className="text-black text-base font-semibold mb-5">
          Why are you here?
        </div>
        <div className="flex gap-2 ">
          <button
            className={`${context.state.formType == "contractor"
                ? "text-gray-800 border-2 border-gray-700"
                : "bg-primary-500 text-white"
              } text-sm sm:text-base w-1/2 sm:w-36 h-11 sm:h-12 rounded-xl font-semibold`}
            onClick={() => {
              context.dispatch({
                type: TASKTYPE.CHAGNEFORMTYPE,
                formType: "visitor",
              });
            }}
          >
            Visitor
          </button>
          <button
            className={`${context.state.formType == "visitor"
                ? "text-gray-800 border-2 border-gray-700"
                : "bg-primary-500 text-white"
              } text-sm sm:text-base w-1/2 sm:w-36 h-11 sm:h-12 rounded-xl font-semibold`}
            onClick={() => {
              context.dispatch({
                type: TASKTYPE.CHAGNEFORMTYPE,
                formType: "contractor",
              });
            }}
          >
            Contractor
          </button>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, handleSubmit }) => (
          <>
            <Form onSubmit={handleSubmit}>
              <Input
                type="text"
                label="First Name"
                placeholder="Enter first name"
                name="firstName"
                errorMessage={errors.firstName}
                isTouched={touched.firstName}
              />
              <Input
                type="text"
                label="Last Name"
                placeholder="Enter last name"
                name="lastName"
                errorMessage={errors.lastName}
                isTouched={touched.lastName}
              />
              <Input
                type="phone"
                label="Phone"
                placeholder="Enter phone"
                name="phone"
                errorMessage={errors.phone}
                isTouched={touched.phone}
              />
              <Input
                type="email"
                label="Email"
                placeholder="Enter email address"
                name="email"
                errorMessage={errors.email}
                isTouched={touched.email}
              />
              {context.state.formType == "contractor" ? (
                <Input
                  type="text"
                  label="Compnay / Organization"
                  placeholder="Enter company / organization"
                  name="company"
                  errorMessage={errors.company}
                  isTouched={touched.company}
                />
              ) : (
                <></>
              )}
              <Input
                type="text"
                label="Reason of Visit *"
                placeholder="Enter reason of visit"
                name="reason"
                errorMessage={errors.reason}
                isTouched={touched.reason}
              />

              <CustomHr className="my-2" />

              <div className="flex justify-center mb-4 gap-6">
                <button
                  className="text-sm sm:text-base text-primary-500 border-2 border-primary-500 w-1/2 sm:w-36 h-11 sm:h-12 rounded-lg"
                  onClick={() => {
                    context.dispatch({
                      type: TASKTYPE.SHOW_SIGN_IN_MODEL,
                    });
                  }}
                >
                  Back
                </button>
                <button className="text-sm sm:text-base bg-primary-500 hover:bg-primary-600/80 text-white w-1/2 sm:w-36 h-11 sm:h-12 font-semibold rounded-lg">
                  Next
                </button>
              </div>
            </Form>
          </>
        )}
      </Formik>
      {/* Selfie section */}
    </>
  );
}
