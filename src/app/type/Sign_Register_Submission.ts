import { UserDetail } from "@/types/interfaces";
import { ProjectDetail } from "./projects";

// String labels for visitor type (display only). Must show these, not numeric ID.
export const VISITOR_TYPE_LABELS: Record<number, string> = {
  0: 'No one',
  1: 'Customer',
  2: 'Supplier',
  3: 'Employee',
  4: 'Contractor',
  5: 'Courier / Delivery Person',
  6: 'Family Member',
  7: 'Friend',
};

export function getVisitorTypeLabel(id: number | undefined | null): string {
  if (id == null) return '';
  return VISITOR_TYPE_LABELS[id] ?? String(id);
}

export interface SignInRegisterSubmission {
    _id:         string;
    project:     ProjectDetail;
    site:        {
        _id:string;
        siteName:string;
        addressLineOne:string;
        
    };
    userType:    number;
    appId:       string;
    visitorType: number;
    toSee:       UserDetail;
    reason:      string;
    photo:       string;
    firstName:   string;
    lastName:    string;
    contact:     string;
    email:       string;
    signInAt:    Date;
    signOutAt:   any;
    deletedAt:   any;
    submittedBy: UserDetail;
    createdAt:   Date;
    updatedAt:   Date;
    __v:         number;
    /** Populated sign-in record on logbook list items. */
    signinId?:   SignInRegisterSubmission;
    /** Log entry type on logbook list (e.g. sign-in / sign-out). */
    logType?:    string;
}

/** Logbook list item; same shape as a sign-in/register submission. */
export interface SRLogs extends SignInRegisterSubmission {}
