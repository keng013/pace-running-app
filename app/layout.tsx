import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "PACE | Run Smarter", description: "Pace calculator, race strategy and running training companion by KRIT.DEV", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "PACE" } };
export const viewport: Viewport = { themeColor: "#101b20", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}</body></html>; }
