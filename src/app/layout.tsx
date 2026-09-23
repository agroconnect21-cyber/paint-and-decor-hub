import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });
export const metadata: Metadata = { title: "Paint & Decor Hub | Bringing Colour & Style to Your Space", description: "Premium paint finishes, quality decor products, and nationwide delivery from Paint & Decor Hub." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body className={`${display.variable} ${sans.variable}`}>{children}</body></html>; }