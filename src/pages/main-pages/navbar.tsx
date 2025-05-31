// Navbar.tsx
import React, { useState, useEffect } from 'react';
import { 
  Route,
  Menu,
  X,
  Home,
  TrendingUp,
  CalendarDays,
  User,
  Settings
} from 'lucide-react';

interface NavItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems: NavItem[] = [
    { id: 1, name: 'Home', icon: <Home className="w-5 h-5" />, path: '/' },
    { id: 2, name: 'Roadmap', icon: <Route className="w-5 h-5" />, path: '/roadmap' },
    { id: 3, name: 'Progress', icon: <TrendingUp className="w-5 h-5" />, path: '/progress' },
    { id: 4, name: 'Timeline', icon: <CalendarDays className="w-5 h-5" />, path: '/timeline' },
    { id: 5, name: 'Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
    { id: 6, name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0F172A] shadow-lg py-2' : 'bg-gradient-to-b from-[#0F172A] to-[#020617] py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Route className="text-[#60A5FA] w-6 h-6 mr-2" />
            <span className="text-xl font-bold text-[#60A5FA]">RoadMapper</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.path}
                className="flex items-center text-[#E2E8F0] hover:text-[#3B82F6] transition-colors"
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-[#E2E8F0] focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  className="flex items-center px-4 py-2 text-[#E2E8F0] hover:bg-[#1E293B] hover:text-[#3B82F6] rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;