import "./../styles/globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

<Toaster position="top-right" />


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <nav className="bg-gray-900 px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <span className="text-xl">📈</span>
            <span className="text-xl">AutoInsight Pro</span>
          </div>
          <ul className="flex gap-6 text-sm text-gray-300">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><a href="/sample.csv" download className="hover:text-white">Sample CSV</a></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            
          </ul>
        </nav>
        <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

