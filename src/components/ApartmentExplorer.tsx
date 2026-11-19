import {
  Building,
  Check,
  Heart,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatArea, formatMoney } from '../data/realEstateData';
import {
  City,
  CurrencyCode,
  Project,
  RoomFilter,
  Unit,
} from '../types/realEstate';
import { FloorPlanSVG } from './FloorPlanSVG';

interface ApartmentExplorerProps {
  projects: Project[];
  units: Unit[];
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  selectedProjectId: string;
  onSelectProjectId: (id: string) => void;
  cityFilter: City | 'all';
  onCityFilterChange: (c: City | 'all') => void;
  roomFilter: RoomFilter;
  onRoomFilterChange: (r: RoomFilter) => void;
  maxBudgetUsd: number;
  onMaxBudgetUsdChange: (val: number) => void;
  favorites: string[];
  onToggleFavorite: (unitId: string) => void;
  onInspectUnit: (unit: Unit) => void;
  onCalculateUnit: (unit: Unit) => void;
  onBookUnit: (unit: Unit) => void;
}

export function ApartmentExplorer({
  projects,
  units,
  currency,
  onCurrencyChange,
  selectedProjectId,
  onSelectProjectId,
  cityFilter,
  onCityFilterChange,
  roomFilter,
  onRoomFilterChange,
  maxBudgetUsd,
  onMaxBudgetUsdChange,
  favorites,
  onToggleFavorite,
  onInspectUnit,
  onCalculateUnit,
  onBookUnit,
}: ApartmentExplorerProps) {
  const [viewMode, setViewMode] = useState<'chess' | 'grid'>('chess');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number>(8);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId]
  );

  // Units filtered globally for list view
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (cityFilter !== 'all' && u.city !== cityFilter) return false;
      if (roomFilter !== 'all' && u.rooms !== roomFilter) return false;
      if (u.priceUsd > maxBudgetUsd) return false;
      if (onlyAvailable && u.status !== 'available') return false;
      if (onlyFavorites && !favorites.includes(u.id)) return false;
      return true;
    });
  }, [
    units,
    cityFilter,
    roomFilter,
    maxBudgetUsd,
    onlyAvailable,
    onlyFavorites,
    favorites,
  ]);

  // Project-specific units for Chess-Grid + SVG Floor Plan
  const projectUnits = useMemo(
    () => units.filter((u) => u.projectId === activeProject.id),
    [units, activeProject.id]
  );

  const floorsDesc = useMemo(() => {
    const floorSet = new Set<number>();
    projectUnits.forEach((u) => floorSet.add(u.floor));
    return Array.from(floorSet).sort((a, b) => b - a);
  }, [projectUnits]);

  const effectiveFloor = floorsDesc.includes(selectedFloor)
    ? selectedFloor
    : (floorsDesc[Math.floor(floorsDesc.length / 2)] ?? 2);

  const floorUnits = useMemo(
    () =>
      projectUnits
        .filter((u) => u.floor === effectiveFloor)
        .sort((a, b) => a.number - b.number),
    [projectUnits, effectiveFloor]
  );

  const selectedUnit = useMemo(() => {
    return (
      projectUnits.find((u) => u.id === activeUnitId) ??
      floorUnits.find((u) => u.status === 'available') ??
      floorUnits[0] ??
      null
    );
  }, [projectUnits, activeUnitId, floorUnits]);

  const handleSelectChessUnit = (u: Unit) => {
    setSelectedFloor(u.floor);
    setActiveUnitId(u.id);
  };

  const handleProjectTabClick = (projectId: string) => {
    onSelectProjectId(projectId);
    setActiveUnitId(null);
  };

  return (
    <section id="apartments" className="py-14 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title + Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
          <div>
            <p className="text-xs font-semibold text-[#007BFB] tracking-wide mb-2">
              Интерактивный выбор недвижимости
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14181F]"
              style={{ textWrap: 'balance' }}
            >
              Подбор квартир и поэтажные планы
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Switcher */}
            <div className="inline-flex items-center gap-1 p-1 bg-[#F5F7FA] rounded-lg border border-[#E5EAF0]">
              {(['KGS', 'USD'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onCurrencyChange(code)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    currency === code
                      ? 'bg-white text-[#14181F] shadow-sm'
                      : 'text-[#5E6773] hover:text-[#14181F]'
                  }`}
                >
                  {code === 'KGS' ? 'Сомы (KGS)' : 'Доллары ($)'}
                </button>
              ))}
            </div>

            {/* Chess vs Grid View Mode */}
            <div className="inline-flex items-center gap-1 p-1 bg-[#F5F7FA] rounded-lg border border-[#E5EAF0]">
              <button
                type="button"
                onClick={() => setViewMode('chess')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  viewMode === 'chess'
                    ? 'bg-[#007BFB] text-white'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Шахматка и план этажа</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  viewMode === 'grid'
                    ? 'bg-[#007BFB] text-white'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Каталог ({filteredUnits.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#F5F7FA] rounded-xl border border-[#E5EAF0] p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
            {/* City */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-medium text-[#5E6773] mb-1">
                Город
              </label>
              <select
                value={cityFilter}
                onChange={(e) =>
                  onCityFilterChange(e.target.value as City | 'all')
                }
                aria-label="Фильтр по городу"
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#E5EAF0] text-sm font-medium text-[#14181F] focus:outline-2 focus:outline-[#007BFB]"
              >
                <option value="all">Все города</option>
                <option value="Бишкек">Бишкек</option>
                <option value="Ош">Ош</option>
              </select>
            </div>

            {/* Rooms */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-medium text-[#5E6773] mb-1">
                Комнатность
              </label>
              <div className="grid grid-cols-5 gap-1 p-1 bg-white rounded-lg border border-[#E5EAF0]">
                {(
                  [
                    { value: 'all', label: 'Все' },
                    { value: 'studio', label: 'Ст' },
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3+' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onRoomFilterChange(opt.value)}
                    className={`py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
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

            {/* Max Price */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-medium text-[#5E6773]">Бюджет до</span>
                <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                  {formatMoney(maxBudgetUsd, currency, currency === 'KGS')}
                </span>
              </div>
              <input
                type="range"
                min={45000}
                max={220000}
                step={2500}
                value={maxBudgetUsd}
                onChange={(e) => onMaxBudgetUsdChange(Number(e.target.value))}
                aria-label="Бюджет до"
                className="w-full js-slider"
                style={{
                  background: `linear-gradient(to right, #007BFB ${Math.round(
                    ((maxBudgetUsd - 45000) / (220000 - 45000)) * 100
                  )}%, #D5DCE4 ${Math.round(
                    ((maxBudgetUsd - 45000) / (220000 - 45000)) * 100
                  )}%)`,
                }}
              />
            </div>

            {/* Toggles */}
            <div className="lg:col-span-4 flex flex-wrap items-center lg:justify-end gap-2 pt-2 lg:pt-4">
              <button
                type="button"
                onClick={() => setOnlyAvailable((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  onlyAvailable
                    ? 'bg-white border-[#007BFB] text-[#007BFB]'
                    : 'bg-white border-[#E5EAF0] text-[#5E6773]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Только свободные</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOnlyFavorites((v) => !v);
                  setViewMode('grid');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  onlyFavorites
                    ? 'bg-[#007BFB] border-[#007BFB] text-white'
                    : 'bg-white border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Избранное ({favorites.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: INTERACTIVE CHESS GRID + FLOOR PLAN SVG */}
        {viewMode === 'chess' ? (
          <div className="space-y-6">
            {/* Project Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {projects.map((p) => {
                const isActive = p.id === activeProject.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProjectTabClick(p.id)}
                    className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#14181F] border-[#14181F] text-white'
                        : 'bg-white border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {p.name} · {p.city}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Chess Matrix */}
              <div className="lg:col-span-5 bg-[#F5F7FA] rounded-xl border border-[#E5EAF0] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#14181F]">
                      Шахматка · {activeProject.name}
                    </h3>
                    <p className="text-xs text-[#5E6773]">
                      {activeProject.address} · Сдача {activeProject.completionQuarter}
                    </p>
                  </div>
                </div>

                {/* Status Legend (Always paired with explicit labels) */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#5E6773] mb-3 pb-3 border-b border-[#E5EAF0]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#007BFB] inline-block" />
                    Свободна
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#F59E0B] inline-block" />
                    Бронь
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#CBD5E1] inline-block" />
                    Продана
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm border border-[#14181F] bg-white inline-block" />
                    Фильтр
                  </span>
                </div>

                {/* Floor Rows */}
                <div className="max-h-[420px] overflow-y-auto pr-1 space-y-1.5">
                  {floorsDesc.map((floorNum) => {
                    const rowUnits = projectUnits
                      .filter((u) => u.floor === floorNum)
                      .sort((a, b) => a.number - b.number);
                    const isFloorActive = floorNum === effectiveFloor;

                    return (
                      <div
                        key={floorNum}
                        className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${
                          isFloorActive ? 'bg-white shadow-xs ring-1 ring-[#007BFB]/30' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedFloor(floorNum)}
                          className={`w-11 py-1.5 text-[11px] font-mono font-semibold rounded text-center cursor-pointer shrink-0 tabular-nums ${
                            isFloorActive
                              ? 'bg-[#007BFB] text-white'
                              : 'text-[#5E6773] hover:bg-white'
                          }`}
                        >
                          {floorNum} эт
                        </button>

                        <div className="grid grid-cols-6 gap-1.5 flex-1">
                          {rowUnits.map((u) => {
                            const matchesRoom =
                              roomFilter === 'all' || u.rooms === roomFilter;
                            const matchesBudget = u.priceUsd <= maxBudgetUsd;
                            const matches = matchesRoom && matchesBudget;
                            const isSelected = selectedUnit?.id === u.id;

                            let cellStyle = '';
                            if (u.status === 'available') {
                              cellStyle = isSelected
                                ? 'bg-[#14181F] text-white ring-2 ring-[#007BFB]'
                                : matches
                                  ? 'bg-[#007BFB] hover:bg-[#0065D1] text-white'
                                  : 'bg-[#007BFB]/20 text-[#14181F]/50';
                            } else if (u.status === 'reserved') {
                              cellStyle = isSelected
                                ? 'bg-[#B45309] text-white ring-2 ring-[#14181F]'
                                : 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40';
                            } else {
                              cellStyle =
                                'bg-[#E2E8F0] text-[#94A3B8] opacity-70';
                            }

                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectChessUnit(u)}
                                title={`Кв. №${u.number} · ${u.roomsLabel} · ${formatArea(u.areaSqm)} · ${formatMoney(u.priceUsd, currency)}`}
                                className={`h-8 rounded text-[11px] font-mono font-semibold transition-transform active:scale-95 cursor-pointer tabular-nums ${cellStyle}`}
                              >
                                {u.rooms === 'studio' ? 'Ст' : `${u.rooms}К`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: SVG Floor Plan + Selected Unit Action Card */}
              <div className="lg:col-span-7 space-y-4">
                <FloorPlanSVG
                  floorUnits={floorUnits}
                  selectedUnitId={selectedUnit?.id ?? null}
                  currency={currency}
                  onSelectUnit={(u) => setActiveUnitId(u.id)}
                />

                {selectedUnit && (
                  <div className="bg-[#F5F7FA] rounded-xl border border-[#E5EAF0] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium text-[#5E6773] mb-1">
                        {selectedUnit.projectName} · Этаж {selectedUnit.floor} ·{' '}
                        {selectedUnit.orientation}
                      </div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h4 className="text-lg font-bold text-[#14181F]">
                          Квартира №{selectedUnit.number} · {selectedUnit.roomsLabel}
                        </h4>
                        <span className="font-mono text-sm font-semibold text-[#5E6773] tabular-nums">
                          {formatArea(selectedUnit.areaSqm)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xl font-bold text-[#007BFB] tabular-nums">
                          {formatMoney(selectedUnit.priceUsd, currency)}
                        </span>
                        <span className="text-xs text-[#5E6773] font-mono tabular-nums">
                          ({formatMoney(selectedUnit.pricePerSqmUsd, currency)} / м²)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(selectedUnit.id)}
                        aria-label="Добавить в избранное"
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                          favorites.includes(selectedUnit.id)
                            ? 'bg-[#007BFB]/10 border-[#007BFB] text-[#007BFB]'
                            : 'bg-white border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F]'
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={
                            favorites.includes(selectedUnit.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onCalculateUnit(selectedUnit)}
                        className="px-4 py-2.5 rounded-lg bg-white hover:bg-[#EBF4FF] text-[#14181F] border border-[#E5EAF0] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Расчёт ипотеки
                      </button>

                      <button
                        type="button"
                        onClick={() => onInspectUnit(selectedUnit)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#007BFB] hover:bg-[#0065D1] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>3D-тур и план</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: FILTERED CATALOG GRID */
          <div>
            {filteredUnits.length === 0 ? (
              <div className="bg-[#F5F7FA] rounded-2xl border border-[#E5EAF0] p-10 text-center">
                <Building className="w-8 h-8 text-[#5E6773] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#14181F] mb-1">
                  Нет квартир по выбранным параметрам
                </h3>
                <p className="text-sm text-[#5E6773] mb-4">
                  Попробуйте увеличить бюджет, сбросить фильтр избранного или выбрать все города.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onCityFilterChange('all');
                    onRoomFilterChange('all');
                    onMaxBudgetUsdChange(220000);
                    setOnlyFavorites(false);
                    setOnlyAvailable(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#007BFB] text-white text-sm font-semibold hover:bg-[#0065D1] transition-colors cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredUnits.slice(0, visibleCount).map((u) => {
                    const isFav = favorites.includes(u.id);
                    const monthlyInstallmentUsd = Math.round(
                      (u.priceUsd * (1 - u.downPaymentMinPercent / 100)) /
                        u.installmentMonths
                    );

                    return (
                      <div
                        key={u.id}
                        className="bg-white rounded-xl border border-[#E5EAF0] hover:border-[#007BFB]/60 transition-all duration-150 p-5 flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <div className="text-xs text-[#5E6773]">
                                {u.projectName} · {u.city}
                              </div>
                              <h3 className="text-base font-bold text-[#14181F] mt-0.5">
                                {u.roomsLabel} №{u.number} · {formatArea(u.areaSqm)}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() => onToggleFavorite(u.id)}
                              aria-label="Добавить в избранное"
                              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isFav
                                  ? 'bg-[#007BFB]/10 border-[#007BFB] text-[#007BFB]'
                                  : 'border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F]'
                              }`}
                            >
                              <Heart
                                className="w-4 h-4"
                                fill={isFav ? 'currentColor' : 'none'}
                              />
                            </button>
                          </div>

                          {/* Mini Schematic Layout Preview */}
                          <div
                            onClick={() => onInspectUnit(u)}
                            className="h-32 rounded-lg bg-[#F5F7FA] border border-[#E5EAF0] flex items-center justify-center cursor-pointer hover:bg-[#EBF4FF]/50 transition-colors mb-3"
                          >
                            <svg
                              viewBox="0 0 180 100"
                              className="w-36 h-20"
                              aria-hidden="true"
                            >
                              <rect
                                x="20"
                                y="12"
                                width="140"
                                height="76"
                                fill="#FFFFFF"
                                stroke="#14181F"
                                strokeWidth="2.5"
                              />
                              <path
                                d="M90,12 L90,88 M20,48 L60,48 L60,12"
                                fill="none"
                                stroke="#94A3B8"
                                strokeWidth="1.5"
                              />
                              <line
                                x1="40"
                                y1="88"
                                x2="140"
                                y2="88"
                                stroke="#007BFB"
                                strokeWidth="3"
                              />
                            </svg>
                          </div>

                          <div className="text-xs text-[#5E6773] flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Этаж {u.floor}</span>
                            <span>·</span>
                            <span>{u.orientation}</span>
                            <span>·</span>
                            <span>Сдача {u.completionQuarter}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E5EAF0] space-y-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-mono text-lg font-bold text-[#14181F] tabular-nums">
                              {formatMoney(u.priceUsd, currency)}
                            </span>
                            <span className="text-xs font-mono text-[#007BFB] tabular-nums">
                              расср. {formatMoney(monthlyInstallmentUsd, currency)}/мес
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => onInspectUnit(u)}
                              className="py-2 px-3 rounded-lg bg-[#007BFB] hover:bg-[#0065D1] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              3D-тур и план
                            </button>
                            <button
                              type="button"
                              onClick={() => onBookUnit(u)}
                              className="py-2 px-3 rounded-lg bg-[#F5F7FA] hover:bg-[#E5EAF0] text-[#14181F] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Бронировать
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {visibleCount < filteredUnits.length && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + 12)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F5F7FA] hover:bg-[#E5EAF0] text-sm font-semibold text-[#14181F] border border-[#E5EAF0] transition-colors cursor-pointer"
                    >
                      <List className="w-4 h-4" />
                      <span>
                        Показать ещё ({filteredUnits.length - visibleCount} лотов)
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
