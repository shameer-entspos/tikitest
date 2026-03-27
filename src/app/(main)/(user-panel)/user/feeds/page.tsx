'use client';
import React, { useReducer, useState } from 'react';
import Feed from '@/components/Feeds/Feed';
import Recent from '@/components/Feeds/Recent';
import Upcoming from '@/components/Feeds/Upcoming';

import {
  PostContext,
  PostContextProps,
  postInitialState,
  postReducer,
} from './context';
function Page() {
  const [state, dispatch] = useReducer(postReducer, postInitialState);
  const contextValue: PostContextProps = {
    state,
    dispatch,
  };
  return (
    <PostContext.Provider value={contextValue}>
      <div className="mt-5 flex">
        <div className="hidden px-5 md:block md:w-[40%] lg:w-[25%]">
          <Recent />
        </div>

        <div className="h-[calc(var(--app-vh)_-_100px)] flex-1 p-1 lg:w-[50%]">
          <Feed />
        </div>

        <div className="hidden px-5 lg:block lg:w-[25%]">
          <Upcoming />
          {/* <Recent /> */}
        </div>
      </div>
    </PostContext.Provider>
  );
}

export default Page;
