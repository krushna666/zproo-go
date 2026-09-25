/*
 * Domain enums shared by the web app and API. Values that are persisted also exist as
 * Prisma enums; apps/api has a test asserting both stay identical.
 */

export const RoleName = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUPPORT: 'SUPPORT',
  OPERATOR: 'OPERATOR',
  DRIVER: 'DRIVER',
  HOTEL_PARTNER: 'HOTEL_PARTNER',
  TRAVEL_PARTNER: 'TRAVEL_PARTNER',
  CORPORATE_ADMIN: 'CORPORATE_ADMIN',
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ServiceType = {
  FLIGHT: 'FLIGHT',
  BUS: 'BUS',
  TRAIN: 'TRAIN',
  HOTEL: 'HOTEL',
  CAB: 'CAB',
  BIKE: 'BIKE',
  HOLIDAY: 'HOLIDAY',
  PARCEL: 'PARCEL',
  CORPORATE: 'CORPORATE',
} as const;
export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export const BookingStatus = {
  INITIATED: 'INITIATED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const Currency = {
  INR: 'INR',
  USD: 'USD',
  AED: 'AED',
} as const;
export type Currency = (typeof Currency)[keyof typeof Currency];
