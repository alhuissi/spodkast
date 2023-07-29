import { Metadata } from "next";
import "../styles/globals.css";

let title = "PDF to Podcast";
let description = "Generate customizable audio from your PDF files seconds.";
let ogimage = "https://spodkest.vercel.app/og-image.png";
let sitename = "spodkest.vercel.app";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: "https://spodkest.vercel.app/",
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#17181C] text-white">
        {children}
      </body>
    </html>
  );
}
