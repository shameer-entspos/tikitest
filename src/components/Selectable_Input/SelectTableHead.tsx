import { CustomBlueCheckBox } from '../Custom_Checkbox/Custom_Blue_Checkbox';

type Props = {
  isSelectMode: boolean;
  toggleSelectMode: () => void;
  cancelSelection: () => void;
  selectAllMine: () => void;
  isAllSelected: boolean;
};

export function SelectTableHead({
  isSelectMode,
  toggleSelectMode,
  cancelSelection,
  selectAllMine,
  isAllSelected,
}: Props) {
  return (
    <th className="w-[100px] rounded-r-lg bg-[#F5F5F5] px-4 py-3 text-right text-sm font-normal text-[#0063F7]">
      {isSelectMode ? (
        <div className="flex items-center justify-end gap-2">
          <div className="cursor-pointer" onClick={cancelSelection}>
            Cancel
          </div>
          <div className="relative flex items-center justify-center gap-2">
            <CustomBlueCheckBox
              checked={isAllSelected}
              disabled={false}
              onChange={selectAllMine}
            />
          </div>
        </div>
      ) : (
        <div className="cursor-pointer" onClick={toggleSelectMode}>
          Select
        </div>
      )}
    </th>
  );
}
