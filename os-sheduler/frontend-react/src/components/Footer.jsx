/**
 * Footer Component
 * Sticky footer with links and information
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="sticky top-[100vh] bg-gray-800 dark:bg-gray-900 text-gray-300 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              CPU Scheduler Simulator
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              A comprehensive interactive tool for visualizing and comparing CPU scheduling algorithms. 
              Understand process management, context switching, and performance metrics in real-time.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/jayanth-midde-968150321/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
                title="Connect on LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://github.com/Jayasurya09s/User-Level-CPU-sheduler"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
                title="View on GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/new" className="hover:text-white transition-colors">
                  New Simulation
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">
                  Run History
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Compare Runs
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/docs" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/docs#algorithms" className="hover:text-white transition-colors">
                  Algorithm Guide
                </Link>
              </li>
              <li>
                <Link to="/docs#api" className="hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/docs#tutorials" className="hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} CPU Scheduler Simulator. Built for educational purposes by Jayanth Midde.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/docs#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/docs#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Use
              </Link>
              <a 
                href="mailto:jayanthmidde@example.com" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
