import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drivewise | Driver Safety Score",
  description: "A calm, clear view of every drive.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
