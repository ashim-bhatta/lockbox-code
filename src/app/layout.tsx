import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: "Paywall.zip - Stop getting ghosted. Start getting paid.",
  description: "Close the trust gap between freelancers and clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
