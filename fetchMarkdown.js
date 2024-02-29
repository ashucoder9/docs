import fetch from 'node-fetch';

import fs from 'fs/promises';
import path from 'path';

const filesToFetch = [
  {
    rawUrl: 'https://raw.githubusercontent.com/ava-labs/avalanchego/master/vms/platformvm/warp/README.md',
    baseRepoUrl: 'https://github.com/ava-labs/avalanchego/tree/master/vms/platformvm/warp/',
    outputPath: './cross-chain/awm/deep-dive.mdx',
    customContent: `---
title: Deep Dive into AWM
sidebarTitle: Deep Dive
icon: searchengin
---\n\n`
  },
  {
    rawUrl: 'https://raw.githubusercontent.com/meaghanfitzgerald/coreth/docs-integration/precompile/contracts/warp/README.md',
    baseRepoUrl: 'https://github.com/ava-labs/coreth/blob/master/precompile/contracts/warp/',
    outputPath: './cross-chain/awm/evm-integration.mdx',
    customContent: `---
title: EVM Integration
description: Avalanche Warp Messaging provides a basic primitive for signing and verifying messages between Subnets. The receiving network can verify whether an aggregation of signatures from a set of source Subnet validators represents a threshold of stake large enough for the receiving network to process the message. The Avalanche Warp Precompile enables this flow to send a message from blockchain A to blockchain B.
sidebarTitle: EVM Integration
icon: hive
---\n\n`
  },
  {
    rawUrl: 'https://raw.githubusercontent.com/ava-labs/teleporter/main/contracts/src/Teleporter/README.md',
    baseRepoUrl: 'https://github.com/ava-labs/teleporter/blob/main/contracts/src/Teleporter/',
    outputPath: './cross-chain/Teleporter/overview.mdx',
    customContent: `---
title: Overview
description: Teleporter is a messaging protocol built on top of Avalanche Warp Messaging that provides a developer-friendly interface for sending and receiving cross-chain messages from within the EVM.
sidebarTitle: Overview
icon: arrow-right-to-arc
---\n\n`
  },
  {
    rawUrl: 'https://raw.githubusercontent.com/ava-labs/teleporter/main/README.md',
    baseRepoUrl: 'https://github.com/ava-labs/teleporter/blob/main/',
    outputPath: './cross-chain/Teleporter/deep-dive.mdx',
    customContent: `---
title: Deep Dive into the Teleporter Protocol
sidebarTitle: Deep Dive
icon: searchengin
---\n\n`
  },
  {
    rawUrl: 'https://raw.githubusercontent.com/ava-labs/teleporter/main/contracts/src/CrossChainApplications/README.md',
    baseRepoUrl: 'https://github.com/ava-labs/teleporter/blob/main/contracts/src/CrossChainApplications/',
    outputPath: './cross-chain/Teleporter/examples.mdx',
    customContent: `---
sidebarTitle: Examples
icon: window
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