import { formatArea } from '../data/realEstateData';
import { Unit } from '../types/realEstate';

interface FloorPlan2DProps {
  unit: Unit;
}

export function FloorPlan2D({ unit }: FloorPlan2DProps) {
  const isLarge = unit.rooms === '3' || unit.layoutKey === '2br-86';
  const widthMeters = unit.rooms === 'studio' ? '6,40 м' : isLarge ? '11,80 м' : '9,20 м';
  const depthMeters = unit.rooms === 'studio' ? '6,80 м' : isLarge ? '11,50 м' : '8,10 м';

  return (
    <div className="w-full h-full bg-white rounded-xl border border-[#E5EAF0] p-4 sm:p-6 flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5EAF0]">
        <div>
          <span className="text-xs font-medium text-[#5E6773]">
            Архитектурный чертёж с расстановкой мебели
          </span>
          <h4 className="text-base font-bold text-[#14181F]">
            {unit.roomsLabel} · Общая площадь {formatArea(unit.areaSqm)}
          </h4>
        </div>
        <div className="text-xs font-mono text-[#5E6773] bg-[#F5F7FA] px-2.5 py-1 rounded border border-[#E5EAF0]">
          Окна: {unit.orientation}
        </div>
      </div>

      {/* Detailed Blueprint SVG */}
      <div className="my-4 flex-1 flex items-center justify-center">
        <svg
          viewBox="0 0 640 420"
          className="w-full max-w-[580px] h-auto"
          role="img"
          aria-label={`2D планировка квартиры №${unit.number}`}
        >
          {/* Subtle architectural blueprint grid */}
          <defs>
            <pattern
              id="blueprintGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="640" height="420" fill="url(#blueprintGrid)" />

          {/* Dimension Line Top */}
          <line x1="80" y1="36" x2="560" y2="36" stroke="#94A3B8" strokeWidth="1" />
          <line x1="80" y1="30" x2="80" y2="42" stroke="#94A3B8" strokeWidth="1" />
          <line x1="560" y1="30" x2="560" y2="42" stroke="#94A3B8" strokeWidth="1" />
          <text
            x="320"
            y="29"
            textAnchor="middle"
            className="fill-[#5E6773] text-[11px] font-mono"
          >
            {widthMeters}
          </text>

          {/* Dimension Line Left */}
          <line x1="54" y1="60" x2="54" y2="340" stroke="#94A3B8" strokeWidth="1" />
          <line x1="48" y1="60" x2="60" y2="60" stroke="#94A3B8" strokeWidth="1" />
          <line x1="48" y1="340" x2="60" y2="340" stroke="#94A3B8" strokeWidth="1" />
          <text
            x="40"
            y="200"
            textAnchor="middle"
            transform="rotate(-90 40 200)"
            className="fill-[#5E6773] text-[11px] font-mono"
          >
            {depthMeters}
          </text>

          {/* Outer Load-bearing Walls */}
          <rect
            x="80"
            y="60"
            width="480"
            height="280"
            fill="#FFFFFF"
            stroke="#14181F"
            strokeWidth="6"
          />

          {/* Balcony / Loggia */}
          <rect
            x="140"
            y="340"
            width="240"
            height="54"
            fill="#F8FAFC"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
          <text
            x="260"
            y="372"
            textAnchor="middle"
            className="fill-[#5E6773] text-[11px] font-medium"
          >
            Лоджия · {unit.roomBreakdown.find((r) => r.zoneId === 'balcony')?.area ?? 4.2} м²
          </text>

          {/* Interior Partition Walls */}
          {unit.rooms === 'studio' ? (
            <>
              {/* Bathroom top-left */}
              <path
                d="M80,175 L195,175 L195,60"
                fill="none"
                stroke="#14181F"
                strokeWidth="3"
              />
              {/* Hallway divider */}
              <path
                d="M195,175 L250,175"
                fill="none"
                stroke="#14181F"
                strokeWidth="3"
              />
            </>
          ) : (
            <>
              {/* Central dividing wall */}
              <path
                d="M320,60 L320,340"
                fill="none"
                stroke="#14181F"
                strokeWidth="3"
              />
              {/* Bathroom & Hallway top-left */}
              <path
                d="M80,170 L205,170 L205,60"
                fill="none"
                stroke="#14181F"
                strokeWidth="3"
              />
              {/* Kitchen / Second bedroom divider */}
              {isLarge && (
                <path
                  d="M320,205 L560,205"
                  fill="none"
                  stroke="#14181F"
                  strokeWidth="3"
                />
              )}
            </>
          )}

          {/* Panoramic Windows (Blue double lines) */}
          <line x1="150" y1="340" x2="310" y2="340" stroke="#007BFB" strokeWidth="6" />
          <line x1="360" y1="340" x2="510" y2="340" stroke="#007BFB" strokeWidth="6" />
          <line x1="360" y1="60" x2="510" y2="60" stroke="#007BFB" strokeWidth="6" />

          {/* Furniture Outlines — Bathroom */}
          <rect x="92" y="72" width="52" height="88" rx="3" fill="#EBF4FF" stroke="#007BFB" strokeWidth="1" />
          <circle cx="176" cy="88" r="14" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
          <rect x="160" y="128" width="32" height="24" rx="8" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />

          {/* Furniture Outlines — Kitchen Zone */}
          <rect x="215" y="68" width="96" height="34" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
          <rect x="235" y="130" width="66" height="44" rx="4" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />

          {/* Furniture Outlines — Living Area (Bottom Left / Center) */}
          <rect x="104" y="220" width="130" height="48" rx="4" fill="#EBF4FF" stroke="#007BFB" strokeWidth="1.2" />
          <rect x="135" y="282" width="68" height="32" rx="3" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />

          {/* Furniture Outlines — Bedroom (Right Wing) */}
          <rect x="372" y="78" width="110" height="96" rx="4" fill="#EBF4FF" stroke="#007BFB" strokeWidth="1.2" />
          <rect x="382" y="84" width="40" height="22" rx="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
          <rect x="432" y="84" width="40" height="22" rx="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
          <rect x="520" y="74" width="28" height="106" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />

          {isLarge && (
            <>
              <rect x="360" y="232" width="106" height="72" rx="4" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
              <rect x="498" y="220" width="48" height="96" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
            </>
          )}

          {/* Room Labels with Area Callouts */}
          <text x="142" y="122" textAnchor="middle" className="fill-[#14181F] text-[10px] font-semibold">
            Санузел
          </text>
          <text x="262" y="118" textAnchor="middle" className="fill-[#14181F] text-[10px] font-semibold">
            Кухня
          </text>
          <text x="170" y="206" textAnchor="middle" className="fill-[#14181F] text-[11px] font-bold">
            Гостиная · {unit.livingAreaSqm.toFixed(1)} м²
          </text>
          <text x="430" y="192" textAnchor="middle" className="fill-[#14181F] text-[11px] font-bold">
            Спальня
          </text>
          {isLarge && (
            <text x="430" y="274" textAnchor="middle" className="fill-[#14181F] text-[11px] font-bold">
              Вторая комната
            </text>
          )}
        </svg>
      </div>

      {/* Room Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-[#E5EAF0]">
        {unit.roomBreakdown.map((room) => (
          <div
            key={room.name}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#F5F7FA] text-xs"
          >
            <span className="text-[#5E6773] truncate pr-2">{room.name}</span>
            <span className="font-mono font-semibold text-[#14181F] tabular-nums shrink-0">
              {room.area.toFixed(1)} м²
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
