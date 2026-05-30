import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import Shell from "@/components/shell";

export const metadata: Metadata = {
  title: "Vocabulary-NB4-TOEIC Admin",
  description: "Admin console for TOEIC vocab platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
