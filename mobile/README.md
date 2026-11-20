# Cake House — mobile app

Expo (React Native) app for Cake House. It uses the **same Supabase database**
as the website, so menu, prices, orders and staff accounts are shared.

- **Menu** — browse cakes, customized cakes, pizza and snacks with photos.
- **Order** — choose size, flavour, quantity, cake message, delivery date/time;
  the price is calculated by the database (same as the website). Pay the ₹100
  advance by UPI and send the order number on WhatsApp.
- **Orders** — customers see their orders after logging in.
- **Dashboard** — owner / employee / delivery staff log in with their website
  accounts to see orders, confirm advance payments and update order status.

## Run it on your phone

1. Install **Expo Go** from the Play Store / App Store.
2. On your computer, in this `mobile` folder:

   ```bash
   npm install
   npx expo start
   ```

3. Scan the QR code shown in the terminal with Expo Go (Android) or the
   Camera app (iPhone). Your phone and computer must be on the same Wi-Fi.

The app connects to the live Supabase project by default — no `.env` file is
needed. To use a local database instead, create `.env.local` with
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Preview in a browser: `npx expo start --web`.

## Product photos

Photos are bundled from the website's `public/images` folder. After adding
new photos to the website, run:

```bash
node scripts/sync-images.mjs
```

## Publish to the Play Store

Use EAS Build: `npx eas-cli@latest build --platform android` (needs a free
Expo account). The app id is `in.cakehousekmp.app`.
