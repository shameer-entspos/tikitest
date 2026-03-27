import { Dispatch, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import DeleteModal from '../popupModal/delete';
import { useState } from 'react';
import { AddedUserDetailModel } from '@/app/type/addedUserDetailModel';

import { AddedTeamDetailModel } from '@/app/type/addedTeamDetailModel';
import { UserActions, TeamActions } from '@/app/helpers/organization/actions';
import { ACTIONTYPE } from '@/app/helpers/organization/enums';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { Ellipsis } from 'lucide-react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DropdownComponent({
  props,
  type,
  dispatch,
}: {
  props: AddedUserDetailModel | AddedTeamDetailModel;
  type: 'User' | 'Team';
  dispatch: Dispatch<UserActions> | Dispatch<TeamActions>;
}) {
  const [delModal, setDeleteModal] = useState(false);

  const changeDeleteModal = (val: boolean) => {
    setDeleteModal(val);
  };

  return (
    <>
      <div className="w-full">
        <Dropdown className="rounded-lg bg-white shadow-md">
          <DropdownTrigger>
            {/* <svg
              width="26"
              height="6"
              viewBox="0 0 26 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2  cursor-pointer"
            >
              <path
                d="M3.625 5.8125C2.87908 5.8125 2.16371 5.51618 1.63626 4.98874C1.10882 4.46129 0.8125 3.74592 0.8125 3C0.8125 2.25408 1.10882 1.53871 1.63626 1.01126C2.16371 0.483816 2.87908 0.1875 3.625 0.1875C4.37092 0.1875 5.08629 0.483816 5.61374 1.01126C6.14118 1.53871 6.4375 2.25408 6.4375 3C6.4375 3.74592 6.14118 4.46129 5.61374 4.98874C5.08629 5.51618 4.37092 5.8125 3.625 5.8125ZM13 5.8125C12.2541 5.8125 11.5387 5.51618 11.0113 4.98874C10.4838 4.46129 10.1875 3.74592 10.1875 3C10.1875 2.25408 10.4838 1.53871 11.0113 1.01126C11.5387 0.483816 12.2541 0.1875 13 0.1875C13.7459 0.1875 14.4613 0.483816 14.9887 1.01126C15.5162 1.53871 15.8125 2.25408 15.8125 3C15.8125 3.74592 15.5162 4.46129 14.9887 4.98874C14.4613 5.51618 13.7459 5.8125 13 5.8125ZM22.375 5.8125C21.6291 5.8125 20.9137 5.51618 20.3863 4.98874C19.8588 4.46129 19.5625 3.74592 19.5625 3C19.5625 2.25408 19.8588 1.53871 20.3863 1.01126C20.9137 0.483816 21.6291 0.1875 22.375 0.1875C23.1209 0.1875 23.8363 0.483816 24.3637 1.01126C24.8912 1.53871 25.1875 2.25408 25.1875 3C25.1875 3.74592 24.8912 4.46129 24.3637 4.98874C23.8363 5.51618 23.1209 5.8125 22.375 5.8125Z"
                fill="#616161"
              />
            </svg> */}
            <p className="mx-auto w-max cursor-pointer font-medium text-gray-700">
              <Ellipsis />
            </p>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Dropdown Variants"
            color={'default'}
            variant={'light'}
          >
            <DropdownItem
              key="view"
              onClick={() => {
                type == 'User'
                  ? dispatch({
                      type: ACTIONTYPE.EDIT,
                      userPayload: props as AddedUserDetailModel,
                    })
                  : dispatch({
                      type: ACTIONTYPE.EDIT,
                      teamPayload: props as AddedTeamDetailModel,
                    });
              }}
            >
              Edit Details
            </DropdownItem>

            <DropdownItem
              key="remove"
              onClick={() => {
                changeDeleteModal(true);
              }}
            >
              Delete {type}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {delModal && (
          <DeleteModal
            changeDeleteModal={changeDeleteModal}
            type={type}
            model={props}
          />
        )}
      </div>
    </>
  );
}
