<script lang="ts">
  import type { Task, ColumnId } from '$lib/types';

  let {
    item,
    columnId,
    isDragging = false,
    isReadOnly = false,
    isAdmin = false,
    onDragStart,
    onClick,
    onToggleLock
  }: {
    item: Task;
    columnId: ColumnId;
    isDragging?: boolean;
    isReadOnly?: boolean;
    isAdmin?: boolean;
    onDragStart: (e: DragEvent, item: Task, columnId: ColumnId) => void;
    onClick: (item: Task, columnId: ColumnId) => void;
    onToggleLock?: (itemId: number) => void;
  } = $props();

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
      <div class="item-header">
        <span class="item-type">{item.type}</span>
        {#if isAdmin}
          <button
            class="lock-toggle"
            onclick={handleLockToggle}
            aria-label={item.locked ? 'Unlock task' : 'Lock task'}
            title={item.locked ? 'Click to unlock task' : 'Click to lock task'}
          >
            {item.locked ? '🔒' : '🔓'}
          </button>
        {/if}
      </div>
  </div>
</div>

<style>
  .item {
    background: var(--bg-3);
    padding: 1rem;
    border-radius: 4px;
    cursor: grab;
    border: 2px solid transparent;
    transition: all 0.2s;
    position: relative;
    user-select: none;
  }
  
  .item.read-only {
    cursor: pointer;
    opacity: 0.8;
  }

  .item:not(.read-only):hover {
    border-color: #4CAF50;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .item:not(.read-only):focus {
    outline: 2px solid #4CAF50;
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
    font-size: 1.2rem;
    cursor: pointer;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.2s, transform 0.2s;
    z-index: 1;
  }

  .lock-toggle:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  .lock-toggle:focus {
    outline: 2px solid #4CAF50;
    outline-offset: 2px;
    border-radius: 4px;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-type {
    font-size: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    background: #e3f2fd;
    color: #1976d2;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .item-description {
    margin: 0;
    color: var(--fg-1);
    font-weight: 500;
    line-height: 1.4;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .item-images {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .item-image-thumb {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--bg-2);
    padding: 0;
    background: none;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
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
    border-radius: 4px;
    background: var(--bg-2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--fg-2);
  }
</style>
