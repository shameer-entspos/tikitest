import {
  deletePost,
  getUserTeams,
  toggleLikedPost,
} from '@/app/(main)/(user-panel)/user/feeds/api';
import { usePostCotnext } from '@/app/(main)/(user-panel)/user/feeds/context';
import { Dialog } from '@headlessui/react';
import useAxiosAuth from '@/hooks/AxiosAuth';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import CreatePost from './createPost';

import Posts from './Post';
import CustomCheckbox from '../Ui/CustomCheckbox';
import CustomHr from '../Ui/CustomHr';
import CustomModal from '../Custom_Modal';

function Feed() {
  let [isOpen, setIsOpen] = useState(false);

  // Multi-select: default to everyone (show all)
  const [shareOptions, setShareOptions] = useState<
    Array<'everyone' | 'organization' | 'team' | 'my post'>
  >(['everyone']);
  const [applyOptions, setApplyOptions] = useState<
    Array<'everyone' | 'organization' | 'team' | 'my post'>
  >(['everyone']);
  const axiosAuth = useAxiosAuth();
  const { data } = useQuery({
    queryKey: 'getUserTeams',
    queryFn: () => getUserTeams(axiosAuth),
  });
  const [teams, setTeams] = useState<string[]>([]);

  return (
    <>
      <div className="flex h-[calc(var(--app-vh)_-_100px)] w-full flex-col gap-3 space-y-1 overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-30 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="pl-4 text-[20px] font-semibold text-black">Feed</h1>

            <button
              onClick={() => setIsOpen(true)}
              className="text-end text-sm text-primary-500 sm:text-base"
            >
              Filter by
              {applyOptions.length > 0 &&
              applyOptions.length === 1 &&
              applyOptions[0] === 'everyone'
                ? ''
                : `: ${applyOptions
                    .filter((opt) => opt !== 'everyone')
                    .map((opt) =>
                      opt
                        .split(' ')
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')
                    )
                    .join(', ')}`}
            </button>
          </div>
          <CreatePost />
        </div>
        <div className="min-h-full w-full flex-1 overflow-scroll scrollbar-hide">
          <Posts shareOptions={applyOptions} teams={teams} />
        </div>
      </div>
      <CustomModal
        size="md"
        isOpen={isOpen}
        header={
          <>
            <div>
              <h2 className="text-xl font-semibold text-[#1E1E1E]">
                {'Filter Feed'}
              </h2>
              <span className="mt-1 text-base font-normal text-[#616161]">
                {'Select filter options below.'}
              </span>
            </div>
          </>
        }
        body={
          <div className="flex h-[200px] flex-col overflow-auto px-3 sm:h-[500px]">
            <div className="mx-2 my-2 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-[4px]">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 sm:text-base">
                  Everyone
                </span>
              </div>
              <CustomCheckbox
                key={'everyone'}
                label={''}
                description={'Internal & External'}
                checked={shareOptions.includes('everyone')}
                onChange={() => {
                  setShareOptions((prev) =>
                    prev.includes('everyone')
                      ? prev.filter((v) => v !== 'everyone')
                      : ['everyone']
                  );
                  setTeams([]);
                }}
              />
            </div>
            <div className="mx-2 my-2 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-[4px]">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 sm:text-base">
                  My Posts
                </span>
              </div>
              <CustomCheckbox
                key={'My Posts'}
                label={''}
                description={'Internal'}
                checked={shareOptions.includes('my post')}
                onChange={() => {
                  setShareOptions((prev) => {
                    const next: Array<
                      'everyone' | 'organization' | 'team' | 'my post'
                    > = prev.includes('my post')
                      ? prev.filter((v) => v !== 'my post')
                      : [...prev.filter((v) => v !== 'everyone'), 'my post'];
                    return next.length === 0 ? ['everyone'] : next;
                  });
                  setTeams([]);
                }}
              />
            </div>
            <div className="mx-2 my-2 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-[4px]">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 sm:text-base">
                  My Organization
                </span>
              </div>
              <CustomCheckbox
                key={'organization'}
                label={''}
                description={'Internal'}
                checked={shareOptions.includes('organization')}
                onChange={() => {
                  setShareOptions((prev) => {
                    const next: Array<
                      'everyone' | 'organization' | 'team' | 'my post'
                    > = prev.includes('organization')
                      ? prev.filter((v) => v !== 'organization')
                      : [
                          ...prev.filter((v) => v !== 'everyone'),
                          'organization',
                        ];
                    return next.length === 0 ? ['everyone'] : next;
                  });
                  setTeams([]);
                }}
              />
            </div>
            {(data ?? []).map((filter) => (
              <div
                key={filter._id}
                className="mx-2 my-2 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-[4px]"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 sm:text-base">
                    {filter.name}
                  </span>
                </div>
                <CustomCheckbox
                  key={'team'}
                  label={''}
                  description={'Team'}
                  checked={teams.includes(filter._id)}
                  onChange={() => {
                    setShareOptions((prev) => {
                      const next: Array<
                        'everyone' | 'organization' | 'team' | 'my post'
                      > = prev.includes('team')
                        ? prev
                        : [...prev.filter((v) => v !== 'everyone'), 'team'];
                      return next.length === 0 ? ['everyone'] : next;
                    });
                    setTeams((prev) =>
                      prev.includes(filter._id)
                        ? prev.filter((f) => f !== filter._id)
                        : [...prev, filter._id]
                    );
                  }}
                />
              </div>
            ))}
          </div>
        }
        handleCancel={() => {
          setShareOptions(['everyone']);
          setApplyOptions(['everyone']);
          setTeams([]);
          setIsOpen(false);
        }}
        handleSubmit={() => {
          const next: Array<'everyone' | 'organization' | 'team' | 'my post'> =
            shareOptions.includes('team') && teams.length === 0
              ? applyOptions
              : shareOptions.length === 0
                ? ['everyone']
                : shareOptions;
          setApplyOptions(next);
          setIsOpen(false);
        }}
        submitValue={`Add `}
      />
    </>
  );
}

export default Feed;
