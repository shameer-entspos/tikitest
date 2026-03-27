'use client';
import { ProjectDetail } from '@/app/type/projects';
import { useState } from 'react';

export const CustomHoverPorjectShow = ({
  projects,
  index,
  setHoveredProject,
  selectedIndex = 0,
}: {
  projects: ProjectDetail[] | undefined;
  index: number | null;
  setHoveredProject: any;
  selectedIndex?: number | null;
}) => {
  if (!projects || projects.length === 0) {
    return <></>;
  } else {
    // Get the first project
    const firstProject = projects[0];
    const hasMultipleProjects = projects.length > 1;
    return (
      <div className="relative inline-block" key={selectedIndex}>
        <span
          className="rounded-md bg-[#97F1BB] px-2 py-1 text-[#616161]"
          onMouseEnter={() =>
            setHoveredProject(
              (projects ?? []).length > 1 ? (selectedIndex ?? 0) : null
            )
          }
          onMouseLeave={() => setHoveredProject(null)}
        >
          {hasMultipleProjects
            ? `${firstProject.name} +${projects.length - 1}`
            : firstProject.name}
        </span>
        {index === selectedIndex && (
          <div className="absolute left-0 top-full z-20 mt-1 w-fit rounded-lg border bg-[#97F1BB] px-4 py-2 text-xs text-[#616161] shadow-lg">
            <div className="flex items-start">
              <div className="space-y-2">
                {(projects ?? []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0569 3.375H15.5366C15.8493 3.37497 16.1585 3.4401 16.4446 3.56624C16.7307 3.69238 16.9873 3.87676 17.1982 4.10762C17.409 4.33848 17.5695 4.61076 17.6692 4.90707C17.769 5.20339 17.8059 5.51725 17.7776 5.82863L17.061 13.7036C17.0102 14.2627 16.7523 14.7825 16.3378 15.1611C15.9234 15.5397 15.3824 15.7498 14.8211 15.75H3.17849C2.61715 15.7498 2.07618 15.5397 1.66176 15.1611C1.24734 14.7825 0.989411 14.2627 0.938611 13.7036L0.221986 5.82863C0.175003 5.30758 0.311053 4.78646 0.606736 4.35488L0.562861 3.375C0.562861 2.77826 0.799914 2.20597 1.22187 1.78401C1.64383 1.36205 2.21612 1.125 2.81286 1.125H6.94386C7.54055 1.12513 8.11275 1.36226 8.53461 1.78425L9.46611 2.71575C9.88797 3.13774 10.4602 3.37487 11.0569 3.375ZM1.69461 3.51C1.93611 3.42075 2.19261 3.37575 2.46411 3.375H8.53461L7.73924 2.57963C7.52831 2.36863 7.24221 2.25006 6.94386 2.25H2.81286C2.51816 2.24995 2.2352 2.36553 2.02483 2.57191C1.81445 2.77829 1.69346 3.05898 1.68786 3.35362L1.69461 3.51Z"
                        fill="#616161"
                      />
                    </svg>
                    <p className="text-sm">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};
