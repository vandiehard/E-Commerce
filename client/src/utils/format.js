export const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

export const getImageUrl = (images) => {
  if (!images) return '/placeholder-product.svg';
  // Parse JSON string (from raw SQL queries)
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      // If it's already a URL string (not JSON)
      return images.startsWith('http') ? images : '/placeholder-product.svg';
    }
  }
  if (!Array.isArray(images) || images.length === 0) return '/placeholder-product.svg';
  const img = images[0];
  return img && img.startsWith('http') ? img : '/placeholder-product.svg';
};
