#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to automatically update README.md when a PR is merged
 * This script adds a "Recent Changes" section to track merged PRs
 */

const README_PATH = path.join(__dirname, '../../README.md');

// Get PR information from environment variables
const prNumber = process.env.PR_NUMBER;
const prTitle = process.env.PR_TITLE;
const prAuthor = process.env.PR_AUTHOR;
const prUrl = process.env.PR_URL;
const prDate = process.env.PR_DATE;

console.log('Updating README with PR information:');
console.log(`- PR #${prNumber}: ${prTitle}`);
console.log(`- Author: ${prAuthor}`);
console.log(`- Date: ${prDate}`);

// Read the current README
let readme = fs.readFileSync(README_PATH, 'utf8');

// Prepare the new entry for the recent changes
const newEntry = `- **${prDate}** - [#${prNumber}](${prUrl}) ${prTitle} by [@${prAuthor}](https://github.com/${prAuthor})`;

// Check if Recent Changes section exists
const recentChangesHeader = '## 📝 Recent Changes';
const recentChangesRegex = /## 📝 Recent Changes\n\n([\s\S]*?)(?=\n## |\n---|$)/;

if (readme.includes(recentChangesHeader)) {
  // Section exists, add the new entry at the top of the list
  const match = readme.match(recentChangesRegex);
  
  if (match) {
    const existingEntries = match[1].trim();
    const entries = existingEntries ? existingEntries.split('\n') : [];
    
    // Check if this PR is already listed (to avoid duplicates)
    const isDuplicate = entries.some(entry => entry.includes(`#${prNumber}`));
    
    if (!isDuplicate) {
      // Add new entry at the top and keep only the last 10 entries
      entries.unshift(newEntry);
      const limitedEntries = entries.slice(0, 10);
      
      const updatedSection = `${recentChangesHeader}\n\n${limitedEntries.join('\n')}`;
      readme = readme.replace(recentChangesRegex, updatedSection);
      
      console.log('✓ Added new entry to existing Recent Changes section');
    } else {
      console.log('⚠ PR already exists in Recent Changes, skipping...');
      process.exit(0);
    }
  }
} else {
  // Section doesn't exist, create it after the main header
  // Try to match the first heading and its description (more generic pattern)
  const headerRegex = /(^# .*?\n\n.*?\n)/m;
  
  if (readme.match(headerRegex)) {
    const newSection = `\n${recentChangesHeader}\n\n${newEntry}\n`;
    readme = readme.replace(headerRegex, `$1${newSection}`);
    
    console.log('✓ Created new Recent Changes section');
  } else {
    // If no match, insert after first line
    const lines = readme.split('\n');
    if (lines.length > 0) {
      lines.splice(2, 0, '', recentChangesHeader, '', newEntry, '');
      readme = lines.join('\n');
      console.log('✓ Created new Recent Changes section (fallback method)');
    }
  }
}

// Write the updated README back to file
fs.writeFileSync(README_PATH, readme, 'utf8');

console.log('✓ README.md has been updated successfully!');
