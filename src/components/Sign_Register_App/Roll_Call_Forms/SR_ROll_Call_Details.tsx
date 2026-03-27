import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import {
  APPACTIONTYPE,
  JSAAPPACTIONTYPE,
  SR_APP_ACTION_TYPE,
} from '@/app/helpers/user/enums';
import Loader from '@/components/DottedLoader/loader';
import { Search } from '@/components/Form/search';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { useQuery } from 'react-query';
import * as Yup from 'yup';

import { motion } from 'framer-motion';
import { WithRollCallSidebar } from './With_Roll_Call_Sidebar';
import { SRBottomButton } from './SR_Button_Bottom';
import { useSRAppCotnext } from '@/app/(main)/(user-panel)/user/apps/sr/sr_context';
import { SimpleInput } from '@/components/Form/simpleInput';
import { useFormik } from 'formik';

export function SRRollCallDetail() {
  const context = useSRAppCotnext();

  const appFormValidatorSchema = Yup.object().shape({
    // Email validation
    title: Yup.string().required('title is required'),

    // Phone validation
    description: Yup.string().required('description is required'),
  });

  const organizationForm = useFormik({
    initialValues: {
      title: context.state.roll_call_detail?.title ?? '',
      description: context.state.roll_call_detail?.description ?? '',
    },

    validationSchema: appFormValidatorSchema,
    onSubmit: (values) => {
      context.dispatch({
        type: SR_APP_ACTION_TYPE.ROLL_CALL_DETAIL,
        roll_call_detail: {
          title: values.title,
          description: values.description,
        },
      });
      context.dispatch({
        type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
        createNewRollCall: 'attendance',
      });
    },
  });

  return (
    <>
      <WithRollCallSidebar>
        <div className="mx-2 my-4 flex max-h-[368px] w-11/12 flex-col rounded-lg border-2 border-[#EEEEEE] shadow lg:mx-0 lg:ml-2 lg:w-[83%]">
          <div className="flex flex-col sm:p-5 sm:pb-0 md:flex md:flex-row md:justify-between">
            <div className="flex flex-col">
              <h2 className="mb-1 text-sm font-semibold md:text-xl">
                Roll Call Details
              </h2>
              <p className="text-[10px] font-normal text-[#616161] md:text-sm">
                Add details about this roll call below.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-scroll p-5 pt-2">
            <SimpleInput
              label="Title"
              type="text"
              placeholder="Give your roll call title"
              name="title"
              className="w-full"
              errorMessage={organizationForm.errors.title}
              value={organizationForm.values.title}
              isTouched={organizationForm.touched.title}
              onChange={organizationForm.handleChange}
            />
            <div className="pt-5">
              <label className="mb-2 block" htmlFor="reasone">
                Description
              </label>
              <textarea
                rows={3}
                id="description"
                name="description"
                placeholder="Reason for a roll call"
                value={organizationForm.values.description}
                className={` ${
                  organizationForm.errors.description &&
                  organizationForm.touched.description
                    ? 'border-red-500'
                    : 'border-[#EEEEEE]'
                } w-full resize-none rounded-xl border-2 border-gray-300 p-2 shadow-sm`}
                onChange={organizationForm.handleChange}
              />
              {organizationForm.errors.description &&
                organizationForm.touched.description && (
                  <span className="text-xs text-red-500">
                    {organizationForm.errors.description}
                  </span>
                )}
            </div>
          </div>
        </div>
      </WithRollCallSidebar>
      <div className="h-16">
        <SRBottomButton
          isDisabled={!organizationForm.isValid}
          onCancel={() => {
            context.dispatch({
              type: SR_APP_ACTION_TYPE.CREATE_NEW_ROLL,
              createNewRollCall: 'site',
            });
          }}
          onNextClick={() => {
            organizationForm.submitForm();
          }}
        />
      </div>
    </>
  );
}
