import SideBarValue from "../organization/sidebarValue";

export function handleSideBar(isShow: boolean) {
  SideBarValue.value = isShow;
}
