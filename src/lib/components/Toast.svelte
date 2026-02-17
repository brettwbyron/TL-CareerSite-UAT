<script lang="ts">
  import type { Toast } from '$lib/types';
  import { fly } from 'svelte/transition';

  let {
    toasts = $bindable<Toast[]>([])
  } = $props();
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}" in:fly={{ x: 0, duration: 300 }} out:fly={{ x: 0, duration: 500 }}>
      {toast.message}
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    z-index: 10000;
  }

  .toast {
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    font-weight: 500;
    width: 400px;
  }

  .toast-success {
    background: var(--success);
    color: white;
  }

  .toast-error {
    background: var(--error);
    color: white;
  }

  .toast-info {
    background: var(--primary);
    color: white;
  }
</style>
