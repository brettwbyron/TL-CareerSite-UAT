<script lang="ts">
  let {
    element = 'a',
    text = 'Button',
    loadingText,
    title,
    href = '#',
    type = 'primary',
    size = '',
    target = '',
    rel = '',
    disabled=false,
    loading=false,
    onClick
  }: {
    element?: string;
    text?: string;
    loadingText?: string;
    title?: string;
    href?: string;
    type?: string;
    size?: string;
    target?: string;
    rel?: string;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
  } = $props();

  const displayText = $derived(loading && loadingText ? loadingText : text);

  function handleClick(e: MouseEvent) {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  }
</script>

<div>
  <svelte:element
    this={element}
    {...(element === 'a' ? { href, target, rel } : { type: 'button', disabled: disabled || loading })}
    onclickcapture={handleClick}
    class="button button-{type} {size ? `button-${size}` : ''} {loading ? 'button-loading' : ''}"
    role="button"
    title="{title || text}"
  >
    {#if loading}
      <span class="spinner"></span>
    {/if}
    <span class:loading-text={loading}>{displayText}</span>
  </svelte:element>
</div>

<style>
  .button {
    border-radius: var(--border-radius);
    padding: 13px 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    font-weight: 600;
    font-size: 1rem;
    transition: all .15s ease-in-out;
    border: 2px solid #fff;
    line-height: 24px;
    text-decoration: none;
    background-color: transparent;

    &:hover {
      background-color: transparent;
      color: inherit;
    }
  }

  .button-small {
    padding: 8px 32px;
  }

  .button-loading {
    cursor: wait;
    opacity: 0.7;
  }

  .loading-text {
    opacity: 0.7;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    div {
      display: block;
      width: 100%;
    }

    .button {
      width: 100%;
      box-sizing: border-box;
    }
  }

  .button-primary,
  .button-save {
    background-color: var(--primary);
    color: var(--bg-2);
    border-color: var(--primary);
  }
  
  .button-secondary {
    background-color: #bcf3ff;
    border-color: #bcf3ff;
    color: var(--bg-2);

    &:hover {
      color: inherit;
    }
  }
  
  .button-tertiary,
  .button-cancel {
    background-color: var(--bg-3);
    border-color: var(--bg-3);
    color: var(--fg-1);

    &:hover {
      border-color: var(--primary);
    }
  }
  
  .button-delete {
    background-color: var(--error);
    border-color: var(--error);
    color: #fff;

    &:hover {
      background-color: #fff;
      color: var(--error);
    }
  }
  
  .button-hollow {
    background-color: transparent;
    border-color: var(--fg-1);
    color: var(--fg-1);

    &:hover {
      background-color: #fff;
      border-color: var(--primary);
    }
  }

  .button-hollow-primary {
    background-color: transparent;
    border-color: var(--primary);
    color: var(--fg-1);

    &:hover {
      background-color: var(--primary);
      color: #fff;
    }
  }
</style>