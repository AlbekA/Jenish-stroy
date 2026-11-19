import { ArrowRight, Calculator, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  calculateAnnuityMonthlyUsd,
  formatMoney,
} from '../data/realEstateData';
import {
  CalculatorTab,
  CurrencyCode,
  FinancialSummaryPayload,
  Unit,
} from '../types/realEstate';

interface FinancialCalculatorProps {
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  linkedUnit: Unit | null;
  onSubmitCalculation: (payload: FinancialSummaryPayload) => void;
}

const MORTGAGE_PROGRAMS = [
  { id: 'gik-social', name: 'ГИК «Мой дом» (Льготная)', rate: 4.0 },
  { id: 'gik-comm', name: 'ГИК Коммерческая КР', rate: 8.0 },
  { id: 'bank-std', name: 'Банковская ипотека КР', rate: 14.5 },
  { id: 'custom', name: 'Индивидуальная ставка', rate: 11.0 },
];

export function FinancialCalculator({
  currency,
  onCurrencyChange,
  linkedUnit,
  onSubmitCalculation,
}: FinancialCalculatorProps) {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('mortgage');
  const [propertyPriceUsd, setPropertyPriceUsd] = useState<number>(88000);

  // Mortgage State
  const [programId, setProgramId] = useState<string>('gik-comm');
  const [customRate, setCustomRate] = useState<number>(8.0);
  const [downPercent, setDownPercent] = useState<number>(30);
  const [mortgageYears, setMortgageYears] = useState<number>(15);

  // Installment 0% State
  const [installmentDownPercent, setInstallmentDownPercent] =
    useState<number>(30);
  const [installmentMonths, setInstallmentMonths] = useState<number>(36);
  const [installmentCadence, setInstallmentCadence] = useState<
    'monthly' | 'quarterly'
  >('monthly');

  // Trade-In State
  const [oldUnitType, setOldUnitType] = useState<string>('2-комнатная квартира');
  const [oldPropertyUsd, setOldPropertyUsd] = useState<number>(58000);
  const [tradeInPlanMonths, setTradeInPlanMonths] = useState<number>(24);

  useEffect(() => {
    if (linkedUnit) {
      setPropertyPriceUsd(linkedUnit.priceUsd);
    }
  }, [linkedUnit]);

  const activeRate =
    programId === 'custom'
      ? customRate
      : (MORTGAGE_PROGRAMS.find((p) => p.id === programId)?.rate ?? 8.0);
  const activeProgramName =
    MORTGAGE_PROGRAMS.find((p) => p.id === programId)?.name ?? 'Ипотека';

  // Mortgage Computations
  const mortgageDownUsd = Math.round(propertyPriceUsd * (downPercent / 100));
  const loanPrincipalUsd = Math.max(0, propertyPriceUsd - mortgageDownUsd);
  const monthlyMortgageUsd = calculateAnnuityMonthlyUsd(
    loanPrincipalUsd,
    activeRate,
    mortgageYears
  );
  const totalPaymentsUsd = monthlyMortgageUsd * mortgageYears * 12;
  const totalInterestUsd = Math.max(0, totalPaymentsUsd - loanPrincipalUsd);
  const recommendedIncomeUsd = Math.round(monthlyMortgageUsd * 1.85);

  const principalShare =
    totalPaymentsUsd > 0
      ? Math.round((loanPrincipalUsd / totalPaymentsUsd) * 100)
      : 100;
  const interestShare = 100 - principalShare;

  // Installment Computations (0%)
  const instDownUsd = Math.round(
    propertyPriceUsd * (installmentDownPercent / 100)
  );
  const instBalanceUsd = Math.max(0, propertyPriceUsd - instDownUsd);
  const instPeriods =
    installmentCadence === 'monthly'
      ? installmentMonths
      : Math.max(1, Math.round(installmentMonths / 3));
  const instPeriodPaymentUsd = Math.round(instBalanceUsd / instPeriods);

  // Trade-In Computations (95% instant credit guarantee)
  const tradeInCreditUsd = Math.round(oldPropertyUsd * 0.95);
  const tradeInDiffUsd = Math.max(0, propertyPriceUsd - tradeInCreditUsd);
  const tradeInMonthlyUsd = Math.round(tradeInDiffUsd / tradeInPlanMonths);

  const handleActionSubmit = () => {
    if (activeTab === 'mortgage') {
      onSubmitCalculation({
        mode: 'mortgage',
        programName: `${activeProgramName} (${activeRate}%)`,
        propertyPriceUsd,
        downPaymentUsd: mortgageDownUsd,
        monthlyPaymentUsd: monthlyMortgageUsd,
        termLabel: `${mortgageYears} лет`,
      });
    } else if (activeTab === 'installment') {
      onSubmitCalculation({
        mode: 'installment',
        programName: `Рассрочка 0% (${installmentCadence === 'monthly' ? 'ежемесячно' : 'ежеквартально'})`,
        propertyPriceUsd,
        downPaymentUsd: instDownUsd,
        monthlyPaymentUsd: instPeriodPaymentUsd,
        termLabel: `${installmentMonths} мес.`,
      });
    } else {
      onSubmitCalculation({
        mode: 'tradein',
        programName: `Trade-In (${oldUnitType})`,
        propertyPriceUsd,
        downPaymentUsd: tradeInCreditUsd,
        monthlyPaymentUsd: tradeInMonthlyUsd,
        termLabel: `${tradeInPlanMonths} мес. без %`,
        tradeInValueUsd: oldPropertyUsd,
      });
    }
  };

  return (
    <section id="mortgage" className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#007BFB] tracking-wide mb-2">
              Прозрачные финансовые решения
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14181F]"
              style={{ textWrap: 'balance' }}
            >
              Ипотека, рассрочка 0% и Trade-In
            </h2>
            {linkedUnit && (
              <p className="text-sm text-[#5E6773] mt-1.5">
                Расчёт синхронизирован с квартирой №{linkedUnit.number} (
                {linkedUnit.projectName})
              </p>
            )}
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-[#F5F7FA] rounded-lg border border-[#E5EAF0] self-start md:self-auto">
            {(['KGS', 'USD'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onCurrencyChange(code)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  currency === code
                    ? 'bg-white text-[#14181F] shadow-sm'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                {code === 'KGS' ? 'В сомах (KGS)' : 'В долларах ($)'}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Mode Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-[#F5F7FA] rounded-xl border border-[#E5EAF0] mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('mortgage')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'mortgage'
                ? 'bg-[#007BFB] text-white shadow-xs'
                : 'text-[#5E6773] hover:text-[#14181F]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Ипотека ГИК и банков</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('installment')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'installment'
                ? 'bg-[#007BFB] text-white shadow-xs'
                : 'text-[#5E6773] hover:text-[#14181F]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Рассрочка 0% до 36 мес.</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tradein')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'tradein'
                ? 'bg-[#007BFB] text-white shadow-xs'
                : 'text-[#5E6773] hover:text-[#14181F]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Обмен жилья Trade-In</span>
          </button>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Controls (7 cols) */}
          <div className="lg:col-span-7 bg-[#F5F7FA] rounded-2xl border border-[#E5EAF0] p-6 sm:p-8 space-y-6">
            {/* Shared Property Price Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#14181F]">
                  Стоимость выбранной квартиры
                </label>
                <span className="font-mono text-lg font-bold text-[#14181F] tabular-nums">
                  {formatMoney(propertyPriceUsd, currency)}
                </span>
              </div>
              <input
                type="range"
                min={42000}
                max={220000}
                step={1000}
                value={propertyPriceUsd}
                onChange={(e) => setPropertyPriceUsd(Number(e.target.value))}
                className="w-full js-slider"
                style={{
                  background: `linear-gradient(to right, #007BFB ${Math.round(
                    ((propertyPriceUsd - 42000) / (220000 - 42000)) * 100
                  )}%, #D5DCE4 ${Math.round(
                    ((propertyPriceUsd - 42000) / (220000 - 42000)) * 100
                  )}%)`,
                }}
              />
              <div className="flex justify-between text-[11px] font-mono text-[#5E6773] mt-1 tabular-nums">
                <span>{formatMoney(42000, currency, true)}</span>
                <span>{formatMoney(220000, currency, true)}</span>
              </div>
            </div>

            {/* TAB 1: MORTGAGE */}
            {activeTab === 'mortgage' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#14181F] mb-2.5">
                    Программа кредитования
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MORTGAGE_PROGRAMS.map((prog) => (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => {
                          setProgramId(prog.id);
                          setCustomRate(prog.rate);
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          programId === prog.id
                            ? 'bg-white border-[#007BFB] shadow-xs'
                            : 'bg-white/70 border-[#E5EAF0] hover:bg-white'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold text-[#14181F]">
                          {prog.name}
                        </span>
                        <span className="font-mono text-sm font-bold text-[#007BFB] tabular-nums shrink-0">
                          {prog.id === 'custom' ? `${customRate}%` : `${prog.rate}%`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {programId === 'custom' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#14181F]">
                        Процентная ставка
                      </span>
                      <span className="font-mono text-base font-bold text-[#007BFB] tabular-nums">
                        {customRate.toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={22}
                      step={0.5}
                      value={customRate}
                      onChange={(e) => setCustomRate(Number(e.target.value))}
                      className="w-full js-slider"
                      style={{
                        background: `linear-gradient(to right, #007BFB ${Math.round(
                          ((customRate - 3) / 19) * 100
                        )}%, #D5DCE4 ${Math.round(((customRate - 3) / 19) * 100)}%)`,
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#14181F]">
                        Первоначальный взнос ({downPercent}%)
                      </span>
                      <span className="font-mono text-sm font-bold text-[#14181F] tabular-nums">
                        {formatMoney(mortgageDownUsd, currency, true)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={70}
                      step={5}
                      value={downPercent}
                      onChange={(e) => setDownPercent(Number(e.target.value))}
                      className="w-full js-slider"
                      style={{
                        background: `linear-gradient(to right, #007BFB ${Math.round(
                          ((downPercent - 20) / 50) * 100
                        )}%, #D5DCE4 ${Math.round(((downPercent - 20) / 50) * 100)}%)`,
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#14181F]">
                        Срок кредита
                      </span>
                      <span className="font-mono text-sm font-bold text-[#14181F] tabular-nums">
                        {mortgageYears} лет
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={20}
                      step={1}
                      value={mortgageYears}
                      onChange={(e) => setMortgageYears(Number(e.target.value))}
                      className="w-full js-slider"
                      style={{
                        background: `linear-gradient(to right, #007BFB ${Math.round(
                          ((mortgageYears - 3) / 17) * 100
                        )}%, #D5DCE4 ${Math.round(((mortgageYears - 3) / 17) * 100)}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 0% INSTALLMENT */}
            {activeTab === 'installment' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#14181F]">
                        Первый взнос ({installmentDownPercent}%)
                      </span>
                      <span className="font-mono text-sm font-bold text-[#14181F] tabular-nums">
                        {formatMoney(instDownUsd, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={70}
                      step={5}
                      value={installmentDownPercent}
                      onChange={(e) =>
                        setInstallmentDownPercent(Number(e.target.value))
                      }
                      className="w-full js-slider"
                      style={{
                        background: `linear-gradient(to right, #007BFB ${Math.round(
                          ((installmentDownPercent - 30) / 40) * 100
                        )}%, #D5DCE4 ${Math.round(
                          ((installmentDownPercent - 30) / 40) * 100
                        )}%)`,
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[#14181F]">
                        Срок рассрочки (0%)
                      </span>
                      <span className="font-mono text-sm font-bold text-[#007BFB] tabular-nums">
                        {installmentMonths} мес.
                      </span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={36}
                      step={3}
                      value={installmentMonths}
                      onChange={(e) =>
                        setInstallmentMonths(Number(e.target.value))
                      }
                      className="w-full js-slider"
                      style={{
                        background: `linear-gradient(to right, #007BFB ${Math.round(
                          ((installmentMonths - 6) / 30) * 100
                        )}%, #D5DCE4 ${Math.round(
                          ((installmentMonths - 6) / 30) * 100
                        )}%)`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-[#14181F] mb-2">
                    График платежей
                  </span>
                  <div className="inline-flex items-center gap-1 p-1 bg-white rounded-lg border border-[#E5EAF0]">
                    <button
                      type="button"
                      onClick={() => setInstallmentCadence('monthly')}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        installmentCadence === 'monthly'
                          ? 'bg-[#007BFB] text-white'
                          : 'text-[#5E6773]'
                      }`}
                    >
                      Ежемесячно
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallmentCadence('quarterly')}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        installmentCadence === 'quarterly'
                          ? 'bg-[#007BFB] text-white'
                          : 'text-[#5E6773]'
                      }`}
                    >
                      Ежеквартально
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TRADE-IN */}
            {activeTab === 'tradein' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#14181F] mb-2">
                    Ваш текущий объект недвижимости
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      '1-комнатная квартира',
                      '2-комнатная квартира',
                      '3-комнатная квартира',
                      'Частный дом / Участок',
                    ].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setOldUnitType(t)}
                        className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          oldUnitType === t
                            ? 'bg-white border-[#007BFB] text-[#007BFB]'
                            : 'bg-white/70 border-[#E5EAF0] text-[#5E6773]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#14181F]">
                      Рыночная оценка вашего жилья
                    </span>
                    <span className="font-mono text-base font-bold text-[#14181F] tabular-nums">
                      {formatMoney(oldPropertyUsd, currency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={25000}
                    max={150000}
                    step={2000}
                    value={oldPropertyUsd}
                    onChange={(e) => setOldPropertyUsd(Number(e.target.value))}
                    className="w-full js-slider"
                    style={{
                      background: `linear-gradient(to right, #007BFB ${Math.round(
                        ((oldPropertyUsd - 25000) / (150000 - 25000)) * 100
                      )}%, #D5DCE4 ${Math.round(
                        ((oldPropertyUsd - 25000) / (150000 - 25000)) * 100
                      )}%)`,
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#14181F]">
                      Рассрочка на разницу доплаты (0%)
                    </span>
                    <span className="font-mono text-sm font-bold text-[#007BFB] tabular-nums">
                      {tradeInPlanMonths} мес.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={36}
                    step={6}
                    value={tradeInPlanMonths}
                    onChange={(e) => setTradeInPlanMonths(Number(e.target.value))}
                    className="w-full js-slider"
                    style={{
                      background: `linear-gradient(to right, #007BFB ${Math.round(
                        ((tradeInPlanMonths - 6) / 30) * 100
                      )}%, #D5DCE4 ${Math.round(
                        ((tradeInPlanMonths - 6) / 30) * 100
                      )}%)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Result Card & Data Visualization (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EAF0] p-6 sm:p-8 flex flex-col justify-between gap-6">
            {activeTab === 'mortgage' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-[#5E6773]">
                    Ежемесячный платёж · {activeRate}% годовых
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-bold text-[#007BFB] tabular-nums mt-1">
                    {formatMoney(monthlyMortgageUsd, currency)}
                  </div>
                  <div className="text-xs text-[#5E6773] mt-1 tabular-nums">
                    Рекомендуемый доход семьи: от{' '}
                    {formatMoney(recommendedIncomeUsd, currency)} / мес
                  </div>
                </div>

                {/* Principal vs Interest Stacked Visual Bar */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-[#14181F] tabular-nums">
                      Основной долг ({principalShare}%)
                    </span>
                    <span className="text-[#5E6773] tabular-nums">
                      Проценты ({interestShare}%)
                    </span>
                  </div>
                  <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-[#E5EAF0]">
                    <div
                      className="h-full bg-[#007BFB] transition-all duration-300"
                      style={{ width: `${principalShare}%` }}
                    />
                    <div
                      className="h-full bg-[#94A3B8] transition-all duration-300"
                      style={{ width: `${interestShare}%` }}
                    />
                  </div>
                </div>

                <div className="divide-y divide-[#E5EAF0] text-sm">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Сумма кредита</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(loanPrincipalUsd, currency)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Первый взнос ({downPercent}%)</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(mortgageDownUsd, currency)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Начисленные проценты</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(totalInterestUsd, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'installment' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-[#5E6773]">
                    {installmentCadence === 'monthly'
                      ? 'Ежемесячный платёж (0% переплата)'
                      : 'Ежеквартальный платёж (0% переплата)'}
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-bold text-[#007BFB] tabular-nums mt-1">
                    {formatMoney(instPeriodPaymentUsd, currency)}
                  </div>
                  <div className="text-xs text-[#5E6773] mt-1">
                    Фиксация цены за квадратный метр на весь срок договора
                  </div>
                </div>

                <div className="divide-y divide-[#E5EAF0] text-sm">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Первый взнос</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(instDownUsd, currency)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Остаток к оплате</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(instBalanceUsd, currency)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Количество платежей</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {instPeriods}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Переплата по процентам</span>
                    <span className="font-mono font-bold text-[#007BFB] tabular-nums">
                      {formatMoney(0, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tradein' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-[#5E6773]">
                    Зачёт старого жилья (95% от оценки)
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-bold text-[#007BFB] tabular-nums mt-1">
                    {formatMoney(tradeInCreditUsd, currency)}
                  </div>
                  <div className="text-xs text-[#5E6773] mt-1">
                    Без комиссий риэлторам · Быстрая оценка за 24 часа
                  </div>
                </div>

                <div className="divide-y divide-[#E5EAF0] text-sm">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Новая квартира</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(propertyPriceUsd, currency)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">Остаток доплаты</span>
                    <span className="font-mono font-semibold text-[#14181F] tabular-nums">
                      {formatMoney(tradeInDiffUsd, currency)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#5E6773]">
                      В рассрочку 0% ({tradeInPlanMonths} мес.)
                    </span>
                    <span className="font-mono font-bold text-[#14181F] tabular-nums">
                      {formatMoney(tradeInMonthlyUsd, currency)} / мес
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleActionSubmit}
              className="w-full py-3.5 px-5 rounded-xl bg-[#007BFB] hover:bg-[#0065D1] text-white text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Зафиксировать расчёт и оставить заявку</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
