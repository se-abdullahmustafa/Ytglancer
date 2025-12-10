import "./globals.css";

export const metadata = {
  title: "YtGlancer - Convert YouTube Videos to PDF Notes Instantly",
  description:
    "Transform YouTube videos into organized, searchable PDF notes in seconds. Free YouTube to PDF converter - YtGlancer",
  metadataBase: new URL("https://ytglancer.com"),
  openGraph: {
    title: "YtGlancer - YouTube to PDF Converter",
    description:
      "Transform YouTube videos into organized, searchable PDF notes instantly",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="layout-content">{children}</div>
      </body>
    </html>
  );
}
