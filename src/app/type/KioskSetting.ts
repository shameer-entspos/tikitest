export interface KioskSetting {
    _id:                 string;
    orgId:               string;
    notifyMeWhenSignIn:  boolean;
    notifyMeWhenSignOut: boolean;
    forceSelfie:         boolean;
    notifyPeople:        string[];
    selectedSite:        string;
    selectedProject:     string[];
    /** When no site selected, backend returns default Home site/project for Kiosk */
    defaultHomeSiteId?:  string;
    defaultHomeProjectId?: string;
    /** Effective site/project to use (selected site or default Home); used for QR and sign-in */
    effectiveSiteId?:    string;
    effectiveProjectId?: string;
    deletedAt:           null;
    createdAt:           Date;
    updatedAt:           Date;
}