import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';

export const metadata = {
  title: 'MahoMart | Premium E-Commerce Experience',
  description: 'Shop curated high-performance lifestyle, footwear, and technology products at MahoMart.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <CartDrawer />
        <main className="flex-grow pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
