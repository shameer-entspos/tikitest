export const USER_ROLE = {
  USER: 2,
  ORGANIZATION: 3,
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
