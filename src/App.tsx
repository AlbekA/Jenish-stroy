import { useEffect, useMemo, useState } from 'react';
import { ApartmentExplorer } from './components/ApartmentExplorer';
import { BookingModal } from './components/BookingModal';
import { DeveloperSection } from './components/DeveloperSection';
import { FinancialCalculator } from './components/FinancialCalculator';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProjectsShowcase } from './components/ProjectsShowcase';
import { UnitDetailDrawer } from './components/UnitDetailDrawer';
import { UnitTourShowcase } from './components/UnitTourShowcase';
import { ALL_UNITS, PROJECTS } from './data/realEstateData';
import {
  City,
  CurrencyCode,
  FinancialSummaryPayload,
  RoomFilter,
  Unit,
} from './types/realEstate';

export default function App() {
  const [currency, setCurrency] = useState<CurrencyCode>('KGS');
  const [cityFilter, setCityFilter] = useState<City | 'all'>('all');
  const [roomFilter, setRoomFilter] = useState<RoomFilter>('all');
  const [maxBudgetUsd, setMaxBudgetUsd] = useState<number>(180000);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    PROJECTS[0].id
  );

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jenish_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inspectedUnit, setInspectedUnit] = useState<Unit | null>(null);
  const [linkedCalculatorUnit, setLinkedCalculatorUnit] = useState<Unit | null>(
    null
  );
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingUnit, setBookingUnit] = useState<Unit | null>(null);
  const [bookingCalculation, setBookingCalculation] =
    useState<FinancialSummaryPayload | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('jenish_favorites', JSON.stringify(favorites));
    } catch {
      // ignore storage quota
    }
  }, [favorites]);

  const matchingAvailableCount = useMemo(() => {
    return ALL_UNITS.filter((u) => {
      if (u.status !== 'available') return false;
      if (cityFilter !== 'all' && u.city !== cityFilter) return false;
      if (roomFilter !== 'all' && u.rooms !== roomFilter) return false;
      if (u.priceUsd > maxBudgetUsd) return false;
      return true;
    }).length;
  }, [cityFilter, roomFilter, maxBudgetUsd]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleFavorite = (unitId: string) => {
    setFavorites((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSelectProjectFromShowcase = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = PROJECTS.find((p) => p.id === projectId);
    if (project) {
      setCityFilter(project.city);
    }
    scrollToSection('apartments');
  };

  const handleCalculateUnit = (unit: Unit) => {
    setLinkedCalculatorUnit(unit);
    scrollToSection('mortgage');
  };

  const handleBookUnit = (unit: Unit) => {
    setBookingUnit(unit);
    setBookingCalculation(null);
    setBookingModalOpen(true);
  };

  const handleBookFromCalculator = (payload: FinancialSummaryPayload) => {
    setBookingUnit(linkedCalculatorUnit);
    setBookingCalculation(payload);
    setBookingModalOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setBookingUnit(null);
    setBookingCalculation(null);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#14181F]">
      <Navbar onNavigate={scrollToSection} />

      <main className="flex-1">
        <HeroSection
          currency={currency}
          onCurrencyChange={setCurrency}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          roomFilter={roomFilter}
          onRoomFilterChange={setRoomFilter}
          maxBudgetUsd={maxBudgetUsd}
          onMaxBudgetUsdChange={setMaxBudgetUsd}
          matchingCount={matchingAvailableCount}
          onApplyQuickSearch={() => scrollToSection('apartments')}
          onOpenTourShowcase={() => scrollToSection('tour-showcase')}
        />

        <ProjectsShowcase
          projects={PROJECTS}
          units={ALL_UNITS}
          currency={currency}
          selectedCity={cityFilter}
          onSelectCity={setCityFilter}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProjectFromShowcase}
        />

        <ApartmentExplorer
          projects={PROJECTS}
          units={ALL_UNITS}
          currency={currency}
          onCurrencyChange={setCurrency}
          selectedProjectId={selectedProjectId}
          onSelectProjectId={setSelectedProjectId}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          roomFilter={roomFilter}
          onRoomFilterChange={setRoomFilter}
          maxBudgetUsd={maxBudgetUsd}
          onMaxBudgetUsdChange={setMaxBudgetUsd}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onInspectUnit={(u) => setInspectedUnit(u)}
          onCalculateUnit={handleCalculateUnit}
          onBookUnit={handleBookUnit}
        />

        <UnitTourShowcase
          units={ALL_UNITS}
          currency={currency}
          onBookUnit={handleBookUnit}
          onCalculateUnit={handleCalculateUnit}
        />

        <FinancialCalculator
          currency={currency}
          onCurrencyChange={setCurrency}
          linkedUnit={linkedCalculatorUnit}
          onSubmitCalculation={handleBookFromCalculator}
        />

        <DeveloperSection onOpenBooking={handleOpenGeneralBooking} />
      </main>

      <Footer onNavigate={scrollToSection} />

      <UnitDetailDrawer
        unit={inspectedUnit}
        currency={currency}
        isFavorite={inspectedUnit ? favorites.includes(inspectedUnit.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setInspectedUnit(null)}
        onBookUnit={(u) => {
          setInspectedUnit(null);
          handleBookUnit(u);
        }}
        onCalculateUnit={handleCalculateUnit}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        currency={currency}
        unit={bookingUnit}
        financialSummary={bookingCalculation}
      />
    </div>
  );
}
