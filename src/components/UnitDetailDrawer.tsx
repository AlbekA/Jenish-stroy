import { Calculator, Heart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  calculateAnnuityMonthlyUsd,
  formatArea,
  formatMoney,
} from '../data/realEstateData';
import { CurrencyCode, Unit } from '../types/realEstate';
import { FloorPlan2D } from './FloorPlan2D';
import { UnitTour3D } from './UnitTour3D';

interface UnitDetailDrawerProps {
  unit: Unit | null;
  currency: CurrencyCode;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onBookUnit: (unit: Unit) => void;
  onCalculateUnit: (unit: Unit) => void;
}

export function UnitDetailDrawer({
  unit,
  currency,
  isFavorite,
  onToggleFavorite,
  onClose,
  onBookUnit,
  onCalculateUnit,
}: UnitDetailDrawerProps) {
  const [tab, setTab] = useState<'3d' | '2d'>('3d');

  useEffect(() => {
    if (!unit) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [unit, onClose]);

  if (!unit) return null;

  const installmentDownUsd = Math.round(
    unit.priceUsd * (unit.downPaymentMinPercent / 100)
  );
  const installmentMonthlyUsd = Math.round(
    (unit.priceUsd - installmentDownUsd) / unit.installmentMonths
  );
  const gikMonthlyUsd = calculateAnnuityMonthlyUsd(
    Math.round(unit.priceUsd * 0.7),
    8,
    15
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B121E]/70 flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Карточка квартиры №${unit.number}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1220px] bg-white rounded-2xl border border-[#E5EAF0] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#E5EAF0] flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#5E6773]">
              {unit.projectName} · {unit.city} · Этаж {unit.floor} · Сдача{' '}
              {unit.completionQuarter}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#14181F]">
              {unit.roomsLabel} №{unit.number} · {formatArea(unit.areaSqm)}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(unit.id)}
              aria-label="Добавить в избранное"
              className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#007BFB]/10 border-[#007BFB] text-[#007BFB]'
                  : 'border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F]'
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть окно"
              className="w-10 h-10 rounded-lg border border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F] hover:bg-[#F5F7FA] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: 3D Tour or 2D Blueprint */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-[#F5F7FA] border-b lg:border-b-0 lg:border-r border-[#E5EAF0]">
            <div className="inline-flex items-center gap-1 p-1 bg-white rounded-lg border border-[#E5EAF0] mb-4">
              <button
                type="button"
                onClick={() => setTab('3d')}
                className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  tab === '3d'
                    ? 'bg-[#007BFB] text-white'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                Интерактивный 3D-тур
              </button>
              <button
                type="button"
                onClick={() => setTab('2d')}
                className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  tab === '2d'
                    ? 'bg-[#007BFB] text-white'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                2D-планировка
              </button>
            </div>

            {tab === '3d' ? (
              <UnitTour3D unit={unit} compact />
            ) : (
              <FloorPlan2D unit={unit} />
            )}
          </div>

          {/* Right: Purchase & Specs Panel */}
          <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div>
                <div className="text-xs text-[#5E6773]">Стоимость при 100% оплате</div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#14181F] tabular-nums mt-0.5">
                  {formatMoney(unit.priceUsd, currency)}
                </div>
                <div className="font-mono text-xs text-[#5E6773] tabular-nums mt-1">
                  {formatMoney(unit.pricePerSqmUsd, currency)} за м² · {unit.orientation}
                </div>
              </div>

              {/* Payment Options Summary */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]">
                  <div className="text-xs font-semibold text-[#14181F]">
                    Рассрочка 0% до {unit.installmentMonths} мес.
                  </div>
                  <div className="text-xs text-[#5E6773] mt-1">
                    Взнос {unit.downPaymentMinPercent}% ({formatMoney(installmentDownUsd, currency)})
                  </div>
                  <div className="font-mono text-sm font-bold text-[#007BFB] tabular-nums mt-1">
                    {formatMoney(installmentMonthlyUsd, currency)} / мес
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]">
                  <div className="text-xs font-semibold text-[#14181F]">
                    Ипотека ГИК КР (8% годовых, 15 лет)
                  </div>
                  <div className="font-mono text-sm font-bold text-[#14181F] tabular-nums mt-1">
                    от {formatMoney(gikMonthlyUsd, currency)} / мес
                  </div>
                </div>
              </div>

              {/* Specs List */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E5EAF0]">
                  <span className="text-[#5E6773]">Общая площадь</span>
                  <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                    {formatArea(unit.areaSqm)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5EAF0]">
                  <span className="text-[#5E6773]">Жилая / Кухня</span>
                  <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                    {unit.livingAreaSqm.toFixed(1)} / {unit.kitchenAreaSqm.toFixed(1)} м²
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5EAF0]">
                  <span className="text-[#5E6773]">Статус лота</span>
                  <span className="font-semibold text-[#14181F]">
                    {unit.status === 'available'
                      ? 'Свободна к брони'
                      : unit.status === 'reserved'
                        ? 'В резерве'
                        : 'Продана'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onBookUnit(unit)}
                className="w-full py-3 px-4 rounded-lg bg-[#007BFB] hover:bg-[#0065D1] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Забронировать квартиру
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCalculateUnit(unit);
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#F5F7FA] hover:bg-[#E5EAF0] text-[#14181F] text-sm font-semibold border border-[#E5EAF0] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-[#007BFB]" />
                <span>Открыть детальный калькулятор</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
