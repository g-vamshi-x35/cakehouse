# Cake House — mobile app

The official Android (and iOS) app for Cake House, built with **Expo (React Native)**.
It uses the **same Supabase backend as the website** (www.cakehousekmp.in): the same
products, prices, photos, customers, orders, addresses, custom cake requests and
notifications. Nothing is duplicated, and the website keeps working exactly as before.

## What's in the app

| Area | Screens |
| --- | --- |
| Onboarding | Welcome → Personal details (name, phone, date of birth) → Create password (show/hide, confirm, strength rules) → Success celebration → Home. Plus Log in (phone **or** email) and "browse as guest". |
| **Home** tab | Website hero, offers (active coupons, banners from the owner dashboard, highlights), shop by category, bestsellers (`is_featured`), popular picks, why choose us, reviews, gallery, contact. |
| **Menu** tab | Search, category chips, sorting, product grid → product details (photos, sizes, flavours, message on cake, quantity, reviews) → cart → checkout (saved addresses, date and time slot, coupon, delivery charge) → order placed (UPI advance + WhatsApp). |
| **Custom Cake** tab | Size, shape, layers, flavour, cream, theme, message, inspiration photo (gallery or camera, uploaded to Supabase Storage), instructions, date → request goes to the owner dashboard. |
| **Account** tab | Profile header, my orders (status timeline, order again), custom cake requests (quotes), notifications, personal details, saved addresses, contact the shop, log out. Staff accounts also get their dashboard. |

## How it connects to the existing backend

- **Auth**: Supabase Auth, the same project as the website. Website customers and staff log in with their
  email. New app customers register with their phone number: the account's login id is
  `<10-digit phone>@phone.cakehousekmp.in` (never shown, nothing is emailed to it). The profile
  (name, phone, birthday) goes into the same `profiles` table the website uses.
- **Orders**: `place_cart_order` (migration `supabase/migrations/0026_place_cart_order_function.sql`).
  It is additive: the website's `place_quick_order` is unchanged. Prices, coupons and totals are
  recalculated in the database, so the app can't be used to change prices.
- **Custom cakes**: insert into `custom_cake_requests`; photos go to the `uploads` bucket under
  `custom-cakes/`, the same as the website form.
- **Notifications**: rows in the existing `notifications` table appear in the app, with an unread badge, and
  as Android system notifications while the app is open or resumed.
- **Product photos**: website photos are bundled for instant loading (`npm run sync-images`); new photos added
  on the website load from www.cakehousekmp.in automatically.

Data access is protected by the database's Row Level Security policies, the same as the website. The
publishable key in `src/lib/supabase.ts` is public by design. Never put the service-role key in the app.

## Run it on your phone

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Play Store). For camera and system notifications, use a development build
(`npx eas-cli@latest build --profile development --platform android`).

Preview in a browser: `npx expo start --web`.

## Build for the Play Store

1. Create a free account at expo.dev, then run the following in `mobile/`:
   `npx eas-cli@latest login` and `npx eas-cli@latest init` (this adds the project id to app.json).
2. Test APK (install directly on a phone):
   `npx eas-cli@latest build --platform android --profile preview`
3. Play Store bundle (AAB, version code auto-increments):
   `npx eas-cli@latest build --platform android --profile production`
4. Upload the AAB in Google Play Console, or `npx eas-cli@latest submit --platform android`
   (needs a Play service-account key; goes to the internal testing track as a draft).

App id: `in.cakehousekmp.app`. Icon, adaptive icon (with themed/monochrome layer), splash screen and
notification icon are in `assets/images/`. Permissions: camera (cake photos), notifications, internet.
Microphone and legacy storage permissions are blocked.

## Checks

```bash
npx tsc --noEmit      # typecheck
npx expo lint         # lint
npx expo export --platform android   # production bundle compiles
```
