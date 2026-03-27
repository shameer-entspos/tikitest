import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';

type Props<T> = {
  elsePart: React.ReactNode;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggle: () => void;
  isDisabled: boolean;
};

export function SelectTableCell<T>({
  elsePart,
  isSelectMode,
  isSelected,
  onToggle,
  isDisabled,
}: Props<T>) {
  return (
    <td className="flex w-full items-center justify-end px-2 py-4 text-end">
      {isSelectMode ? (
        <CustomBlueCheckBox
          checked={isSelected}
          disabled={isDisabled}
          onChange={onToggle}
        />
      ) : (
        elsePart
      )}
    </td>
  );
}
