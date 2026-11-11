import { Caveat, IBM_Plex_Mono, Spectral } from "next/font/google";

// Self-hosted at build time: no request to Google when someone opens the site, and no layout shift while fonts load.
// Weights match what the CSS uses. The CSS reads them through --serif, --mono and --hand in globals.css.
//
// Speed: only the fonts on the first screen are preloaded (Spectral 300 normal and italic, Plex Mono 400 and 500).
// On a slow phone, every preloaded file shares the line with the one stylesheet that first paint waits for,
// so preloading fonts nobody sees yet holds the whole page back. Spectral 400 and Caveat (the hand) only appear
// further down; they still load, just after the first screen has painted.
// Both Spectral calls declare the same family, "Spectral", so --serif picks up every weight from either.
export const spectral = Spectral({ weight: ["300"], style: ["normal", "italic"], subsets: ["latin"], display: "swap", variable: "--font-spectral" });
export const spectralBook = Spectral({ weight: ["400"], style: ["normal", "italic"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-spectral-book" });
export const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--font-plex-mono" });
export const caveat = Caveat({ weight: ["500"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-caveat" });
