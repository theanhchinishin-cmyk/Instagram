// ==========================================================================
// MAIN APP JAVASCRIPT
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dark Mode Toggle
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  // Load preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    body.classList.add('dark-mode');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', currentTheme);
    });
  }

  // 2. Initialize Socket.io Connection (if script is loaded)
  if (typeof io !== 'undefined') {
    window.socket = io();
    
    // Register current user room if user is logged in
    const profileContainer = document.querySelector('.profile-container');
    const feedLayout = document.querySelector('.feed-layout-container');
    
    // Attempt to register logged in user with socket
    // We can infer it or let server register.
    
    // Global socket event listeners
    window.socket.on('new-post', (post) => {
      showToast(`New post uploaded by @${post.username}!`);
      
      // If we are on the homepage feed, prepend this post to feed
      const feedContainer = document.getElementById('posts-feed-container');
      if (feedContainer) {
        // Remove empty state if present
        const emptyState = feedContainer.querySelector('.empty-feed-container');
        if (emptyState) {
          emptyState.remove();
        }
        
        // Build post element dynamically or request template reload
        // For simpler and clean UX, let's toast them or insert a banner "New posts available. Click to refresh."
        // We will add a banner at top of feed
        let refreshBanner = document.getElementById('refresh-feed-banner');
        if (!refreshBanner) {
          refreshBanner = document.createElement('button');
          refreshBanner.id = 'refresh-feed-banner';
          refreshBanner.className = 'btn-primary hover-scale transition-all';
          refreshBanner.style.cssText = 'margin: 10px auto; display: block; width: fit-content; font-size: 13px; padding: 6px 16px; border-radius: 20px;';
          refreshBanner.textContent = 'New posts available • Click to refresh';
          refreshBanner.addEventListener('click', () => {
            window.location.reload();
          });
          feedContainer.prepend(refreshBanner);
        }
      }
    });
  }
});

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast-container');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
}

// Utility formatTimeAgo function (for client-side dynamic content rendering if needed)
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
