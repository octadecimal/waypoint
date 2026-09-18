---
name: using-git-worktrees
description: Use when implementation needs isolation from the primary checkout or before executing a plan in a repository that requires a dedicated worktree.
---

# Using Git Worktrees

Create or verify an isolated workspace without disturbing the operator's primary checkout or ambiguous work.

**Core principle:** detect existing isolation, follow repository policy, verify ownership, then create the minimum workspace needed.

Plan-only work does not create a worktree. An approved implementation plan, auto-execution request, repository instruction, or earlier user preference for isolation authorizes normal worktree setup; do not ask again. If no implementation authority or preference exists and creating a worktree would change repository state, finish read-only planning first and obtain execution authority through `astra-workflow:astra-plan`.

## 1. Inspect repository and existing isolation

Run read-only checks from the intended repository:

```bash
git rev-parse --show-toplevel
git rev-parse --absolute-git-dir
git rev-parse --git-common-dir
git rev-parse --show-superproject-working-tree
git branch --show-current
git status --short
git worktree list --porcelain
```

Resolve returned paths before comparing them. A linked worktree has a distinct Git directory and common Git directory. A submodule can also produce distinct-looking Git metadata, so a non-empty superproject path is a submodule signal, not proof of worktree isolation.

If already in an owned linked worktree, keep it and proceed to setup. Record its absolute path and branch. A detached worktree may be harness-managed; do not attach or move it until repository instructions and ownership are clear.

Inspect the primary checkout and all candidate worktree paths before mutations. Preserve unrelated edits and existing worktrees. Never remove, reuse, or repoint a directory merely because its name resembles the current task.

## 2. Choose mechanism and location

Use a harness-native worktree operation when the live tool surface provides one. Native tools may own placement and cleanup state. Otherwise use `git worktree`.

Location priority:

1. Explicit repository or user instruction.
2. Existing project-local `.worktrees/`.
3. Existing project-local `worktrees/`.
4. Project-local `.worktrees/` by default, unless repository policy requires an external location.

For a project-local location, verify Git ignores it before creating content:

```bash
git check-ignore -q .worktrees
```

If it is not ignored, follow repository policy. The coordinator may add the precise ignore rule when the approved work includes that repository change. If changing tracked ignore rules is outside scope or ownership is unclear, use an explicit external temporary parent instead. Do not create an unignored nested checkout.

Derive the base branch and remote from repository instructions and Git state. Do not assume `main`, `master`, or `origin`. Fetch only when the authorized plan and repository policy call for a current remote base.

## 3. Create the worktree

Choose a filesystem-safe task slug and ensure neither the branch nor path already belongs to another task:

```bash
git show-ref --verify --quiet refs/heads/<branch>
git worktree list --porcelain
git worktree add <absolute-path> -b <branch> <verified-base>
```

Use an existing task branch only when its ownership and intended worktree are established. Never force branch creation, delete a branch, prune a worktree, or overwrite a directory to make setup succeed.

After creation, verify:

```bash
git -C <absolute-path> branch --show-current
git -C <absolute-path> status --short
git -C <absolute-path> rev-parse HEAD
```

If creation fails, diagnose the exact cause. A sandbox or permissions failure does not silently authorize in-place implementation. Use an authorized alternate location, a native tool, or report the concrete blocker.

## 4. Project setup

Read repository instructions and lockfiles, then run the documented setup command. Examples are hints only:

- Node: the repository's package manager with its frozen-lockfile mode.
- Python: the existing environment/bootstrap instructions.
- Rust: the documented Cargo setup or build.
- Go: module download or the repository's setup target.

Do not guess a package manager from `package.json` when lockfiles or instructions choose one. Do not copy credentials, runtime databases, local secrets, or dependency directories from the primary checkout unless the project explicitly documents that operation.

## 5. Establish a baseline

Run the narrowest meaningful clean-baseline check required by the plan and repository policy. If the full gate is cheap and documented, use it. Record the command, result, revision, branch, and worktree path.

If the baseline fails, determine whether the failure predates the task. In collaborative mode, report a material ambiguity; in authorized auto mode, diagnose and proceed only when the task can still be verified without hiding the pre-existing failure. Never claim the final change caused or fixed a failure without evidence.

## Handoff and cleanup

Report:

```text
Worktree: <absolute path>
Branch/base: <branch> from <base revision>
Baseline: <command and result>
Ready for: <task>
```

The main coordinator owns staging, commits, pushes, PRs, and CI. Workers may edit assigned files in the worktree but do not perform Git mutations unless explicitly assigned coordinator authority.

Cleanup belongs to `astra-workflow:astra-complete` after integration. Before removal, verify the exact absolute path, ownership, clean state, merged or abandoned status, and absence of a running test stack that depends on it. Remove only the task-owned worktree. A lock or stale metadata is a diagnosis target, not permission to force deletion.

## Quick reference

| Situation | Action |
| --- | --- |
| Already in owned linked worktree | Reuse it and run setup/baseline. |
| In a submodule | Follow parent/submodule policy; do not misclassify it. |
| Native worktree tool exists | Use it. |
| Repository specifies `.worktrees/` | Use it after ignore verification. |
| Candidate directory is unignored | Add a scoped rule if authorized, otherwise choose an external location. |
| Branch/path already exists | Inspect ownership; never overwrite. |
| Baseline fails | Record and diagnose before attributing later failures. |
| Cleanup target is ambiguous | Preserve it. |
