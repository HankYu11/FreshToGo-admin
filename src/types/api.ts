export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  token: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalMerchants: number;
  activeMerchants: number;
  todayReservations: number;
  todayRevenue: number;
  noShowRate: number;
}

export interface TimeseriesPoint {
  date: string;
  value: number;
}

export interface TimeseriesResponse {
  metric: string;
  dateFrom: string;
  dateTo: string;
  data: TimeseriesPoint[];
}

export interface Merchant {
  id: string;
  email: string;
  storeName: string;
  storeAddress: string;
  isVerified: boolean;
  createdAt: string;
  boxCount: number;
  reservationCount: number;
}

export interface MerchantDetail {
  id: string;
  email: string;
  storeName: string;
  storeAddress: string;
  isVerified: boolean;
  createdAt: string;
  boxCount: number;
  activeReservationCount: number;
  totalReservationCount: number;
}

export interface MerchantCreateRequest {
  email: string;
  password: string;
  storeName: string;
  storeAddress: string;
}

export interface User {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  noShowCount: number;
  isBlocked: boolean;
  createdAt: string;
  reservationCount: number;
}

export interface UserDetail {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  noShowCount: number;
  isBlocked: boolean;
  createdAt: string;
  totalReservations: number;
  completedPickups: number;
  cancellations: number;
  noShows: number;
}

export type ReservationStatus = 'ACTIVE' | 'PICKED_UP' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';

export interface Reservation {
  id: string;
  orderId: string;
  userId: string;
  userDisplayName: string;
  boxId: string;
  boxName: string;
  merchantId: string;
  merchantStoreName: string;
  price: number;
  status: ReservationStatus;
  pickupDate: string;
  createdAt: string;
}

export interface ReservationDetail extends Reservation {
  isPickedUp: boolean;
  isCancelled: boolean;
  noShowProcessedAt: string | null;
  redemptionCode: string;
}

export type BoxStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'EXPIRED';

export interface Box {
  id: string;
  name: string;
  merchantId: string;
  merchantStoreName: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  remainingCount: number;
  status: BoxStatus;
  saleDate: string;
  saleTimeStart: string;
  saleTimeEnd: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  createdAt: string;
}

export interface BoxDetail extends Box {
  description: string;
  merchantStoreAddress: string;
  imageUrl: string | null;
  reservations: Reservation[];
}
