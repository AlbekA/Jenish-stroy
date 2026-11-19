import { MapPin, Phone } from 'lucide-react';

interface DeveloperSectionProps {
  onOpenBooking: () => void;
}

const STANDARDS = [
  {
    index: '01.',
    title: 'Инженерный Wellness-стандарт',
    detail:
      'Приточно-вытяжная вентиляция с фильтрацией пыли и центральная система многоступенчатой очистки воды прямо на входе в дом.',
    metric: 'Чистый воздух · Фильтрация PM2.5',
  },
  {
    index: '02.',
    title: 'Сейсмостойкий монолитный каркас',
    detail:
      'Проектирование по повышенным нормам сейсмической безопасности до 9 баллов, усиленное армирование и повышенная шумоизоляция перекрытий.',
    metric: '9 баллов · Потолки до 3,3 м',
  },
  {
    index: '03.',
    title: 'Двор-парк без автомобилей',
    detail:
      'Озеленённые внутренние территории до 1 га с беговыми дорожками, детскими площадками и подземным паркингом под жилой частью.',
    metric: '100% закрытая безопасная среда',
  },
  {
    index: '04.',
    title: 'Предчистовая или готовая отделка',
    detail:
      'Идеальная стяжка пола, выровненные стены, медная электроразводка и опция заказа готового интерьера с мебелью сразу на этапе покупки.',
    metric: 'Экономия до 4 месяцев на ремонте',
  },
];

export function DeveloperSection({ onOpenBooking }: DeveloperSectionProps) {
  return (
    <section
      id="about"
      className="py-16 bg-[#F5F7FA] border-t border-[#E5EAF0]"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Editorial Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#007BFB] tracking-wide mb-2">
                Стандарты строительства
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14181F]"
                style={{ textWrap: 'balance' }}
              >
                Почему семьи выбирают «Жениш строй»
              </h2>
              <p className="text-sm sm:text-base text-[#5E6773] leading-relaxed mt-3">
                Мы строим жилые кварталы нового поколения в Бишкеке и Оше, где
                продуманные планировки сочетаются с прозрачными условиями
                покупки — без скрытых комиссий и с полным юридическим
                сопровождением.
              </p>
            </div>

            {/* Proof Metrics Adjacent to Claims */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white rounded-xl border border-[#E5EAF0] p-4">
                <div className="font-mono text-2xl font-bold text-[#14181F] tabular-nums">
                  340 тыс. м²
                </div>
                <div className="text-xs text-[#5E6773] mt-1">
                  жилой и коммерческой недвижимости введено и строится
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E5EAF0] p-4">
                <div className="font-mono text-2xl font-bold text-[#007BFB] tabular-nums">
                  4 800+
                </div>
                <div className="text-xs text-[#5E6773] mt-1">
                  семей получили ключи в сданных корпусах
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className="bg-white rounded-xl border border-[#E5EAF0] p-5 space-y-3">
              <div className="text-xs font-bold text-[#14181F]">
                Офисы продаж «Жениш строй»
              </div>
              <div className="space-y-2 text-xs sm:text-sm text-[#5E6773]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#007BFB] shrink-0 mt-0.5" />
                  <span>г. Бишкек, ул. Медерова, 89 · Ежедневно 09:00–19:00</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#007BFB] shrink-0 mt-0.5" />
                  <span>г. Ош, ул. Ленина, 147 · Ежедневно 09:00–19:00</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[#14181F] font-mono font-semibold">
                  <Phone className="w-4 h-4 text-[#007BFB] shrink-0" />
                  <span>+996 (555) 700-800</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#14181F] hover:bg-[#007BFB] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Записаться на визит в шоурум
              </button>
            </div>
          </div>

          {/* Right Editorial Standards List */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STANDARDS.map((item) => (
              <div
                key={item.index}
                className="bg-white rounded-2xl border border-[#E5EAF0] p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="font-mono text-sm font-bold text-[#007BFB] mb-2">
                    {item.index}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#14181F] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5E6773] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E5EAF0] text-xs font-medium text-[#14181F]">
                  {item.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
