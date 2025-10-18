/**
 * Admin Dashboard Utility Functions
 */

export const formatDate = (timestamp: string | number): string => {
  try {
    const date = new Date(typeof timestamp === 'string' && /^\d+$/.test(timestamp) 
      ? parseInt(timestamp) 
      : timestamp
    );
    
    return date.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return 'Огноо алдаатай';
  }
};

export const formatDateTime = (timestamp: string | number): string => {
  try {
    const date = new Date(typeof timestamp === 'string' && /^\d+$/.test(timestamp) 
      ? parseInt(timestamp) 
      : timestamp
    );
    
    return date.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Огноо алдаатай';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('MNT', '₮');
};

export const calculateNights = (startDate: string | number, endDate: string | number): number => {
  try {
    const start = new Date(typeof startDate === 'string' && /^\d+$/.test(startDate) 
      ? parseInt(startDate) 
      : startDate
    );
    const end = new Date(typeof endDate === 'string' && /^\d+$/.test(endDate) 
      ? parseInt(endDate) 
      : endDate
    );
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
};

export const getTodayCount = (items: any[]): number => {
  if (!items || items.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return items.filter(item => {
    if (!item.createdAt) return false;
    const itemDate = new Date(
      typeof item.createdAt === 'string' && /^\d+$/.test(item.createdAt)
        ? parseInt(item.createdAt)
        : item.createdAt
    );
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === today.getTime();
  }).length;
};

export const getStatusBadgeColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-green-100 text-green-800',
    'COMPLETED': 'bg-blue-100 text-blue-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'PAID': 'bg-green-100 text-green-800',
    'SHIPPED': 'bg-blue-100 text-blue-800',
    'DELIVERED': 'bg-emerald-100 text-emerald-800'
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'PENDING': 'Хүлээгдэж буй',
    'CONFIRMED': 'Батлагдсан',
    'COMPLETED': 'Дууссан',
    'CANCELLED': 'Цуцлагдсан',
    'PAID': 'Төлөгдсөн',
    'SHIPPED': 'Илгээгдсэн',
    'DELIVERED': 'Хүргэгдсэн',
    'CUSTOMER': 'Хэрэглэгч',
    'HERDER': 'Малчин',
    'ADMIN': 'Админ'
  };
  
  return translations[status] || status;
};

export const translateRole = (role: string): string => {
  const translations: Record<string, string> = {
    'CUSTOMER': 'Хэрэглэгч',
    'HERDER': 'Малчин',
    'ADMIN': 'Админ'
  };
  
  return translations[role] || role;
};

// Export to Excel functionality
export const exportToExcel = async (data: any[], filename: string) => {
  try {
    const XLSX = await import('xlsx');
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
};

// Prepare booking data for export
export const prepareBookingsForExport = (bookings: any[]) => {
  return bookings.map(booking => ({
    'ID': booking.id,
    'Захиалагч': booking.user?.name || '',
    'Имэйл': booking.user?.email || '',
    'Утас': booking.user?.phone || '',
    'Гэр': booking.yurt?.name || '',
    'Байршил': booking.yurt?.location || '',
    'Эзэн': booking.yurt?.owner?.name || '',
    'Эхлэх огноо': formatDate(booking.startDate),
    'Дуусах огноо': formatDate(booking.endDate),
    'Үнэ': booking.totalPrice,
    'Төлөв': translateStatus(booking.status),
    'Огноо': formatDateTime(booking.createdAt)
  }));
};

// Prepare orders for export
export const prepareOrdersForExport = (orders: any[]) => {
  return orders.map(order => ({
    'ID': order.id,
    'Захиалагч': order.user?.name || '',
    'Имэйл': order.user?.email || '',
    'Утас': order.user?.phone || '',
    'Хаяг': order.shippingAddress || '',
    'Нийт үнэ': order.totalPrice,
    'Төлөв': translateStatus(order.status),
    'Огноо': formatDateTime(order.createdAt)
  }));
};

// Prepare users for export
export const prepareUsersForExport = (users: any[]) => {
  return users.map(user => ({
    'ID': user.id,
    'Нэр': user.name,
    'Имэйл': user.email,
    'Утас': user.phone || '',
    'Эрх': translateRole(user.role),
    'Бүртгүүлсэн': formatDateTime(user.createdAt)
  }));
};

// Prepare yurts for export
export const prepareYurtsForExport = (yurts: any[]) => {
  return yurts.map(yurt => ({
    'ID': yurt.id,
    'Нэр': yurt.name,
    'Байршил': yurt.location,
    'Үнэ': yurt.pricePerNight,
    'Багтаамж': yurt.capacity,
    'Эзэн': yurt.owner?.name || '',
    'Утас': yurt.owner?.phone || '',
    'Бүртгүүлсэн': formatDateTime(yurt.createdAt)
  }));
};

