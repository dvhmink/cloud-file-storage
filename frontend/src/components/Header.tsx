"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          Cloud File Storage
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500"
          >
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-900 dark:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-500"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-500"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-500"
            >
              Contact
            </Link>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
