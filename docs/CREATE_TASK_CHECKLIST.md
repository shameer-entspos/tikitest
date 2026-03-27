# Create Task – Requirements Checklist

This checklist ensures the **Create Task** flow (Step 1: Task Definition + Step 2: Assignment) matches the Tasks Module documentation.

---

## Step 1: Task Definition

| Requirement | Field | Type | Implementation |
|-------------|--------|------|-----------------|
| **Required** | Projects | Multi-select | ✅ Multi-select; validation: at least one project required (Yup + backend). When creating from project context, one project pre-selected. |
| **Required** | Customer | Single-select | ✅ CustomSearchSelect; Yup required; backend validates non-empty. |
| **Required** | Task Name | String | ✅ SimpleInput; Yup required; backend validates non-empty. |
| **Required** | Task Description | Text | ✅ Textarea; Yup required + min(1); backend validates non-empty. |
| Optional | Linked App | App reference | ✅ CustomSearchSelect; optional; backend accepts null. |
| **Required** | Start Date | Date | ✅ CustomDateRangePicker; Yup required; backend validates; sent in payload and create request. |
| **Required** | Due Date | Date | ✅ CustomDateRangePicker; Yup required; backend validates. |
| Optional | Repeat Task | Boolean | ✅ Checkbox; when enabled shows Repeat Frequency and Series End. |
| When repeat | Repeat Frequency | Enum | ✅ Daily, Weekdays, Weekly, Monthly, Yearly, Custom (SelectOption). |
| When repeat | Custom Interval | Integer + Unit | ✅ repeatCount, weekCount, monthCount from context (Task_Members / NewTaskModel). |
| When repeat | Series End Condition | Project end OR custom date | ✅ "When Project Ends" (value '0') or "Custom Date"; validation: if "When Project Ends" and no selected project has end date → toast + block Next. |
| When repeat | repeatTaskEndDate | Date \| null | ✅ When "When Project Ends" → send `null` (backend uses project end). When Custom → send selected date. (Task_Members, TaskAddMembersSection.) |
| **Required** | Task Sharing Mode | INDIVIDUAL \| SHARED | ✅ CustomRadio (Individual / Shared); controlled by form value; payload and API send `'individual'` or `'shared'`. |

**Series End Logic (doc):** If "Project end" is selected, the system uses the latest end date across selected projects. If no project has an end date, a custom end date must be selected.

- **Frontend:** When user selects "When Project Ends" and no selected project has an end date, validation blocks Next and shows toast.
- **Backend:** When `repeatTaskEndDate` is null, `isExpireOrNot` uses project `date` (active if project end ≥ today).

---

## Step 2: Assignment

| Requirement | Implementation |
|-------------|----------------|
| **Selection** | Users can multi-select Users and/or Teams restricted to those associated with the selected projects. |
| **API** | `getMembersListOfProejcts(axiosAuth, projectIds)` → `POST user/task/listOfMembers` with `ids: projectIds`; returns `users`, `teams`, `externalUser`. |
| **Resolution** | At creation time teams are resolved to individual users (backend: `teamMembers` from `Team.find().members`). |
| **Stored** | Fixed list: `individualUsers`, `teams` (refs), `teamMembers` (resolved user IDs). Subsequent team membership changes do not affect existing instances. |

Assignment UI and create payload (Task_Members.tsx, TaskAddMembersSection.tsx) send `individualUsers`, `teams`, `external`; backend resolves teams to `teamMembers` and stores all.

---

## Backend Create (express-tiki)

| Check | Implementation |
|-------|----------------|
| Task name required | ✅ Validated (non-empty string). |
| Task description required | ✅ Validated (non-empty string). |
| Customer required | ✅ Validated (non-empty string). |
| Due date required | ✅ Validated. |
| Start date required | ✅ Validated. |
| At least one project | ✅ `projects` must be array with `length >= 1`. |
| shareAs | ✅ Normalized to `'shared'` or `'individual'`. |
| Projects linked | ✅ After task save, `Project.updateMany({ _id: { $in: projectsArray } }, { $push: { tasks: task._id } })`. |

---

## Frontend Create Flow Summary

1. **Step 1 (NewTaskModel/index.tsx)**  
   User fills: Projects (multi), Customer, Task Name, Task Description, Linked App (optional), Start Date, Due Date, Repeat Task (optional), Repeat Frequency / Custom Interval / Series End when repeat, Task Sharing (Individual/Shared).  
   Validation: name, description, startDate, dueDate, customer, projects (min 1). Series end: if "When Project Ends" and no project end date → toast and block.  
   On **Next** → dispatch payload (including `shareAs: 'individual' | 'shared'`) and open Step 2 (members).

2. **Step 2 (Task_Members.tsx or TaskAddMembersSection.tsx)**  
   User selects Users/Teams from project members (from `listOfMembers`).  
   On **Confirm** → `createTask` with full payload: all Step 1 fields + `userId`, `individualUsers`, `teams`, `external`, `repeatTask`, `repeatTaskEndDate` (null when "When Project Ends"), `weekCount`, `monthCount`, `repeatCount`, etc.

3. **API**  
   `POST user/task/create` with body containing all fields above; backend validates and creates task, then updates project(s) with task id.

---

## Files Touched for Create Task

- **Frontend:** `NewTaskModel/index.tsx` (Step 1 form, validation, Start Date, Projects validation, shareAs), `Task_Members.tsx` (create payload, repeatTaskEndDate, shareAs), `TaskAddMembersSection.tsx` (create payload, shareAs, customer, startDate, endDate, repeatTaskEndDate).
- **Backend:** `express-tiki/src/v1/controllers/user/task.controller.ts` (create: name, description, customer, dueDate, startDate, projects array length, shareAs norm; use `projectsArray` for task and Project.updateMany).
- **API:** `tiki/.../tasks/api.ts` – `createTask` posts to `user/task/create`.
