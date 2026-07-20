import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "B2B Community | India's Largest Marketplace",
  description: "Connect buyers with sellers in India's leading B2B marketplace.",
};

import LayoutWrapper from "@/components/LayoutWrapper";
import GoogleAdsProvider from "@/components/GoogleAdsProvider";
import ReduxProvider from "@/redux/ReduxProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${poppins.variable} font-sans antialiased bg-gray-50 text-slate-800`}
      >
        <ReduxProvider>
          <AuthProvider>
            <GoogleAdsProvider />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
