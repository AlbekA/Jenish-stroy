import { CheckCircle2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { formatArea, formatMoney } from '../data/realEstateData';
import {
  BookingSubmission,
  CurrencyCode,
  FinancialSummaryPayload,
  Unit,
} from '../types/realEstate';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  unit: Unit | null;
  financialSummary: FinancialSummaryPayload | null;
}

export function BookingModal({
  isOpen,
  onClose,
  currency,
  unit,
  financialSummary,
}: BookingModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+996 ');
  const [cityOffice, setCityOffice] = useState<'Бишкек' | 'Ош'>('Бишкек');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<BookingSubmission | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSubmitted(null);
      return;
    }
    if (unit) {
      setCityOffice(unit.city);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, unit, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const digitsOnly = phone.replace(/\D/g, '');

    if (trimmedName.length < 2) {
      setError('Укажите ваше имя (минимум 2 символа).');
      return;
    }
    if (digitsOnly.length < 9) {
      setError('Введите корректный номер телефона в формате +996 XXX XX-XX-XX.');
      return;
    }

    const submission: BookingSubmission = {
      id: `JS-${Math.floor(100000 + Math.random() * 899999)}`,
      customerName: trimmedName,
      phone: phone.trim(),
      unitId: unit?.id,
      unitSummary: unit
        ? `${unit.projectName}, кв. №${unit.number} (${formatArea(unit.areaSqm)})`
        : `Консультация в офисе (${cityOffice})`,
      financialSummary: financialSummary ?? undefined,
      createdAt: new Date().toLocaleString('ru-RU'),
    };

    try {
      const prevRaw = localStorage.getItem('jenish_bookings');
      const prev: BookingSubmission[] = prevRaw ? JSON.parse(prevRaw) : [];
      localStorage.setItem(
        'jenish_bookings',
        JSON.stringify([submission, ...prev].slice(0, 10))
      );
    } catch {
      // ignore storage errors
    }

    setError('');
    setSubmitted(submission);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B121E]/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Оформление бронирования или консультации"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E5EAF0] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E5EAF0] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#14181F]">
            {submitted ? 'Заявка зафиксирована' : 'Бронирование и консультация'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть форму"
            className="w-9 h-9 rounded-lg border border-[#E5EAF0] text-[#5E6773] hover:text-[#14181F] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="w-12 h-12 text-[#007BFB] mx-auto" />
              <div>
                <div className="font-mono text-xs font-semibold text-[#5E6773]">
                  Номер заявки: {submitted.id}
                </div>
                <h4 className="text-xl font-bold text-[#14181F] mt-1">
                  Спасибо, {submitted.customerName}!
                </h4>
                <p className="text-sm text-[#5E6773] mt-2">
                  Персональный менеджер «Жениш строй» свяжется с вами по номеру{' '}
                  <span className="font-mono font-semibold text-[#14181F]">
                    {submitted.phone}
                  </span>{' '}
                  в течение 15 минут.
                </p>
              </div>

              <div className="bg-[#F5F7FA] rounded-xl border border-[#E5EAF0] p-4 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#5E6773]">Объект</span>
                  <span className="font-semibold text-[#14181F]">
                    {submitted.unitSummary}
                  </span>
                </div>
                {submitted.financialSummary && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#5E6773]">Программа</span>
                      <span className="font-semibold text-[#14181F]">
                        {submitted.financialSummary.programName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5E6773]">Платёж</span>
                      <span className="font-mono font-bold text-[#007BFB] tabular-nums">
                        {formatMoney(
                          submitted.financialSummary.monthlyPaymentUsd,
                          currency
                        )}{' '}
                        / мес
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-[#007BFB] hover:bg-[#0065D1] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Вернуться на сайт
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Context Summary */}
              {(unit || financialSummary) && (
                <div className="bg-[#F5F7FA] rounded-xl border border-[#E5EAF0] p-3.5 text-xs space-y-1">
                  {unit && (
                    <div className="font-semibold text-[#14181F]">
                      {unit.projectName} · {unit.roomsLabel} №{unit.number} (
                      {formatArea(unit.areaSqm)}) —{' '}
                      <span className="font-mono text-[#007BFB]">
                        {formatMoney(unit.priceUsd, currency)}
                      </span>
                    </div>
                  )}
                  {financialSummary && (
                    <div className="text-[#5E6773]">
                      Расчёт: {financialSummary.programName} ·{' '}
                      <span className="font-mono font-semibold text-[#14181F]">
                        {formatMoney(financialSummary.monthlyPaymentUsd, currency)}/мес
                      </span>{' '}
                      на {financialSummary.termLabel}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="booking-name"
                  className="block text-xs font-semibold text-[#14181F] mb-1.5"
                >
                  Ваше имя
                </label>
                <input
                  id="booking-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например, Азамат"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-[#E5EAF0] text-sm text-[#14181F] focus:outline-2 focus:outline-[#007BFB]"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-phone"
                  className="block text-xs font-semibold text-[#14181F] mb-1.5"
                >
                  Телефон для связи (WhatsApp / звонок)
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+996 555 00-00-00"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-[#E5EAF0] text-sm font-mono text-[#14181F] focus:outline-2 focus:outline-[#007BFB]"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#14181F] mb-1.5">
                  Удобный офис продаж
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(['Бишкек', 'Ош'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCityOffice(c)}
                      className={`py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        cityOffice === c
                          ? 'bg-[#EBF4FF] border-[#007BFB] text-[#007BFB]'
                          : 'bg-white border-[#E5EAF0] text-[#5E6773]'
                      }`}
                    >
                      Офис в г. {c}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#007BFB] hover:bg-[#0065D1] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Зафиксировать цену и отправить заявку
              </button>

              <p className="text-[11px] text-[#5E6773] text-center">
                Бесплатная бронь фиксирует стоимость квартиры на 48 часов.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
