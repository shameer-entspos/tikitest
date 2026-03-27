import { BillingActions } from '@/app/helpers/organization/actions';
import { BILLINGTYPE } from '@/app/helpers/organization/enums';
import { BillingState } from '@/app/helpers/organization/states';
import { Dispatch, createContext, useContext } from 'react';

export interface BillingContextProps {
  state: BillingState;
  dispatch: Dispatch<BillingActions>;
}

export const initialState: BillingState = {
  showInvoice: false,
  section: 'manage',
};

const initialContext: BillingContextProps = {
  state: {
    showInvoice: false,
    section: 'manage',
  },
  dispatch: () => {},
};
export const BillingContext =
  createContext<BillingContextProps>(initialContext);

export const billingReducer = (
  state: BillingState,
  action: BillingActions
): BillingState => {
  switch (action.type) {
    case BILLINGTYPE.APPS:
      return { ...state, appIds: action.appIds };
    case BILLINGTYPE.PLAN:
      return { ...state, plan: action.plan };
    case BILLINGTYPE.LICENSE:
      return { ...state, license: action.license };
    case BILLINGTYPE.UPDATE_SECTION:
      return { ...state, section: action.section };
    case BILLINGTYPE.INVOICE:
      return { ...state, showInvoice: action.showInvoice };
    default:
      throw new Error('Unknown action type');
  }
};

export function useBillingCotnext() {
  const context = useContext(BillingContext);
  if (!context) {
    throw 'error';
  }
  return context;
}
