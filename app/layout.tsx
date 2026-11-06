import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./auth.css";
import { Analytics } from "@vercel/analytics/next";
export const metadata: Metadata = { title: "PACE Zone | Run Smarter", description: "PACE Zone — Pace calculator, calorie tracker, race strategy and running training companion", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "PACE Zone" } };
export const viewport: Viewport = { themeColor: "#101b20", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}<Analytics /></body></html>; }
