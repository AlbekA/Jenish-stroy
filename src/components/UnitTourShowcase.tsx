import { useMemo, useState } from 'react';
import { formatArea, formatMoney } from '../data/realEstateData';
import { CurrencyCode, LayoutKey, Unit } from '../types/realEstate';
import { FloorPlan2D } from './FloorPlan2D';
import { UnitTour3D } from './UnitTour3D';

interface UnitTourShowcaseProps {
  units: Unit[];
  currency: CurrencyCode;
  onBookUnit: (unit: Unit) => void;
  onCalculateUnit: (unit: Unit) => void;
}

const SHOWCASE_LAYOUTS: { key: LayoutKey; tabLabel: string }[] = [
  { key: 'studio-43', tabLabel: 'Студия · 43,4 м²' },
  { key: '1br-52', tabLabel: '1-комн. · 52,8 м²' },
  { key: '2br-74', tabLabel: '2-комн. · 74,2 м²' },
  { key: '3br-136', tabLabel: '3-комн. · 136,0 м²' },
];

export function UnitTourShowcase({
  units,
  currency,
  onBookUnit,
  onCalculateUnit,
}: UnitTourShowcaseProps) {
  const [selectedLayout, setSelectedLayout] = useState<LayoutKey>('2br-74');
  const [mode, setMode] = useState<'3d' | '2d'>('3d');

  const demoUnit = useMemo(() => {
    return (
      units.find(
        (u) => u.layoutKey === selectedLayout && u.status === 'available'
      ) ??
      units.find((u) => u.layoutKey === selectedLayout) ??
      units[0]
    );
  }, [units, selectedLayout]);

  if (!demoUnit) return null;

  return (
    <section
      id="tour-showcase"
      className="py-14 bg-[#F5F7FA] border-y border-[#E5EAF0]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
          <div>
            <p className="text-xs font-semibold text-[#007BFB] tracking-wide mb-2">
              Пространственная визуализация квартир
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14181F]"
              style={{ textWrap: 'balance' }}
            >
              Интерактивный 3D-тур с мебелью и отделкой
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 3D vs 2D Blueprint Toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-white rounded-lg border border-[#E5EAF0]">
              <button
                type="button"
                onClick={() => setMode('3d')}
                className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === '3d'
                    ? 'bg-[#007BFB] text-white'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                3D-тур с мебелью
              </button>
              <button
                type="button"
                onClick={() => setMode('2d')}
                className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === '2d'
                    ? 'bg-[#007BFB] text-white'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                2D-план с размерами
              </button>
            </div>
          </div>
        </div>

        {/* Layout Typology Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4">
          {SHOWCASE_LAYOUTS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedLayout(item.key)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedLayout === item.key
                  ? 'bg-[#14181F] border-[#14181F] text-white'
                  : 'bg-white border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F]'
              }`}
            >
              {item.tabLabel}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8">
            {mode === '3d' ? (
              <UnitTour3D unit={demoUnit} />
            ) : (
              <FloorPlan2D unit={demoUnit} />
            )}
          </div>

          <div className="lg:col-span-4 bg-white rounded-xl border border-[#E5EAF0] p-6 flex flex-col justify-between gap-6">
            <div>
              <div className="text-xs font-medium text-[#5E6773] mb-1">
                {demoUnit.projectName} · {demoUnit.city}
              </div>
              <h3 className="text-xl font-bold text-[#14181F]">
                {demoUnit.roomsLabel} №{demoUnit.number}
              </h3>
              <p className="text-sm text-[#5E6773] mt-1">
                Этаж {demoUnit.floor} · {demoUnit.orientation} · Сдача{' '}
                {demoUnit.completionQuarter}
              </p>

              <div className="mt-5 pt-5 border-t border-[#E5EAF0]">
                <div className="text-xs text-[#5E6773]">Стоимость лота</div>
                <div className="font-mono text-2xl font-bold text-[#14181F] tabular-nums mt-0.5">
                  {formatMoney(demoUnit.priceUsd, currency)}
                </div>
                <div className="font-mono text-xs text-[#5E6773] tabular-nums mt-1">
                  {formatMoney(demoUnit.pricePerSqmUsd, currency)} за м²
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="text-xs font-semibold text-[#14181F]">
                  Экспликация помещений
                </div>
                <div className="divide-y divide-[#E5EAF0] border border-[#E5EAF0] rounded-lg overflow-hidden">
                  {demoUnit.roomBreakdown.map((room) => (
                    <div
                      key={room.name}
                      className="flex items-center justify-between px-3 py-2 text-xs bg-white"
                    >
                      <span className="text-[#5E6773]">{room.name}</span>
                      <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                        {formatArea(room.area)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onBookUnit(demoUnit)}
                className="w-full py-3 px-4 rounded-lg bg-[#007BFB] hover:bg-[#0065D1] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Забронировать эту планировку
              </button>
              <button
                type="button"
                onClick={() => onCalculateUnit(demoUnit)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#F5F7FA] hover:bg-[#E5EAF0] text-[#14181F] text-sm font-semibold border border-[#E5EAF0] transition-colors cursor-pointer"
              >
                Рассчитать ипотеку и рассрочку
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
