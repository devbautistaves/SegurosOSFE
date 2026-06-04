import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "SegurOS - CRM de Polizas y Cobranzas",
    template: "%s | SegurOS",
  },
  description: "SegurOS: Sistema de gestion de polizas, siniestros, cobranzas y seguimiento para tu empresa aseguradora.",
  keywords: [
    "seguros",
    "polizas",
    "crm seguros",
    "gestion de polizas",
    "siniestros",
    "cobranzas seguros",
    "SegurOS",
    "aseguradora",
  ],
  authors: [{ name: "SegurOS" }],
  creator: "SegurOS",
  publisher: "SegurOS",
  metadataBase: new URL("https://seguros.tusventas.com.ar"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://seguros.tusventas.com.ar",
    siteName: "SegurOS",
    title: "SegurOS - CRM de Polizas y Cobranzas",
    description: "Sistema de gestion de polizas, siniestros, cobranzas y seguimiento.",
  },
  robots: {
    index: false,
    follow: false,
  },
  category: "Software",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f2149" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2149" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="bg-slate-50">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
