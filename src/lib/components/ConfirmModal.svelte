<script lang="ts">
  import { trapFocus } from '$lib/utils';

  import ButtonComponent from '$lib/components/Button.svelte';

  let {
    show = false,
    type = 'delete', // 'delete' | 'unsaved'
    onConfirm,
    onCancel,
    onDiscard,
    onSave
  }: {
    show: boolean;
    type?: 'delete' | 'unsaved';
    onConfirm?: () => void;
    onCancel: () => void;
    onDiscard?: () => void;
    onSave?: () => void;
  } = $props();

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.code === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }
</script>

{#if show}
  <div 
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={handleOverlayClick}
    onkeydown={handleKeydown}
  >
    <div class="modal modal-small" {@attach trapFocus}>
      <div class="modal-header">
        <h2>{type === 'delete' ? 'Confirm Delete' : 'Unsaved Changes'}</h2>
      </div>
      <div class="modal-body">
        {#if type === 'delete'}
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        {:else}
          <p>You have unsaved changes. What would you like to do?</p>
        {/if}
      </div>
      <div class="modal-footer">
        {#if type === 'delete'}
          <ButtonComponent 
            element="button"
            text="Cancel"
            type="cancel"
            onClick={onCancel}
          />
          <ButtonComponent 
            element="button"
            text="Delete"
            type="delete"
            onClick={onConfirm}
          />
        {:else}
          <ButtonComponent 
            element="button"
            text="Keep Editing"
            type="cancel"
            onClick={onCancel}
          />
          <ButtonComponent 
            element="button"
            text="Discard"
            type="delete"
            onClick={onDiscard}
          />
          <ButtonComponent 
            element="button"
            text="Save"
            type="save"
            onClick={onSave}
          />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: var(--bg-2);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-small {
    max-width: 450px;
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--bg-3);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    margin: 0;
    color: var(--fg-1);
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .modal-body p {
    margin: 0;
    color: var(--fg-1);
    line-height: 1.6;
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--bg-3);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    .modal {
      width: 95%;
    }
  }
</style>
