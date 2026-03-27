import { createCategory } from '@/app/(main)/(user-panel)/user/apps/am/api';
import {
  getAllAppProjects,
  getAllOrgUsers,
} from '@/app/(main)/(user-panel)/user/apps/api';
import {
  submitSite,
  updateSite,
} from '@/app/(main)/(user-panel)/user/apps/sr/api';
import { Category } from '@/app/type/asset_category';
import Loader from '@/components/DottedLoader/loader';
import { SimpleInput } from '@/components/Form/simpleInput';
import { CustomSearchSelect } from '@/components/TimeSheetApp/CommonComponents/Custom_Select/Custom_Search_Select';
import useAxiosAuth from '@/hooks/AxiosAuth';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { useFormik } from 'formik';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const AddCategoryModel = ({
  handleClose,
  listOfParentCategories,
}: {
  handleClose: () => void;
  listOfParentCategories: Category[];
}) => {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const appFormValidator = (values: any) => {
    const errors: any = {};

    // Validate categoryName
    if (!values.categoryName) {
      errors.categoryName = 'Category name is required.';
    }

    // Validate subcategoryName only if the selectedOption is "subcategory"
    if (values.selectedOption === 'subcategory' && !values.subcategoryName) {
      errors.subcategoryName = 'Subcategory name is required.';
    }

    return errors;
  };
  const createCategoryMutation = useMutation(createCategory, {
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries('categoreis');
    },
  });
  const organizationForm = useFormik({
    initialValues: {
      categoryName: '',
      subcategoryName: '',
      selectedOption: 'category',
    },
    validate: appFormValidator,
    onSubmit: (values) => {
      // {
      //   "name": "Laptops3",
      //   "isSubCategory": true,
      //   "parentCategory": "673f343cf0cb8a054be60e7f"
      // }
      const data = {
        name: values.categoryName,
        isSubCategory: values.selectedOption == 'subcategory' ? true : false,
        parentCategory: values.subcategoryName[0],
      };
      createCategoryMutation.mutate({
        axiosAuth,
        data,
      });
    },
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggle = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const { data: projects, isLoading: projectLoading } = useQuery({
    queryKey: 'allUserAssignedProjects',
    queryFn: () => getAllAppProjects(axiosAuth),
  });

  return (
    <Modal isOpen={true} onOpenChange={handleClose} placement="auto" size="lg">
      <ModalContent className="max-w-[600px] rounded-3xl bg-white">
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-row items-start gap-2 px-5 py-4">
              <div className="flex w-full justify-between px-2">
                <div className="flex w-full flex-row items-start gap-4 py-2">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
                    <path
                      d="M11 13C11 12.4696 11.2107 11.9609 11.5858 11.5858C11.9609 11.2107 12.4696 11 13 11H37C37.5304 11 38.0391 11.2107 38.4142 11.5858C38.7893 11.9609 39 12.4696 39 13V17C39 17.5304 38.7893 18.0391 38.4142 18.4142C38.0391 18.7893 37.5304 19 37 19H13C12.4696 19 11.9609 18.7893 11.5858 18.4142C11.2107 18.0391 11 17.5304 11 17V13ZM11 25C11 24.4696 11.2107 23.9609 11.5858 23.5858C11.9609 23.2107 12.4696 23 13 23H25C25.5304 23 26.0391 23.2107 26.4142 23.5858C26.7893 23.9609 27 24.4696 27 25V37C27 37.5304 26.7893 38.0391 26.4142 38.4142C26.0391 38.7893 25.5304 39 25 39H13C12.4696 39 11.9609 38.7893 11.5858 38.4142C11.2107 38.0391 11 37.5304 11 37V25ZM33 23C32.4696 23 31.9609 23.2107 31.5858 23.5858C31.2107 23.9609 31 24.4696 31 25V37C31 37.5304 31.2107 38.0391 31.5858 38.4142C31.9609 38.7893 32.4696 39 33 39H37C37.5304 39 38.0391 38.7893 38.4142 38.4142C38.7893 38.0391 39 37.5304 39 37V25C39 24.4696 38.7893 23.9609 38.4142 23.5858C38.0391 23.2107 37.5304 23 37 23H33Z"
                      fill="#0063F7"
                    />
                  </svg>

                  <div>
                    <h1>{'Add Category'}</h1>

                    <span className="text-base font-normal text-[#616161]">
                      Add a new category as a parent or child category.
                    </span>
                  </div>
                </div>
                <div
                  onClick={() => {
                    handleClose();
                  }}
                  className="cursor-pointer"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.5875 0.423757C14.4834 0.319466 14.3598 0.236725 14.2237 0.180271C14.0876 0.123817 13.9417 0.0947577 13.7944 0.0947577C13.647 0.0947577 13.5011 0.123817 13.3651 0.180271C13.229 0.236725 13.1053 0.319466 13.0013 0.423757L7.50001 5.91376L1.99876 0.412507C1.8946 0.308353 1.77095 0.225733 1.63487 0.169364C1.49878 0.112996 1.35293 0.0839844 1.20563 0.0839844C1.05834 0.0839844 0.912481 0.112996 0.776396 0.169364C0.640311 0.225733 0.516662 0.308353 0.412507 0.412507C0.308353 0.516662 0.225733 0.640311 0.169364 0.776396C0.112996 0.912481 0.0839844 1.05834 0.0839844 1.20563C0.0839844 1.35293 0.112996 1.49878 0.169364 1.63487C0.225733 1.77095 0.308353 1.8946 0.412507 1.99876L5.91376 7.50001L0.412507 13.0013C0.308353 13.1054 0.225733 13.2291 0.169364 13.3651C0.112996 13.5012 0.0839844 13.6471 0.0839844 13.7944C0.0839844 13.9417 0.112996 14.0875 0.169364 14.2236C0.225733 14.3597 0.308353 14.4834 0.412507 14.5875C0.516662 14.6917 0.640311 14.7743 0.776396 14.8306C0.912481 14.887 1.05834 14.916 1.20563 14.916C1.35293 14.916 1.49878 14.887 1.63487 14.8306C1.77095 14.7743 1.8946 14.6917 1.99876 14.5875L7.50001 9.08626L13.0013 14.5875C13.1054 14.6917 13.2291 14.7743 13.3651 14.8306C13.5012 14.887 13.6471 14.916 13.7944 14.916C13.9417 14.916 14.0875 14.887 14.2236 14.8306C14.3597 14.7743 14.4834 14.6917 14.5875 14.5875C14.6917 14.4834 14.7743 14.3597 14.8306 14.2236C14.887 14.0875 14.916 13.9417 14.916 13.7944C14.916 13.6471 14.887 13.5012 14.8306 13.3651C14.7743 13.2291 14.6917 13.1054 14.5875 13.0013L9.08626 7.50001L14.5875 1.99876C15.015 1.57126 15.015 0.851258 14.5875 0.423757Z"
                      fill="#616161"
                    />
                  </svg>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="my-4">
              <div
                className={`w-full ${
                  organizationForm.values.selectedOption === 'subcategory'
                    ? 'h-[420px]'
                    : ''
                } max-h-[420px] overflow-y-scroll px-6 scrollbar-hide`}
              >
                <div className="relative mb-4 overflow-auto">
                  <div className="flex flex-col items-start space-y-4">
                    {/* Radio button for selecting Category */}
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="option"
                        value="category"
                        checked={
                          organizationForm.values.selectedOption === 'category'
                        }
                        onChange={() => {
                          organizationForm.setFieldValue('subcategoryName', '');
                          organizationForm.setFieldValue(
                            'selectedOption',
                            'category'
                          );
                        }}
                        className="form-radio h-4 w-4 accent-[#616161]"
                      />
                      <span className="ml-2">Category</span>
                    </label>

                    {/* Radio button for selecting Subcategory */}
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="option"
                        value="subcategory"
                        onChange={() =>
                          organizationForm.setFieldValue(
                            'selectedOption',
                            'subcategory'
                          )
                        }
                        checked={
                          organizationForm.values.selectedOption ===
                          'subcategory'
                        }
                        className="form-radio h-4 w-4 accent-[#616161]"
                      />
                      <span className="ml-2">Subcategory</span>
                    </label>
                  </div>
                </div>

                <div className="mt-2">
                  {/* Input for Category Name */}
                  <SimpleInput
                    type="text"
                    label="Category Name"
                    placeholder="Give your category a name"
                    name="categoryName"
                    className="w-full"
                    required={true}
                    onChange={organizationForm.handleChange}
                  />

                  {/* Conditionally render Subcategory Name input if "subcategory" is selected */}

                  {organizationForm.values.selectedOption === 'subcategory' && (
                    <div className="relative mb-4">
                      <CustomSearchSelect
                        label="Select Parent Category"
                        data={(listOfParentCategories ?? [])
                          .filter((e) => !e.isUnCategorized)
                          .flatMap((c) => {
                            return {
                              label: c.name,
                              value: c._id,
                            };
                          })}
                        showImage={false}
                        onSelect={(values) => {
                          organizationForm.setFieldValue(
                            'subcategoryName',
                            values
                          );
                        }}
                        selected={[]} // Adjust this if necessary
                        multiple={false}
                        isOpen={openDropdown === 'dropdown2'}
                        onToggle={() => handleToggle('dropdown2')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2 border-t-2 border-gray-200">
              <Button
                className="rounded-lg border-2 border-[#0063F7] bg-white px-10 font-semibold text-[#0063F7]"
                onPress={onCloseModal}
              >
                Cancel
              </Button>
              <Button
                className="rounded-lg bg-[#0063F7] px-10 font-semibold text-white"
                color={`${organizationForm.isValid ? 'primary' : 'default'}`}
                onPress={() => {
                  organizationForm.submitForm();
                }}
              >
                {createCategoryMutation.isLoading ? (
                  <>
                    <Loader />
                  </>
                ) : (
                  <>Add</>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddCategoryModel;
