import { Caveat, IBM_Plex_Mono, Spectral } from "next/font/google";

// Self-hosted at build time: no request to Google when someone opens the site, and no layout shift while fonts load.
// Weights match what the CSS uses. The CSS reads them through --serif, --mono and --hand in globals.css.
export const spectral = Spectral({ weight: ["300", "400"], style: ["normal", "italic"], subsets: ["latin"], display: "swap", variable: "--font-spectral" });
export const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--font-plex-mono" });
export const caveat = Caveat({ weight: ["500"], subsets: ["latin"], display: "swap", variable: "--font-caveat" });
