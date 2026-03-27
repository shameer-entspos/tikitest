import { Site } from "@/app/type/Sign_Register_Sites";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { ErrorMessage, useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";

export default function ViewManageSitesModel({
  handleClose,
  site,
}: {
  handleClose: () => void;
  site: Site | undefined;
}) {
  return (
    <Modal
      isOpen={true}
      onOpenChange={handleClose}
      placement="top-center"
      size="xl"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-5 py-4">
              <div className="flex w-full flex-row items-start gap-4 border-b-2 py-2">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                  <path
                    d="M39.6985 17.7475L36.136 15.0025C35.8939 14.8471 35.6307 14.7274 35.3545 14.647C35.0794 14.558 34.793 14.5085 34.504 14.5H24.25L25.4515 22H34.504C34.75 22 35.0575 21.9445 35.353 21.853C35.6485 21.7615 35.9335 21.6355 36.1345 21.499L39.697 18.751C39.8995 18.6145 40 18.433 40 18.25C40 18.067 39.8995 17.8855 39.6985 17.7475ZM22.75 11.5H21.25C21.0511 11.5 20.8603 11.579 20.7197 11.7197C20.579 11.8603 20.5 12.0511 20.5 12.25V17.5H15.496C15.247 17.5 14.941 17.5555 14.6455 17.6485C14.3485 17.7385 14.065 17.863 13.864 18.0025L10.3015 20.7475C10.099 20.884 10 21.067 10 21.25C10 21.4315 10.099 21.613 10.3015 21.7525L13.864 24.5005C14.065 24.637 14.3485 24.763 14.6455 24.853C14.941 24.9445 15.247 25 15.496 25H20.5V37.75C20.5 37.9489 20.579 38.1397 20.7197 38.2803C20.8603 38.421 21.0511 38.5 21.25 38.5H22.75C22.9489 38.5 23.1397 38.421 23.2803 38.2803C23.421 38.1397 23.5 37.9489 23.5 37.75V12.25C23.5 12.0511 23.421 11.8603 23.2803 11.7197C23.1397 11.579 22.9489 11.5 22.75 11.5Z"
                    fill="#0063F7"
                  />
                </svg>

                <div>
                  <h1>{"View Site"}</h1>

                  <span className="text-base font-normal text-[#616161]">
                    View site details below.
                  </span>
                </div>
                <div></div>
              </div>
            </ModalHeader>
            <ModalBody className="mt-4">
              <div className="h-[60vh] max-h-[520px] w-full overflow-y-scroll">
                <div className="bg-white px-6">
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-600">Site ID</h2>
                    <p className="text-lg font-semibold">B2AA9Z-3</p>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-600">Assigned Project</h2>
                    <span className="inline-block rounded bg-green-100 px-2 py-1 text-sm text-green-800">
                      Building Renovations +2
                    </span>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-600">Assigned Customer</h2>
                    <div className="mt-1 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                        <svg
                          className="h-6 w-6 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <p className="ml-2 text-gray-700">BSL Scaffolding</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-600">Site Name</h2>
                    <p className="text-lg font-semibold">
                      Left Wing Block, Entrance - MPS Building
                    </p>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-600">Site Address</h2>
                    <p className="text-lg font-semibold">
                      35 Hannigan Drive, Mt Wellington, Auckland, New Zealand
                    </p>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-sm text-gray-600">Added By</h2>
                    <div className="mt-1 flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                        <svg
                          className="h-6 w-6 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <p className="ml-2 text-gray-700">Brandon O'Neil</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Remove this site when last ‘Assigned Project’ is closed.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-evenly gap-2 border-t-2 border-gray-200">
              <Button
                className="bg-white px-10 font-semibold text-[#0063F7]"
                onPress={onCloseModal}
              >
                Close
              </Button>
              <Button
                className="bg-white px-10 font-semibold text-primary-500"
                onPress={() => {}}
              >
                Edit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
