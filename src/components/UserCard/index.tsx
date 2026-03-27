import { usePresignedUserPhoto } from '@/hooks/usePresignedUserPhoto';
import { UserDetail } from '@/types/interfaces';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

interface Props {
  submittedBy: UserDetail | undefined;
  name?: string;
  index: number;
  showHoverModel?: boolean;
}

const UserCard: React.FC<Props> = ({
  submittedBy,
  index,
  name,
  showHoverModel = true,
}) => {
  const [hoveredIndex, setHoveredUser] = useState<number | null>(null);
  const { data: session } = useSession();
  const photoDisplay = usePresignedUserPhoto(submittedBy?.photo, '/user.svg');
  return (
    <div
      className="relative my-2 flex items-center"
      onMouseEnter={() => setHoveredUser(index)}
      onMouseLeave={() => setHoveredUser(null)}
    >
      <img
        src={photoDisplay}
        alt="avatar"
        className="mr-2 h-8 w-8 rounded-full border border-gray-500"
      />
      {name ? (
        <span className="text-sm text-gray-700">{name}</span>
      ) : (
        <span className="text-sm text-gray-700">{`${
          submittedBy?._id === session?.user.user._id
            ? `Me`
            : `${submittedBy?.firstName} ${submittedBy?.lastName}`
        }`}</span>
      )}

      {hoveredIndex === index && showHoverModel && (
        <div className="absolute z-20 mt-20 w-[350px] rounded-lg border bg-gray-50 p-2 text-xs text-[#616161] shadow-lg">
          <div className="flex items-start">
            <img
              src={photoDisplay}
              alt="Avatar"
              className="h-10 w-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-200"
            />
            <div className="ml-4 space-y-2">
              <p className="text-sm font-semibold text-[#605f5f]">
                {name
                  ? name
                  : `${submittedBy?.firstName} ${submittedBy?.lastName}`}
              </p>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#616161"
                >
                  <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280 320-200v-80L480-520 160-720v80l320 200Z" />
                </svg>
                <p className="text-sm">{submittedBy?.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#616161"
                >
                  <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z" />
                </svg>

                <p className="text-sm">
                  {submittedBy?.organization?.name ?? ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
