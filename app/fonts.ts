import { Caveat, IBM_Plex_Mono, Spectral } from "next/font/google";

// Self-hosted at build time: no request to Google when someone opens the site, and no layout shift while fonts load.
// Weights match what the CSS uses. The CSS reads them through --serif, --mono and --hand in globals.css.
//
// Speed: every font a page's first screen uses is preloaded. Spectral 300 and 400, normal and italic, are all on
// some page's first screen (400 on /team, /careers, /audit and most inner pages), and so is Plex Mono. Caveat (the
// hand: signature, hand notes) is on no first screen, so it is not preloaded: it still loads, after first paint,
// instead of sharing the line with the stylesheet that first paint waits for.
export const spectral = Spectral({ weight: ["300", "400"], style: ["normal", "italic"], subsets: ["latin"], display: "swap", variable: "--font-spectral" });
export const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--font-plex-mono" });
export const caveat = Caveat({ weight: ["500"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-caveat" });
