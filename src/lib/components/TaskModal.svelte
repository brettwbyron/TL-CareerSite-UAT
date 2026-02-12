<script lang="ts">
  import type { ModalData, TaskType, Column, ColumnId } from '$lib/types';
  import { TASK_TYPES, DEVICE_TYPES } from '$lib/types';
  import { trapFocus } from '$lib/utils';

  let {
    show = false,
    isNew = false,
    isViewOnly = false,
    isLocked = false,
    modalData = $bindable<ModalData>(),
    selectedColumnId = $bindable<ColumnId>(),
    columns,
    isAdmin = false,
    validationError = '',
    onSave,
    onDelete,
    onCancel
  }: {
    show: boolean;
    isNew: boolean;
    isViewOnly?: boolean;
    isLocked?: boolean;
    modalData: ModalData;
    selectedColumnId: ColumnId;
    columns: Column[];
    isAdmin?: boolean;
    validationError?: string;
    onSave: () => void;
    onDelete: () => void;
    onCancel: () => void;
  } = $props();
  
  // Filter columns for non-admin users (exclude inprogress, feedback, retest, and cancelled, but always include the current column)
  const availableColumns = $derived(
    isAdmin 
      ? columns 
      : columns.filter(col => 
          col.id === selectedColumnId || 
          (col.id !== 'inprogress' && col.id !== 'feedback' && col.id !== 'retest' && col.id !== 'cancelled')
        )
  );

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

  // Image upload handling
  let fileInput = $state<HTMLInputElement>();
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB input limit (will be compressed)
  const TARGET_SIZE = 800 * 1024; // Target 800KB after compression
  const MAX_IMAGES = 5;

  let selectedImage = $state<string | null>(null);
  let descriptionTextarea = $state<HTMLTextAreaElement>();

  // Compress image using canvas
  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large (max 1920px wide)
          const MAX_WIDTH = 1920;
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with quality 0.9, reduce if needed
          let quality = 0.9;
          let result = canvas.toDataURL('image/jpeg', quality);
          
          // If still too large, reduce quality
          while (result.length > TARGET_SIZE * 1.37 && quality > 0.5) { // 1.37 = base64 overhead
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
          }
          
          resolve(result);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Auto-resize textarea based on content
  function adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // Adjust height when modal opens
  $effect(() => {
    if (show && descriptionTextarea) {
      adjustTextareaHeight(descriptionTextarea);
    }
  });

  function handleImageClick(image: string) {
    selectedImage = image;
  }

  function closeImageModal() {
    selectedImage = null;
  }

  async function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      target.value = '';
      return;
    }

    // Check file size before processing
    if (file.size > MAX_IMAGE_SIZE) {
      alert(`Image is too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
      target.value = '';
      return;
    }

    // Check max images
    if (modalData.images.length >= MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      target.value = '';
      return;
    }

    try {
      // Compress the image
      const compressed = await compressImage(file);
      modalData.images = [...modalData.images, compressed];
      target.value = ''; // Reset input
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try another file.');
      target.value = '';
    }
  }

  function removeImage(index: number) {
    modalData.images = modalData.images.filter((_, i) => i !== index);
  }

</script>

{#if show}
  <div 
    class="modal-overlay" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    onclick={handleOverlayClick}
    onkeydown={handleKeydown}
  >
    <div class="modal" {@attach trapFocus}>
      <div class="modal-header">
        <h2 id="modal-title">{isViewOnly ? 'View Task (Read-Only)' : isNew ? 'Add Task' : 'Edit Task'}</h2>
        <button class="close-btn" aria-label="Close modal" onclick={onCancel}>×</button>
      </div>
      
      <div class="modal-body">
        {#if validationError}
          <div class="error-message">{validationError}</div>
        {/if}

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" bind:value={selectedColumnId} disabled={isViewOnly}>
            {#each availableColumns as column}
              <option value="{column.id}">{column.title}</option>
            {/each}
          </select>
        </div>

        {#if isAdmin}
           <div class="form-group">
             <label for="type">Type *</label>
             <select id="type" bind:value={modalData.type} disabled={isViewOnly || (isLocked && !isAdmin)}>
               {#each TASK_TYPES as type}
                 <option value="{type}">{type}</option>
               {/each}
             </select>
           </div>
        {/if}

        <div class="form-group">
          <label for="device">Device</label>
          <select id="device" bind:value={modalData.device} disabled={isViewOnly || isLocked}>
            {#each DEVICE_TYPES as device}
              <option value="{device}">{device}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea 
            id="description"
            bind:this={descriptionTextarea}
            bind:value={modalData.description}
            oninput={(e) => adjustTextareaHeight(e.currentTarget)}
            maxlength="500"
            placeholder="Enter task description..."
            disabled={isViewOnly || (isLocked && !isAdmin)}
            readonly={isViewOnly || (isLocked && !isAdmin)}
          ></textarea>
          <small>{modalData.description.length}/500 characters</small>
        </div>

        <div class="form-group">
          <label for="section">Section / Page</label>
          <input 
            type="text" 
            id="section"
            bind:value={modalData.section}
            placeholder="e.g., Header, Home Page, Categories..."
            disabled={isViewOnly || (isLocked && !isAdmin)}
            readonly={isViewOnly || (isLocked && !isAdmin)}
          />
        </div>

        <div class="form-group">
          <label for="feedback">Feedback / Notes</label>
          <textarea 
            id="feedback"
            bind:value={modalData.feedback}
            rows="3"
            placeholder="Enter feedback or additional notes..."
            disabled={isViewOnly}
            readonly={isViewOnly}
          ></textarea>
        </div>

        <div class="form-group">
          <div class="label">Images ({modalData.images.length}/{MAX_IMAGES})</div>
          {#if modalData.images.length > 0}
            <div class="image-preview-container">
              {#each modalData.images as image, index}
                <div class="image-preview">
                  <button
                    class="image-preview-btn"
                    onclick={() => handleImageClick(image)}
                    aria-label="View full size image {index + 1}"
                    type="button"
                  >
                    <img src={image} alt="Uploaded image {index + 1}" />
                  </button>
                  {#if (!isViewOnly && !isLocked) || isAdmin}
                    <button 
                      class="remove-image-btn" 
                      onclick={() => removeImage(index)}
                      aria-label="Remove image"
                      type="button"
                    >
                      ×
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
          {#if !isViewOnly && modalData.images.length < MAX_IMAGES}
            <input
              type="file"
              bind:this={fileInput}
              onchange={handleImageUpload}
              accept="image/*"
              class="file-input"
              aria-label="Upload image"
              disabled={isViewOnly}
              readonly={isViewOnly}
            />
            {#if (!isViewOnly) || isAdmin}
              <button 
                type="button" 
                class="upload-btn"
                onclick={() => fileInput?.click()}
              >
                + Add Image
              </button>
              <small>Max {MAX_IMAGE_SIZE / 1024 / 1024}MB per image (auto-compressed), {MAX_IMAGES} images total</small>
            {/if}
          {/if}
        </div>
      </div>

      <div class="modal-footer">
        <div class="modal-footer-left">
          {#if !isNew && !isViewOnly}
            {#if !isAdmin && isLocked}
              <div class="lock-message">
                <span class="lock-icon">🔒</span>
                <span>Task locked - Work has been started. Only status and feedback can be changed.</span>
              </div>
            {:else if !isLocked || isAdmin}
              <button 
                class="delete-btn-modal" 
                onclick={onDelete}
                aria-label="Delete task"
              >
                Delete
              </button>
            {/if}
          {/if}
        </div>
        <div class="modal-footer-right">
          <button class="cancel-btn" onclick={onCancel}>{isViewOnly ? 'Close' : 'Cancel'}</button>
          {#if !isViewOnly}
            <button class="save-btn" onclick={onSave}>Save</button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

{#if selectedImage}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="image-modal-overlay" {@attach trapFocus} onclick={closeImageModal} onkeydowncapture={(e) => { if (e.code === "Escape") { e.stopPropagation(); closeImageModal(); } }}>
    <div class="image-modal-content" onclick={(e) => e.stopPropagation()}>
      <button class="image-close-btn" onclick={closeImageModal} aria-label="Close image viewer">
        ×
      </button>
      <img src={selectedImage} alt="Full size view" />
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

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--fg-2);
    line-height: 1;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: var(--fg-1);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--fg-1);
    font-weight: 600;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--bg-3);
    border-radius: 4px;
    font-size: 1rem;
    background: var(--bg-1);
    color: var(--fg-1);
    font-family: inherit;
    box-sizing: border-box;
  }

  .form-group textarea {
    min-height: 4rem;
    resize: none;
    overflow-y: hidden;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #4CAF50;
  }

  .form-group input:disabled,
  .form-group select:disabled,
  .form-group textarea:disabled,
  .form-group input:read-only,
  .form-group textarea:read-only {
    background: transparent;
    border: none;
    border-top: 2px solid var(--bg-3);
    border-bottom: 2px solid var(--bg-3);
    padding-left: 0;
    padding-right: 0;
    opacity: 1;
    color: var(--fg-1);
    cursor: default;
  }

  .form-group select:disabled {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .form-group small {
    display: block;
    margin-top: 0.25rem;
    color: var(--fg-2);
    font-size: 0.875rem;
  }

  .error-message {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #ffebee;
    color: #c62828;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--bg-3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5em;
  }

  .modal-footer-left {
    display: flex;
    gap: 0.75rem;
  }

  .modal-footer-right {
    display: flex;
    gap: 0.75rem;
  }

  .modal-footer button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.2s;
  }

  .cancel-btn {
    background: var(--bg-3);
    color: var(--fg-1);
  }

  .cancel-btn:hover {
    background: var(--bg-1);
  }

  .save-btn {
    background: #4CAF50;
    color: white;
  }

  .save-btn:hover {
    background: #45a049;
  }

  .delete-btn-modal {
    background: #f44336;
    color: white;
  }

  .delete-btn-modal:hover {
    background: #d32f2f;
  }

  .lock-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fff3e0;
    border-radius: 4px;
    color: #e65100;
    font-size: 0.9rem;
    line-height: 1.4;
    max-width: 400px;
  }

  .lock-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .file-input {
    display: none;
  }

  .upload-btn {
    padding: 0.5rem 1rem;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background 0.2s;
    margin-bottom: 0.5rem;
  }

  .upload-btn:hover {
    background: #1976D2;
  }

  .image-preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .image-preview {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid var(--bg-3);
  }

  .image-preview-btn {
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    display: block;
    transition: opacity 0.2s;
  }

  .image-preview-btn:hover {
    opacity: 0.8;
  }

  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .remove-image-btn {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 28px;
    height: 28px;
    background: rgba(244, 67, 54, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    padding: 0;
  }

  .remove-image-btn:hover {
    background: rgba(211, 47, 47, 1);
  }

  .image-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    cursor: pointer;
  }

  .image-modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    cursor: default;
  }

  .image-modal-content img {
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    display: block;
    border-radius: 8px;
  }

  .image-close-btn {
    position: absolute;
    top: -2.5rem;
    right: 0;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .image-close-btn:hover {
    background: white;
  }

  @media (max-width: 768px) {
    .modal {
      width: 95%;
    }

    .modal-footer {
      flex-direction: column-reverse;
      gap: 1rem;
    }

    .modal-footer-left,
    .modal-footer-right {
      width: 100%;
    }

    .modal-footer button {
      width: 100%;
    }
  }
</style>
