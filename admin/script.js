const API_URL = '/api';
const PAINTINGS_API = `${API_URL}/paintings`;
let token = localStorage.getItem('adminToken');
let currentEditingPaintingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showAdminScreen();
    // Initialize tab from URL after showing admin screen
    setTimeout(() => {
      initializeTabFromURL();
    }, 100);
  }

  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Painting form
  document.getElementById('paintingForm').addEventListener('submit', handlePaintingSubmit);

  // Profile form
  document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);

  // Image preview handlers
  setupImagePreviews();
});

function setupImagePreviews() {
  ['cover-big-input', 'cover-tall-input', 'avatarInput'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('change', (e) => {
        if (e.target.id === 'avatarInput') {
          previewImage(e.target.files[0], 'avatarPreview');
        } else if (e.target.id === 'cover-big-input') {
          previewImage(e.target.files[0], 'cover-big-preview');
        } else if (e.target.id === 'cover-tall-input') {
          previewImage(e.target.files[0], 'cover-tall-preview');
        }
      });
    }
  });
  
  // Setup multiple images preview for paintings
  const paintingImagesInput = document.getElementById('paintingImages');
  if (paintingImagesInput) {
    paintingImagesInput.addEventListener('change', (e) => {
      const files = e.target.files;
      previewMultipleImages(files);
    });
  }
}

function previewMultipleImages(files) {
  const previewDiv = document.getElementById('paintingImagesPreview');
  previewDiv.innerHTML = '';
  
  if (!files || files.length === 0) {
    return;
  }
  
  // Store the file objects in an array
  window.currentPaintingFiles = [];
  
  let loadedCount = 0;
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  const totalImages = imageFiles.length;
  
  imageFiles.forEach((file, index) => {
    window.currentPaintingFiles.push(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.createElement('div');
      container.className = 'drag-item';
      container.draggable = true;
      container.dataset.index = window.currentPaintingFiles.length - 1;
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'preview-img';
      img.title = file.name;
      
      const dragHandle = document.createElement('div');
      dragHandle.className = 'image-drag-handle';
      dragHandle.textContent = '☰';
      dragHandle.title = 'Drag to reorder';
      
      container.appendChild(dragHandle);
      container.appendChild(img);
      previewDiv.appendChild(container);
      
      loadedCount++;
      // Setup drag and drop after all images are loaded
      if (loadedCount === totalImages) {
        setTimeout(() => setupImageDragAndDrop(previewDiv), 100);
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file:', file.name);
      loadedCount++;
      if (loadedCount === totalImages) {
        setTimeout(() => setupImageDragAndDrop(previewDiv), 100);
      }
    };
    reader.readAsDataURL(file);
  });
  
  // Show count
  if (imageFiles.length > 0) {
    const count = imageFiles.length;
    const info = document.createElement('div');
    info.style.marginTop = '10px';
    info.style.color = '#666';
    info.style.fontSize = '14px';
    info.textContent = `${count} image${count > 1 ? 's' : ''} selected - drag to reorder`;
    previewDiv.appendChild(info);
  }
}

function previewImage(file, previewId) {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById(previewId);
      img.src = e.target.result;
      img.style.display = 'block';
      
      // Keep upload button visible
      const label = img.parentElement.querySelector('.upload-label');
      const btn = img.parentElement.querySelector('.btn');
      if (label && btn) {
        label.style.display = 'none'; // Hide default label
        btn.style.display = 'inline-block'; // Show change button
      }
    };
    reader.readAsDataURL(file);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      token = data.token;
      localStorage.setItem('adminToken', token);
      showAdminScreen();
      
      // Initialize tab from URL
      initializeTabFromURL();
      
      // Scroll to management content
      setTimeout(() => {
        document.querySelector('.tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      showError(data.error);
    }
  } catch (error) {
    showError('Login failed, please check if server is running');
  }
}

function handleLogout() {
  token = null;
  localStorage.removeItem('adminToken');
  showLoginScreen();
}

function showLoginScreen() {
  document.getElementById('loginScreen').classList.add('active');
  document.getElementById('adminScreen').classList.remove('active');
}

function showAdminScreen() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('adminScreen').classList.add('active');
}

function showError(message) {
  const errorDiv = document.getElementById('loginError');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  setTimeout(() => errorDiv.classList.remove('show'), 5000);
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // Update URL hash
  if (window.location.hash !== `#${tabName}`) {
    window.history.pushState({ tab: tabName }, '', `#${tabName}`);
  }

  if (tabName === 'paintings') {
    loadPaintings();
  } else if (tabName === 'profile') {
    loadProfile();
  } else if (tabName === 'covers') {
    loadCovers();
  }
}

// Initialize tab from URL hash
function initializeTabFromURL() {
  const hash = window.location.hash.slice(1); // Remove # from hash
  const validTabs = ['covers', 'paintings', 'profile'];
  
  if (validTabs.includes(hash)) {
    switchTab(hash);
  } else {
    // Default to covers if no hash or invalid hash
    switchTab('covers');
  }
}

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
  initializeTabFromURL();
});

async function uploadFile(file, folder, onProgress = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data.url);
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('POST', `${API_URL}/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}

async function uploadCover(position) {
  const input = document.getElementById(`cover-${position}-input`);
  const file = input.files[0];
  if (!file) {
    alert('Please select an image first');
    return;
  }

  const progressDiv = document.getElementById(`cover-${position}-progress`);
  const progressFill = progressDiv.querySelector('.progress-fill');
  const progressText = progressDiv.querySelector('.progress-text');

  try {
    showLoading();
    progressDiv.style.display = 'block';
    
    const url = await uploadFile(file, 'covers', (percent) => {
      progressFill.style.width = percent + '%';
      progressText.textContent = percent + '%';
    });
    
    progressDiv.style.display = 'none';
    
    const response = await fetch(`${API_URL}/covers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ imageUrl: url, position })
    });

    if (response.ok) {
      alert('Cover uploaded successfully!');
      
      // Show the uploaded image
      const preview = document.getElementById(`cover-${position}-preview`);
      if (preview) {
        preview.src = url;
        preview.style.display = 'block';
      }
      
      // Keep the change button visible for updates
      const label = preview?.parentElement.querySelector('.upload-label');
      const btn = preview?.parentElement.querySelector('.btn');
      if (label) {
        label.style.display = 'none'; // Hide default label
      }
      if (btn) {
        btn.style.display = 'inline-block'; // Show change button
      }
      
      input.value = '';
    }
  } catch (error) {
    alert('Upload failed: ' + error.message);
    progressDiv.style.display = 'none';
  } finally {
    hideLoading();
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
  }
}

async function loadPaintings() {
  try {
    const response = await fetch(`${API_URL}/paintings`);
    const paintings = await response.json();
    
    const container = document.getElementById('paintingsList');
    container.innerHTML = paintings.map(painting => {
      const images = painting.images || [];
      const imagesCount = images.length;
      
      let thumbnailsHTML = '';
      if (imagesCount === 0) {
        thumbnailsHTML = '<div class="no-thumbnail">No Image</div>';
      } else {
        thumbnailsHTML = images.map((img, idx) => `<img src="${img}" alt="${painting.title}" class="thumbnail-img" data-painting-id="${painting.id}">`).join('');
        
        if (imagesCount > 1) {
          thumbnailsHTML = `
            <div class="thumbnails-grid">
              ${thumbnailsHTML}
            </div>
            <span class="image-count-badge">${imagesCount}</span>
          `;
        }
      }
      
      return `
        <div class="painting-item" data-painting-id="${painting.id}" draggable="true">
          <div class="drag-handle">☰</div>
          <div class="painting-thumbnail" data-painting-id="${painting.id}" style="cursor: pointer;">
            ${thumbnailsHTML}
          </div>
          <div class="painting-info">
            <h3>${painting.title}</h3>
            <p><strong>Year:</strong> ${painting.year || '-'}</p>
            <p><strong>Medium:</strong> ${painting.medium || '-'}</p>
            <p><strong>Size:</strong> ${painting.size || '-'}</p>
          </div>
          <div class="painting-actions">
            <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); editPainting(${painting.id})">Edit</button>
            <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); deletePainting(${painting.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
    
    // Add click event listeners
    container.querySelectorAll('.painting-thumbnail').forEach(thumbnail => {
      thumbnail.addEventListener('click', (e) => {
        e.stopPropagation();
        const paintingId = parseInt(thumbnail.dataset.paintingId);
        showImageGallery(paintingId);
      });
    });
    
    // Add drag and drop functionality
    setupDragAndDrop(container);
  } catch (error) {
    console.error('Failed to load paintings:', error);
  }
}

function setupDragAndDrop(container) {
  let draggedElement = null;
  
  container.querySelectorAll('.painting-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    
    item.addEventListener('dragend', async (e) => {
      item.classList.remove('dragging');
      
      // Save the new order after drag ends
      if (draggedElement) {
        const items = Array.from(container.querySelectorAll('.painting-item'));
        const orders = items.map((element, index) => ({
          id: parseInt(element.dataset.paintingId),
          order: index
        }));
        
        try {
          const response = await fetch(`${API_URL}/paintings/update-order`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orders })
          });
          
          if (!response.ok) {
            throw new Error('Failed to update order');
          }
          
          console.log('Order updated successfully');
        } catch (error) {
          console.error('Failed to update order:', error);
          alert('Failed to save new order. Reloading list...');
          loadPaintings();
        }
      }
      draggedElement = null;
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (draggedElement && draggedElement !== item) {
        const rect = item.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        container.insertBefore(draggedElement, next ? item.nextSibling : item);
      }
    });
  });
}

// Setup drag and drop for image previews (new files and existing images)
function setupImageDragAndDrop(container) {
  let draggedElement = null;
  
  container.querySelectorAll('.drag-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = item;
      item.classList.add('image-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    
    item.addEventListener('dragend', (e) => {
      item.classList.remove('image-dragging');
      
      if (draggedElement && window.currentPaintingFiles) {
        // Update the file order in the array based on DOM order
        const items = Array.from(container.querySelectorAll('.drag-item'));
        const newFiles = [];
        
        items.forEach((element) => {
          const oldIndex = parseInt(element.dataset.index);
          newFiles.push(window.currentPaintingFiles[oldIndex]);
        });
        
        // Update indices to reflect new order
        items.forEach((element, newIndex) => {
          element.dataset.index = newIndex;
        });
        
        window.currentPaintingFiles = newFiles;
      }
      draggedElement = null;
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (draggedElement && draggedElement !== item) {
        const rect = item.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        container.insertBefore(draggedElement, next ? item.nextSibling : item);
      }
    });
  });
}

// Setup drag and drop for existing images
function setupExistingImagesDragAndDrop() {
  const container = document.getElementById('existingImagesPreview');
  if (!container) return;
  
  let draggedElement = null;
  
  container.querySelectorAll('.existing-image-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = item;
      item.classList.add('image-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    
    item.addEventListener('dragend', (e) => {
      item.classList.remove('image-dragging');
      
      if (draggedElement) {
        // Reorder the currentExistingImages array based on DOM order
        const items = Array.from(container.querySelectorAll('.existing-image-item'));
        const newImages = [];
        
        items.forEach((element) => {
          const index = parseInt(element.dataset.index);
          newImages.push(currentExistingImages[index]);
        });
        
        currentExistingImages = newImages;
        
        // Update dataset indices to match new order
        items.forEach((element, newIndex) => {
          element.dataset.index = newIndex;
        });
      }
      draggedElement = null;
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (draggedElement && draggedElement !== item) {
        const rect = item.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        container.insertBefore(draggedElement, next ? item.nextSibling : item);
      }
    });
  });
}

// Add image gallery viewing functionality
async function showImageGallery(paintingId) {
  try {
    // Get all images for this painting
    const response = await fetch(`${API_URL}/paintings/${paintingId}`);
    const painting = await response.json();
    const images = painting.images || [];
    
    if (images.length === 0) {
      alert('No images to display');
      return;
    }
    
    // Create image viewing modal
    const modal = document.createElement('div');
    modal.className = 'image-gallery-modal';
    modal.innerHTML = `
      <div class="image-gallery-content">
        <span class="gallery-close" onclick="closeImageGallery()">&times;</span>
        <h2>${painting.title}</h2>
        <div class="gallery-images">
          ${images.map((img, idx) => `
            <img src="${img}" alt="${painting.title} ${idx + 1}" class="gallery-image ${idx === 0 ? 'active' : ''}">
          `).join('')}
        </div>
        <div class="gallery-nav">
          <button class="btn btn-secondary" onclick="galleryPrevImage()">← Previous</button>
          <span class="gallery-counter">1 / ${images.length}</span>
          <button class="btn btn-secondary" onclick="galleryNextImage()">Next →</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Initialize image index
    window.currentGalleryImages = images;
    window.currentGalleryIndex = 0;
    updateGalleryCounter();
    
  } catch (error) {
    alert('Failed to load images: ' + error.message);
  }
}

function closeImageGallery() {
  const modal = document.querySelector('.image-gallery-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

function galleryNextImage() {
  if (window.currentGalleryIndex < window.currentGalleryImages.length - 1) {
    window.currentGalleryIndex++;
    updateGalleryImage();
    updateGalleryCounter();
  }
}

function galleryPrevImage() {
  if (window.currentGalleryIndex > 0) {
    window.currentGalleryIndex--;
    updateGalleryImage();
    updateGalleryCounter();
  }
}

function updateGalleryImage() {
  const images = document.querySelectorAll('.gallery-image');
  images.forEach(img => img.classList.remove('active'));
  if (images[window.currentGalleryIndex]) {
    images[window.currentGalleryIndex].classList.add('active');
  }
}

function updateGalleryCounter() {
  const counter = document.querySelector('.gallery-counter');
  if (counter) {
    counter.textContent = `${window.currentGalleryIndex + 1} / ${window.currentGalleryImages.length}`;
  }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (document.querySelector('.image-gallery-modal')) {
    if (e.key === 'ArrowRight') galleryNextImage();
    if (e.key === 'ArrowLeft') galleryPrevImage();
    if (e.key === 'Escape') closeImageGallery();
  }
});

async function loadCovers() {
  try {
    const response = await fetch(`${API_URL}/covers`);
    const covers = await response.json();
    
    covers.forEach(cover => {
      const preview = document.getElementById(`cover-${cover.position}-preview`);
      const label = preview?.parentElement.querySelector('.upload-label');
      const btn = preview?.parentElement.querySelector('.btn');
      
      if (cover.imageUrl && preview) {
        preview.src = cover.imageUrl;
        preview.style.display = 'block';
        
        // Hide default label, show change button
        if (label) label.style.display = 'none';
        if (btn) btn.style.display = 'inline-block';
      }
    });
  } catch (error) {
    console.error('Failed to load covers:', error);
  }
}

async function loadProfile() {
  try {
    const response = await fetch(`${API_URL}/profile`);
    const profile = await response.json();

    document.getElementById('profileDesc').value = profile.description || '';
    document.getElementById('profileTags').value = profile.tags?.join('\n') || '';
    
    if (profile.avatarUrl) {
      document.getElementById('avatarPreview').src = profile.avatarUrl;
      document.getElementById('avatarPreview').style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

// Track existing images for editing
let currentExistingImages = [];

function showAddPaintingForm() {
  currentEditingPaintingId = null;
  currentExistingImages = [];
  window.currentPaintingFiles = [];
  document.getElementById('modalTitle').textContent = 'Add Painting';
  document.getElementById('paintingForm').reset();
  document.getElementById('paintingImagesPreview').innerHTML = '';
  document.getElementById('existingImagesPreview').innerHTML = '';
  document.getElementById('existingImagesList').style.display = 'none';
  document.getElementById('paintingImages').required = true;
  document.getElementById('paintingModal').classList.add('active');
}

function closePaintingModal() {
  document.getElementById('paintingModal').classList.remove('active');
  currentEditingPaintingId = null;
  currentExistingImages = [];
  window.currentPaintingFiles = [];
}

async function handlePaintingSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('paintingTitle').value.trim();
  const desc = document.getElementById('paintingDesc').value.trim();
  const year = document.getElementById('paintingYear').value.trim();
  const medium = document.getElementById('paintingMedium').value.trim();
  const size = document.getElementById('paintingSize').value.trim();
  const files = document.getElementById('paintingImages').files;
  
  // Validate all required fields
  if (!title) {
    alert('Title is required');
    return;
  }
  
  if (!desc) {
    alert('Description is required');
    return;
  }
  
  if (!year) {
    alert('Year is required');
    return;
  }
  
  if (!medium) {
    alert('Medium is required');
    return;
  }
  
  if (!size) {
    alert('Size is required');
    return;
  }
  
  // For editing, require at least one image (existing or new)
  if (currentEditingPaintingId && currentExistingImages.length === 0 && (!files || files.length === 0)) {
    alert('At least one image is required');
    return;
  }
  
  // For creating new painting, require at least one image
  if (!currentEditingPaintingId && (!files || files.length === 0)) {
    alert('At least one image is required');
    return;
  }
  
  // Validate that all files are images
  const imageFiles = files ? Array.from(files).filter(file => file.type.startsWith('image/')) : [];
  
  if (files && files.length > 0 && imageFiles.length === 0) {
    alert('Please select only image files (jpg, png, gif, webp, svg)');
    return;
  }
  
  if (files && files.length > 0 && imageFiles.length !== files.length) {
    alert(`Warning: ${files.length - imageFiles.length} non-image file(s) will be skipped`);
  }

  try {
    showLoading();
    
    // Show progress bar
    const progressDiv = document.getElementById('painting-progress');
    const progressInfo = progressDiv.querySelector('.progress-info');
    const progressFill = progressDiv.querySelector('.progress-fill');
    const progressText = progressDiv.querySelector('.progress-text');
    
    // Upload new images - use window.currentPaintingFiles if available (for drag-sorted images)
    const filesToUpload = window.currentPaintingFiles && window.currentPaintingFiles.length > 0 
      ? window.currentPaintingFiles 
      : imageFiles;
    
    const newImageUrls = [];
    const totalFiles = filesToUpload.length;
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      try {
        progressDiv.style.display = 'block';
        progressInfo.textContent = `Uploading image ${i + 1} of ${totalFiles}...`;
        
        const url = await uploadFile(file, 'paintings', (percent) => {
          // Calculate overall progress
          const overallPercent = Math.round(((i + percent) / totalFiles));
          progressFill.style.width = overallPercent + '%';
          progressText.textContent = overallPercent + '%';
        });
        
        newImageUrls.push(url);
        console.log(`Uploaded: ${file.name}`);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        alert(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    
    progressDiv.style.display = 'none';
    
    // Merge existing images and new images
    const finalImages = [...currentExistingImages, ...newImageUrls];
    
    if (finalImages.length === 0) {
      alert('At least one image is required');
      return;
    }
    
    console.log(`Total images: ${finalImages.length} (${currentExistingImages.length} existing + ${newImageUrls.length} new)`);

    const paintingData = {
      title,
      desc,
      category: 'art', // Default to 'art' since category is removed from form
      year, medium, size,
      images: finalImages
    };

    const url = currentEditingPaintingId 
      ? `${API_URL}/paintings/${currentEditingPaintingId}`
      : `${API_URL}/paintings`;
    
    const method = currentEditingPaintingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paintingData)
    });

    if (response.ok) {
      const responseData = await response.json();
      const totalImages = finalImages.length;
      alert(`Painting saved successfully with ${totalImages} image(s)!`);
      closePaintingModal();
      loadPaintings();
    } else {
      const errorData = await response.json();
      alert('Failed to save painting: ' + (errorData.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Save failed: ' + error.message);
    document.getElementById('painting-progress').style.display = 'none';
  } finally {
    hideLoading();
    // Reset progress bar
    const progressDiv = document.getElementById('painting-progress');
    if (progressDiv) {
      const progressFill = progressDiv.querySelector('.progress-fill');
      const progressText = progressDiv.querySelector('.progress-text');
      if (progressFill) progressFill.style.width = '0%';
      if (progressText) progressText.textContent = '0%';
    }
  }
}

async function deletePainting(id) {
  if (!confirm('Are you sure you want to delete this painting?')) return;

  try {
    const response = await fetch(`${API_URL}/paintings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('Deleted successfully!');
      loadPaintings();
    }
  } catch (error) {
    alert('Delete failed: ' + error.message);
  }
}

async function editPainting(id) {
  try {
    const response = await fetch(`${API_URL}/paintings/${id}`);
    const painting = await response.json();

    currentEditingPaintingId = id;
    currentExistingImages = painting.images || [];
    window.currentPaintingFiles = [];
    
    document.getElementById('modalTitle').textContent = 'Edit Painting';
    document.getElementById('paintingTitle').value = painting.title;
    document.getElementById('paintingDesc').value = painting.desc;
    document.getElementById('paintingYear').value = painting.year;
    document.getElementById('paintingMedium').value = painting.medium;
    document.getElementById('paintingSize').value = painting.size;
    
    // Show existing images with delete button
    displayExistingImages();
    
    // Clear new images preview
    document.getElementById('paintingImagesPreview').innerHTML = '';
    document.getElementById('paintingImages').required = false;
    
    document.getElementById('paintingModal').classList.add('active');
  } catch (error) {
    alert('Load failed: ' + error.message);
  }
}

function displayExistingImages() {
  const existingDiv = document.getElementById('existingImagesPreview');
  if (currentExistingImages.length === 0) {
    document.getElementById('existingImagesList').style.display = 'none';
    return;
  }
  
  document.getElementById('existingImagesList').style.display = 'block';
  existingDiv.innerHTML = currentExistingImages.map((url, index) => 
    `<div class="existing-image-item" draggable="true" data-index="${index}" style="position: relative;">
      <div class="image-drag-handle">☰</div>
      <img src="${url}" class="preview-img">
      <span class="delete-image-btn" onclick="removeExistingImage(${index})" title="Delete this image">×</span>
    </div>`
  ).join('');
  
  // Setup drag and drop for existing images
  setupExistingImagesDragAndDrop();
}

function removeExistingImage(index) {
  currentExistingImages.splice(index, 1);
  displayExistingImages();
}

async function handleProfileSubmit(e) {
  e.preventDefault();
  
  const avatarFile = document.getElementById('avatarInput').files[0];
  const description = document.getElementById('profileDesc').value;
  const tagsText = document.getElementById('profileTags').value;
  const tags = tagsText.split('\n').filter(t => t.trim()).map(t => t.trim());

  try {
    showLoading();
    
    const progressDiv = document.getElementById('avatar-progress');
    const progressFill = progressDiv.querySelector('.progress-fill');
    const progressText = progressDiv.querySelector('.progress-text');
    
    let avatarUrl = null;
    if (avatarFile) {
      progressDiv.style.display = 'block';
      avatarUrl = await uploadFile(avatarFile, 'profile', (percent) => {
        progressFill.style.width = percent + '%';
        progressText.textContent = percent + '%';
      });
      progressDiv.style.display = 'none';
    } else {
      // Keep existing avatar if not uploading new one
      const existing = document.getElementById('avatarPreview').src;
      if (existing && existing.startsWith('http')) {
        avatarUrl = existing;
      }
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        avatarUrl,
        description,
        tags
      })
    });

    if (response.ok) {
      alert('Profile saved successfully!');
      loadProfile();
    }
  } catch (error) {
    alert('Save failed: ' + error.message);
    progressDiv.style.display = 'none';
  } finally {
    hideLoading();
    // Reset progress bar
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
  }
}

function loadData() {
  // This function is no longer needed as tab initialization is handled by initializeTabFromURL()
}

function showLoading() {
  // Add loading indicator if needed
}

function hideLoading() {
  // Hide loading indicator
}

