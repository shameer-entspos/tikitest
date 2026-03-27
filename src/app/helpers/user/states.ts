import {
  AppModel,
  HazardModel,
  JSAAppModel,
  SubmitAppDetail,
} from '@/app/(main)/(user-panel)/user/apps/api';
import {
  ChatRequestList,
  ChatRooms,
  ProjectRooms,
  TeamRooms,
  TikiAssitant,
} from '@/app/(main)/(user-panel)/user/chats/api';
import { Post } from '@/app/(main)/(user-panel)/user/feeds/api';
import { TaskModel } from '@/app/(main)/(user-panel)/user/tasks/api';
import { PPEModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { ProjectDetail, UserElement } from '@/app/type/projects';

import { UserDetail } from '@/types/interfaces';
import { StepFormValues } from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Steps';
import { RefObject } from 'react';
import { TimeSheet } from '@/app/type/timesheet';
import { Expanse } from '@/app/type/expanse';
import { DiscussionTopic } from '@/app/type/discussion_topic';

import { LiveBoard } from '@/app/type/live_board';
import { SafetyMeetings } from '@/app/type/safety_meeting';

export interface ProjectState {
  showCurrentModal?: 'members' | 'details' | 'apps' | string;
  showProjectModal?: boolean;
  projectType?: 'private' | 'public';
  color?: string;

  payload?: {
    name: string;
    reference?: string;
    address?: string;
    customer?: { label: string; value: string };
    description?: string;
  };
  date?: Date;
  dueDateMode?: 'NO_DUE_DATE' | 'CUSTOM';

  teams?: TeamsWithRole[];
  users?: UserWithRole[];
  app?: string[];
  projectDetail?: ProjectDetail;
  isProjectEditing?: boolean;
}

export type TeamsWithRole = {
  team: string;
  role: string;
};
export type UserWithRole = {
  user: string;
  role: string;
};
export type AppWithRole = {
  app: string;
};

export type ChatState = {
  show_create_new_message?: boolean;
  roomDetail?: ChatRooms | TeamRooms | ProjectRooms | TikiAssitant;
  roomViewProfile?: {
    room?: ChatRooms | TeamRooms | ProjectRooms;
    // participant?: ParticipantOfRoom;
    participant?: UserDetail;
    showFrom?: 'direct' | 'team' | 'project';
  };
  showContactDetail?: {
    detail?: UserDetail;
    action:
      | 'view'
      | 'edit'
      | 'delete'
      | 'add'
      | 'removeFriend'
      | 'customerDelete';
  };
  selectUserIdFormTeamOrProject?: string;
  showMembers?: 'team' | 'project';
  messageController?: string;
  chatTab?: 'activity' | 'direct' | 'team' | 'project' | 'contact';
  sidebarOpen?: boolean;
  chatMessageType?: 'chat' | 'files' | 'mentioned';
  currentIndex?: number | 0;
  filteredMessageIds?: string[];
  mentionUsers?: UserDetail[];
  addFriendTab?: 'direct' | 'team' | 'project';

  users?: UserWithRole[];

  micTap?: boolean;
  selectedId?: string;

  projectFormType?: 'form' | 'members' | 'select';
  payload?: {
    channelName: string;
    description: string;
    appearName: string;
  };
  selectedUsers?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  selectedProjectUsers?: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  selectedType?: 'private' | 'public';
  teamFormType?: 'form' | 'members' | 'select';
  showEditformType?: 'team' | 'project';

  // people
  showModel?: boolean;
  searchText?: string | undefined;
  userId?: string[];
  showChat?: boolean;
  showChatRequest?: 'receive' | 'sent';
  showChatRequestDetail?: ChatRequestList;
  showChatRequestDetailOf?: 'receive' | 'sent';

  recorderStop?: boolean;
  warningPayload?: {
    actiontype: 'leave' | 'delete' | 'deleteChannel';
    type: 'team' | 'project';
  };

  teamCount?: number;
  activityCount?: number;
  directCount?: number;
  projectCount?: number;
};

export interface PostState {
  isDialogOpen?: boolean;
  showDetail?: boolean;
  selectedFilter?: string;
  post?: Post;
  commentController?: string;
  selectedImages?: File[];
}

export interface TaskState {
  currentTab?: 'upcoming' | 'overdue' | 'submission' | 'task' | 'edit';
  curretnSection?: 'task' | 'edit';
  showTaskModal?: 'detail' | 'view';
  showSignIn?: 'start' | 'form' | 'selfie' | 'projects' | 'selectUser';
  signAs?: 'user' | 'guest';
  showProject?: 'starred' | 'assign' | 'all';
  projectId?: string[];
  showRemove?: boolean;
  removeid?: string;
  selectBulk?: boolean;
  payload?: {
    name: string;
    description: string;
    projects?: string[];
    isGeneral?: boolean;
    selectedProjectsDetail?: any[];
    customer?: string;
    endDate?: string;
    startDate?: Date;
    app?: string;
    shareAs?: string;
    repeatTaskCheckbox?: boolean;
  };
  userId?: string[];
  buikId?: string[];

  formPayload?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    reason: string;
    company?: string;
  };
  formType?: 'visitor' | 'contractor';
  dueDate?: Date;
  repeatTask?: string;
  repeatTaskHasDueDate?: string;
  isShowForEdit?: boolean;
  repeatTaskDueDate?: Date;

  audit?: boolean;
  showCustomPicker?: boolean;
  taskModel?: TaskModel;

  /** Single list of internal user IDs assigned (individual + team members). Compare with users list for display. */
  assignedUserIds?: string[];
  individualUsers?: string[];
  teams?: string[];
  excludedUserIds?: string[];
  externalUser?: string[];
  /// dilaog
  selectValueOfCustomList?: string;
  // weekOptionDay?: string;
  monthType?: 'Day' | 'Week';
  dayNumOfMonth?: number;
  weekNumOfMonth?: number;
  DayNumOfWeekOfMonth?: number;
  selectDaysForWeek?: number[];
  selectedSelfie?: File;
  selectedCountOfRepeat?: number;
  selectedCheckedModel?: TaskModel[];
  isMultiSelectEnabled?: boolean;
}

export type JSAAppState = {
  showPPESafetyGear?: boolean;
  showHazard?: boolean;
  showDraft?: boolean;
  showTemplate?: boolean;
  showSubmission?: boolean;
  showPages?:
    | 'createNew'
    | 'submission'
    | 'drafts'
    | 'templates'
    | 'ppeSafety'
    | 'hazards'
    | 'showDetail'
    | 'settings'
    | 'activityLog';
  showProjects:
    | 'Starred'
    | 'Recent'
    | 'AllProjects'
    | 'Favourites'
    | 'AssignedToMe';

  showDetailPayload?: {
    id: string;
    type: 'Draft' | 'Submission' | 'Template';
  };

  showModal?:
    | 'NewModal'
    | 'detailModal'
    | 'editModal'
    | 'deleteModal'
    | 'duplicateModel'
    | undefined;
  selectedItem?: PPEModel | HazardModel | undefined;
  createNewSection?: 'project' | 'jsaDetail' | 'step' | 'emergency' | 'review';
  jsaDetailSelectedTab?: 'overview' | 'comments' | 'activity';
  jsaSelectedProjects?: {
    id: string;
    name: string;
  }[];
  jsaCreateDetailPayload?: {
    reference: string;
    jsaName: string;
    description: string;
    contactName: string;
    phone: string;
    customer: string;
  };
  // jsaDetailContact?: {
  //   _id: string;
  //   firstName: string;
  //   lastName: string;
  //   photo: string;
  //   email: string;
  // };
  jsaDetailSelectedManagers?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }[];
  jsaDetailDate?: {
    from?: Date;
    to?: Date;
  };
  jsaLastModifiedDate?: {
    from?: Date;
    to?: Date;
  };
  jsaSteps?: {
    description: string;
    hazards: HazardModel[];
    ppe: PPEModel[];
  }[];
  hazards?: HazardModel[];
  ppe?: PPEModel[];
  jsaEmergencyPlanPayLoad?: {
    area: string;
    procedure: string;
    jsaEmergencyPlanContacts?: {
      name: string;
      phone: string;
    }[];
  };

  jsaEmergencyPlanImages?: string[];
  steps?: StepFormValues[];
  reviewStatus?: 'public' | 'private';
  reviewPublicStatusEditable?: boolean;
  saveAsDraft?: boolean;
  saveAsTemplate?: boolean;
  saveTemplateType?: 'my' | 'shared';
  selectLocationForDuplicate?: 'Submission' | 'Draft' | 'my' | 'shared';
  saveTemplateName?: string;
  showSubmissionDeleteModel?: JSAAppModel;
  showMultiSubmissionDeleteModal?: JSAAppModel[];
  showPPEDeleteModel?: PPEModel;
  showMultiPPEDeleteModal?: PPEModel[];
  showHazardsDeleteModel?: HazardModel;
  showMultiHazardsDeleteModal?: HazardModel[];
  showDuplicateModel?: JSAAppModel;
  showChatModel?: JSAAppModel;
  showMailSubmissionModel?: JSAAppModel;
  editSubmission?: JSAAppModel;
  isTemplateEditable?: boolean;
  jsaAppId?: string;
  contentRef?: RefObject<HTMLDivElement>;
  usingTemplateId?: string;
  selectedSettingTab?: string;
};

export type AssetManagerState = {
  showPages?:
    | 'checkinout'
    | 'show_checkin'
    | 'show_checkout'
    | 'order'
    | 'servicing'
    | 'pending_services'
    | 'service_groups'
    | 'manage'
    | 'categories'
    | 'settings';
  appId?: string;
  logImages?: string[];
  amDetailSelectedTab?:
    | 'overview'
    | 'comments'
    | 'activity'
    | 'docs'
    | 'service';
  is_asset_edit?: string;
  create_asset_payload?: {
    name: string;
    reference?: string;
    description?: string;
    category?: {
      label?: string;
      value?: string;
    };
    subcategory?: {
      label?: string;
      value?: string;
    };
    invoiceNumber?: string;
    make?: string;
    model?: string;
    serialNumber?: string;
    vendor?: string;
    ownerShipStatus?: string;
    authorizedBy?: string;
    purchaseDate?: Date;
    expireDate?: Date;
    purchasePrice?: string;
    purchaseNote?: string;
    assetLocation?: string;
    retirementDate?: Date;
    retirementMethod?: {
      label?: string;
      value?: string;
    };
    serviceProvider?: string;
    checkInpermission?: string;
    teams?: string[];
  };
  assetsImages?: string[];
  show_asset_create_model?: 'detail' | 'photo' | 'review';
  checkinoutPages?: 'show_checkin' | 'show_checkout';
  servicingPages?: 'pending_service' | 'service_group';
  selectedSettingTab?: string;
  bulkcheckInOut?: 'in' | 'out';
  select_via_email?: string | undefined;
};

export type SafetyHubState = {
  showPages?:
    | 'liveboard'
    | 'hazardsIncidents'
    | 'safetyMeetings'
    | 'discussionTopics'
    | 'settings';
  appId?: string;
  selectedSettingTab?: string;
  showNewHazardsIncident?: boolean;
  hazardAndIncidentModelForEdit?: LiveBoard;
  selectedImages?: string[];
  show_safety_meeting_create_model?:
    | 'project'
    | 'topic'
    | 'attendence'
    | 'meeting'
    | 'review';
  selected_safety_meeting_model?: SafetyMeetings;
  SMSelectedProjects?: {
    id: string;
    name: string;
    members?: UserDetail[];
  }[];

  smImages?: string[];
  selected_topic?: DiscussionTopic[];
  selected_attendence?: UserDetail[];
  meeting_payload?: {
    name: string;
    leader?: string;
    agenda: string;
  };
  reviewStatus?: 'public' | 'private';
  reviewPublicStatusEditable?: boolean;
  select_via_chat?: string | undefined;
  select_via_email?: string | undefined;
};

export type TimeSheetState = {
  showPages?:
    | 'timesheet'
    | 'expenses'
    | 'review'
    | 'report'
    | 'settings'
    | 'report_expense'
    | 'report_timesheet';
  reportPages?: 'show_report_timesheet' | 'show_report_expense';
  reviewPages?: 'show_expense_review' | 'show_timesheet_review';
  appId?: string;

  showNewExpense?: boolean;
  expenseImages?: string[];
  selectedTimeSheet?: {
    showAs: 'edit' | 'delete' | 'detail';
    model?: TimeSheet;
  };
  selectedExpanse?: {
    showAs: 'edit' | 'delete' | 'detail';
    model?: Expanse;
  };
  selectedSettingTab?: string;
  timesheetReports?: TimeSheet[];
  expenseReports?: Expanse[];
  timesheetDetailDate?: {
    from?: Date;
    to?: Date;
  };
};

export interface SRAppState {
  showPages?:
    | 'sign_in_out'
    | 'kiosk_mode'
    | 'roll_call'
    | 'manage_sites'
    | 'settings'
    | 'sign_in_out_second_section'
    | 'kiosk_mode_second_section'
    | 'kiosk_settings'
    | 'sr_sign_out'
    | 'sr_sign_in'
    | 'sr_log';
  showDetailPayload?: {
    id: string;
    type: 'Draft' | 'Submission' | 'Template';
  };
  sr_app_id?: string;
  selectedSettingTab?: string;
  srDetailSelectedTab?: 'overview' | 'comments' | 'activity';
  selectedSettingTabKioskMode?: string;
  createNewRollCall?: 'project' | 'site' | 'details' | 'attendance' | 'review';

  SRSelectedProjects?: {
    id: string;
    name: string;
  }[];
  SRSelectedSites?: {
    id: string;
    siteName: string;
  }[];
  showRollCallForm?: boolean;
  showEditRollCallForm?: boolean;

  roll_call_detail?: {
    id?: string;
    title: string;
    description: string;
  };
  selected_roll_call_user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }[];
  reviewStatus?: 'public' | 'private';
  reviewPublicStatusEditable?: boolean;

  srDetailDate?: {
    from?: Date;
    to?: Date;
  };
}

export type AppState = {
  payload?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    reason: string;
    company?: string;
  };
  showSignInModel?: boolean;
  showJsaPage?: boolean;
  showForm?:
    | 'user'
    | 'signout'
    | 'selfie'
    | 'selectuser'
    | 'singleAppSubmission'
    | 'projects'
    | 'guest';
  signAs?: 'user' | 'guest';
  formType?: 'contractor';
  appModel?: AppModel;
  selectedSelfie?: File;
  showProject?: 'starred' | 'assign' | 'all';
  projectId?: string[];
  userId?: string[];
  signoutUsers?: string[];
  showSubmitAppDetail?: boolean;
  submitAppDetail?: SubmitAppDetail;
};
