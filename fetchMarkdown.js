import fetch from 'node-fetch';

import fs from 'fs/promises';
import path from 'path';

const filesToFetch = [
  {
    rawUrl: 'https://raw.githubusercontent.com/ava-labs/teleporter/main/README.md', //mention full URL with file name
    baseRepoUrl: 'https://github.com/ava-labs/teleporter/blob/main/', //mention base repo URL on github.com
    outputPath: './Teleporter/deep-dive.mdx',
    customContent: `---
tags: [Avalanche Warp Messaging, AWM, Cross-Subnet Communication, Cross-Chain Communication]
description: Avalanche Warp Messaging (AWM) provides a primitive for cross-subnet communication on the Avalanche Network.
keywords: [ docs, documentation, avalanche, awm, cross-subnet communication, cross-chain, cross-chain communication ]
sidebar_label: Deep Dive
sidebar_position: 1
title: Teleporter Deep Dive
---\n\n`
  }
];

async function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirname, { recursive: true });
    }
  }
}

// Function to resolve relative links with absolute links
function resolveRelativeLinks(content, baseRepoUrl) {
  const markdownLinkRegex = /!\[.*?\]\((.*?)\)|\[.*?\]\((.*?)\)/g;

  // Prefix relative links with baseRepoUrl
  return content.replace(markdownLinkRegex, (match, imagePath, linkPath) => {
    const relativePath = imagePath || linkPath;

    if (!relativePath.startsWith('http')) {
      // Ensure the baseRepoUrl format is correct for appending relative paths
      const formattedBaseRepoUrl = baseRepoUrl.endsWith('/') ? baseRepoUrl : `${baseRepoUrl}/`;
      return match.replace(relativePath, formattedBaseRepoUrl + relativePath);
    }

    return match;
  });
}

async function fetchAndSaveMarkdown({ rawUrl, baseRepoUrl, outputPath, customContent }) {
  try {
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error(`Failed to fetch markdown file from ${rawUrl}`);

    let content = await response.text();

    // Prepend custom content to the fetched content
    content = customContent + content;

    // Directly resolve relative links using baseRepoUrl
    content = resolveRelativeLinks(content, baseRepoUrl);

    await ensureDirectoryExistence(outputPath);
    await fs.writeFile(outputPath, content);
    console.log(`Markdown file fetched from ${rawUrl} and saved to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function processMarkdownFiles() {
  for (const file of filesToFetch) {
    await fetchAndSaveMarkdown(file);
  }
}

processMarkdownFiles();