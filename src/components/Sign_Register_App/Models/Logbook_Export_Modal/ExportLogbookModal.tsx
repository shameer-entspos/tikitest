import { Site } from '@/app/type/Sign_Register_Sites';
import { SignInRegisterSubmission } from '@/app/type/Sign_Register_Submission';
import { dateFormat, timeFormat } from '@/app/helpers/dateFormat';
import CustomModal from '@/components/Custom_Modal';
import { downloadCSV } from '@/utils/generateCsv';
import { useState } from 'react';

interface ExportLogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | undefined;
  logbookData: SignInRegisterSubmission[];
  onExportPDF: () => Promise<void>;
}

const ExportLogbookModal = ({
  isOpen,
  onClose,
  site,
  logbookData,
  onExportPDF,
}: ExportLogbookModalProps) => {
  const [selectedOption, setSelectedOption] = useState<'pdf' | 'csv' | ''>('pdf');
  const [confirmOption, setConfirmOption] = useState(false);

  const visitorTypeMap: { [key: number]: string } = {
    0: 'No one',
    1: 'Customer',
    2: 'Supplier',
    3: 'Employee',
    4: 'Contractor',
    5: 'Courier / Delivery Person',
    6: 'Family Member',
    7: 'Friend',
  };

  const handleNext = () => {
    if (!confirmOption) {
      // Just show the confirmation screen, don't generate yet
      setConfirmOption(true);
    } else {
      // Close modal
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedOption('pdf');
    setConfirmOption(false);
    onClose();
  };

  const handleDownloadPDF = async () => {
    try {
      await onExportPDF();
    } catch (error) {
      console.error('Failed to download PDF', error);
    }
  };

  const handleDownloadCSV = () => {
    const flattenedData = logbookData.map((entry) => ({
      'First Name': entry.firstName || '',
      'Last Name': entry.lastName || '',
      'User Type': entry.userType == 1 ? 'User' : 'Guest',
      'Visitor Type': visitorTypeMap[entry.visitorType] || '',
      'Email': entry.email || '',
      'Contact': entry.contact || '',
      'Date & Time': entry.createdAt
        ? `${dateFormat(entry.createdAt.toString())} ${timeFormat(entry.createdAt.toString())}`
        : '',
      'Sign Out Date & Time': entry.signOutAt
        ? `${dateFormat(entry.signOutAt.toString())} ${timeFormat(entry.signOutAt.toString())}`
        : '',
      'Status': entry.signOutAt == null ? 'Signed in' : 'Signed out',
      'Site Name': entry.site?.siteName || '',
      'Submitted By': entry.submittedBy
        ? `${entry.submittedBy.firstName || ''} ${entry.submittedBy.lastName || ''}`.trim()
        : '',
    }));

    const fileName = `logbook-${site?.siteId || site?._id || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(flattenedData, fileName);
  };

  const getFileName = () => {
    if (selectedOption === 'pdf') {
      return `logbook-${site?.siteId || site?._id || 'export'}-${new Date().toISOString().split('T')[0]}.PDF`;
    } else if (selectedOption === 'csv') {
      return `logbook-${site?.siteId || site?._id || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
    }
    return '';
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleCancel={handleClose}
      handleSubmit={handleNext}
      submitValue={confirmOption ? 'Close' : 'Next'}
      cancelButton="Cancel"
      submitDisabled={!selectedOption}
      variant="primary"
      cancelvariant="primaryOutLine"
      size="xl"
      header={
        <div className="flex flex-row items-start gap-2">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="25" cy="25" r="25" fill="#E2F3FF" />
            <path
              d="M14.1251 14.25H29.8751C29.9746 14.25 30.0699 14.2105 30.1403 14.1402C30.2106 14.0698 30.2501 13.9745 30.2501 13.875V11.25C30.2502 11.1515 30.2308 11.0539 30.1932 10.9629C30.1556 10.8718 30.1003 10.7891 30.0307 10.7194L24.7807 5.46938C24.711 5.39975 24.6283 5.34454 24.5372 5.3069C24.4462 5.26926 24.3486 5.24992 24.2501 5.25H15.2501C14.8523 5.25 14.4707 5.40804 14.1894 5.68934C13.9081 5.97064 13.7501 6.35218 13.7501 6.75V13.875C13.7501 13.9745 13.7896 14.0698 13.8599 14.1402C13.9303 14.2105 14.0256 14.25 14.1251 14.25ZM24.2501 7.125L28.3751 11.25H24.2501V7.125ZM31.0001 17.2997C30.9833 17.4925 30.8943 17.6718 30.7508 17.8017C30.6074 17.9315 30.4202 18.0024 30.2267 18H28.0001V19.5H29.4748C29.6683 19.4974 29.8557 19.5682 29.9992 19.6981C30.1427 19.828 30.2317 20.0075 30.2482 20.2003C30.255 20.3029 30.2407 20.4058 30.2061 20.5026C30.1714 20.5994 30.1173 20.6881 30.0469 20.7631C29.9766 20.8381 29.8916 20.8978 29.7972 20.9385C29.7028 20.9793 29.601 21.0002 29.4982 21H28.0001V22.4747C28.0027 22.6682 27.9319 22.8556 27.802 22.9991C27.6721 23.1426 27.4926 23.2316 27.2998 23.2481C27.1972 23.2549 27.0943 23.2406 26.9975 23.206C26.9007 23.1713 26.812 23.1172 26.737 23.0468C26.662 22.9765 26.6023 22.8915 26.5615 22.7971C26.5208 22.7027 26.4999 22.6009 26.5001 22.4981V17.25C26.5001 17.0511 26.5791 16.8603 26.7198 16.7197C26.8604 16.579 27.0512 16.5 27.2501 16.5H30.2501C30.3529 16.4998 30.4547 16.5207 30.5491 16.5615C30.6435 16.6022 30.7285 16.6619 30.7988 16.7369C30.8691 16.8119 30.9233 16.9006 30.9579 16.9974C30.9926 17.0942 31.0069 17.1971 31.0001 17.2997ZM16.0001 16.5H14.5001C14.3012 16.5 14.1104 16.579 13.9698 16.7197C13.8291 16.8603 13.7501 17.0511 13.7501 17.25V22.4747C13.747 22.6686 13.8176 22.8564 13.9475 23.0003C14.0775 23.1442 14.2572 23.2334 14.4504 23.25C14.553 23.2568 14.6559 23.2425 14.7527 23.2078C14.8495 23.1732 14.9382 23.119 15.0132 23.0487C15.0882 22.9784 15.1479 22.8934 15.1886 22.799C15.2294 22.7046 15.2503 22.6028 15.2501 22.5V21.75H15.9438C17.3726 21.75 18.582 20.6325 18.6242 19.2047C18.6348 18.8534 18.5748 18.5035 18.4478 18.1759C18.3207 17.8482 18.1291 17.5494 17.8844 17.2971C17.6397 17.0449 17.3468 16.8444 17.0231 16.7074C16.6994 16.5705 16.3515 16.5 16.0001 16.5ZM15.9673 20.25H15.2501V18H16.0001C16.1574 17.9993 16.3132 18.0315 16.4573 18.0948C16.6014 18.158 16.7306 18.2507 16.8367 18.367C16.9427 18.4832 17.0231 18.6205 17.0728 18.7698C17.1225 18.9191 17.1403 19.0771 17.1251 19.2338C17.0924 19.5165 16.9558 19.777 16.7419 19.9648C16.5279 20.1526 16.2519 20.2542 15.9673 20.25ZM22.0001 16.5H20.5001C20.3012 16.5 20.1104 16.579 19.9698 16.7197C19.8291 16.8603 19.7501 17.0511 19.7501 17.25V22.5C19.7501 22.6989 19.8291 22.8897 19.9698 23.0303C20.1104 23.171 20.3012 23.25 20.5001 23.25H21.9363C23.7795 23.25 25.331 21.7987 25.3742 19.9566C25.385 19.5066 25.3058 19.059 25.1411 18.6402C24.9765 18.2213 24.7297 17.8396 24.4153 17.5175C24.1009 17.1954 23.7253 16.9395 23.3105 16.7648C22.8957 16.59 22.4502 16.5 22.0001 16.5ZM21.9542 21.75H21.2501V18H22.0001C22.2525 17.9998 22.5024 18.0506 22.7347 18.1493C22.967 18.248 23.177 18.3926 23.3521 18.5744C23.5272 18.7563 23.6638 18.9716 23.7536 19.2075C23.8435 19.4434 23.8848 19.695 23.8751 19.9472C23.8357 20.9616 22.9695 21.75 21.9542 21.75Z"
              fill="#0063F7"
            />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-[#1E1E1E]">
              Export Logbook
            </h2>
            <span className="mt-1 text-base font-normal text-[#616161]">
              {confirmOption
                ? 'Your export is ready for download.'
                : 'Select an option below.'}
            </span>
          </div>
        </div>
      }
      body={
        <div className="flex h-[300px] flex-col space-y-4 overflow-y-auto">
          {!confirmOption ? (
            <div className="mb-24 flex flex-col space-y-4 p-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="exportOption"
                  checked={selectedOption === 'pdf'}
                  onChange={() => setSelectedOption('pdf')}
                  className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                />
                <span className="ml-2">Export to PDF</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="exportOption"
                  checked={selectedOption === 'csv'}
                  onChange={() => setSelectedOption('csv')}
                  className="form-radio h-[22px] w-[22px] p-2 accent-[#616161]"
                />
                <span className="ml-2">Export to CSV</span>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="max-w-[350px] truncate text-[20px] text-[#0063F7]">
                {getFileName()}
              </div>
              <div
                className="cursor-pointer text-[20px] font-bold text-[#0063F7] hover:text-[#0052D4]"
                onClick={
                  selectedOption === 'csv' ? handleDownloadCSV : handleDownloadPDF
                }
              >
                Download
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default ExportLogbookModal;

