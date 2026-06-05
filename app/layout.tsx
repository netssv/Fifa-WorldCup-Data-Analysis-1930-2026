import "./globals.css";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <head>
        <title>FIFA World Cup 2026 Bracket</title>
        <meta
          name="description"
          content="Interactive prediction bracket for the FIFA World Cup 2026. Pick your teams through every round — from Groups to the Champion."
        />
        {/* Google Analytics 4 (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-822XS7WHJP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-822XS7WHJP');
          `}
        </Script>
      </head>
      <body
        className="min-h-screen bg-neutral-100 dark:bg-neutral-950 antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
