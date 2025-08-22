import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import Link from 'next/link'

const page = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 md:px-8 flex justify-between items-center relative z-10">
        <div className="text-2xl font-bold text-gray-800">
          <Link href="/">MyAdvancedApp</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition duration-300">Home</Link>
          <Link href="/features" className="text-gray-600 hover:text-gray-900 transition duration-300">Features</Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900 transition duration-300">About</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition duration-300">Contact</Link>

          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Dashboard</Button>
          </Link>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 w-full py-4 z-0">
          <div className="flex flex-col items-center space-y-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900 transition duration-300" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/features" className="text-gray-700 hover:text-gray-900 transition duration-300" onClick={() => setIsOpen(false)}>Features</Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 transition duration-300" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900 transition duration-300" onClick={() => setIsOpen(false)}>Contact</Link>

            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full">Dashboard</Button>
            </Link>
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Login</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Kanban Board Content */}

      {/* Footer */}
      <footer className="bg-gray-800 p-6 text-white text-center text-sm">
        <div className="container mx-auto">
          <p>&copy; 2025 MyAdvancedApp. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default page