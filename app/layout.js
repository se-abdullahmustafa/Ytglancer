import "./globals.css";

export const metadata = {
  title: "YtGlancer - Convert YouTube Videos to PDF Notes Instantly",
  description:
    "Transform YouTube videos into organized, searchable PDF notes in seconds. Free YouTube to PDF converter - YtGlancer",
};

export const viewport = {
  themeColor: "#667eea",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-content">{children}</div>
      </body>
    </html>
  );
}
