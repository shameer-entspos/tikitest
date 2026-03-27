import React from 'react';
import { Button } from '../Buttons';

import { useMutation, useQueryClient } from 'react-query';
import { deleteUser } from '@/app/(main)/(org-panel)/organization/users/api';
import { deleteTeam } from '@/app/(main)/(org-panel)/organization/teams/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomHr from '../Ui/CustomHr';

function DeleteModal({
  changeDeleteModal,
  type,
  model,
}: {
  changeDeleteModal: Function;
  type: 'User' | 'Team';
  model: any;
}) {
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const { mutate, isSuccess, isLoading } = useMutation(
    type == 'Team' ? deleteTeam : deleteUser,
    {
      onSuccess: () => {
        if (type == 'Team') {
          queryClient.invalidateQueries('teams');
        }
        if (type == 'User') {
          queryClient.invalidateQueries('users');
        }
      },
    }
  );

  const handleDelete = () => {
    if (type == 'Team') {
      mutate({ id: model._id, axiosAuth: axiosAuth });
    }
    if (type == 'User') {
      mutate({ id: model._id, axiosAuth: axiosAuth });
    }
  };
  if (isSuccess) {
    changeDeleteModal(false);
    return <></>;
  } else {
    return (
      <>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center bg-gray-900/40 px-4 py-8">
            <div className="relative mx-auto w-full rounded-3xl bg-white shadow-lg md:max-w-[600px]">
              <div className=" px-6 py-4 pt-8 md:px-12">
                <div className="flex w-full items-start justify-between">
                  <div className="text-center text-2xl font-semibold text-black">
                    Delete {type}
                  </div>
                  <button
                    className="rounded-md p-1 outline-none hover:bg-gray-100"
                    onClick={() => changeDeleteModal(false)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.00005 8.3998L2.10005 13.2998C1.91672 13.4831 1.68338 13.5748 1.40005 13.5748C1.11672 13.5748 0.883382 13.4831 0.700048 13.2998C0.516715 13.1165 0.425049 12.8831 0.425049 12.5998C0.425049 12.3165 0.516715 12.0831 0.700048 11.8998L5.60005 6.9998L0.700048 2.0998C0.516715 1.91647 0.425049 1.68314 0.425049 1.3998C0.425049 1.11647 0.516715 0.883138 0.700048 0.699804C0.883382 0.516471 1.11672 0.424805 1.40005 0.424805C1.68338 0.424805 1.91672 0.516471 2.10005 0.699804L7.00005 5.5998L11.9 0.699804C12.0834 0.516471 12.3167 0.424805 12.6 0.424805C12.8834 0.424805 13.1167 0.516471 13.3 0.699804C13.4834 0.883138 13.575 1.11647 13.575 1.3998C13.575 1.68314 13.4834 1.91647 13.3 2.0998L8.40005 6.9998L13.3 11.8998C13.4834 12.0831 13.575 12.3165 13.575 12.5998C13.575 12.8831 13.4834 13.1165 13.3 13.2998C13.1167 13.4831 12.8834 13.5748 12.6 13.5748C12.3167 13.5748 12.0834 13.4831 11.9 13.2998L7.00005 8.3998Z"
                        fill="#616161"
                      />
                    </svg>
                  </button>
                </div>

                <CustomHr className="my-4" />

                <p className="mb-3 h-[70px] text-base text-black">
                  Are you sure you want to delete the following {type}{' '}
                  <b className="capitalize">
                    {type == 'Team'
                      ? model.name
                      : model.firstName + model.lastName}{' '}
                  </b>
                </p>
                {/* <div className="whitespace-normal"> */}
                {/* <p className="mb-6 text-base font-normal text-black">
                    The account will not longer be available, and all date in
                    the accountwill be archived under the User ID.
                  </p> */}

                {/* <h2 className="text-xl font-semibold text-black">
                    {type == "Team"
                      ? model.name
                      : model.firstName + model.lastName}
                  </h2>
                  <h2 className="text- mt-5 text-base">{type}s</h2> */}
                {/* </div> */}

                <div className="mt-2 flex justify-end gap-4 text-center">
                  <button
                    className="h-11 w-1/2 rounded-lg border-2 border-primary-500 text-sm text-primary-500 sm:h-12 sm:w-36 sm:text-base"
                    onClick={() => changeDeleteModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="h-11 w-1/2 rounded-lg bg-[#EB5772] text-sm font-semibold text-white sm:h-12 sm:w-36 sm:text-base"
                    onClick={handleDelete}
                    // variant="danger"
                    disabled={isLoading}
                  >
                    Delete {type}
                  </button>
                </div>

                {/* <div className="mt-8 text-center text-base font-normal text-black">
                  {type == "User" ? (
                    <>User ID: {model.userId}</>
                  ) : (
                    <>Team ID: {model.teamId}</>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default DeleteModal;
