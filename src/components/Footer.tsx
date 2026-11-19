interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#14181F] text-white pt-12 pb-8">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect width="24" height="24" rx="5" fill="#007BFB" />
                <path
                  d="M6.5 17.5V9.5L12 5.5L17.5 9.5V17.5H14V12.5H10V17.5H6.5Z"
                  fill="#FFFFFF"
                />
              </svg>
              <span>Жениш строй</span>
            </div>
            <p className="text-xs sm:text-sm text-white/65 leading-relaxed max-w-xs">
              Строительная компания полного цикла в Кыргызской Республике.
              Жилые кварталы комфорт-, бизнес- и премиум-класса в Бишкеке и Оше.
            </p>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-sm">
            <div className="text-xs font-semibold text-white/50">Навигация</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'projects', label: 'Жилые комплексы' },
                { id: 'apartments', label: 'Подбор квартир' },
                { id: 'tour-showcase', label: '3D-тур' },
                { id: 'mortgage', label: 'Ипотека и Trade-In' },
                { id: 'about', label: 'О компании' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 space-y-2 text-xs sm:text-sm text-white/75">
            <div className="text-xs font-semibold text-white/50">
              Офисы продаж
            </div>
            <div>Бишкек: ул. Медерова, 89</div>
            <div>Ош: ул. Ленина, 147</div>
            <div className="font-mono text-white font-semibold pt-1">
              +996 (555) 700-800
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} Строительная компания «Жениш строй». Все права защищены.
          </div>
          <div>
            Информация на сайте носит ознакомительный характер и не является публичной офертой.
          </div>
        </div>
      </div>
    </footer>
  );
}
