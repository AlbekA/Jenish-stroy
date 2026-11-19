import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'projects', label: 'Проекты' },
    { id: 'apartments', label: 'Квартиры' },
    { id: 'tour-showcase', label: '3D-тур' },
    { id: 'mortgage', label: 'Ипотека' },
    { id: 'about', label: 'О компании' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-[#E5EAF0]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#14181F] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#007BFB] focus-visible:outline-offset-4 rounded"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="24" height="24" rx="5" fill="#007BFB" />
            <path
              d="M6.5 17.5V9.5L12 5.5L17.5 9.5V17.5H14V12.5H10V17.5H6.5Z"
              fill="#FFFFFF"
            />
          </svg>
          <span>Жениш строй</span>
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Основная навигация"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5E6773]"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="relative py-1 hover:text-[#14181F] transition-colors duration-150 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1.5px] after:bg-[#007BFB] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-150 after:origin-left focus-visible:outline-2 focus-visible:outline-[#007BFB] rounded"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary CTA action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('apartments')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#007BFB] hover:bg-[#0065D1] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#007BFB] focus-visible:outline-offset-2"
          >
            Подобрать квартиру
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E5EAF0] text-[#14181F] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E5EAF0] px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="block px-3 py-2.5 text-sm font-medium text-[#14181F] hover:bg-[#F5F7FA] rounded-lg"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleLinkClick('apartments')}
              className="w-full py-3 text-sm font-semibold text-white bg-[#007BFB] hover:bg-[#0065D1] rounded-lg transition-colors cursor-pointer"
            >
              Подобрать квартиру
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
