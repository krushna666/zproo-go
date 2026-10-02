# Zproo — Android app

Book **buses, trains, flights and hotels** in one app. Built with React Native (Expo SDK 57, TypeScript, React Navigation).

## What's inside

| Area | Screens |
|---|---|
| Auth | Mobile + OTP login (demo OTP `123456`) |
| Home | Bus / Train / Flight / Hotel search, city picker, calendar, passengers, cabin class, rooms & guests, offers |
| Results | Date strip, sort (cheapest / fastest / earliest / rating), filters per mode |
| Bus | Seat map (sleeper & seater, lower/upper deck, ladies seats), boarding & dropping points |
| Train | Class selection with AVL / RAC / WL availability |
| Flight | Saver / Flexi / Super Flexi fares with baggage, meals, cancellation |
| Hotel | Amenities, room types, refundable & breakfast tags |
| Checkout | Traveller details with validation, coupon codes, fare breakdown, UPI / card / net banking / wallet |
| Trips | Ticket with PNR & QR, share, cancel, upcoming / cancelled tabs |
| Profile | Edit name & email, support, log out |

## Get the APK

Every push to `main` runs **Actions → Build Android APK**. When it finishes, open the run and download **zproo-apk** under *Artifacts*. Push a tag like `v1.0.0` and the APK is also attached to a GitHub Release.

The release APK is signed with the default debug key, so it installs on any phone (enable *Install unknown apps*) but **cannot be uploaded to the Play Store**. For Play Store, generate an upload keystore and add signing to the workflow, or use `npx eas-cli build -p android`.

## Run locally

```bash
npm install
npx expo run:android      # needs Android Studio / SDK
# or build the APK yourself
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease   # → android/app/build/outputs/apk/release/app-release.apk
```

## Connecting the real Zproo API

All network calls go through `src/api/services.ts`. Right now `src/api/config.ts` has `USE_MOCK: true`, so an in-app mock server (`src/api/mock/server.ts`) answers every request with realistic, repeatable data and stores bookings on the device.

To go live:

1. In `src/api/config.ts` set `USE_MOCK: false` and `BASE_URL` to your API.
2. Make your backend implement the endpoints in [API.md](API.md), returning the shapes in `src/api/types.ts` — or adjust `services.ts` to map your existing responses.

The auth token from `/auth/verify` is sent as `Authorization: Bearer <token>` on every request.

## Project layout

```
App.tsx                     providers + navigator
src/api/                    config, HTTP client, services, types, pricing, mock server
src/components/             UI kit, city picker, calendar, ticket
src/navigation/             stack + bottom tabs
src/screens/                all screens
.github/workflows/          APK build
```
