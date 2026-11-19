// @cpe-os/shared
// Single source of truth for values used by BOTH the backend and the frontend.
// Adding a new role here instantly updates TypeScript autocomplete in both apps.

export const APP_NAME = 'CPE OS' as const;
export const APP_DESCRIPTION =
  'The Operating System for Computer Engineering, FUTMinna' as const;

// Roles control access to routes, UI sections, and API endpoints.
// Kept as `as const` so TypeScript infers the literal union instead of `string`.
export const ROLES = ['student', 'lecturer', 'admin'] as const;
export type Role = (typeof ROLES)[number];

// Academic levels. Used for filtering past questions and course listings.
export const COURSE_LEVELS = [100, 200, 300, 400, 500] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

// Nigerian academic year is split into two semesters (First / Second).
export const SEMESTERS = ['first', 'second'] as const;
export type Semester = (typeof SEMESTERS)[number];