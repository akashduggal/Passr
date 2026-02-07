export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  
  const now = new Date();
  const date = new Date(dateInput);
  const diffMs = now - date;
  
  // Handle future dates or invalid dates
  if (isNaN(diffMs)) return '';
  if (diffMs < 0) return 'Just now'; // Should not happen usually, but for safety

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}
