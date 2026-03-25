export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalMerchants: number;
  totalUsers: number;
  activeReservations: number;
  totalBoxes: number;
  totalRevenue: number;
  newUsersToday: number;
}

export interface TimeseriesPoint {
  date: string;
  value: number;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantCreateRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  blocked: boolean;
  noShowCount: number;
  createdAt: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  merchantId: string;
  merchantName: string;
  boxId: string;
  boxName: string;
  price: number;
  status: ReservationStatus;
  pickupTime: string;
  cancelReason?: string;
  createdAt: string;
}

export type BoxStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'EXPIRED';

export interface Box {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  remaining: number;
  status: BoxStatus;
  saleDate: string;
  pickupStart: string;
  pickupEnd: string;
  createdAt: string;
}
