<script lang="ts">
  import type { Column, Task, ColumnId } from '$lib/types';
  import TaskCard from './TaskCard.svelte';

  let {
    column,
    isAdmin = false,
    isDragOver = false,
    draggedItemId = null,
    variant = 'default',
    onDrop,
    onDragOver,
    onDragLeave,
    onItemDragStart,
    onItemClick,
    onToggleLock
  }: {
    column: Column;
    isAdmin?: boolean;
    isDragOver?: boolean;
    draggedItemId?: number | null;
    variant?: 'default' | 'alert' | 'warning' | 'info' | 'success' | 'subtle';
    onDrop: (e: DragEvent, columnId: ColumnId) => void;
    onDragOver: (e: DragEvent, columnId: ColumnId) => void;
    onDragLeave: () => void;
    onItemDragStart: (e: DragEvent, item: Task, columnId: ColumnId) => void;
    onItemClick: (item: Task, columnId: ColumnId) => void;
    onToggleLock: (itemId: number) => void;
  } = $props();
  
  // Separate drag and drop restrictions for non-admins
  // In Progress: can't drag from OR drop to
  // Re-Test: can drag from, but can't drop to
  // Done: can't drag from, but can drop to
  const isDragDisabled = $derived(!isAdmin && (column.id === 'inprogress'));
  const isDropDisabled = $derived(!isAdmin && (column.id === 'inprogress' || column.id === 'retest' || column.id === 'feedback'));
</script>

<div 
  class="column"
  class:drag-over={isDragOver && !isDropDisabled}
  class:drop-disabled={isDropDisabled}
  class:alert={variant === 'alert'}
  class:warning={variant === 'warning'}
  class:info={variant === 'info'}
  class:success={variant === 'success'}
  class:subtle={variant === 'subtle'}
  role="region"
  aria-label="{column.title} column"
  ondrop={(e) => !isDropDisabled && onDrop(e, column.id)}
  ondragover={(e) => !isDropDisabled && onDragOver(e, column.id)}
  ondragleave={onDragLeave}
>
  <h2>
    <span>
      {#if variant === 'alert'}
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      {/if}
      {#if variant === 'warning'}
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      {/if}
      {#if variant === 'info'}
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
      {/if}
      {#if variant === 'success'}
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      {/if}
      {#if variant === 'subtle'}
        {#if column.id === 'cancelled'}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        {:else}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        {/if}
      {/if}
      {column.title}
      <span class="count">({column.items.length})</span>
    </span>
    {#if isDropDisabled || isDragDisabled}
      <span class="admin-only" title="Cannot {isDropDisabled ? `${isDragDisabled ? 'drag or ' : ''}drop to` : 'drag from'} this column">🔒</span>
    {/if}
  </h2>
  <div class="items" role="list" aria-label="{column.title} tasks">
    {#if column.items.length === 0}
      <div class="empty-state">
        <p>No tasks here</p>
      </div>
    {:else}
      {#each column.items as item (item.id)}
        <TaskCard
          {item}
          columnId={column.id}
          {isAdmin}
          isDragging={draggedItemId === item.id}
          isReadOnly={isDragDisabled}
          onDragStart={onItemDragStart}
          onClick={onItemClick}
          onToggleLock={onToggleLock}
        />
      {/each}
    {/if}
  </div>
</div>

<style>
  .column {
    background: var(--bg-2);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    min-height: 400px;
    transition: background 0.2s;
  }

  .column.alert,
  .column.warning,
  .column.info,
  .column.success {
    min-height: auto;
  }

  .column.subtle {
    min-height: auto;
  }

  .column.drag-over {
    background: #e8f5e9;
    border: 2px dashed #4CAF50;
  }

  .column h2 {
    margin: 0 0 1rem 0;
    color: var(--fg-1);
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  
  .column h2 span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .column h2 .icon {
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;
  }

  .column.alert {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    border: 2px solid #f44336;
    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.15);
  }

  .column.alert h2 {
    color: #c62828;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .column.alert h2 .count,
  .column.alert h2 .admin-only {
    color: #b71c1c;
  }

  .column.warning {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border: 2px solid #ff9800;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15);
  }

  .column.warning h2 {
    color: #e65100;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .column.warning h2 .count,
  .column.warning h2 .admin-only {
    color: #d84315;
  }

  .column.info {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 2px solid #2196F3;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  }

  .column.info h2 {
    color: #1565c0;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .column.info h2 .count,
  .column.info h2 .admin-only {
    color: #0d47a1;
  }

  .column.success {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border: 2px solid #4CAF50;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
  }

  .column.success h2 {
    color: #2e7d32;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .column.success h2 .count,
  .column.success h2 .admin-only {
    color: #1b5e20;
  }

  .column.subtle {
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    opacity: 0.7;
  }

  .column.subtle h2 {
    color: var(--fg-2);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .count {
    font-size: 1rem;
    color: var(--fg-2);
    font-weight: normal;
  }
  
  .admin-only {
    font-size: 0.9rem;
    opacity: 0.7;
  }
  
  .column.drop-disabled {
    opacity: 0.85;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
  }

  .column.subtle .items {
    flex-direction: row;
    flex-wrap: wrap;
    flex: 1;
  }

  .column.subtle .items :global(.task-card) {
    max-width: 300px;
    flex: 0 1 auto;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--fg-2);
    font-style: italic;
  }

  .empty-state p {
    margin: 0;
  }

  /* Dark mode adjustments */
  :global(html.dark) .column {
    background: rgba(76, 76, 76, 0.5);
  }

  :global(html.dark) .column.alert {
    background: linear-gradient(135deg, rgba(255, 235, 238, 0.15) 0%, rgba(255, 205, 210, 0.15) 100%);
    border-color: rgba(244, 67, 54, 0.6);
  }

  :global(html.dark) .column.warning {
    background: linear-gradient(135deg, rgba(255, 243, 224, 0.15) 0%, rgba(255, 224, 178, 0.15) 100%);
    border-color: rgba(255, 152, 0, 0.6);
  }

  :global(html.dark) .column.info {
    background: linear-gradient(135deg, rgba(227, 242, 253, 0.15) 0%, rgba(187, 222, 251, 0.15) 100%);
    border-color: rgba(33, 150, 243, 0.6);
  }

  :global(html.dark) .column.success {
    background: linear-gradient(135deg, rgba(232, 245, 233, 0.15) 0%, rgba(200, 230, 201, 0.15) 100%);
    border-color: rgba(76, 175, 80, 0.6);
  }

  :global(html.dark) .column.subtle {
    background: rgba(76, 76, 76, 0.3);
    border-color: rgba(102, 102, 102, 0.5);
  }

  :global(html.dark) .column.alert h2,
  :global(html.dark) .column.alert h2 .count,
  :global(html.dark) .column.alert h2 .admin-only {
    color: #ffcdd2;
  }

  :global(html.dark) .column.warning h2,
  :global(html.dark) .column.warning h2 .count,
  :global(html.dark) .column.warning h2 .admin-only {
    color: #ffe0b2;
  }

  :global(html.dark) .column.info h2,
  :global(html.dark) .column.info h2 .count,
  :global(html.dark) .column.info h2 .admin-only {
    color: #bbdefb;
  }

  :global(html.dark) .column.success h2,
  :global(html.dark) .column.success h2 .count,
  :global(html.dark) .column.success h2 .admin-only {
    color: #c8e6c9;
  }
</style>
