export enum OwnerShipStatus {
    Owned= "Owned",
    Leased = "Leased",
    Rented = "Rented",
    Leased_To_Own = "Leased To Own",
  }


export enum RetirementMethod {
   Storage = "Storage",
   Resell= "Resell",
   Trade_In = "Trade In",
   E_Waste_Recycle = "E-Waste / Recycle",
   Donate="Donate",
   Return_To_Leasing_Agent = "Return To Leasing Agent",
   Return_To_Vendor = "Return To Vendor",
   Staff_Gift_Buy_Option = "Staff Gift / Buy Option",
  }


  export enum AssetStatus {
   Healthy = "Healthy",
   OutOfOrder = "Out of Order",
   Maintainance_Repair= "Maintenance / Repair",
   Lost_Stolen = "Lost / Stolen",
   Retired = "Retired",
  }

  export enum HazardStatus{
 
    Unresolved = "Unresolved",
    UnderReview = "Under Review",
    Resolved = "Resolved",
  }