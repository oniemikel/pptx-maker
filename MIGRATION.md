# Migration Plan: Firebase/AWS Removal and Vercel Unification

## Goal
- Remove Firebase and AWS from this project.
- Unify deployment on Vercel with Next.js + Python Serverless Functions.
- Keep architecture stateless: no DB, no storage, request-only processing.
- Enforce Zero-useEffect for data fetching and API calls.

## Current Migration Status
- Current phase: Phase 5 (Zero-useEffect enforcement in progress)
- Overall progress: 4/7 phases complete
- Latest: Completed Phase 4 data-flow migration with `useActionState` + server-side validation

## Phase Checklist

### Phase 0: Documentation
- [x] Create MIGRATION.md at project root
- [ ] Confirm target architecture and constraints with team
- [ ] Freeze migration scope for first PR

### Phase 1: Directory Restructure (FSD + Thin App)
- [x] Create `frontend-next/src/features/auth`
- [x] Create `frontend-next/src/features/content`
- [x] Create `frontend-next/src/features/shared`
- [x] Move domain UI/logic out of `frontend-next/app`
- [x] Keep `frontend-next/app` as routing-only wrappers

### Phase 2: Python API on Vercel (No Framework)
- [x] Create `api/generate.py` with direct `handler`
- [x] Import `python-pptx` directly in `api/generate.py`
- [x] Return PPTX bytes as binary response
- [x] Add/update Vercel Python runtime config

### Phase 3: Shared Password Auth (Server Actions)
- [x] Implement login Server Action with `ADMIN_PASSWORD`
- [x] Add secure cookie-based auth state
- [x] Implement fom components (`GenerateForm.tsx`)
- [x] Remove Firebase auth hooks/components

### Phase 4: Data Flow Migration
- [x] Implement flow: Server Action -> `/api/generate.py` -> browser download
- [x] Remove client-side direct API patterns that bypass Server Actions
- [x] Keep all generation data request-scoped only

### Phase 5: Zero-useEffect Enforcement
- [ ] Audit all remaining `useEffect`
- [ ] Remove `useEffect` used for fetching/calling APIs
- [ ] Document any non-removable `useEffect` with reason (target: 0)

### Phase 6: Legacy Removal
- [ ] Remove Firebase dependencies and env vars
- [ ] Remove AWS Lambda related code and docs
- [ ] Remove FastAPI candidates/experiments if any
- [ ] Clean up obsolete files/imports

### Phase 7: Validation and Release
- [ ] Local validation of end-to-end PPTX download
- [ ] Vercel preview validation
- [ ] Cold-start and response-time sanity check
- [ ] Prepare PR summary and migration notes

## Decommissioned / To-Be-Decommissioned Components
- [ ] Firebase Auth
- [ ] Firebase Firestore/Storage
- [ ] AWS Lambda backend (`backend/lambda_function.py`)
- [ ] FastAPI-based candidate architecture (if present)
- [ ] Firebase-based frontend auth/data hooks

## 10-Second Limit Optimization Status
- [ ] Keep Python entrypoint minimal (`api/generate.py` only)
- [ ] Avoid framework bootstrap overhead (no FastAPI wrapper)
- [ ] Minimize import graph in serverless handler
- [ ] Verify `python-pptx` load impact in cold start
- [ ] Reduce payload size and processing steps before generation
- [ ] Add lightweight timing logs for cold/warm comparisons

## Server/Client Boundary Definition

### Server Side (default)
- Next.js Server Components for page-level data flow and auth gate.
- Next.js Server Actions for form submission, auth check, and API calls.
- Vercel Python Function (`api/generate.py`) for PPTX generation.

### Client Side (minimum leaf only)
- Interactive leaf components only (`use client`) for UI input behavior.
- No data fetching or API orchestration in client components.
- No `useEffect` for fetching/mutation.

## Target Data Flow
1. User submits form in a client leaf.
2. Server Action validates auth (`ADMIN_PASSWORD` session/cookie).
3. Server Action calls `/api/generate.py`.
4. Python function generates PPTX in memory and returns binary.
5. Browser downloads file.

## Notes
- This document is updated at each completed phase.
- Keep PRs small and phase-based for stability.
- Please use `pnpm` instead of `npm`.

## useEffect Removal Log (Phase 4)
- `frontend-next/src/features/content/components/GenerateForm.tsx`
	- Result: `useEffect` count is `0` before and after this phase.
	- Change: Replaced manual client submit flow with `useActionState` + `<form action={serverAction}>`.
	- Reason: Keep request orchestration on the server and avoid client-side fetch/effect orchestration.

- `frontend-next/src/features/content/actions/generateAction.ts`
	- Change: Switched to `FormData` action signature for `useActionState` and moved validation/auth checks to server.
	- Reason: Enforce "client fetch禁止・Server Actions経由" rule.
