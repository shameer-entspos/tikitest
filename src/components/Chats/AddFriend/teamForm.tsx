"use client";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import { Input } from "../../Form/Input";
import { Button } from "../../Buttons";
import { useChatCotnext } from "@/app/(main)/(user-panel)/user/chats/context";
import { CHATTYPE } from "@/app/helpers/user/enums";
import { useMutation, useQueryClient } from "react-query";
import {
  createTeamRoom,
  updateTeamRoom,
} from "@/app/(main)/(user-panel)/user/chats/api";
import useAxiosAuth from "@/hooks/AxiosAuth";
import Loader from "@/components/DottedLoader/loader";
import { useEffect } from "react";
const TeamForm = () => {
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
    channelName: Yup.string().required("name is required"),
    description: Yup.string().required("reference is required"),
    appearName: Yup.string().required("description is required"),
  });
  const createTeamRoomMutation = useMutation(createTeamRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries("teamsRoom");
      context.dispatch({ type: CHATTYPE.TOGGLE });
    },
  });
  const updateTeamRoomMutation = useMutation(updateTeamRoom, {
    onSuccess: () => {
      queryClient.invalidateQueries("teamsRoom");
      context.dispatch({ type: CHATTYPE.EDITCHANNEL });
    },
  });
  const handleSubmit = async (values: any) => {
    if (context.state.selectedType === "private") {
      context.dispatch({
        type: CHATTYPE.TEAMPAYLOAD,
        selectedType: context.state.selectedType,
        teamFormType: "members",
        payload: {
          channelName: values.channelName,
          description: values.description,
          appearName: values.appearName,
        },
      });
    }
    if (context.state.selectedType === "public") {
      if (context.state.showEditformType === "team") {
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
            teamId: context.state.selectedId ?? "",
            channelName: values.channelName ?? "",
            description: values.description ?? "",
            appearName: values.appearName ?? "",
            type: context.state.selectedType,
            room: [],
          },
        });
      } else {
        createTeamRoomMutation.mutate({
          axiosAuth,
          body: {
            teamId: context.state.selectedId ?? "",
            channelName: values.channelName ?? "",
            description: values.description ?? "",
            appearName: values.appearName ?? "",
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
      <div className="h-auto overflow-y-scroll scrollbar-hide">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleSubmit }) => (
            <>
              <Form onSubmit={handleSubmit}>
                <div className="overflow-hidden overflow-y-auto">
                  <Input
                    type="text"
                    label="Channel Name"
                    placeholder="Create a unique channel name"
                    name="channelName"
                    errorMessage={errors.channelName}
                    isTouched={touched.channelName}
                  />
                  <Input
                    type="text"
                    label="Short Description"
                    placeholder="Enter a description about this channel."
                    name="description"
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

                  <div className="mb-4">
                    {/* Radion button */}

                    <div className="flex">
                      <input
                        type="radio"
                        value="private"
                        checked={context.state.selectedType === "private"}
                        onChange={handleSelectionChange}
                      />{" "}
                      <b className="ml-2 text-xs">Private</b>
                      <span className="ml-4 text-xs text-gray-500">
                        Only members added can view this project.
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex">
                      <input
                        type="radio"
                        value="public"
                        checked={context.state.selectedType === "public"}
                        onChange={handleSelectionChange}
                      />{" "}
                      <b className="ml-2 text-xs">Public</b>
                      <span className="ml-4 text-xs text-gray-500">
                        Anyone in your organization can view this project.
                      </span>
                    </div>
                  </div>

                  {/* Button  */}
                  <div className="mt-6">
                    <div className="flex justify-center gap-7 text-center">
                      <button
                        className="mt-[24px] h-[47px] min-w-[155px] rounded-lg border-3 border-[#0063F7] px-[20px] py-[6px] text-sm font-bold leading-[22px] text-[#0063F7]"
                        type="button"
                        onClick={() => {
                          if (context.state.showEditformType === "team") {
                            context.dispatch({
                              type: CHATTYPE.EDITCHANNEL,
                            });
                          } else {
                            context.dispatch({
                              type: CHATTYPE.TEAMFORMTYPE,
                              teamFormType: "select",
                              selectedUsers: context.state.selectedUsers,
                            });
                          }
                        }}
                      >
                        Back
                      </button>
                      <Button
                        className="mt-[24px] h-[40px] min-w-[155px] rounded-lg bg-[#0063F7] px-[20px] py-[6px] text-sm font-bold leading-[22px] text-white"
                        type="submit"
                        variant="primary"
                      >
                        {context.state.showEditformType === "team" ? (
                          <>
                            {context.state.selectedType === "public" ? (
                              <>
                                {updateTeamRoomMutation.isLoading ? (
                                  <Loader />
                                ) : (
                                  <>Update Team</>
                                )}
                              </>
                            ) : (
                              "Update Members"
                            )}
                          </>
                        ) : (
                          <>
                            {context.state.selectedType === "public" ? (
                              <>
                                {createTeamRoomMutation.isLoading ? (
                                  <Loader />
                                ) : (
                                  <>Create Team</>
                                )}
                              </>
                            ) : (
                              "Add Members"
                            )}
                          </>
                        )}
                      </Button>
                    </div>
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

export { TeamForm };
