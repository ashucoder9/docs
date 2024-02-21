import fetch from 'node-fetch';

import fs from 'fs/promises';
import path from 'path';

const filesToFetch = [
  {
    url: 'https://raw.githubusercontent.com/ava-labs/teleporter/main/README.md',
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

async function fetchAndSaveMarkdown({ url, outputPath, customContent }) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch markdown file from ${url}`);

    let content = await response.text();

    content = customContent + content;

    await ensureDirectoryExistence(outputPath);
    await fs.writeFile(outputPath, content);
    console.log(`Markdown file from ${url} saved to ${outputPath}`);
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