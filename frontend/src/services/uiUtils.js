// Format Indian Rupee (INR) with Indian number formatting (Lakhs & Crores)
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0);
}

// Toast & Notification Manager
export function showToast(message, type = 'success') {
  const container = document.getElementById('toastStack');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconName = type === 'success' ? 'check-circle-2' : type === 'error' ? 'alert-octagon' : 'info';
  
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ icons: window.lucide.icons });
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal helper
export function openModal(title, subtitle, contentHtml, icon = 'info') {
  const backdrop = document.getElementById('modalBackdrop');
  const titleEl = document.getElementById('modalTitle');
  const subtitleEl = document.getElementById('modalSubtitle');
  const bodyEl = document.getElementById('modalBody');
  const iconEl = document.getElementById('modalIcon');

  if (backdrop && titleEl && bodyEl) {
    titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    bodyEl.innerHTML = contentHtml;
    if (iconEl) iconEl.innerHTML = `<i data-lucide="${icon}"></i>`;
    backdrop.style.display = 'flex';
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ icons: window.lucide.icons });
    }
  }
}

export function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.style.display = 'none';
}

// Indian Standard Time (IST, UTC+5:30) Formatter
export function getIndianDateTime(date = new Date()) {
  const d = new Date(date);
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const parts = new Intl.DateTimeFormat('en-IN', options).formatToParts(d);
  const map = {};
  parts.forEach(p => map[p.type] = p.value);
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

export function getIndianDate(date = new Date()) {
  const d = new Date(date);
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-IN', options).formatToParts(d);
  const map = {};
  parts.forEach(p => map[p.type] = p.value);
  return `${map.year}-${map.month}-${map.day}`;
}
