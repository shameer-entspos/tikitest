import { ProjectDetail, UserElement } from '@/app/type/projects';
import {
  AMAPPACTIONTYPE,
  APPACTIONTYPE,
  CHATTYPE,
  JSAAPPACTIONTYPE,
  POSTTYPE,
  PROJECTACTIONTYPE,
  SAFETYHUBTYPE,
  SR_APP_ACTION_TYPE,
  TASKTYPE,
  TIMESHEETTYPE,
} from './enums';
import { TeamsWithRole, UserWithRole } from './states';
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
import { MentionUsers } from '@/components/Chats/users';
import { TaskModel } from '@/app/(main)/(user-panel)/user/tasks/api';
import { PPEModel } from '@/app/(main)/(user-panel)/user/apps/api';
import { UserDetail } from '@/types/interfaces';
import { StepFormValues } from '@/components/JobSafetyAnalysis/CreateNewComponents/JSA_Steps';
import { RefObject } from 'react';
import { TimeSheet } from '@/app/type/timesheet';
import { Expanse } from '@/app/type/expanse';
import { RollCall } from '@/app/type/roll_call';
import { DiscussionTopic } from '@/app/type/discussion_topic';
import { LiveBoard } from '@/app/type/live_board';
import { SafetyMeetings } from '@/app/type/safety_meeting';

export interface ProjectActions {
  type: PROJECTACTIONTYPE;
  payload?: {
    name: string;
    reference?: string;
    address?: string;
    customer?: { label: string; value: string };
    description?: string;
  };
  date?: Date;
  dueDateMode?: 'NO_DUE_DATE' | 'CUSTOM';
  currentSection?: 'members' | 'details' | 'apps';
  projectType?: 'private' | 'public';
  color?: string;

  team?: TeamsWithRole;
  user?: UserWithRole;
  projectDetail?: ProjectDetail;
  app?: string;
  editApp?: string[];
  // editorganization?: OrganizationWithRole[];
  editteam?: TeamsWithRole[];
  edituser?: UserWithRole[];
  projectDetailTab?:
    | 'overview'
    | 'task'
    | 'app'
    | 'channel'
    | 'file'
    | 'submission'
    | 'member';
}

export interface AppActions {
  type: APPACTIONTYPE;
  payload?: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    reason: string;
    company?: string;
  };
  showSignInModel?: boolean;
  showForm?:
    | 'user'
    | 'signout'
    | 'selfie'
    | 'selectuser'
    | 'singleAppSubmission'
    | 'projects'
    | 'guest';
  formType?: 'contractor';
  appModel?: AppModel;
  selectedSelfie?: File;
  showProject?: 'starred' | 'assign' | 'all';
  projectId?: string;
  signAs?: 'user' | 'guest';
  userid?: string;
  signoutUsers?: string;
  submitAppDetail?: SubmitAppDetail;
}

export interface ChatActions {
  type: CHATTYPE;

  roomDetail?: ChatRooms | TeamRooms | ProjectRooms | TikiAssitant;
  messageController?: string;
  selectUserIdFormTeamOrProject?: string;
  sidebarOpen?: boolean;
  showMembers?: 'team' | 'project';
  chatTab?: 'activity' | 'direct' | 'team' | 'project' | 'contact';
  chatMessageType?: 'chat' | 'files' | 'mentioned';
  filteredMessageIds?: string[];
  currentIndex?: number | 0;
  mentionUsers?: UserDetail[];
  roomViewProfile?: {
    room?: ChatRooms | TeamRooms | ProjectRooms;
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
  addFriendTab?: 'direct' | 'team' | 'project';

  users?: UserWithRole;
  saveUsers?: UserWithRole[];
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
  searchText?: string | undefined;
  userId?: string;
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
}

export interface PostActions {
  type: POSTTYPE;
  commentController?: string;
  post?: Post;
  selectedFilter?: string;
  selectedImages?: File;
  deletetedImageIndex?: number;
}

export interface TaskActions {
  type: TASKTYPE;
  curretnSection?: 'task' | 'edit';
  currentTab?: 'upcoming' | 'overdue' | 'submission' | 'task' | 'edit';
  showTaskModal?: 'detail' | 'view';
  showSignIn?: 'start' | 'form' | 'selfie' | 'projects' | 'selectUser';
  showProject?: 'starred' | 'assign' | 'all';
  projectId?: string;
  taskModel?: TaskModel;
  showRemove?: boolean;
  removeid?: string;
  signAs?: 'user' | 'guest';
  payload?: {
    name: string;
    description: string;
    projects?: string[];
    isGeneral?: boolean;
    selectedProjectsDetail?: any[];
    customer?: string;
    app?: string;
    shareAs?: string;
    repeatTaskCheckbox?: boolean;
    endDate?: string;
    startDate?: Date;
  };
  userId?: string;
  buikId?: string;
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
  repeatTaskDueDate?: Date;

  individualUsers?: string;
  teams?: string;
  excludedUserIds?: string[];
  assignedUserIds?: string[];
  externalUser?: string;

  //task dialog
  selectValueOfCustomList?: string;
  // weekOptionDay?: string;
  monthType?: 'Day' | 'Week';
  dayNumOfMonth?: number;
  weekNumOfMonth?: number;
  DayNumOfWeekOfMonth?: number;
  selectedSelfie?: File;
  selectDaysForWeek?: number;
  selectedCountOfRepeat?: number;
  selectedCheckedModel?: TaskModel;
}
export interface JSAAppActions {
  stepIndex?: number;
  type: JSAAPPACTIONTYPE;
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
  payLoad?: PPEModel | HazardModel | undefined;
  createNewSection?: 'project' | 'jsaDetail' | 'step' | 'emergency' | 'review';
  jsaDetailSelectedTab?: 'overview' | 'comments' | 'activity';
  jsaSelectedProjects?: {
    id: string;
    name: string;
  };
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
  jsaDetailDate?: {
    from?: Date;
    to?: Date;
  };
  jsaLastModifiedDate?: {
    from?: Date;
    to?: Date;
  };
  jsaDetailSelectedManagers?:
    | {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        _id?: string;
      }
    | {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        _id?: string;
      }[];
  jsaSteps?: {
    description: string;
    Hazards: HazardModel[];
    PPEs: PPEModel[];
  }[];
  hazards?: HazardModel;
  ppe?: PPEModel;
  jsaEmergencyPlanPayLoad?: {
    area: string;
    procedure: string;
    jsaEmergencyPlanContacts?: {
      name: string;
      phone: string;
    }[];
  };

  jsaEmergencyPlanImages?: string;
  steps?: StepFormValues;
  reviewStatus?: 'public' | 'private';
  saveTemplateType?: 'my' | 'shared';
  selectLocationForDuplicate?: 'Submission' | 'Draft' | 'my' | 'shared';
  saveTemplateName?: string;
  showSubmissionDeleteModel?: JSAAppModel;
  showMultiSubmissionDeleteModel?: JSAAppModel[];
  showPPEDeleteModel?: PPEModel;
  showMultiPPEDeleteModel?: PPEModel[];
  showHazardsDeleteModel?: HazardModel;
  showMultiHazardsDeleteModal?: HazardModel[];
  selectedSubmissions?: JSAAppModel[];
  showDuplicateModel?: JSAAppModel;
  showChatModel?: JSAAppModel;
  showMailSubmissionModel?: JSAAppModel;
  editSubmission?: JSAAppModel;
  jsaAppId?: string;
  contentRef?: RefObject<HTMLDivElement>;
  selectedSettingTab?: string;
}

export interface TimeSheetActions {
  type: TIMESHEETTYPE;
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
  expenseImages?: string;
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
}

export interface AssetManagerActions {
  bulkcheckInOut?: 'in' | 'out';
  type: AMAPPACTIONTYPE;
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
  assetsImages?: string | string[];
  logImages?: string | null;
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
  forEditassetsImages?: string[];
  amDetailSelectedTab?:
    | 'overview'
    | 'comments'
    | 'activity'
    | 'docs'
    | 'service';
  checkinoutPages?: 'show_checkin' | 'show_checkout';
  servicingPages?: 'pending_service' | 'service_groups';
  show_asset_create_model?: 'detail' | 'photo' | 'review';
  selectedSettingTab?: string;
  select_via_email?: string | undefined;
}

export interface SafetyHubActions {
  type: SAFETYHUBTYPE;
  showPages?:
    | 'liveboard'
    | 'hazardsIncidents'
    | 'safetyMeetings'
    | 'discussionTopics'
    | 'settings';
  appId?: string;
  selectedSettingTab?: string;
  selectedImages?: string;
  hazardAndIncidentModelForEdit?: LiveBoard;
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
  };

  smImages?: string;
  selected_topic?: DiscussionTopic;
  selected_attendence?: UserDetail;
  resolutionPayload?: {
    resolution: string;
    id: string;
  };
  topciStatusPayload?: {
    status: string;
    id: string;
  };
  select_via_chat?: string | undefined;
  select_via_email?: string | undefined;

  meeting_payload?: {
    name: string;
    leader?: string;
    agenda: string;
  };
  reviewStatus?: 'public' | 'private';
  reviewPublicStatusEditable?: boolean;
}

export interface SRAppAction {
  type: SR_APP_ACTION_TYPE;
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

  sr_app_id?: string;
  selectedSettingTab?: string;
  srDetailSelectedTab?: 'overview' | 'comments' | 'activity';
  selectedSettingTabKioskMode?: string;
  createNewRollCall?: 'project' | 'site' | 'details' | 'attendance' | 'review';
  SRSelectedProjects?: {
    id: string;
    name: string;
  };
  SRSelectedSites?: {
    id: string;
    siteName: string;
  };
  roll_call_detail?: {
    title: string;
    description: string;
  };
  selected_roll_call_user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  reviewStatus?: 'public' | 'private';
  reviewPublicStatusEditable?: boolean;
  roll_call_edit?: RollCall;

  srDetailDate?: {
    from?: Date;
    to?: Date;
  };
}
