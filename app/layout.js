import './globals.css';
import Header from './components/header/header';
import Footer from './components/footer/footer';

export const metadata = {
    title: 'YtGlancer - Convert YouTube Videos to PDF Notes Instantly',
    description: 'Transform YouTube videos into organized, searchable PDF notes in seconds. Free YouTube to PDF converter - YtGlancer',
    themeColor: '#667eea',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Google Analytics */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-W0KMKPGT63"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-W0KMKPGT63');
            `,
                    }}
                />
                {/* Ahrefs Analytics */}
                <script async src="https://analytics.ahrefs.com/analytics.js" data-key="MzIaBwdecol4j4IdLNl7OA"></script>
            </head>
            <body>
                <Header />
                <div className="layout-content">
                    {children}
                </div>
                <Footer />
            </body>
        </html>
    );
}
