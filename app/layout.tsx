import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";



export const metadata: Metadata = {
  title: "ShopEase -  Your Premium E-commerce Store",
  description: 'Shop the best products at amazing prices with fast delivery',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        <main className="main-content">
          {children}
        </main>

        <Footer/>

      </body>
    </html>
  );
}
