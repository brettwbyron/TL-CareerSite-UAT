<script lang="ts">
  import type { Column, Task, TaskType, ColumnId } from '$lib/types';
  import SearchFilters from './SearchFilters.svelte';
  import ColumnComponent from './Column.svelte';

  let {
    username,
    columns,
    isAdmin,
    searchQuery = $bindable<string>(''),
    filterType = $bindable<TaskType | 'All'>('All'),
    draggedItem = $bindable<Task | null>(null),
    dragOverColumn = $bindable<ColumnId | null>(null),
    disableAddTask = $bindable(false),
    onAddTask,
    onItemDragStart,
    onItemClick,
    onToggleLock,
    onDrop,
    onDragOver,
    onDragLeave
  }: {
    username: string;
    columns: Column[];
    isAdmin: boolean;
    searchQuery: string;
    filterType: TaskType | 'All';
    draggedItem: Task | null;
    dragOverColumn: ColumnId | null;
    disableAddTask: boolean;
    onAddTask: () => void;
    onItemDragStart: (e: DragEvent, item: Task, columnId: ColumnId) => void;
    onItemClick: (item: Task, columnId: ColumnId) => void;
    onToggleLock: (itemId: number) => void;
    onDrop: (e: DragEvent, columnId: ColumnId) => void;
    onDragOver: (e: DragEvent, columnId: ColumnId) => void;
    onDragLeave: () => void;
  } = $props();

  let filteredColumns = $derived(getFilteredColumns());

  function getFilteredColumns(): Column[] {
    return columns.map(column => ({
      ...column,
      items: column.items.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        return matchesSearch && matchesType;
      })
    }));
  }
</script>

<div class="container">
  <div class="account-info">
    {#if username}
      <h1>{username}</h1>
    {/if}
    {#if isAdmin}
      <div class="admin-controls">
        <label class="toggle-control">
          <input type="checkbox" bind:checked={disableAddTask} />
          <span>Disable new UAT items (Fixing stage)</span>
        </label>
      </div>
    {/if}
  </div>

  <SearchFilters bind:searchQuery bind:filterType {onAddTask} {disableAddTask} />

  <div class="columns" role="group" aria-label="Task board columns">
    {#each filteredColumns as column}
      <ColumnComponent
        {column}
        {isAdmin}
        isDragOver={dragOverColumn === column.id}
        draggedItemId={draggedItem?.id}
        {onDrop}
        {onDragOver}
        {onDragLeave}
        {onItemDragStart}
        {onItemClick}
        {onToggleLock}
      />
    {/each}
  </div>
</div>

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .account-info {
    margin-bottom: 2rem;
  }

  .account-info h1 {
    margin: 0;
    color: var(--fg-1);
    font-size: 2rem;
  }

  .admin-controls {
    margin-top: 1rem;
  }

  .toggle-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--fg-2);
    font-size: 0.95rem;
    cursor: pointer;
    user-select: none;
  }

  .toggle-control input[type="checkbox"] {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  .toggle-control:hover {
    color: var(--fg-1);
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .columns {
      grid-template-columns: 1fr;
    }
  }
</style>
