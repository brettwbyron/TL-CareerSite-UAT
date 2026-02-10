import type { Column, ColumnId } from './types';
import { Octokit } from 'octokit';

const STORAGE_VERSION = '1.0';

// Focus trap action for modals
export function trapFocus(node: HTMLElement) {
  const previouslyFocused = document.activeElement as HTMLElement;

  function focusable() {
    return Array.from(
      node.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const current = document.activeElement;
    const elements = focusable();
    const first = elements[0];
    const last = elements[elements.length - 1];

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const elements = focusable();
  if (elements.length > 0) {
    elements[0].focus();
  }

  node.addEventListener('keydown', handleKeydown);

  return () => {
    node.removeEventListener('keydown', handleKeydown);
    if (previouslyFocused) {
      previouslyFocused.focus();
    }
  };
}

// SHA-256 password hashing
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get default empty columns
export function getDefaultColumns(): Column[] {
  return [
    { id: 'todo', title: 'To Do', items: [] },
    { id: 'inprogress', title: 'In Progress', items: [] },
    { id: 'retest', title: 'Re-Test', items: [] },
    { id: 'feedback', title: 'Feedback Needed', items: [] },
    { id: 'done', title: 'Done', items: [] }
  ];
}

// GitHub API functions
export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface BoardData {
  passwordHash: string;
  version: string;
  columns: Column[];
  disableAddTask: boolean
}

export async function listAllDataFromGitHub(
  octokit: Octokit,
  config: GitHubConfig
) {
  try {
    const response = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: 'data',
      ref: config.branch
    });

    const dataFiles = response.data;
    
    if (!Array.isArray(dataFiles)) {
      console.error('Expected array of files but received:', typeof dataFiles);
      return false;
    }
    
    return dataFiles.filter(file => file.name !== '.gitkeep');
  } catch (error) {
    console.error('Error loading customer list:', error);
    return false;
  }
}

export async function loadDataFromGitHub(
  octokit: Octokit,
  config: GitHubConfig,
  customerId: string,
  password: string
): Promise<{ success: boolean; data?: Column[]; error?: string; isNew?: boolean; sha?: string; passwordHash?: string; disableAddTask?: boolean }> {
  try {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: `data/${customerId.toLowerCase()}.json`,
      ref: config.branch
    });

    if (Array.isArray(fileData) || !('content' in fileData)) {
      throw new Error('Unexpected response format');
    }

    // Decode base64 content
    const content: BoardData = JSON.parse(atob(fileData.content));

    // Verify password
    const inputHash = await hashPassword(password);
    if (content.passwordHash !== inputHash) {
      return { success: false, error: 'Incorrect password' };
    }

    // Validate data format
    if (content.version === STORAGE_VERSION && content.columns) {
      // Merge loaded data with default columns structure
      const defaultColumns = getDefaultColumns();
      const mergedColumns = defaultColumns.map(defaultCol => {
        const loadedCol = content.columns.find(col => col.id === defaultCol.id);
        return {
          ...defaultCol,
          items: loadedCol?.items || []
        };
      });
      
      return { 
        success: true, 
        data: mergedColumns,
        isNew: false,
        sha: fileData.sha,
        passwordHash: content.passwordHash,
        disableAddTask: content.disableAddTask || false
      };
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error: any) {
    if (error.status === 404) {
      return {
        success: false
      };
    }

    console.error('Failed to load data:', error);
    return { 
      success: false, 
      error: 'Failed to load data. Check configuration.' 
    };
  }
}

export async function saveDataToGitHub(
  octokit: Octokit,
  config: GitHubConfig,
  customerId: string,
  data: BoardData,
  message: string = 'Update board data',
  fileSha?: string | null
): Promise<{ success: boolean; sha?: string; error?: string }> {
  try {
    const params: any = {
      owner: config.owner,
      repo: config.repo,
      path: `data/${customerId.toLowerCase()}.json`,
      message,
      content: btoa(JSON.stringify(data, null, 2)),
      branch: config.branch
    };

    if (fileSha) {
      params.sha = fileSha;
    }

    const { data: result } = await octokit.rest.repos.createOrUpdateFileContents(params);
    return { 
      success: true, 
      sha: result.content?.sha
    };
  } catch (error) {
    console.error('Failed to save data:', error);
    return { 
      success: false, 
      error: 'Failed to save data to GitHub' 
    };
  }
}

export async function loadDataFromGitHubAdmin(
  octokit: Octokit,
  config: GitHubConfig,
  customerId: string
): Promise<{ success: boolean; data?: Column[]; error?: string; sha?: string; passwordHash?: string; disableAddTask?: boolean }> {
  try {
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: `data/${customerId.toLowerCase()}.json`,
      ref: config.branch
    });

    if (Array.isArray(fileData) || !('content' in fileData)) {
      throw new Error('Unexpected response format');
    }

    // Decode base64 content
    const content: BoardData = JSON.parse(atob(fileData.content));

    // Validate data format
    if (content.version === STORAGE_VERSION && content.columns) {
      // Merge loaded data with default columns structure
      const defaultColumns = getDefaultColumns();
      const mergedColumns = defaultColumns.map(defaultCol => {
        const loadedCol = content.columns.find(col => col.id === defaultCol.id);
        return {
          ...defaultCol,
          items: loadedCol?.items || []
        };
      });
      
      return { 
        success: true, 
        data: mergedColumns,
        sha: fileData.sha,
        passwordHash: content.passwordHash,
        disableAddTask: content.disableAddTask || false
      };
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error: any) {
    console.error('Failed to load data:', error);
    return { 
      success: false, 
      error: 'Failed to load data. Check configuration.' 
    };
  }
}

export async function deleteDataFromGitHub(
  octokit: Octokit,
  config: GitHubConfig,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the file to get its SHA
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: `data/${customerId.toLowerCase()}.json`,
      ref: config.branch
    });

    if (Array.isArray(fileData) || !('sha' in fileData)) {
      throw new Error('Unexpected response format');
    }

    // Delete the file
    await octokit.rest.repos.deleteFile({
      owner: config.owner,
      repo: config.repo,
      path: `data/${customerId.toLowerCase()}.json`,
      message: `Delete customer: ${customerId}`,
      sha: fileData.sha,
      branch: config.branch
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete data:', error);
    return { 
      success: false, 
      error: 'Failed to delete customer data from GitHub' 
    };
  }
}
