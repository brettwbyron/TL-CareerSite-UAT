<script lang="ts">
  let {
    element = 'a',
    text = 'Button',
    title,
    href = '#',
    type = 'primary',
    size = '',
    target = '',
    rel = '',
    disabled=false,
    onClick
  }: {
    element?: string;
    text?: string;
    title?: string;
    href?: string;
    type?: string;
    size?: string;
    target?: string;
    rel?: string;
    disabled?: boolean;
    onClick?: () => void;
  } = $props();

  function handleClick(e: MouseEvent) {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  }
</script>

<div class="employ-button">
  <svelte:element
    this={element}
    {...(element === 'a' ? { href, target, rel } : { type: 'button', disabled })}
    onclickcapture={handleClick}
    class="button button-{type} {size ? `button-${size}` : ''}"
    role="button"
    title="{title || text}"
  >
    {text}
  </svelte:element>
</div>

<style>
  .button {
    border-radius: 11px;
    padding: 13px 25px;
    font-weight: 600;
    font-size: 1rem;
    transition: all .15s ease-in-out;
    border: 2px solid #fff;
    line-height: 24px;
    text-decoration: none;
    background-color: transparent;

    &:is(:hover,:focus,:active) {
      background-color: transparent;
      color: inherit;
    }
  }

  .button-small {
    padding: 8px 32px;
  }

  .button-primary,
  .button-save {
    background-color: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }
  
  .button-secondary {
    background-color: #bcf3ff;
    border-color: #bcf3ff;
    color: #000;

    &:is(:hover,:focus,:active) {
      color: inherit;
    }
  }
  
  .button-tertiary,
  .button-cancel {
    background-color: var(--bg-3);
    border-color: var(--bg-3);
    color: var(--fg-1);

    &:is(:hover,:focus,:active) {
      border-color: var(--primary);
    }
  }
  
  .button-delete {
    background-color: var(--error);
    border-color: var(--error);
    color: #fff;

    &:is(:hover,:focus,:active) {
      background-color: #fff;
      color: var(--error);
    }
  }
  
  .button-hollow {
    background-color: transparent;
    border-color: #fff;
    color: #fff;

    &:is(:hover,:focus,:active) {
      background-color: #fff;
      color: var(--fg-1);
    }
  }

  .button-hollow-primary {
    background-color: transparent;
    border-color: var(--primary);
    color: var(--primary);

    &:is(:hover,:focus,:active) {
      background-color: var(--primary);
      color: #fff;
    }
  }
</style>