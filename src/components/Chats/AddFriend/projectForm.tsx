'use client';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../Form/Input';
import { Button } from '../../Buttons';
import { useChatCotnext } from '@/app/(main)/(user-panel)/user/chats/context';
import { CHATTYPE } from '@/app/helpers/user/enums';
import { useMutation, useQueryClient } from 'react-query';
import {
  createProjectRoom,
  createTeamRoom,
  updateProjectRoom,
  updateTeamRoom,
} from '@/app/(main)/(user-panel)/user/chats/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import Loader from '@/components/DottedLoader/loader';

const ProjectRoomForm = () => {
  const axiosAuth = useAxiosAuth();
  const context = useChatCotnext();
  const queryClient = useQueryClient();
  ///
  const initialValues = {
    channelName: context.state.payload?.channelName,
    description: context.state.payload?.description,
    appearName: context.state.payload?.appearName,
  };
  const validationSchema = Yup.object().shape({
    channelName: Yup.string().required('name is required'),
    description: Yup.string().required('reference is required'),
    appearName: Yup.string().required('description is required'),
  });

  const createTeamRoomMutation = useMutation(createProjectRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries('projectRooms');
      context.dispatch({ type: CHATTYPE.TOGGLE });
    },
  });
  const updateTeamRoomMutation = useMutation(updateProjectRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries('projectRooms');
      context.dispatch({ type: CHATTYPE.EDITCHANNEL });
    },
  });
  const handleSubmit = async (values: any) => {
    if (context.state.selectedType === 'private') {
      context.dispatch({
        type: CHATTYPE.PROJECTPAYLOAD,
        selectedType: context.state.selectedType,
        projectFormType: 'members',
        payload: {
          channelName: values.channelName,
          description: values.description,
          appearName: values.appearName,
        },
      });
    }
    if (context.state.selectedType === 'public') {
      if (context.state.showEditformType === 'project') {
        // if (context.state.roomDetail) {
        //   const updatedRoom = {
        //     ...context.state.roomDetail,
        //     channelName: context.state.payload?.channelName ?? "",
        //     description: context.state.payload?.description ?? "",
        //     appearName: context.state.payload?.appearName ?? "",
        //   };
        //   context.dispatch({
        //     type: CHATTYPE.UPDATEROOMDETAIL,
        //     roomDetail: updatedRoom,
        //   });
        // }
        updateTeamRoomMutation.mutate({
          axiosAuth,
          body: {
            roomId: context.state.roomDetail?._id ?? '',
            projectId: context.state.selectedId ?? '',
            channelName: values.channelName ?? '',
            description: values.description ?? '',
            appearName: values.appearName ?? '',
            type: context.state.selectedType,
            room: [],
          },
        });
      } else {
        createTeamRoomMutation.mutate({
          axiosAuth,
          body: {
            projectId: context.state.selectedId ?? '',
            channelName: values.channelName ?? '',
            description: values.description ?? '',
            appearName: values.appearName ?? '',
            type: context.state.selectedType,
            room: [],
          },
        });
      }
    }
  };

  const handleSelectionChange = (e: any) => {
    context.dispatch({
      type: CHATTYPE.SELECTEDTYPE,
      selectedType: e.target.value,
    });
  };

  return (
    <>
      <div className="overflow-y-scroll scrollbar-hide">
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
                  label="Channel Name"
                  placeholder="Create a unique channel name"
                  name="channelName"
                  className="placeholder:text-xs md:placeholder:text-base"
                  errorMessage={errors.channelName}
                  isTouched={touched.channelName}
                />
                <Input
                  type="text"
                  label="Short Description"
                  placeholder="Enter a description about this channel."
                  name="description"
                  className="text-xs md:text-base"
                  errorMessage={errors.description}
                  isTouched={touched.description}
                />
                <Input
                  type="text"
                  label="Your channel name will appear as"
                  placeholder="#channel-name-t-3429"
                  name="appearName"
                  errorMessage={errors.appearName}
                  isTouched={touched.appearName}
                />
                <div className="mb-8 mt-6">
                  {/* Radion button */}
                  <div className="flex items-center">
                    <input
                      type="radio"
                      value="private"
                      checked={context.state.selectedType === 'private'}
                      onChange={handleSelectionChange}
                    />{' '}
                    <b className="ml-2 text-xs">Private</b>
                    <span className="ml-4 text-[10px] text-gray-500 md:text-xs">
                      Only members added can view this project.
                    </span>
                  </div>
                </div>
                <div className="mb-8 mt-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      value="public"
                      checked={context.state.selectedType === 'public'}
                      onChange={handleSelectionChange}
                    />{' '}
                    <b className="ml-2 text-xs">Public</b>
                    <span className="ml-4 text-[10px] text-gray-500 md:text-xs">
                      Anyone in your organization can view this project.
                    </span>
                  </div>
                </div>
                {/* Button  */}
                <div className="mt-24">
                  <div className="flex justify-center gap-3 text-center">
                    <button
                      className="mt-[24px] h-[47px] w-[120px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[8px] text-xs font-bold leading-[22px] text-[#0063F7] md:min-w-[188px] md:text-sm"
                      type="button"
                      onClick={() => {
                        if (context.state.showEditformType === 'project') {
                          context.dispatch({
                            type: CHATTYPE.EDITCHANNEL,
                          });
                        } else {
                          context.dispatch({
                            type: CHATTYPE.TEAMFORMTYPE,
                            teamFormType: 'select',
                            selectedProjectUsers:
                              context.state.selectedProjectUsers,
                          });
                        }
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="mt-[24px] h-[47px] w-[120px] rounded-lg bg-[#0063F7] px-[10px] py-[8px] text-[12px] font-bold leading-[22px] text-white md:min-w-[188px] md:px-[20px] md:text-sm"
                    >
                      {context.state.showEditformType === 'project' ? (
                        <>
                          {context.state.selectedType === 'public' ? (
                            <>
                              {updateTeamRoomMutation.isLoading ? (
                                <Loader />
                              ) : (
                                <>Update Channel</>
                              )}
                            </>
                          ) : (
                            'Update Members'
                          )}
                        </>
                      ) : (
                        <>
                          {context.state.selectedType === 'public' ? (
                            <>
                              {createTeamRoomMutation.isLoading ? (
                                <Loader />
                              ) : (
                                <>Create Channel</>
                              )}
                            </>
                          ) : (
                            'Add Members'
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            </>
          )}
        </Formik>
      </div>

      {/* new members details */}
    </>
  );
};

export { ProjectRoomForm };
