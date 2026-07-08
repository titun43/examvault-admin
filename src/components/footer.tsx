'use client';

import { useAppStore } from '@/lib/store';
import { GraduationCap, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  const { setCurrentView } = useAppStore();

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg text-primary">NEXTEXAM</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Your #1 destination for complete exam preparation.
            </p>
            <div className="flex gap-3">
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('exams')} className="hover:text-primary transition-colors">
                  All Exams
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('leaderboard')} className="hover:text-primary transition-colors">
                  Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-primary cursor-pointer transition-colors">Help Center</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Contact Us</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">FAQ</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span></li>
              <li><span className="hover:text-primary cursor-pointer transition-colors">Refund Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2025 NEXTEXAM. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
