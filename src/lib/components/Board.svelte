<script lang="ts">
  import type { Column, Task, TaskType, ColumnId } from '$lib/types';
  import SearchFilters from './SearchFilters.svelte';
  import ColumnComponent from './Column.svelte';

  let {
    displayName,
    uatEndDate,
    devSiteUrl,
    customerId,
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
    onDragLeave,
    onUpdateAccountInfo,
    onSave
  }: {
    displayName: string;
    uatEndDate: string;
    devSiteUrl: string;
    customerId: string;
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
    onUpdateAccountInfo?: (displayName: string, uatEndDate: string, devSiteUrl: string, password: string) => void;
    onSave?: () => void;
  } = $props();

  let filteredColumns = $derived(getFilteredColumns());
  
  let isEditingAccountInfo = $state(false);
  let editDisplayName = $state('');
  let editUatEndDate = $state('');
  let editDevSiteUrl = $state('');
  let editPassword = $state('');
  
  let daysRemaining = $derived.by(() => {
    if (!uatEndDate) return null;
    // Parse as local date to avoid timezone issues
    const dateStr = uatEndDate.split('T')[0]; // Get just YYYY-MM-DD part
    const [year, month, day] = dateStr.split('-').map(Number);
    const endDate = new Date(year, month - 1, day); // month is 0-indexed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  });
  
  let isUatEndingSoon = $derived(daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0);

  function getFilteredColumns(): Column[] {
    const filtered = columns.map(column => ({
      ...column,
      items: column.items.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        return matchesSearch && matchesType;
      })
    }));
    
    // Hide empty admin-restricted columns for non-admin users
    if (!isAdmin) {
      const adminRestrictedColumns: ColumnId[] = ['feedback', 'inprogress', 'retest', 'cancelled'];
      return filtered.filter(column => {
        if (adminRestrictedColumns.includes(column.id)) {
          return column.items.length > 0;
        }
        return true;
      });
    }
    
    return filtered;
  }
  
  // Separate feedback, re-test, in progress, and cancelled columns from main columns
  let feedbackColumn = $derived(filteredColumns.find(col => col.id === 'feedback'));
  let retestColumn = $derived(filteredColumns.find(col => col.id === 'retest'));
  let inProgressColumn = $derived(filteredColumns.find(col => col.id === 'inprogress'));
  let cancelledColumn = $derived(filteredColumns.find(col => col.id === 'cancelled'));
  let mainColumns = $derived(filteredColumns.filter(col => col.id !== 'feedback' && col.id !== 'retest' && col.id !== 'inprogress' && col.id !== 'cancelled'));
  
  // Get variant for each column
  function getColumnVariant(columnId: ColumnId): 'default' | 'alert' | 'warning' | 'info' | 'success' | 'subtle' {
    if (columnId === 'feedback') return 'alert';
    if (columnId === 'retest') return 'warning';
    if (columnId === 'todo') return 'info';
    if (columnId === 'done') return 'success';
    if (columnId === 'inprogress' || columnId === 'cancelled') return 'subtle';
    return 'default';
  }
  
  function startEditingAccountInfo() {
    editDisplayName = displayName;
    // Extract just the YYYY-MM-DD part
    editUatEndDate = uatEndDate ? uatEndDate.split('T')[0] : '';
    editDevSiteUrl = devSiteUrl;
    editPassword = ''; // Always start empty for security
    isEditingAccountInfo = true;
  }
  
  function cancelEditingAccountInfo() {
    isEditingAccountInfo = false;
    editPassword = ''; // Clear password for security
  }
  
  function saveAccountInfo() {
    if (onUpdateAccountInfo) {
      // Store as YYYY-MM-DD format (no time component to avoid timezone issues)
      onUpdateAccountInfo(editDisplayName, editUatEndDate, editDevSiteUrl, editPassword);
    }
    isEditingAccountInfo = false;
    editPassword = ''; // Clear password for security
  }
</script>

<div class="container">
  <div class="account-info">
    {#if isEditingAccountInfo && isAdmin}
      <div class="edit-account-form">
        <div class="form-group">
          <label for="edit-display-name">Display Name</label>
          <input
            id="edit-display-name"
            type="text"
            bind:value={editDisplayName}
            placeholder="Customer Display Name"
          />
        </div>
        
        <div class="form-group">
          <label for="edit-uat-date">UAT Review Deadline</label>
          <input
            id="edit-uat-date"
            type="date"
            bind:value={editUatEndDate}
          />
        </div>
        
        <div class="form-group">
          <label for="edit-dev-url">Dev URL</label>
          <input
            id="edit-dev-url"
            type="text"
            bind:value={editDevSiteUrl}
            placeholder="customercareers-dev.ttcportals.com"
          />
        </div>
        
        <div class="form-group">
          <label for="edit-password">New Password (leave blank to keep current)</label>
          <input
            id="edit-password"
            type="password"
            bind:value={editPassword}
            placeholder="Enter new password"
            autocomplete="new-password"
          />
        </div>
        
        <div class="form-actions">
          <button class="save-btn" onclick={saveAccountInfo}>Save</button>
          <button class="cancel-btn" onclick={cancelEditingAccountInfo}>Cancel</button>
        </div>
      </div>
    {:else}
      <div class="header-container">
        <h1>{displayName || customerId}</h1>
        {#if isAdmin}
          <button class="edit-account-btn" onclick={startEditingAccountInfo}>Edit Account Info</button>
        {/if}
      </div>
      <div class="header-container">
        {#if uatEndDate}
          <span class="uat-end-date" class:warning={isUatEndingSoon}>
            UAT Review Deadline: {(() => {
              const dateStr = uatEndDate.split('T')[0];
              const [year, month, day] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day).toLocaleDateString();
            })()}
            {#if daysRemaining !== null && daysRemaining >= 0}
              ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining)
            {/if}
          </span>
        {/if}
        {#if devSiteUrl}
          <a href={devSiteUrl.startsWith('http') ? devSiteUrl : `https://${devSiteUrl}`} target="_blank" rel="noopener noreferrer" class="dev-site-link">
            View Dev Site
          </a>
        {/if}
      </div>
    {/if}
    {#if isAdmin}
      <div class="admin-controls">
        <label class="toggle-control">
          <input type="checkbox" bind:checked={disableAddTask} onchange={() => onSave?.()} />
          <span>Disable new UAT items (Fixing stage)</span>
        </label>
      </div>
    {/if}
  </div>

  <SearchFilters bind:searchQuery bind:filterType {onAddTask} {disableAddTask} />

  <div class="top-columns">
    {#if feedbackColumn && (isAdmin || feedbackColumn.items.length > 0)}
      <div class="feedback-section">
        <ColumnComponent
          column={feedbackColumn}
          {isAdmin}
          variant={getColumnVariant(feedbackColumn.id)}
          isDragOver={dragOverColumn === feedbackColumn.id}
          draggedItemId={draggedItem?.id}
          {onDrop}
          {onDragOver}
          {onDragLeave}
          {onItemDragStart}
          {onItemClick}
          {onToggleLock}
        />
      </div>
    {/if}

    {#if retestColumn && (isAdmin || retestColumn.items.length > 0)}
      <div class="retest-section">
        <ColumnComponent
          column={retestColumn}
          {isAdmin}
          variant={getColumnVariant(retestColumn.id)}
          isDragOver={dragOverColumn === retestColumn.id}
          draggedItemId={draggedItem?.id}
          {onDrop}
          {onDragOver}
          {onDragLeave}
          {onItemDragStart}
          {onItemClick}
          {onToggleLock}
        />
      </div>
    {/if}
  </div>

  <div class="columns" role="group" aria-label="Task board columns">
    {#each mainColumns as column}
      <ColumnComponent
        {column}
        {isAdmin}
        variant={getColumnVariant(column.id)}
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

  <div class="bottom-columns">
    {#if inProgressColumn && (isAdmin || inProgressColumn.items.length > 0)}
      <ColumnComponent
        column={inProgressColumn}
        {isAdmin}
        variant="subtle"
        isDragOver={dragOverColumn === inProgressColumn.id}
        draggedItemId={draggedItem?.id}
        {onDrop}
        {onDragOver}
        {onDragLeave}
        {onItemDragStart}
        {onItemClick}
        {onToggleLock}
      />
    {/if}
    
    {#if cancelledColumn && (isAdmin || cancelledColumn.items.length > 0)}
      <ColumnComponent
        column={cancelledColumn}
        {isAdmin}
        variant="subtle"
        isDragOver={dragOverColumn === cancelledColumn.id}
        draggedItemId={draggedItem?.id}
        {onDrop}
        {onDragOver}
        {onDragLeave}
        {onItemDragStart}
        {onItemClick}
        {onToggleLock}
      />
    {/if}
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
    gap: 1em;
    display: flex;
    flex-direction: column;
  }

  .account-info h1 {
    margin: 0;
    color: var(--fg-1);
    font-size: 2rem;
  }

  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .uat-end-date {
    color: var(--fg-2);
    font-size: 1rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    background: var(--bg-2);
    border-radius: 4px;
    border: 1px solid var(--bg-3);
  }

  .uat-end-date.warning {
    background: #fff3e0;
    color: #e65100;
    border-color: #e65100;
  }

  .dev-site-link {
    color: white;
    background: #4CAF50;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.2s;
    display: inline-block;
  }

  .dev-site-link:hover {
    background: #45a049;
  }

  .edit-account-btn {
    padding: 0.5rem 1rem;
    background: var(--bg-2);
    color: var(--fg-1);
    border: 2px solid var(--bg-3);
    border-radius: 4px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-account-btn:hover {
    background: var(--bg-3);
    border-color: #4CAF50;
  }

  .edit-account-form {
    background: var(--bg-2);
    padding: 1.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--fg-1);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid var(--bg-3);
    border-radius: 4px;
    font-size: 1rem;
    background: var(--bg-1);
    color: var(--fg-1);
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .save-btn,
  .cancel-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .save-btn {
    background: #4CAF50;
    color: white;
  }

  .save-btn:hover {
    background: #45a049;
  }

  .cancel-btn {
    background: var(--bg-3);
    color: var(--fg-1);
  }

  .cancel-btn:hover {
    background: var(--bg-1);
  }

  .admin-controls {
    margin-top: 1rem;
    width: fit-content;
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

  .top-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    align-items: stretch;
  }

  .top-columns > div > :global(.column) {
    min-height: auto;
  }

  .feedback-section {
    grid-column: span 1;
    min-width: 0;
    display: flex;
  }

  .feedback-section > :global(.column) {
    flex: 1;
  }

  .retest-section {
    grid-column: span 1;
    min-width: 0;
    display: flex;
  }

  .retest-section > :global(.column) {
    flex: 1;
  }

  .bottom-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
    align-items: stretch;
  }

  .bottom-columns > :global(.column) {
    min-height: auto;
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .top-columns {
      flex-direction: column;
    }

    .columns {
      grid-template-columns: 1fr;
    }
  }
</style>
