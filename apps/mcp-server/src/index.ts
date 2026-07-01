#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import FormData from 'form-data';
import fetch from 'node-fetch';

const CONFIG_PATH = path.join(os.homedir(), '.republish-mcp.json');

interface Config {
  apiKey: string;
  baseUrl: string;
}

function loadConfig(): Config {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as Config;
  }
  return {
    apiKey: process.env.PUBLISH_API_KEY || '',
    baseUrl: process.env.PUBLISH_API_URL || 'http://localhost:3000/api',
  };
}

function saveConfig(config: Config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

async function apiRequest(config: Config, method: string, endpoint: string, body?: unknown) {
  const res = await fetch(`${config.baseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Publish-Api-Key': config.apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function uploadFiles(config: Config, filePaths: string[]) {
  const form = new FormData();
  for (const fp of filePaths) {
    if (fs.existsSync(fp)) {
      form.append('files', fs.createReadStream(fp));
    }
  }
  const res = await fetch(`${config.baseUrl}/media/upload`, {
    method: 'POST',
    headers: {
      'X-Publish-Api-Key': config.apiKey,
      ...form.getHeaders(),
    },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

const server = new McpServer({ name: 'republish', version: '0.1.0' });

server.registerTool(
  'publish_connect',
  {
    description: 'Connect to Publish API with API key and base URL',
    inputSchema: {
      apiKey: z.string().describe('Publish API key'),
      baseUrl: z.string().optional().describe('API base URL'),
    },
  },
  async ({ apiKey, baseUrl }) => {
    const config: Config = {
      apiKey,
      baseUrl: baseUrl || 'http://localhost:3000/api',
    };
    saveConfig(config);
    return {
      content: [{ type: 'text', text: JSON.stringify({ status: 'connected', baseUrl: config.baseUrl }) }],
    };
  },
);

server.registerTool(
  'publish_upload_media',
  {
    description: 'Upload local photos/videos to Publish',
    inputSchema: {
      filePaths: z.array(z.string()).describe('Local file paths'),
    },
  },
  async ({ filePaths }) => {
    const config = loadConfig();
    const result = await uploadFiles(config, filePaths);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  },
);

server.registerTool(
  'publish_generate_draft',
  {
    description: 'Generate a listing draft from prompt and optional media',
    inputSchema: {
      prompt: z.string().describe('Natural language description'),
      mediaUrls: z.array(z.string()).optional(),
      price: z.number().optional(),
      category: z.string().optional(),
    },
  },
  async ({ prompt, mediaUrls, price, category }) => {
    const config = loadConfig();
    const result = await apiRequest(config, 'POST', '/ai/generate-draft', {
      prompt,
      mediaUrls,
      price,
      category,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  'publish_preview_draft',
  {
    description: 'Preview a draft before publishing',
    inputSchema: { draftId: z.string() },
  },
  async ({ draftId }) => {
    const config = loadConfig();
    const result = await apiRequest(config, 'GET', `/drafts/${draftId}`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  'publish_update_draft',
  {
    description: 'Update draft fields before publishing',
    inputSchema: {
      draftId: z.string(),
      caption: z.string().optional(),
      price: z.number().optional(),
      hashtags: z.array(z.string()).optional(),
    },
  },
  async ({ draftId, caption, price, hashtags }) => {
    const config = loadConfig();
    const result = await apiRequest(config, 'PATCH', `/drafts/${draftId}`, {
      caption,
      price,
      hashtags,
    });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  'publish_confirm',
  {
    description: 'Publish draft — ONLY after explicit user confirmation',
    inputSchema: { draftId: z.string() },
  },
  async ({ draftId }) => {
    const config = loadConfig();
    const result = await apiRequest(config, 'POST', `/drafts/${draftId}/publish`, {});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  'publish_list_drafts',
  {
    description: 'List pending drafts',
    inputSchema: {},
  },
  async () => {
    const config = loadConfig();
    const result = await apiRequest(config, 'GET', '/drafts');
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  'publish_cancel_draft',
  {
    description: 'Cancel a draft',
    inputSchema: { draftId: z.string() },
  },
  async ({ draftId }) => {
    const config = loadConfig();
    const result = await apiRequest(config, 'DELETE', `/drafts/${draftId}`);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
