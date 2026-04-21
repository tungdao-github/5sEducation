export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  title: string;
  instructor: string;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  discount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  fullName: string;
  trackingSteps: {
    label: string;
    date: string;
    done: boolean;
  }[];
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-2026-001',
    userId: 'u1',
    items: [
      { id: '1', title: 'Nguyên tắc Gestalt: Thiết kế giao diện trực quan', instructor: 'Tanner Kohler', price: 289, image: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=400&auto=format&fit=crop' },
      { id: '3', title: 'Microcopy: Tiêu đề, đề mục, thẻ và nhiều hơn nữa', instructor: 'Kate Moran', price: 199, image: 'https://images.unsplash.com/photo-1586943759341-be5595944989?w=400&auto=format&fit=crop' },
    ],
    total: 438, discount: 50, couponCode: 'SALE50',
    status: 'completed', paymentMethod: 'VNPay',
    createdAt: '2026-03-01T10:30:00', updatedAt: '2026-03-01T11:00:00',
    email: 'user@test.com', fullName: 'Nguyễn Văn An',
    trackingSteps: [
      { label: 'Đặt hàng thành công', date: '01/03/2026 10:30', done: true },
      { label: 'Xác nhận thanh toán', date: '01/03/2026 10:35', done: true },
      { label: 'Đang xử lý', date: '01/03/2026 10:40', done: true },
      { label: 'Hoàn thành', date: '01/03/2026 11:00', done: true },
    ],
  },
  {
    id: 'ORD-2026-002',
    userId: 'u1',
    items: [
      { id: '5', title: '10 nguyên tắc đánh giá khả năng sử dụng', instructor: 'Jakob Nielsen', price: 99, image: 'https://images.unsplash.com/photo-1585624882829-f92c2d4cd89d?w=400&auto=format&fit=crop' },
    ],
    total: 99, discount: 0,
    status: 'processing', paymentMethod: 'ZaloPay',
    createdAt: '2026-03-28T15:00:00', updatedAt: '2026-03-28T15:05:00',
    email: 'user@test.com', fullName: 'Nguyễn Văn An',
    trackingSteps: [
      { label: 'Đặt hàng thành công', date: '28/03/2026 15:00', done: true },
      { label: 'Xác nhận thanh toán', date: '28/03/2026 15:05', done: true },
      { label: 'Đang xử lý', date: '28/03/2026 15:10', done: true },
      { label: 'Hoàn thành', date: '', done: false },
    ],
  },
];

export const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export const coupons: Record<string, number> = {
  'SALE50': 50, 'NEWUSER': 100, 'UXDESIGN20': 20,
  'SUMMER30': 30, 'FLASH10': 10,
};
