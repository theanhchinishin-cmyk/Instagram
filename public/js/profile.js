// ==========================================================================
// PROFILE PAGE INTERACTION SCRIPT
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const followBtn = document.getElementById('follow-toggle-btn');
  const followersCount = document.getElementById('followers-count');
  const followersCountMobile = document.getElementById('followers-count-mobile');
  
  if (followBtn) {
    followBtn.addEventListener('click', () => {
      const userId = followBtn.getAttribute('data-user-id');
      
      // Temporarily disable
      followBtn.disabled = true;
      
      fetch(`/api/follow/${userId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.following) {
            // Changed to following state
            followBtn.textContent = 'Following';
            followBtn.classList.remove('btn-primary');
            followBtn.classList.add('btn-secondary');
          } else {
            // Changed to follow state
            followBtn.textContent = 'Follow';
            followBtn.classList.remove('btn-secondary');
            followBtn.classList.add('btn-primary');
          }
          
          // Update follower counters (both desktop & mobile layout)
          if (followersCount) followersCount.textContent = data.followers_count;
          if (followersCountMobile) followersCountMobile.textContent = data.followers_count;
        }
      })
      .catch(err => {
        console.error('Follow request failed:', err);
      })
      .finally(() => {
        followBtn.disabled = false;
      });
    });
  }
});
