import { TIMESHEETTYPE } from '@/app/helpers/user/enums';
import { SimpleInput } from '@/components/Form/simpleInput';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';

import { useTimeSheetAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/timesheets/timesheet_context';

import {
  createTimeSheet,
  updateTimeSheet,
} from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useQueryClient, useMutation, useQuery } from 'react-query';
import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { TimeSheet } from '@/app/type/timesheet';
import { useState } from 'react';
import { useFormik } from 'formik';
import DateRangePicker from '../CommonComponents/Calender/Timesheet_View_Calander';
import { CustomSearchSelect } from '../CommonComponents/Custom_Select/Custom_Search_Select';
interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  openDropdown: string | null;
  handleToggle: (dropdown: string) => void;
  onCloseModal: () => void;
  projectOptions: { label: string; value: string }[];
  onSelectedProjectsChange: (selectedProjects: string[]) => void; // New prop
}

const FilterModal: React.FC<ModalProps> = ({
  isOpen,
  onOpenChange,
  openDropdown,
  handleToggle,
  onCloseModal,
  projectOptions,
  onSelectedProjectsChange, // Receiving the callback
}) => {
  const handleSubmit = (values: any) => {
    const data = {
      projects: values.selectedProject ?? [], // Initialize with empty array
      customer: values.customer ?? [],
    };
  };

  const handleSelectProjects = (values: { value: string }[]) => {
    if (values && values.length > 0) {
      const selectedProjects = values
        .filter((v) => v.value) // Ensuring `value` is present in each selected item
        .map((v) => v.value);
      console.log('Selected Projects in Modal:', selectedProjects);

      onSelectedProjectsChange(selectedProjects); // Passing the updated selected projects back to the main screen
    } else {
      console.log('No projects selected');
    }
  };

  const context = useTimeSheetAppsCotnext();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="auto"
      size="xl"
      className="absolute px-8 py-2"
    >
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-center gap-2 border-b-2 border-gray-200 px-1 py-5">
              <div>
                <h2 className="text-xl font-semibold">Filter By</h2>
                <p className="mt-1 text-sm font-normal text-[#616161]">
                  Filter by the following selections and options.
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="mt-4 flex flex-col justify-start overflow-y-scroll p-0 pl-2 pr-4 pt-4">
              <div className="mb-8 w-full">
                <DateRangePicker
                  title="Submitted Date Range"
                  handleOnConfirm={(from: Date, to: Date) =>
                    context.dispatch({
                      type: TIMESHEETTYPE.TS_DETAIL_DATE,
                      timesheetDetailDate: { from: from, to: to },
                    })
                  }
                  selectedDate={context.state.timesheetDetailDate}
                />
              </div>
              <div className="mb-8 w-full">
                <CustomSearchSelect
                  label="Assigned Project"
                  data={projectOptions}
                  showImage={false}
                  onSelect={handleSelectProjects}
                  multiple={true}
                  isOpen={openDropdown === 'dropdown1'}
                  onToggle={() => handleToggle('dropdown1')}
                />
              </div>
              <div className="mb-8 w-full">
                <CustomSearchSelect
                  label="Assigned Customer"
                  data={[
                    { label: 'SubCategory 1', value: 'Subcategory1' },
                    { label: 'SubCategory 2', value: 'Subcategory2' },
                    { label: 'SubCategory 3', value: 'Subcategory3' },
                  ]}
                  showImage={true}
                  onSelect={() => {}}
                  multiple={true}
                  isOpen={openDropdown === 'dropdown2'}
                  onToggle={() => handleToggle('dropdown2')}
                />
              </div>
              <div className="mb-16 w-full">
                <SimpleInput
                  label="Reference"
                  type="text"
                  placeholder="Enter Reference"
                  name="reference"
                  className="w-full"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex w-full justify-center border-t-1 pt-8">
                <button
                  type="button"
                  className="mr-4 rounded-lg border-2 border-[#0063F7] bg-transparent px-8 py-1 text-[#0063F7] duration-200"
                  onClick={onCloseModal}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#0063F7] px-8 py-1 text-[#FFFFFF] duration-200"
                  onClick={handleSubmit}
                >
                  Apply
                </button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FilterModal;
