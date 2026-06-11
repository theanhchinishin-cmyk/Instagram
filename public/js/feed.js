// ==========================================================================
// FEED AND INTERACTION JAVASCRIPT
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Double tap to like on post images
  const postCards = document.querySelectorAll('.post-card');
  
  postCards.forEach(card => {
    const imgContainer = card.querySelector('.post-image-container');
    const img = card.querySelector('.post-image');
    const heartOverlay = card.querySelector('.floating-heart');
    const likeBtn = card.querySelector('.like-btn');
    const postId = card.getAttribute('data-post-id');
    
    let lastTap = 0;
    
    if (imgContainer && heartOverlay && likeBtn) {
      imgContainer.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
          // Double tap detected
          handleLikeToggle(postId, card, true);
          
          // Animate floating heart overlay
          heartOverlay.classList.remove('animate');
          void heartOverlay.offsetWidth; // Trigger reflow to restart animation
          heartOverlay.classList.add('animate');
          
          setTimeout(() => {
            heartOverlay.classList.remove('animate');
          }, 700);
        }
        lastTap = currentTime;
      });
    }
  });

  // 2. Like button click listener
  document.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
      const card = likeBtn.closest('.post-card');
      const postId = likeBtn.getAttribute('data-post-id');
      handleLikeToggle(postId, card, false);
    }
  });

  // 3. Comment input form submission and button validation
  document.addEventListener('input', (e) => {
    const commentInput = e.target.closest('.comment-input');
    if (commentInput) {
      const form = commentInput.closest('.add-comment-form');
      const postBtn = form.querySelector('.comment-post-btn');
      
      if (commentInput.value.trim().length > 0) {
        postBtn.removeAttribute('disabled');
      } else {
        postBtn.setAttribute('disabled', 'true');
      }
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('.add-comment-form');
    if (form) {
      e.preventDefault();
      const postId = form.getAttribute('data-post-id');
      const input = form.querySelector('.comment-input');
      const postBtn = form.querySelector('.comment-post-btn');
      const content = input.value.trim();
      
      if (content === '') return;
      
      // Disable buttons during send
      input.disabled = true;
      postBtn.disabled = true;
      
      fetch(`/api/comment/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          appendComment(cardOfPost(postId), data.comment);
          input.value = '';
        } else {
          alert(data.error || 'Failed to submit comment');
        }
      })
      .catch(err => {
        console.error('Comment error:', err);
      })
      .finally(() => {
        input.disabled = false;
        postBtn.disabled = false;
      });
    }
  });

  // 4. Follow click listener in suggested list
  document.addEventListener('click', (e) => {
    const followBtn = e.target.closest('.suggested-follow-btn');
    if (followBtn) {
      const userId = followBtn.getAttribute('data-user-id');
      
      // Disable temporarily
      followBtn.disabled = true;
      
      fetch(`/api/follow/${userId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.following) {
            followBtn.textContent = 'Following';
            followBtn.style.color = 'var(--color-text-secondary)';
          } else {
            followBtn.textContent = 'Follow';
            followBtn.style.color = 'var(--color-primary)';
          }
        }
      })
      .catch(err => {
        console.error('Follow error:', err);
      })
      .finally(() => {
        followBtn.disabled = false;
      });
    }
  });
});

// Helper: toggle like state via API
function handleLikeToggle(postId, card, forceLike = false) {
  const likeBtn = card.querySelector('.like-btn');
  const likesCountSpan = card.querySelector('.likes-count');
  
  if (!likeBtn) return;
  
  // If double-tapped on image, and already liked, do nothing
  if (forceLike && likeBtn.classList.contains('liked')) {
    return;
  }
  
  fetch(`/api/like/${postId}`, { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      if (data.liked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `
          <svg fill="#ED4956" height="24" viewBox="0 0 24 24" width="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `;
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = `
          <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-1.834-1.587-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"/>
          </svg>
        `;
      }
      likesCountSpan.textContent = data.likes_count;
    }
  })
  .catch(err => {
    console.error('Like toggle error:', err);
  });
}

// Find card element by post id
function cardOfPost(postId) {
  return document.querySelector(`.post-card[data-post-id="${postId}"]`);
}

// Prepend comment element dynamically
function appendComment(card, comment) {
  if (!card) return;
  const list = card.querySelector('.comments-list');
  if (list) {
    const div = document.createElement('div');
    div.className = 'post-comment';
    div.innerHTML = `
      <a href="/profile/${comment.username}" class="comment-username">${comment.username}</a>
      <span>${comment.content}</span>
    `;
    list.appendChild(div);
  }
}
