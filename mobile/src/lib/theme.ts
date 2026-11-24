// Brand tokens — the same palette and typefaces as the website
// (src/app/globals.css: cream / cream-light / rose / brown / brown-dark / ink,
// Playfair Display for headings, Lato for body text).
export const C = {
  cream: '#f0d7a7',
  creamLight: '#eee1ba',
  page: '#f7eedb',
  surface: '#fbf5e9',
  rose: '#c37960',
  roseSoft: 'rgba(195, 121, 96, 0.14)',
  brown: '#894e3f',
  brownDark: '#5e352a',
  ink: '#2b1a15',
  // Luxury palette added in the website's premium redesign.
  gold: '#b08d57',
  goldSoft: 'rgba(176, 141, 87, 0.18)',
  goldLine: 'rgba(176, 141, 87, 0.35)',
  espresso: '#1f1411',
  espressoSoft: '#2c1d18',
  muted: '#7a6259',
  faint: 'rgba(43, 26, 21, 0.38)',
  white: '#ffffff',
  green: '#2f7d4f',
  greenBg: '#dff3e6',
  whatsapp: '#25d366',
  amber: '#9a6b00',
  amberBg: '#fdf1cf',
  red: '#b3261e',
  redBg: '#fde4e1',
  blue: '#2b5d9a',
  blueBg: '#e1ecfa',
  border: 'rgba(137, 78, 63, 0.16)',
  borderStrong: 'rgba(137, 78, 63, 0.32)',
};

export const R = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

/** Font family names registered in the root layout. */
export const F = {
  heading: 'PlayfairDisplay_700Bold',
  headingSemi: 'PlayfairDisplay_600SemiBold',
  headingItalic: 'PlayfairDisplay_400Regular_Italic',
  body: 'Lato_400Regular',
  bodyBold: 'Lato_700Bold',
  bodyBlack: 'Lato_900Black',
};

export const SHADOW = {
  card: '0 6px 18px rgba(94, 53, 42, 0.10)',
  lifted: '0 12px 28px rgba(94, 53, 42, 0.18)',
  bar: '0 -4px 20px rgba(94, 53, 42, 0.10)',
};

/** Max content width so the layout stays comfortable on tablets / web. */
export const MAX_W = 720;
