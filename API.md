# Zproo API contract

Base URL is set in `src/api/config.ts`. JSON in, JSON out. Errors return a non-2xx status with `{ "message": "..." }`, which the app shows to the user. Types referenced below live in `src/api/types.ts`.

| Method | Path | Body / query | Returns |
|---|---|---|---|
| POST | `/auth/otp` | `{ phone }` | `{ sent: true }` |
| POST | `/auth/verify` | `{ phone, otp, name? }` | `User` (includes `token`) |
| GET | `/cities?q=` | — | `City[]` |
| GET | `/offers` | — | `Offer[]` |
| POST | `/offers/validate` | `{ code, mode, amount }` | `{ valid, discount, message }` |
| POST | `/search/bus` | `TransportSearch` | `BusResult[]` |
| POST | `/search/train` | `TransportSearch` | `TrainResult[]` |
| POST | `/search/flight` | `TransportSearch` (with `cabin`) | `FlightResult[]` |
| POST | `/search/hotel` | `HotelSearch` | `HotelResult[]` |
| GET | `/bus/:id/seats?date=YYYY-MM-DD` | — | `{ decks: { name, rows: (Seat \| null)[][] }[] }` |
| POST | `/bookings` | `{ selection, travellers, contact, couponCode?, paymentMethod }` | `Booking` |
| GET | `/bookings` | — | `Booking[]` (newest first) |
| POST | `/bookings/:id/cancel` | — | `Booking` with `status: "CANCELLED"` |

Dates are `YYYY-MM-DD`, times are 24-hour `HH:mm`, prices are in rupees.

In production, `/bookings` should create a payment order with your gateway (Razorpay, PayU, etc.) and confirm the booking only after payment succeeds; the app currently treats the call as a completed payment.
