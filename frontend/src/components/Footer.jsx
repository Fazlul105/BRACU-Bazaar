import React from 'react';
import { ShoppingBag, ShieldCheck, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
              <span className="text-lg font-black text-white">BRACU <span className="text-amber-400">Bazaar</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The official student-to-student marketplace exclusively built for BRAC University. Buy & sell textbooks, electronics, calculators, and hostel essentials with 8-digit student ID verification.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/products?category=Textbooks%20%26%20Notes" className="hover:text-amber-400 transition-colors">Course Textbooks & Notes</a></li>
              <li><a href="/products?category=Calculators%20%26%20Lab%20Gear" className="hover:text-amber-400 transition-colors">Calculators & Lab Gear</a></li>
              <li><a href="/products?category=Electronics%20%26%20Gadgets" className="hover:text-amber-400 transition-colors">Electronics & Gadgets</a></li>
              <li><a href="/products?category=Hostel%20%26%20Mess%20Essentials" className="hover:text-amber-400 transition-colors">Hostel & Mess Supplies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Campus Meetup Points</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Permanent Campus (Merul Badda)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Mohakhali UB1 - UB7</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Tarakanda Residential Campus</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Platform Governance</h4>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <ShieldCheck className="w-4 h-4" /> Super Admin
              </div>
              <p className="text-white font-medium">Md. Fazlul Karim</p>
              <p className="text-amber-400 font-mono text-[11px]">BRACU ID: 23101229</p>
              <p className="text-[10px] text-slate-500 pt-1">Authorized for full platform moderation & user safety.</p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BRACU Bazaar. Built for BRAC University Students.</p>
          <p className="flex items-center gap-1">
            Created with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for BRACU Community
          </p>
        </div>
      </div>
    </footer>
  );
}

