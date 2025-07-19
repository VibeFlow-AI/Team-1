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
      <img src="/file.svg" alt="Logo" className="w-10 h-10" />
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

        {/* Right: Actions */}
        <div>
          {!user && (
            <Link href="/auth/register">
              <Button size="lg" className="rounded-md">Get Started</Button>
            </Link>
          )}
          {user && (
            <Button variant="outline" onClick={handleLogout} className="rounded-md">
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
