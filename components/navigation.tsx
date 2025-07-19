import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img src="/file.svg" alt="Logo" className="w-8 h-8" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 hidden md:flex justify-center space-x-8">
            <Link
              href="#home"
              className="text-black hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="#sessions"
              className="text-black hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              Sessions
            </Link>
            <Link
              href="#about"
              className="text-black hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              About
            </Link>
          </div>

          {/* Get Started Button */}
          <div className="flex-shrink-0">
            <Button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
