import { useState } from 'react';

export function useSelectableRows(items: string[]) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelectMode = () => setIsSelectMode(!isSelectMode);
  const cancelSelection = () => {
    setIsSelectMode(false);
    setSelectedItems([]);
  };

  const toggleItemSelection = (item: string) => {
    if (selectedItems.some((i) => i === item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const selectAllMine = () => {
    const mine = items;
    if (items.length === selectedItems.length) {
      cancelSelection();
    } else {
      setSelectedItems(mine);
    }
  };

  const isItemSelected = (itemId: string) =>
    selectedItems.some((item) => item === itemId);

  const isAllMineSelected = items.length === selectedItems.length;

  return {
    isSelectMode,
    toggleSelectMode,
    cancelSelection,
    selectedItems,
    toggleItemSelection,
    selectAllMine,
    isItemSelected,
    isAllMineSelected,
  };
}
