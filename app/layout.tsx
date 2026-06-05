import "./globals.css";

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
