// ==========================================================================
// POST CREATION SCREEN INTERACTIONS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const imageInput = document.getElementById('image-input');
  const previewBox = document.getElementById('preview-box');
  const imagePreview = document.getElementById('image-preview');
  const removeBtn = document.getElementById('remove-img-btn');
  const captionInput = document.getElementById('caption-input');
  const charCount = document.getElementById('char-count');
  const shareBtn = document.getElementById('share-btn');
  
  if (dropZone && imageInput && previewBox) {
    // 1. Click to trigger input selection
    dropZone.addEventListener('click', (e) => {
      // Don't trigger if clicked on the remove preview button
      if (e.target.closest('#remove-img-btn')) return;
      imageInput.click();
    });

    // 2. Drag and drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        imageInput.files = files;
        handleFileSelect(files[0]);
      }
    });

    // 3. Manual file selection
    imageInput.addEventListener('change', (e) => {
      if (imageInput.files.length > 0) {
        handleFileSelect(imageInput.files[0]);
      }
    });

    // 4. Remove selected image
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetForm();
    });
  }

  // 5. Caption text limit counter
  if (captionInput && charCount) {
    captionInput.addEventListener('input', () => {
      const currentLength = captionInput.value.length;
      charCount.textContent = currentLength;
    });
  }

  // Function to load file and show preview
  function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      resetForm();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      previewBox.style.display = 'block';
      shareBtn.removeAttribute('disabled');
    };
    reader.readAsDataURL(file);
  }

  function resetForm() {
    imageInput.value = '';
    imagePreview.src = '#';
    previewBox.style.display = 'none';
    shareBtn.setAttribute('disabled', 'true');
  }
});
