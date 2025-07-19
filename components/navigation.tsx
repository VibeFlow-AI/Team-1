"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "#home", label: "Home" },
  { href: "#sessions", label: "Sessions" },
  { href: "#about", label: "About" },
];

function NavLogo() {
  return (
    <Link href="/" className="flex-shrink-0">
      <img src="/img.jpg" alt="Logo" className="w-10 h-10 object-contain" />
    </Link>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-black font-thin hover:text-gray-600 text-lg"
    >
      {label}
    </Link>
  );
}

export default function Navigation() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed top-0 inset-x-4 z-50 bg-white rounded-b-lg shadow-md">
      <div className="flex items-center justify-between px-8 py-5">
        {/* Left: Logo */}
        <NavLogo />

        {/* Center: Navigation Links */}
        <div className="flex space-x-8">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} />
          ))}
        </div>

        {/* Right: Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700 text-sm">Welcome, {user.email}</span>
              <Link href="/dashboard">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>

              <Link href="/auth/register">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
