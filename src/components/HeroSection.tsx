import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import {
  formatMoney,
  HERO_IMAGE_URL,
  USD_TO_KGS_RATE,
} from '../data/realEstateData';
import { City, CurrencyCode, RoomFilter } from '../types/realEstate';

interface HeroSectionProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  cityFilter: City | 'all';
  onCityFilterChange: (city: City | 'all') => void;
  roomFilter: RoomFilter;
  onRoomFilterChange: (room: RoomFilter) => void;
  maxBudgetUsd: number;
  onMaxBudgetUsdChange: (val: number) => void;
  matchingCount: number;
  onApplyQuickSearch: () => void;
  onOpenTourShowcase: () => void;
}

export function HeroSection({
  currency,
  onCurrencyChange,
  cityFilter,
  onCityFilterChange,
  roomFilter,
  onRoomFilterChange,
  maxBudgetUsd,
  onMaxBudgetUsdChange,
  matchingCount,
  onApplyQuickSearch,
  onOpenTourShowcase,
}: HeroSectionProps) {
  const roomOptions: { value: RoomFilter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'studio', label: 'Студия' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3+' },
  ];

  const minBudgetUsd = 45000;
  const ceilingBudgetUsd = 220000;
  const sliderPercent = Math.round(
    ((maxBudgetUsd - minBudgetUsd) / (ceilingBudgetUsd - minBudgetUsd)) * 100
  );

  return (
    <section id="top" className="bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8">
        {/* Samolet-style rounded architectural canvas with integrated quick search bar */}
        <div className="relative rounded-2xl overflow-hidden bg-[#14181F] min-h-[520px] lg:min-h-[580px] flex flex-col justify-between">
          {/* Background Render + Fallback Gradient */}
          <img
            src={HERO_IMAGE_URL}
            alt="Современный жилой квартал Жениш строй на фоне гор Ала-Тоо в Бишкеке"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0C121D]/90 via-[#0C121D]/55 to-[#0C121D]/25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0C121D]/90 via-transparent to-[#0C121D]/30"
          />

          {/* Top Editorial Headline Block */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-3xl">
            <p className="text-xs sm:text-sm font-medium text-white/80 tracking-wide mb-3">
              Бишкек · Ош · Wellness-стандарты · Рассрочка 0% до 36 месяцев
            </p>
            <h1
              className="text-white font-bold tracking-tight leading-[1.08] mb-4"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.6rem)',
                textWrap: 'balance',
              }}
            >
              Квартиры нового поколения от «Жениш строй»
            </h1>
            <p className="text-base sm:text-lg text-white/85 max-w-xl leading-relaxed mb-6">
              Выбирайте планировку на интерактивном этаже, гуляйте по будущей
              квартире в 3D-туре и рассчитывайте ипотеку ГИК или Trade-In онлайн.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenTourShowcase}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-semibold border border-white/25 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Запустить 3D-тур по квартире</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Integrated Samolet-style Quick Filter Dock */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8 pt-0">
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-lg border border-[#E5EAF0]">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E5EAF0]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#14181F]">
                  <SlidersHorizontal className="w-4 h-4 text-[#007BFB]" />
                  <span>Быстрый подбор квартиры</span>
                </div>

                {/* Currency Switcher */}
                <div
                  role="group"
                  aria-label="Валюта отображения цен"
                  className="inline-flex items-center gap-1 p-1 bg-[#F5F7FA] rounded-lg border border-[#E5EAF0]"
                >
                  <button
                    type="button"
                    onClick={() => onCurrencyChange('KGS')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      currency === 'KGS'
                        ? 'bg-[#007BFB] text-white'
                        : 'text-[#5E6773] hover:text-[#14181F]'
                    }`}
                  >
                    Сомы (KGS)
                  </button>
                  <button
                    type="button"
                    onClick={() => onCurrencyChange('USD')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      currency === 'USD'
                        ? 'bg-[#007BFB] text-white'
                        : 'text-[#5E6773] hover:text-[#14181F]'
                    }`}
                  >
                    Доллары ($)
                  </button>
                  <span className="hidden sm:inline-block px-2 text-[11px] text-[#5E6773] tabular-nums">
                    1 $ = {USD_TO_KGS_RATE} сом
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                {/* City Selector */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-[#5E6773] mb-1.5">
                    Город
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[#F5F7FA] rounded-lg border border-[#E5EAF0]">
                    {(['all', 'Бишкек', 'Ош'] as const).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => onCityFilterChange(city)}
                        className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          cityFilter === city
                            ? 'bg-white text-[#14181F] shadow-sm'
                            : 'text-[#5E6773] hover:text-[#14181F]'
                        }`}
                      >
                        {city === 'all' ? 'Все' : city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Count Segmented Buttons */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-[#5E6773] mb-1.5">
                    Комнатность
                  </label>
                  <div className="grid grid-cols-5 gap-1 p-1 bg-[#F5F7FA] rounded-lg border border-[#E5EAF0]">
                    {roomOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onRoomFilterChange(opt.value)}
                        className={`py-2 px-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          roomFilter === opt.value
                            ? 'bg-[#007BFB] text-white'
                            : 'text-[#5E6773] hover:text-[#14181F]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Budget Slider */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-[#5E6773]">
                      Стоимость до
                    </span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(maxBudgetUsd, currency, currency === 'KGS')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minBudgetUsd}
                    max={ceilingBudgetUsd}
                    step={2500}
                    value={maxBudgetUsd}
                    onChange={(e) => onMaxBudgetUsdChange(Number(e.target.value))}
                    aria-label="Максимальный бюджет"
                    className="w-full js-slider"
                    style={{
                      background: `linear-gradient(to right, #007BFB ${sliderPercent}%, #E5EAF0 ${sliderPercent}%)`,
                    }}
                  />
                </div>

                {/* Primary Search CTA */}
                <div className="lg:col-span-3">
                  <button
                    type="button"
                    onClick={onApplyQuickSearch}
                    className="w-full h-[42px] px-4 rounded-lg bg-[#007BFB] hover:bg-[#0065D1] text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap tabular-nums"
                  >
                    <span>Показать {matchingCount} квартир</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-Column Developer Metrics Strip (adjacent below hero split) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-[#F5F7FA] border border-[#E5EAF0] rounded-xl px-5 py-4">
            <div className="font-mono text-2xl font-bold text-[#14181F] tabular-nums">
              1 008
            </div>
            <div className="text-xs sm:text-sm text-[#5E6773] mt-1">
              квартир в 5 комплексах Бишкека и Оша
            </div>
          </div>
          <div className="bg-[#F5F7FA] border border-[#E5EAF0] rounded-xl px-5 py-4">
            <div className="font-mono text-2xl font-bold text-[#007BFB] tabular-nums">
              0% · 36 мес.
            </div>
            <div className="text-xs sm:text-sm text-[#5E6773] mt-1">
              прямая рассрочка от застройщика без переплат
            </div>
          </div>
          <div className="bg-[#F5F7FA] border border-[#E5EAF0] rounded-xl px-5 py-4">
            <div className="font-mono text-2xl font-bold text-[#14181F] tabular-nums">
              3,3 м
            </div>
            <div className="text-xs sm:text-sm text-[#5E6773] mt-1">
              высота потолков и приточная фильтрация воздуха
            </div>
          </div>
          <div className="bg-[#F5F7FA] border border-[#E5EAF0] rounded-xl px-5 py-4">
            <div className="font-mono text-2xl font-bold text-[#14181F] tabular-nums">
              9 баллов
            </div>
            <div className="text-xs sm:text-sm text-[#5E6773] mt-1">
              сейсмостойкость монолитно-кирпичного каркаса
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
