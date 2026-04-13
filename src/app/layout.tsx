import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compre Bitcoin de Forma 100% Privada | DSEC Labs",
  description:
    "Aprenda do zero ao setup completo de auto-custódia em 5 dias. Mini curso gratuito por email. Sem KYC. Sem intermediários.",
  openGraph: {
    title: "Compre Bitcoin de Forma 100% Privada",
    description:
      "Do zero ao setup completo de auto-custódia em 5 dias — direto no seu e-mail.",
    images: ["https://img.youtube.com/vi/nqrHdNllzik/maxresdefault.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
