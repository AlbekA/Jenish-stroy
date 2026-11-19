import { useState } from 'react';
import { formatArea, formatMoney } from '../data/realEstateData';
import { CurrencyCode, Unit } from '../types/realEstate';

interface FloorPlanSVGProps {
  floorUnits: Unit[];
  selectedUnitId: string | null;
  currency: CurrencyCode;
  onSelectUnit: (unit: Unit) => void;
}

interface SlotGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
  labelX: number;
  labelY: number;
  balcony: { x: number; y: number; w: number; h: number };
  partitions: string[];
}

// 6-slot architectural floor wing geometry on a 760x440 SVG viewBox
const SLOT_GEOMETRIES: SlotGeometry[] = [
  // Top-left: Studio 43.4 m2
  {
    x: 36,
    y: 44,
    w: 196,
    h: 146,
    labelX: 134,
    labelY: 112,
    balcony: { x: 36, y: 24, w: 110, h: 20 },
    partitions: ['M150,44 L150,124 L232,124', 'M95,124 L95,190'],
  },
  // Top-center: 1-BR 52.8 m2
  {
    x: 240,
    y: 44,
    w: 230,
    h: 146,
    labelX: 355,
    labelY: 112,
    balcony: { x: 260, y: 24, w: 130, h: 20 },
    partitions: ['M355,44 L355,190', 'M240,120 L300,120 L300,190'],
  },
  // Top-right: 2-BR 74.2 m2
  {
    x: 478,
    y: 44,
    w: 246,
    h: 146,
    labelX: 601,
    labelY: 112,
    balcony: { x: 550, y: 24, w: 144, h: 20 },
    partitions: [
      'M582,44 L582,190',
      'M660,44 L660,130 L724,130',
      'M478,125 L540,125 L540,190',
    ],
  },
  // Bottom-left: 2-BR Euro 86.5 m2
  {
    x: 36,
    y: 252,
    w: 230,
    h: 148,
    labelX: 151,
    labelY: 325,
    balcony: { x: 48, y: 400, w: 156, h: 20 },
    partitions: [
      'M154,252 L154,400',
      'M36,328 L104,328 L104,252',
      'M206,252 L206,336 L266,336',
    ],
  },
  // Bottom-center: 3-BR 112.4 m2
  {
    x: 274,
    y: 252,
    w: 222,
    h: 148,
    labelX: 385,
    labelY: 325,
    balcony: { x: 294, y: 400, w: 170, h: 20 },
    partitions: [
      'M380,252 L380,400',
      'M274,320 L330,320',
      'M435,252 L435,342 L496,342',
    ],
  },
  // Bottom-right: 3-BR Penthouse 136 m2
  {
    x: 504,
    y: 252,
    w: 220,
    h: 148,
    labelX: 614,
    labelY: 325,
    balcony: { x: 520, y: 400, w: 184, h: 20 },
    partitions: [
      'M602,252 L602,400',
      'M504,326 L560,326',
      'M658,252 L658,338 L724,338',
    ],
  },
];

export function FloorPlanSVG({
  floorUnits,
  selectedUnitId,
  currency,
  onSelectUnit,
}: FloorPlanSVGProps) {
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);

  const hoveredUnit =
    floorUnits.find((u) => u.id === hoveredUnitId) ??
    floorUnits.find((u) => u.id === selectedUnitId) ??
    floorUnits[0];

  return (
    <div className="bg-white rounded-xl border border-[#E5EAF0] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-bold text-[#14181F]">
            Интерактивный план этажа
          </h4>
          <p className="text-xs text-[#5E6773]">
            Нажмите на квартиру на схеме, чтобы открыть 3D-тур и расчёт
          </p>
        </div>

        {/* Compass Rose */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#5E6773] bg-[#F5F7FA] px-3 py-1.5 rounded-lg border border-[#E5EAF0]">
          <span>С ↑</span>
          <span>·</span>
          <span>Ю ↓ (Горы)</span>
        </div>
      </div>

      {/* Interactive SVG Floor Plan */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox="0 0 760 440"
          className="w-full min-w-[540px] h-auto select-none"
          role="img"
          aria-label="Поэтажный план секции"
        >
          {/* Outer Building Envelope */}
          <rect
            x="24"
            y="16"
            width="712"
            height="410"
            rx="8"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* Central Corridor & Elevator / Stair Core */}
          <rect
            x="36"
            y="196"
            width="688"
            height="50"
            fill="#EDF2F7"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <rect
            x="325"
            y="199"
            width="110"
            height="44"
            rx="3"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="1"
          />
          <text
            x="380"
            y="225"
            textAnchor="middle"
            className="fill-[#475569] text-[10px] font-semibold"
          >
            Лифтовый холл
          </text>

          {/* Apartment Polygons */}
          {floorUnits.slice(0, 6).map((unit, idx) => {
            const geom = SLOT_GEOMETRIES[idx];
            if (!geom) return null;

            const isSelected = unit.id === selectedUnitId;
            const isHovered = unit.id === hoveredUnitId;

            let fillColor = '#FFFFFF';
            let strokeColor = '#94A3B8';
            let textColor = '#14181F';

            if (unit.status === 'available') {
              fillColor = isSelected
                ? '#007BFB'
                : isHovered
                  ? '#EBF4FF'
                  : '#FFFFFF';
              strokeColor = isSelected || isHovered ? '#007BFB' : '#64748B';
              textColor = isSelected ? '#FFFFFF' : '#14181F';
            } else if (unit.status === 'reserved') {
              fillColor = isSelected ? '#F59E0B' : '#FEF3C7';
              strokeColor = '#D97706';
              textColor = isSelected ? '#FFFFFF' : '#92400E';
            } else {
              fillColor = '#F1F5F9';
              strokeColor = '#CBD5E1';
              textColor = '#94A3B8';
            }

            return (
              <g
                key={unit.id}
                className="cursor-pointer transition-colors duration-150"
                onClick={() => onSelectUnit(unit)}
                onMouseEnter={() => setHoveredUnitId(unit.id)}
                onMouseLeave={() => setHoveredUnitId(null)}
                role="button"
                tabIndex={0}
                aria-label={`Квартира №${unit.number}, ${unit.roomsLabel}, ${formatArea(unit.areaSqm)}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectUnit(unit);
                  }
                }}
              >
                {/* Balcony */}
                <rect
                  x={geom.balcony.x}
                  y={geom.balcony.y}
                  width={geom.balcony.w}
                  height={geom.balcony.h}
                  fill={isSelected ? '#3B9AFF' : '#F8FAFC'}
                  stroke={strokeColor}
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />

                {/* Main Apartment Footprint */}
                <rect
                  x={geom.x}
                  y={geom.y}
                  width={geom.w}
                  height={geom.h}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected || isHovered ? '2.5' : '1.5'}
                />

                {/* Architectural Interior Partitions */}
                {geom.partitions.map((d, pIdx) => (
                  <path
                    key={pIdx}
                    d={d}
                    fill="none"
                    stroke={isSelected ? 'rgba(255,255,255,0.45)' : '#CBD5E1'}
                    strokeWidth="1.2"
                  />
                ))}

                {/* Unit Label */}
                <text
                  x={geom.labelX}
                  y={geom.labelY - 8}
                  textAnchor="middle"
                  fill={textColor}
                  className="text-[12px] font-bold"
                >
                  №{unit.number} · {unit.rooms === 'studio' ? 'Студия' : `${unit.rooms}К`}
                </text>
                <text
                  x={geom.labelX}
                  y={geom.labelY + 10}
                  textAnchor="middle"
                  fill={isSelected ? 'rgba(255,255,255,0.9)' : '#475569'}
                  className="text-[11px] font-mono"
                >
                  {unit.areaSqm.toFixed(1)} м²
                </text>
                <text
                  x={geom.labelX}
                  y={geom.labelY + 26}
                  textAnchor="middle"
                  fill={isSelected ? '#FFFFFF' : unit.status === 'available' ? '#007BFB' : '#64748B'}
                  className="text-[10px] font-semibold"
                >
                  {unit.status === 'available'
                    ? formatMoney(unit.priceUsd, currency, true)
                    : unit.status === 'reserved'
                      ? 'Бронь'
                      : 'Продана'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Selected/Hovered Readout Footer */}
      {hoveredUnit && (
        <div className="mt-3 pt-3 border-t border-[#E5EAF0] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2 text-[#14181F]">
            <span className="font-bold">Кв. №{hoveredUnit.number}</span>
            <span className="text-[#5E6773]">·</span>
            <span>{hoveredUnit.roomsLabel}</span>
            <span className="text-[#5E6773]">·</span>
            <span className="font-mono tabular-nums">
              {formatArea(hoveredUnit.areaSqm)}
            </span>
            <span className="text-[#5E6773]">·</span>
            <span className="text-[#5E6773]">{hoveredUnit.orientation}</span>
          </div>
          <div className="font-mono font-bold text-[#007BFB] tabular-nums">
            {formatMoney(hoveredUnit.priceUsd, currency)}
          </div>
        </div>
      )}
    </div>
  );
}
