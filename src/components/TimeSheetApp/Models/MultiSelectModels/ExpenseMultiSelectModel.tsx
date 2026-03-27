import { getAllAppProjects } from '@/app/(main)/(user-panel)/user/apps/api';
import { getCustomersList } from '@/app/(main)/(user-panel)/user/apps/am/api';
import { downloadCSV } from '@/utils/generateCsv';
import { dateFormat } from '@/app/helpers/dateFormat';
import { updateMultipleExpenses } from '@/app/(main)/(user-panel)/user/apps/timesheets/api';
import Loader from '@/components/DottedLoader/loader';
import { SimpleInput } from '@/components/Form/simpleInput';
import useAxiosAuth from '@/hooks/AxiosAuth';
import CustomModal from '@/components/Custom_Modal';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { CustomSearchSelect } from '../../CommonComponents/Custom_Select/Custom_Search_Select';
import { Expanse } from '@/app/type/expanse';

interface ExpenseMultiSelectModalProps {
  handleShowModel: () => void;
  selectedExpenses: Expanse[];
}

const ExpenseMultiSelectModal: React.FC<ExpenseMultiSelectModalProps> = ({
  handleShowModel,
  selectedExpenses,
}) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: 'customers',
    queryFn: () => getCustomersList(axiosAuth),
  });

  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });

  const updateMultipleExpenseMutation = useMutation(updateMultipleExpenses, {
    onSuccess: () => {
      handleShowModel();
      queryClient.invalidateQueries('expenses');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expenses');
    },
  });

  const [confirmOption, setConfirmOption] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    'csv' | 'edit' | 'delete'
  >('csv');

  const [editSelectedProject, setEditSelectedProject] = useState<string[]>([]);
  const [editSelectedCustomer, setEditSelectedCustomer] = useState<string[]>(
    []
  );
  const [editSelectedSupplier, setEditSelectedSupplier] = useState<string[]>(
    []
  );

  const [editReference, setEditReference] = useState<string>('');
  const [editDescription, setEditDescription] = useState('');

  // Required: Project, Customer, Supplier. Optional: Reference, Description
  const areEditFieldsValid = () => {
    return (
      editSelectedProject.length > 0 &&
      editSelectedCustomer.length > 0 &&
      editSelectedSupplier.length > 0
    );
  };

  const handleOptionChange = (option: 'csv' | 'edit' | 'delete') => {
    setSelectedOption(option);
  };

  const handleApplyOption = () => {
    setConfirmOption(true);
  };

  const handleBackToOptions = () => {
    setSelectedOption('csv');
    setConfirmOption(false);
  };

  const [openDropdown, setOpenDropdown] = useState<string>('');

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? '' : dropdownId);
  };

  const getHeader = () => {
    if (selectedOption === 'delete' && confirmOption) {
      return (
        <>
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#FFDFDF" />
            <path
              d="M37.7513 31.0419L27.5032 13.2446C27.2471 12.8086 26.8815 12.4471 26.4427 12.1959C26.0038 11.9446 25.5069 11.8125 25.0013 11.8125C24.4956 11.8125 23.9987 11.9446 23.5598 12.1959C23.121 12.4471 22.7554 12.8086 22.4993 13.2446L12.2513 31.0419C12.0049 31.4636 11.875 31.9433 11.875 32.4317C11.875 32.9202 12.0049 33.3998 12.2513 33.8216C12.5041 34.2602 12.869 34.6237 13.3087 34.8748C13.7484 35.1258 14.2469 35.2553 14.7532 35.2501H35.2493C35.7552 35.2549 36.2532 35.1252 36.6925 34.8742C37.1317 34.6231 37.4963 34.2599 37.7489 33.8216C37.9957 33.4 38.1259 32.9205 38.1263 32.432C38.1268 31.9436 37.9973 31.4638 37.7513 31.0419ZM36.1259 32.8829C36.0365 33.0353 35.9083 33.1612 35.7542 33.2477C35.6002 33.3342 35.4259 33.3781 35.2493 33.3751H14.7532C14.5766 33.3781 14.4023 33.3342 14.2483 33.2477C14.0942 33.1612 13.966 33.0353 13.8766 32.8829C13.7957 32.7459 13.753 32.5897 13.753 32.4305C13.753 32.2714 13.7957 32.1152 13.8766 31.9782L24.1247 14.1809C24.2158 14.0293 24.3447 13.9038 24.4987 13.8166C24.6527 13.7295 24.8266 13.6837 25.0036 13.6837C25.1806 13.6837 25.3545 13.7295 25.5085 13.8166C25.6625 13.9038 25.7914 14.0293 25.8825 14.1809L36.1306 31.9782C36.2108 32.1156 36.2526 32.2721 36.2518 32.4312C36.251 32.5903 36.2075 32.7463 36.1259 32.8829ZM24.0638 25.8751V21.1876C24.0638 20.9389 24.1625 20.7005 24.3383 20.5247C24.5142 20.3488 24.7526 20.2501 25.0013 20.2501C25.2499 20.2501 25.4884 20.3488 25.6642 20.5247C25.84 20.7005 25.9388 20.9389 25.9388 21.1876V25.8751C25.9388 26.1237 25.84 26.3622 25.6642 26.538C25.4884 26.7138 25.2499 26.8126 25.0013 26.8126C24.7526 26.8126 24.5142 26.7138 24.3383 26.538C24.1625 26.3622 24.0638 26.1237 24.0638 25.8751ZM26.4075 30.0938C26.4075 30.372 26.325 30.6438 26.1705 30.8751C26.016 31.1064 25.7964 31.2866 25.5394 31.393C25.2824 31.4995 24.9997 31.5273 24.7269 31.4731C24.4541 31.4188 24.2036 31.2849 24.0069 31.0882C23.8102 30.8915 23.6763 30.641 23.622 30.3682C23.5678 30.0954 23.5956 29.8126 23.7021 29.5557C23.8085 29.2987 23.9887 29.0791 24.22 28.9246C24.4512 28.7701 24.7231 28.6876 25.0013 28.6876C25.3742 28.6876 25.7319 28.8357 25.9956 29.0995C26.2593 29.3632 26.4075 29.7209 26.4075 30.0938Z"
              fill="#A81717"
            />
          </svg>
          <div>
            <h2 className="text-xl font-semibold">Delete Expenses</h2>
            <p className="mt-1 text-sm font-normal text-[#616161]">
              Are you sure you want to delete these expenses. This action cannot
              be undone.
            </p>
          </div>
        </>
      );
    }
    return (
      <>
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
          <path
            d="M16.25 33.75H18.0312L30.25 21.5313L28.4688 19.75L16.25 31.9688V33.75ZM13.75 36.25V30.9375L30.25 14.4688C30.5 14.2396 30.7763 14.0625 31.0788 13.9375C31.3813 13.8125 31.6987 13.75 32.0312 13.75C32.3638 13.75 32.6867 13.8125 33 13.9375C33.3133 14.0625 33.5842 14.25 33.8125 14.5L35.5312 16.25C35.7812 16.4792 35.9638 16.75 36.0788 17.0625C36.1938 17.375 36.2508 17.6875 36.25 18C36.25 18.3333 36.1929 18.6513 36.0788 18.9538C35.9646 19.2562 35.7821 19.5321 35.5312 19.7812L19.0625 36.25H13.75ZM29.3438 20.6562L28.4688 19.75L30.25 21.5313L29.3438 20.6562Z"
            fill="#0063F7"
          />
        </svg>
        <div>
          <h2 className="text-xl font-semibold">Bulk Select Options</h2>
          <p className="mt-1 text-sm font-normal text-[#616161]">
            Select an option below.
          </p>
        </div>
      </>
    );
  };

  const getBody = () => (
    <div
      className={`mt-0 overflow-y-scroll scrollbar-hide ${
        selectedOption === 'delete' ? 'min-h-[0px]' : 'min-h-[150px]'
      } flex flex-col justify-start p-0 pb-8 pl-2 pr-4 pt-4`}
    >
      {!confirmOption && (
        <div className="mb-24 flex flex-col space-y-4 p-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="option"
              checked={selectedOption == 'csv'}
              onClick={() => handleOptionChange('csv')}
              className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
            />
            <span className="ml-2">Export to CSV</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="option"
              checked={selectedOption == 'edit'}
              onClick={() => handleOptionChange('edit')}
              className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
            />
            <span className="ml-2">Edit Expenses</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="option"
              checked={selectedOption == 'delete'}
              onClick={() => handleOptionChange('delete')}
              className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
            />
            <span className="ml-2">Delete Expenses</span>
          </label>
        </div>
      )}

      {selectedOption === 'csv' && confirmOption && (
        <div className="flex items-center justify-between">
          <div className="max-w-[350px] truncate text-[20px] text-[#0063F7]">
            {new Date()
              .toISOString()
              .split('T')[0]
              .replace(/-/g, '')
              .toUpperCase()}
            -Expense-Export.csv
          </div>
          <div
            className="cursor-pointer text-[20px] font-bold text-[#0063F7]"
            onClick={() => {
              const flattenedData = selectedExpenses.map((item) => ({
                'Expense ID': item.referenceId || '',
                Supplier: item.supplier || '',
                'Assigned Project':
                  item.projects?.map((p) => p.name).join(', ') || '',
                Cost: item.invoiceValue || '',
                'Submitted By':
                  `${item.createdBy?.firstName || ''} ${item.createdBy?.lastName || ''}`.trim() ||
                  '',
                Date: dateFormat(item.createdAt.toString()),
                Reference: item.referenceId || '',
              }));
              const fileName = `${new Date().toISOString().split('T')[0].replace(/-/g, '').toUpperCase()}-Expense-Export.csv`;
              downloadCSV(flattenedData, fileName);
            }}
          >
            Download
          </div>
        </div>
      )}

      {selectedOption === 'edit' && confirmOption && (
        <div className="mb-16 flex flex-col gap-4">
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Assigned Project"
              isRequired={true}
              data={(projects ?? []).map((project) => ({
                label: project.name ?? '',
                value: project._id ?? '',
              }))}
              selected={editSelectedProject}
              onSelect={(values) =>
                setEditSelectedProject(
                  Array.isArray(values) ? values : [values]
                )
              }
              hasError={false}
              showImage={false}
              isOpen={openDropdown === 'dropdown1'}
              onToggle={() => handleToggle('dropdown1')}
            />
          </div>
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Assigned Customer"
              isRequired={true}
              data={[
                { label: 'My Organization', value: 'My Organization' },
                ...(customers ?? [])
                  .filter((c) => c.role == 4)
                  .flatMap((user) => ({
                    label: `${user.customerName} - ${user.userId}`,
                    value: `${user.customerName}`,
                    photo: user.photo,
                  })),
              ]}
              selected={
                editSelectedCustomer.length > 0 ? [editSelectedCustomer[0]] : []
              }
              onSelect={(values) => {
                const val = Array.isArray(values)
                  ? (values[0] ?? '')
                  : (values ?? '');
                setEditSelectedCustomer(val ? [val] : []);
              }}
              hasError={false}
              showImage={true}
              multiple={false}
              returnSingleValueWithLabel={true}
              isOpen={openDropdown === 'dropdown2'}
              onToggle={() => handleToggle('dropdown2')}
            />
          </div>
          <div className="relative mb-8">
            <CustomSearchSelect
              label="Assigned Supplier"
              isRequired={true}
              data={[
                { label: 'My Organization', value: 'My Organization' },
                ...(customers ?? [])
                  .filter((c) => c.role == 5)
                  .flatMap((user) => ({
                    label: `${user.customerName} - ${user.userId}`,
                    value: `${user.customerName}`,
                    photo: user.photo,
                  })),
              ]}
              selected={
                editSelectedSupplier.length > 0 ? [editSelectedSupplier[0]] : []
              }
              onSelect={(values) => {
                const val = Array.isArray(values)
                  ? (values[0] ?? '')
                  : (values ?? '');
                setEditSelectedSupplier(val ? [val] : []);
              }}
              hasError={false}
              showImage={true}
              multiple={false}
              returnSingleValueWithLabel={true}
              isOpen={openDropdown === 'dropdown3'}
              onToggle={() => handleToggle('dropdown3')}
            />
          </div>

          <div className="relative">
            <SimpleInput
              type="text"
              label="Reference (Optional)"
              placeholder="Enter Reference"
              name="categoryName"
              className="w-full"
              bottomPadding={false}
              value={editReference}
              onChange={(e) => setEditReference(e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="mb-2 text-base text-[#1E1E1E]">
              Description
              <span className="text-[14px] font-normal text-[#616161]">
                {' (Optional)'}
              </span>
            </div>
            <textarea
              className="w-full rounded-md border border-gray-300 p-3 focus:outline-none"
              placeholder="Enter your description here..."
              rows={6}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
        </div>
      )}

      {selectedOption === 'delete' && confirmOption && (
        <div className="mb-16 flex flex-col gap-4">
          <h3>Selected IDs:</h3>
          {selectedExpenses.length > 0 ? (
            selectedExpenses.map((ex) => (
              <div key={ex._id} className="selecteds-id">
                {ex._id}
              </div>
            ))
          ) : (
            <p>No items selected</p>
          )}
        </div>
      )}
    </div>
  );

  const handleModalCancel = () => {
    if (confirmOption) {
      handleBackToOptions();
    } else {
      handleShowModel();
    }
  };

  const getHandleSubmit = () => {
    if (!confirmOption) return handleApplyOption;
    if (selectedOption === 'csv') {
      return () => {
        const flattenedData = selectedExpenses.map((item) => ({
          'Expense ID': item.referenceId || '',
          Supplier: item.supplier || '',
          'Assigned Project':
            item.projects?.map((p) => p.name).join(', ') || '',
          Cost: item.invoiceValue || '',
          'Submitted By':
            `${item.createdBy?.firstName || ''} ${item.createdBy?.lastName || ''}`.trim() ||
            '',
          Date: dateFormat(item.createdAt.toString()),
          Reference: item.referenceId || '',
        }));
        const fileName = `${new Date().toISOString().split('T')[0].replace(/-/g, '').toUpperCase()}-Expense-Export.csv`;
        downloadCSV(flattenedData, fileName);
        handleShowModel();
      };
    }
    if (selectedOption === 'edit') {
      return () => {
        const data = {
          projects: editSelectedProject ?? [],
          customer:
            editSelectedCustomer.length > 0 ? editSelectedCustomer[0] : '',
          supplier:
            editSelectedSupplier.length > 0 ? editSelectedSupplier[0] : '',
          reference: editReference,
          description: editDescription,
        };
        updateMultipleExpenseMutation.mutate({
          axiosAuth,
          data: {
            ids: selectedExpenses.map((ex) => ex._id),
            action: 'UPDATE',
            data,
          },
        });
      };
    }
    if (selectedOption === 'delete') {
      return () => {
        updateMultipleExpenseMutation.mutate({
          axiosAuth,
          data: {
            ids: (selectedExpenses ?? []).map((ex) => ex._id) ?? [],
            action: 'DELETE',
          },
        });
      };
    }
    return () => {};
  };

  const getSubmitValue = () => {
    if (!confirmOption) return 'Next';
    if (selectedOption === 'csv') return 'Download';
    if (selectedOption === 'edit') return 'Confirm';
    if (selectedOption === 'delete') return 'Delete';
    return 'Next';
  };

  return (
    <CustomModal
      isOpen={true}
      header={getHeader()}
      body={getBody()}
      handleCancel={handleShowModel}
      customCancelHandler={handleModalCancel}
      handleSubmit={getHandleSubmit()}
      submitValue={getSubmitValue()}
      cancelButton={confirmOption ? 'Back' : 'Cancel'}
      variant={
        selectedOption === 'delete' && confirmOption ? 'danger' : 'primary'
      }
      submitDisabled={
        selectedOption === 'edit' && confirmOption && !areEditFieldsValid()
      }
      isLoading={updateMultipleExpenseMutation.isLoading}
    />
  );
};

export default ExpenseMultiSelectModal;
