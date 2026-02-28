<script lang="ts">
  import type { Task, ColumnId } from '$lib/types';

  let {
    item,
    columnId,
    isDragging = false,
    isReadOnly = false,
    isAdmin = false,
    displayName = '',
    onDragStart,
    onClick,
    onToggleLock
  }: {
    item: Task;
    columnId: ColumnId;
    isDragging?: boolean;
    isReadOnly?: boolean;
    isAdmin?: boolean;
    displayName?: string;
    onDragStart: (e: DragEvent, item: Task, columnId: ColumnId) => void;
    onClick: (item: Task, columnId: ColumnId) => void;
    onToggleLock?: (itemId: number) => void;
  } = $props();
  
  // Display owner value - show display name if owner is 'Account'
  const ownerDisplay = $derived(item.owner === 'Account' ? (displayName || 'Account') : item.owner);

  function handleDragStart(e: DragEvent) {
    if (isReadOnly) {
      e.preventDefault();
      return;
    }
    onDragStart(e, item, columnId);
  }

  function handleClick() {
    // Always allow clicking to view the task
    onClick(item, columnId);
  }

  function handleKeydown(e: KeyboardEvent) {
    // Always allow keyboard access to view the task
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      onClick(item, columnId);
    }
  }

  function handleLockToggle(e: MouseEvent) {
    e.stopPropagation();
    if (onToggleLock) {
      onToggleLock(item.id);
    }
  }
</script>

<div 
  class="item"
  class:being-dragged={isDragging}
  class:read-only={isReadOnly}
  role="button"
  draggable={!isReadOnly}
  tabindex="0"
  aria-label="Task: {item.description}. Type: {item.type}. {isReadOnly ? 'Click to view (read-only). Drag disabled.' : 'Click to edit, drag to move.'}"
  ondragstart={handleDragStart}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  <div class="item-content">
      <p class="item-description">{item.description}</p>
      {#if item.owner || (item.feedback && item.feedback.length > 0)}
        <div class="item-owner-row">
          {#if item.owner}
            <div class="item-owner">
              <span class="owner-label">Owner:</span>
              <span 
                class="owner-value" 
                class:owner-developer={item.owner === 'Developer'}
                class:owner-pm={item.owner === 'PM'}
                class:owner-account={item.owner === 'Account'}
              >{ownerDisplay}</span>
            </div>
          {/if}
          {#if item.feedback && item.feedback.length > 0}
            <div class="item-feedback-badge">
              <span class="feedback-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>
              <span class="feedback-count">{item.feedback.length}</span>
            </div>
          {/if}
        </div>
      {/if}
      {#if item.images && item.images.length > 0}
        <div class="item-images">
          {#each item.images.slice(0, 3) as image, index}
            <button
              class="item-image-thumb"
              aria-label="View image {index + 1}"
              type="button"
            >
              <img src={image} alt="Attachment {index + 1}" />
            </button>
          {/each}
          {#if item.images.length > 3}
            <div class="item-image-more">
              +{item.images.length - 3}
            </div>
          {/if}
        </div>
      {/if}
      {#if item.type || isAdmin}
         <div class="item-header">
           {#if item.type}
              <span 
                class="item-type"
                class:item-type-change={item.type === "Change Request"}
                class:item-type-feature={item.type === "Feature"}
                class:item-type-issue={item.type === "Issue"}>
                {item.type}
              </span>
           {:else}
              <span class="item-type-none"></span>
           {/if}
           {#if isAdmin}
              <button
                class="lock-toggle"
                class:lock-toggle-locked={item.locked}
                onclick={handleLockToggle}
                aria-label={item.locked ? 'Unlock task' : 'Lock task'}
                title={item.locked ? 'Click to unlock task' : 'Click to lock task'}
              >
                {#if item.locked}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect fill="currentColor" x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                {:else}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                {/if}
              </button>
           {/if}
         </div>
      {/if}
  </div>
</div>

<style>
  .item {
    background: var(--bg-2);
    padding: 1.125rem;
    border-radius: var(--border-radius);
    cursor: grab;
    border: 1px solid var(--bg-3);
    transition: all 0.2s;
    position: relative;
    user-select: none;
    box-shadow: var(--shadow-sm);
  }
  
  .item.read-only {
    cursor: pointer;
    opacity: 0.85;
  }

  .item:not(.read-only):hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .item:not(.read-only):focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .item.being-dragged {
    opacity: 0.5;
    cursor: grabbing;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .lock-toggle {
    background: none;
    border: none;
    cursor: pointer;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.2s, transform 0.2s;
    z-index: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.9rem;
  }

  .lock-toggle:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  .lock-toggle:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--border-radius);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-type {
    font-size: 0.625rem;
    padding: 0.375rem 0.875rem;
    border-radius: 16px;
    background: var(--bg-3);
    color: var(--fg-2);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .item-type-change {
    background: var(--primary-bg);
    color: var(--primary-fg);
  }
  
  .item-type-feature {
    background: var(--warning-bg);
    color: var(--warning-fg);
  }

  .item-type-issue {
    background: var(--error-bg);
    color: var(--error-fg);
  }

  .item-description {
    margin: 0;
    color: var(--fg-1);
    font-weight: 500;
    line-height: 1.5;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .item-owner-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .item-owner {
    display: flex;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--fg-2);
  }

  .owner-label {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .owner-value {
    font-weight: 500;
  }

  /* Developer - info colors */
  .owner-value.owner-developer {
    color: var(--info-fg);
  }

  /* PM - warning colors */
  .owner-value.owner-pm {
    color: var(--warning-fg);
  }

  /* Account - error colors */
  .owner-value.owner-account {
    color: var(--error-fg);
  }

  .item-images {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .item-image-thumb {
    width: 50px;
    height: 50px;
    border-radius: var(--border-radius);
    overflow: hidden;
    border: 1px solid var(--bg-3);
    padding: 0;
    background: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: var(--shadow-sm);
  }

  .item-image-thumb:hover {
    transform: scale(1.05);
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
  }

  .item-image-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .item-image-more {
    width: 50px;
    height: 50px;
    border-radius: var(--border-radius);
    background: var(--bg-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--fg-2);
    border: 1px solid var(--bg-3);
  }

  .item-feedback-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--fg-2);
    position: relative;
    width: 1em;
    padding-right: 0.5rem;
    padding-top: 0.4rem;
  }

  .feedback-icon {
    width: 0.8rem;
    height: 0.8rem;
    flex-shrink: 0;
  }

  .feedback-count {
    font-weight: 600;
    height: 1em;
    font-size: 0.7rem;
    width: auto;
    background-color: var(--bg-2);
    transition: var(--global-transition);
    position: absolute;
    top: 0;
    left: calc(100% - 1em);
    padding: 1px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
