abstract class SideBarValue {
  private static _value: boolean = true;

  static get value(): boolean {
    return SideBarValue._value;
  }

  static set value(newValue: boolean) {
    SideBarValue._value = newValue;
  }
}
export default SideBarValue;
