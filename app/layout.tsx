import type { Metadata } from "next";
import "./globals.css";
import { Figtree } from "next/font/google";

const roboto = Figtree({
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
