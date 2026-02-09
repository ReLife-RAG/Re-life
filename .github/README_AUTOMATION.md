# Automated README Update System

This document explains the automated system that updates the repository's README file when pull requests are merged.

## Overview

The automation consists of two main components:

1. **GitHub Actions Workflow** (`.github/workflows/update-readme-on-pr.yml`)
2. **Update Script** (`.github/scripts/update-readme.js`)

## How It Works

### Trigger

The workflow is triggered automatically when:
- A pull request is **closed** (via the `pull_request_target` event)
- The PR was **merged** (not just closed without merging)

### Process Flow

1. **PR is Merged**: When a pull request is approved and merged into the main branch
2. **Workflow Activates**: The GitHub Actions workflow starts automatically
3. **Extract PR Info**: The workflow extracts key information:
   - PR number
   - PR title
   - Author username
   - PR URL
   - Merge date
4. **Update README**: The Node.js script updates the README file:
   - Creates a "📝 Recent Changes" section if it doesn't exist
   - Adds the new PR entry at the top of the list
   - Keeps only the last 10 entries
   - Prevents duplicate entries
5. **Commit & Push**: If changes were made, they are committed and pushed to main

### The "Recent Changes" Section

The script automatically maintains a "Recent Changes" section in the README with this format:

```markdown
## 📝 Recent Changes

- **2026-02-09** - [#123](PR_URL) PR title by [@username](https://github.com/username)
- **2026-02-08** - [#122](PR_URL) Another PR by [@contributor](https://github.com/contributor)
...
```

Features:
- **Chronological Order**: Most recent PRs appear first
- **Limited History**: Only keeps the last 10 merged PRs
- **Duplicate Prevention**: Won't add the same PR twice
- **Rich Links**: Includes links to the PR and author's GitHub profile

## Workflow Configuration

### Permissions

The workflow requires these permissions:
- `contents: write` - To push changes to the README
- `pull-requests: read` - To read PR information

### Security

- Uses `pull_request_target` which runs in the context of the base repository
- Only executes when `github.event.pull_request.merged == true`
- Commits are made by `github-actions[bot]`

## Script Details

### Input (Environment Variables)

The script expects these environment variables:
- `PR_NUMBER` - The pull request number
- `PR_TITLE` - The pull request title
- `PR_AUTHOR` - The GitHub username of the PR author
- `PR_URL` - The full URL to the pull request
- `PR_DATE` - The date the PR was merged (YYYY-MM-DD format)

### Output

- Updates `README.md` in place
- Creates or updates the "Recent Changes" section
- Exits with code 0 on success

### Edge Cases Handled

1. **No Existing Section**: Creates the section after the repository description
2. **Empty Section**: Adds the first entry
3. **Duplicate Entry**: Skips if the PR number already exists
4. **Maximum Entries**: Limits to 10 most recent entries

## Testing the Script Locally

You can test the script manually:

```bash
# Set environment variables
export PR_NUMBER="123"
export PR_TITLE="Test PR"
export PR_AUTHOR="yourusername"
export PR_URL="https://github.com/ReLife-SDGP-CS-79/Re-life-website/pull/123"
export PR_DATE="2026-02-09"

# Run the script
node .github/scripts/update-readme.js

# Check the changes
git diff README.md
```

## Customization

### Change the Number of Entries Kept

Edit `.github/scripts/update-readme.js` and modify this line:

```javascript
const limitedEntries = entries.slice(0, 10); // Change 10 to your desired limit
```

### Change the Section Header

Modify the `recentChangesHeader` constant:

```javascript
const recentChangesHeader = '## 📝 Recent Changes'; // Customize as needed
```

### Change the Entry Format

Modify the `newEntry` template:

```javascript
const newEntry = `- **${prDate}** - [#${prNumber}](${prUrl}) ${prTitle} by [@${prAuthor}](https://github.com/${prAuthor})`;
```

## Troubleshooting

### Workflow Not Running

**Check:**
- Is the PR actually merged (not just closed)?
- Does the workflow file have correct YAML syntax?
- Are the required permissions granted?

**Solution:**
- Review the Actions tab in your GitHub repository
- Check workflow logs for error messages

### README Not Updating

**Check:**
- Did the script run successfully in the workflow logs?
- Are there any git conflicts?
- Does the script have write permissions?

**Solution:**
- Review the "Update README with PR information" step in the workflow logs
- Check the commit history to see if changes were pushed

### Duplicate Entries

The script automatically prevents duplicates, but if you see them:
- Manually remove the duplicates from README.md
- The script will prevent future duplicates

## Files Reference

- **Workflow**: `.github/workflows/update-readme-on-pr.yml`
- **Script**: `.github/scripts/update-readme.js`
- **Updated File**: `README.md`
- **Documentation**: `.github/README_AUTOMATION.md` (this file)

## Future Enhancements

Possible improvements to consider:

1. **Categorize Changes**: Group by feature/fix/docs
2. **Release Notes**: Auto-generate release notes from PRs
3. **Changelog File**: Maintain a separate CHANGELOG.md
4. **Statistics**: Add contributor statistics
5. **Notifications**: Send notifications when README is updated

## Contributing

If you want to modify the automation:

1. Edit the workflow or script files
2. Test locally using the test script
3. Submit a PR with your changes
4. The automation will update itself once your PR is merged! 🎉
