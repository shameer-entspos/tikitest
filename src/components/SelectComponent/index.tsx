import React from "react";
import { Select, SelectItem, Avatar } from "@nextui-org/react";

export default function SleectComponent({
  users,
  label,
}: {
  users: [{ id: string; name: string }];
  label: string;
}) {
  return (
    <Select
      items={users}
      label={label}
      placeholder="Select option"
      labelPlacement="outside"
      className="max-w-xs fill-white"
      size="sm"

    >
      {(user) => (
        <SelectItem key={user.id} textValue={user.name}>
          <div className="flex gap-2 items-center">
            <div className="flex flex-col">
              <span className="text-small">{user.name}</span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
}
