<script lang="ts">
  import type { TaskType } from '$lib/types';

  let {
    searchQuery = $bindable<string>(''),
    filterType = $bindable<TaskType | 'All'>('All'),
    disableAddTask = false,
    onAddTask
  }: {
    searchQuery: string;
    filterType: TaskType | 'All';
    disableAddTask?: boolean;
    onAddTask: () => void;
  } = $props();
</script>

<div class="header-controls">
  <div class="search-filters">
    <input 
      type="text" 
      class="search-input" 
      placeholder="Search tasks..." 
      bind:value={searchQuery}
    />
  </div>

  <div class="action-buttons">
    <button 
      class="add-task-btn" 
      onclick={onAddTask}
      disabled={disableAddTask}
      title={disableAddTask ? 'UAT item creation disabled - The UAT process is now in the Fixing stage where created items are being worked on. No new items can be added at this time.' : 'Add a new task'}
    >
      + Add Task
    </button>
  </div>
</div>

<style>
  .header-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .search-filters {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .search-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid var(--bg-3);
    border-radius: 4px;
    font-size: 1rem;
    background: var(--bg-2);
    color: var(--fg-1);
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .add-task-btn {
    padding: 0.75rem 1.5rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .add-task-btn:hover {
    background: #45a049;
  }

  .add-task-btn:disabled {
    background: #9e9e9e;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .add-task-btn:disabled:hover {
    background: #9e9e9e;
  }

  @media (max-width: 768px) {
    .header-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .search-filters {
      flex-direction: column;
    }
  }
</style>
