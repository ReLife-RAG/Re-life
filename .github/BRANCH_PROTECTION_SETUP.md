# Branch Protection Setup Guide

The `CODEOWNERS` file in this repository is already configured so that **@Umeshinduranga** is the required reviewer for all pull requests. To fully enforce the rules, follow the steps below to enable branch protection in the GitHub UI.

## Steps to Enable Branch Protection

1. Go to **Settings → Rules → Rulesets** in this repository.
2. Click **New ruleset → New branch ruleset**.
3. Configure the ruleset:

| Setting | Value |
|---|---|
| **Ruleset name** | `main-protection` |
| **Enforcement status** | Active |
| **Target branches** | Add target → Include default branch (`main`) |

4. Under **Branch rules**, enable the following:

   - ✅ **Restrict deletions** — prevents anyone from deleting the `main` branch.
   - ✅ **Require a pull request before merging**
     - Set **Required approvals** to `1`
     - ✅ Check **Require review from Code Owners**
   - ✅ **Block force pushes**

5. Click **Create** to save the ruleset.

## What These Rules Do

- **No direct pushes to `main`**: All changes must go through a pull request.
- **PR authors cannot approve their own PR**: GitHub enforces this automatically when reviews are required.
- **Only @Umeshinduranga can approve**: The `CODEOWNERS` file marks @Umeshinduranga as the owner of all files, and the "Require review from Code Owners" setting ensures their approval is mandatory.
