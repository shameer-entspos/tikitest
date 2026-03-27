import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { PPEModel, HazardModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { useJSAAppsCotnext } from '@/app/(main)/(user-panel)/user/apps/jsa/jsaContext';
import { JSAAPPACTIONTYPE } from '@/app/helpers/user/enums';
import CustomModal from '@/components/Custom_Modal';
import CustomRadio from '@/components/CustomRadioButton/CustomRadioButton';

const DetailHazardModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const context = useJSAAppsCotnext();
  const item = context.state.selectedItem as HazardModel;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSharing, setSelectedSharing] = useState(
    item?.sharing === 1 ? 'myList' : item?.sharing === 2 ? 'sharedList' : 'myList'
  );
  useEffect(() => {
    if (item) {
      setSelectedSharing(item?.sharing === 2 ? 'sharedList' : 'myList');
    }
  }, [item?._id]);
  const riskAssessmentMapping: { [key: number]: string } = {
    1: 'Negligible',
    2: 'Minor',
    3: 'Moderate',
    4: 'Significant',
    5: 'Severe',
  };
  const RISK_LABELS = ['Negligible', 'Minor', 'Moderate', 'Significant', 'Severe'];
  const getRiskLabel = (val: unknown): string => {
    if (val == null || val === '') return '';
    const n = Number(val);
    if (!Number.isNaN(n) && n >= 1 && n <= 5) return riskAssessmentMapping[n];
    if (typeof val === 'string' && RISK_LABELS.includes(val)) return val;
    if (typeof val === 'string') {
      const num = Number(val);
      if (!Number.isNaN(num) && num >= 1 && num <= 5) return riskAssessmentMapping[num];
    }
    return String(val);
  };
  const riskText = getRiskLabel(item?.initialRiskAssessment);
  const residualRiskText = getRiskLabel(item?.residualRiskAssessment);
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        header={
          <>
            {' '}
            <img src="/images/ppeLogo.svg" alt="" />
            <div>
              <h2 className="text-xl font-semibold">View Hazards & Risk</h2>
              <p className="mt-1 text-base font-normal text-[#616161]">
                View Hazard & Risk details below.
              </p>
            </div>
          </>
        }
        body={
          <div className="max-h-[500px] min-h-[500px] overflow-y-auto px-5 text-sm font-normal text-black scrollbar-default">
            <div className="mb-4">
              <label className="mb-1 block font-normal text-[#616161]">
                Hazard & Risk Name
              </label>
              <p className="text-base">{item?.name}</p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-[#616161]">
                Initial Risk Assessment
              </label>
              <p className="">{riskText || '—'}</p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-[#616161]">
                Control Method
              </label>
              <p className="">
                {item?.controlMethod || 'No Control available'}
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-[#616161]">
                Residual Risk Assessment
              </label>
              <p className="">{residualRiskText || '—'}</p>
            </div>
            <div className="mb-4">
              <label className="mb-2 block font-medium">Sharing</label>
              <div className="flex flex-col">
                <CustomRadio
                  name={'sharing'}
                  value={'myList'}
                  disabled
                  checkedValue={selectedSharing === 'myList' ? 'myList' : ''}
                  onChange={() => {}}
                  label={
                    <>
                      <div>
                        Save to
                        <span className="font-bold">{` 'My List'`}</span>
                      </div>
                    </>
                  }
                />
                <CustomRadio
                  name={'sharing'}
                  value={'sharedList'}
                  disabled
                  checkedValue={
                    selectedSharing === 'sharedList' ? 'sharedList' : ''
                  }
                  onChange={() => {}}
                  label={
                    <>
                      <div>
                        Save to
                        <span className="font-bold">{` 'Shared List'`}</span>
                      </div>
                    </>
                  }
                />
              </div>
            </div>
            {/* <div className="mb-4">
              <label className="mb-2 block">Sharing to</label>
              <div className="flex flex-col">
                <label className="mb-3 flex items-center">
                  <input
                    type="radio"
                    name="sharing"
                    value="myList"
                    checked={selectedSharing === 'myList'}
                    className="mr-2"
                    readOnly
                  />
                  Saved to
                  <span className={`font-bold`}>&nbsp;My List</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sharing"
                    value="sharedList"
                    checked={selectedSharing === 'sharedList'}
                    className="mr-2"
                    readOnly
                  />
                  Saved to
                  <span className={'font-bold'}>&nbsp;Shared List</span>
                </label>
              </div>
            </div> */}
          </div>
        }
        handleCancel={onClose}
        handleSubmit={() => {
          context.dispatch({
            type: JSAAPPACTIONTYPE.SHOWMODAL,
            showModal: 'editModal',
          });
        }}
        submitValue={'Edit'}
        variant="text"
        cancelvariant="text"
      />
    </>
  );
};

export default DetailHazardModal;
