# Tasks Module – Requirements Verification Report

This document verifies the current **tiki** (frontend) and **express-tiki** (backend) implementation against the provided Tasks Module documentation.

---

## 1. Overview

| Requirement | Status | Notes |
|-------------|--------|--------|
| Mandatory customer association | ✅ Met | Backend `create` validates `customer`; frontend validates and sends it. |
| Multi-project assignment | ✅ Met | Task has `projects[]`; backend pushes task id into selected projects. |
| App deep-linking | ✅ Met | Task has optional `app` reference. |
| Team and user assignment (resolved to users) | ✅ Met | Teams resolved to `teamMembers` at create/copy; stored as user IDs. |
| Recurring task generation with bounded execution | ✅ Met | `repeatTask`, `repeatTaskEndDate`, cron `processTasks`/`createCopyTask`; `isExpireOrNot` uses project end or custom end date. |
| Individual vs shared completion logic | ✅ Met | Frontend `isTaskCompleted()`: shared = any one submitted; individual = all assignees in `submitBy`. |
| Immutable historical records for completed tasks | ✅ Met | Edit/delete only touch instances with no `submitBy`; completed instances are not modified. |
| Parent Task → Task Instance architecture | ✅ Met | `isOrignal` / `realTaskRef`; instances get frozen assignees and `submitBy`. |

---

## 2. Core Architecture

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Parent Task** – definition, recurrence, sharing, assignment, series end | ✅ Met | Parent has `isOrignal: true`, no `realTaskRef`; stores recurrence, shareAs, assignment, repeatTaskEndDate. |
| **Parent never directly completed** | ⚠️ Gap | `submitTask` correctly updates only instances (`!isOrignal`). `markAsCompleteManyTasks` does **not** check `isOrignal` and can add `submitBy` to parents. Doc: only instances can be completed. |
| **Task Instance** – snapshot, frozen assignees, completion data | ✅ Met | Instance has `realTaskRef`, `teamMembers`/`individualUsers` resolved at copy, `submitBy` for completion. |
| **Only instances can be completed** | ⚠️ See above | True for submit flow; not enforced in bulk “mark complete”. |

---

## 3. Create Task – Step 1: Task Definition

| Field | Doc | Backend | Frontend |
|-------|-----|---------|----------|
| Projects | Multi-select | ✅ `projects[]` | ✅ Multi-select |
| Customer | Required | ✅ Validated | ✅ Required in Yup |
| Task Name | Required | ✅ Validated | ✅ Required in Yup |
| Task Description | Required | ✅ Validated | ✅ Required in Yup |
| Linked App | Optional | ✅ Optional | ✅ Optional |
| Start Date | Required | ✅ Validated | ✅ Sent |
| Due Date | Required | ✅ Validated | ✅ Required in Yup |
| Repeat Task | Boolean | ✅ `repeatTask` | ✅ Checkbox + options |
| Repeat Frequency | Daily, Weekdays, Weekly, Monthly, Yearly, Custom | ✅ Enum (Day, Week, Month, Year, Weekdays, etc.) | ✅ Supported |
| Custom Interval | Integer + unit | ✅ `repeatCount`, `weekCount`, `monthCount` | ✅ Sent |
| Series End Condition | Project end OR custom date | ✅ `repeatTaskEndDate`; `isExpireOrNot` uses it and project dates | ✅ End date / project end in UI |
| Task Sharing Mode | INDIVIDUAL / SHARED | ✅ `shareAs` enum | ✅ Radio (individual/shared) |

**Series End Logic (doc):** If “Project end” is selected, use latest end date across selected projects; if a project has no end date, require a custom end date.

- **Backend:** `isExpireOrNot` supports both: when `repeatTaskEndDate` is set it uses it; when null it uses project `date` (active if project end ≥ today). It does **not** explicitly set “latest project end” as the series end date when user chooses “project end” (that would be a frontend/backend contract).
- **Frontend:** End date and “when project ends” style options exist; confirm that when user selects “project end” and all selected projects have no end date, the UI requires a custom end date (per doc).

---

## 4. Create Task – Step 2: Assignment

| Requirement | Status | Notes |
|-------------|--------|--------|
| Multi-select Users and/or Teams restricted to selected projects | ✅ Met | `listOfProjectMembers` (listOfMembers) returns users/teams from selected project ids; frontend uses these for assignment. |
| At creation, teams resolved to individual users | ✅ Met | Backend resolves `teams` → `teamMembers` in `create` and in `createCopyTask`. |
| Fixed list of user IDs stored; team changes do not affect existing instances | ✅ Met | Instances store `teamMembers` (and `individualUsers`); no re-resolution on existing data. |

---

## 5. Task Generation & State

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Rolling window:** instances up to **90 days** into the future and any missing overdue | ⚠️ Unclear | Cron generates instances when the repeat pattern triggers (daily/weekly/monthly logic). There is **no explicit 90-day cap** in code; generation is “next occurrence” rather than “pre-fill next 90 days”. Doc may mean “generate as needed within a 90-day horizon” – confirm intent. |
| **Status:** PENDING or COMPLETED | ✅ Met | Not stored as a separate field; derived: PENDING = no (or incomplete) `submitBy`, COMPLETED = has completion per current logic (see §6). |
| **Overdue:** computed (not stored), PENDING and due date &lt; today | ✅ Met | Frontend: `isOverdue(x)` = not completed and `dueDate` &lt; today (date-only comparison). |

---

## 6. Completion Logic (Critical Gap)

**Doc:**

- **Individual mode:** Task is completed only when **all** assigned users have marked it complete.
- **Shared mode:** Task is completed when **any one** assigned user completes it (“first completion wins”).

**Current behavior:**

- **Backend:** `submitTask` and `markAsCompleteManyTasks` always **append** the current user to `submitBy`. There is **no** check of `shareAs`. Any task (instance or, for bulk complete, parent) is treated the same.
- **Frontend:** “Completed” is derived as `(x?.submitBy ?? []).length > 0` (e.g. in `Tasks/index.tsx`). So **one** submission is enough to consider the task completed everywhere.

**Conclusion:** Behavior matches **Shared** mode only. **Individual** mode is **not** implemented: the system does not require “all assignees have submitted” before considering a task complete.

**To align with doc:**

- **Individual:** Consider task completed only when the set of users in `submitBy` equals the set of assignees (e.g. `userId` + `individualUsers` + `teamMembers` for that instance). Backend and frontend would both need to use this rule when writing and when displaying “Completed”.
- **Shared:** Keep current behavior (any one submission = completed).

---

## 7. Management & Visibility

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Pending Tasks:** All PENDING instances (including overdue), sorted by Due Date, Start Date, Created At, ID | ✅ Met | Pending/upcoming/overdue tabs; sort uses `customSortFunction` with dueDate → startDate → createdAt → _id (Tasks/index.tsx). |
| **Editing:** Updating parent updates all current and future instances; completed instances unchanged | ✅ Met | Backend edit uses `propagateKeys` and `Task.updateMany` with `realTaskRef`, `submitBy: []` or not exists; instances with `submitBy` are excluded. |
| **Deletion:** Soft-delete parent and current/future instances; completed instances remain for audit | ✅ Met | `destory`/`destoryManyTasks` set `deletedAt`; exclude instances that already have `submitBy`. |

---

## 8. Summary

- **Fully aligned:** Customer, multi-project, app link, team/user resolution, recurrence with bounded execution, historical immutability, parent/instance model, assignment from projects, pending/overdue/completed display, sort order, edit/delete propagation, and shared-mode completion.
- **Gaps / clarifications:**
  1. **Completion logic (Individual vs Shared):** Only “shared” (first completion wins) is implemented. “Individual” (all assignees must complete) is missing in both backend and frontend.
  2. **Only instances can be completed:** Enforced in `submitTask`; **not** in `markAsCompleteManyTasks` (parents can get `submitBy`). Recommend restricting bulk “mark complete” to instances only (`isOrignal: false`).
  3. **Task Name / Description required:** Backend does not validate name or description. Frontend requires name and customer but **not** description in the main NewTaskModel form; doc says description is required – add validation and backend checks if you want to enforce it.
  4. **90-day rolling window:** No 90-day cap in code; generation is pattern-based. Confirm with product whether a hard 90-day window is required.

If you want, the next step can be concrete code changes for: (a) Individual vs Shared completion logic, (b) Restricting “mark complete” to instances only, and (c) Optional description (and name) validation on backend and frontend.
