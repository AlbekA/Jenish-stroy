import {
  CurrencyCode,
  LayoutKey,
  Project,
  RoomCategory,
  RoomDimension,
  Unit,
  UnitStatus,
} from '../types/realEstate';

export const USD_TO_KGS_RATE = 87.5;

export const HERO_IMAGE_URL =
  '/src/assets/images/hero_jenish_quarter_1795084732747.jpg';

export const PROJECTS: Project[] = [
  {
    id: 'alatoo-park',
    name: 'ЖК «Ала-Тоо Парк»',
    city: 'Бишкек',
    district: 'Парк Ататюрка',
    address: 'ул. Токтоналиева, 77',
    propertyClass: 'Премиум',
    completionQuarter: 'IV кв. 2028',
    constructionStatus: 'Строится',
    ceilingHeight: 3.3,
    floorsCount: 18,
    sectionsCount: 2,
    totalUnits: 192,
    imageUrl: '/src/assets/images/project_alatoo_park_1795084733599.jpg',
    tagline: 'Первый вертикальный Wellness-квартал у парка Ататюрка',
    description:
      'Две 18-этажные башни с центральной системой фильтрации воды и приточно-вытяжной вентиляцией, задерживающей пыль и аллергены. Панорамное остекление с видом на снежные вершины Ала-Тоо.',
    features: [
      'Очистка воздуха и воды',
      'Потолки 3,3 м',
      'Двор без машин',
      'Подземный паркинг',
    ],
    installmentMaxMonths: 36,
    minDownPaymentPercent: 30,
    minPricePerSqmUsd: 1380,
  },
  {
    id: 'ordo-towers',
    name: 'ЖК «Ордо Тауэрс»',
    city: 'Бишкек',
    district: 'Южная магистраль',
    address: 'ул. Матросова, 10',
    propertyClass: 'Бизнес',
    completionQuarter: 'III кв. 2027',
    constructionStatus: 'Строится',
    ceilingHeight: 3.15,
    floorsCount: 16,
    sectionsCount: 3,
    totalUnits: 264,
    imageUrl: '/src/assets/images/project_ordo_towers_1795084733698.jpg',
    tagline: 'Архитектурный квартал с пешеходным бульваром',
    description:
      'Современный городской комплекс в динамичной деловой части Бишкека. Эргономичные европланировки, шумоизоляция межквартирных перегородок и закрытый благоустроенный променад.',
    features: [
      'Пешеходный бульвар',
      'Шумоизоляция класса А',
      'Сквозные лобби',
      'Колясочные зоны',
    ],
    installmentMaxMonths: 32,
    minDownPaymentPercent: 30,
    minPricePerSqmUsd: 1180,
  },
  {
    id: 'sulaiman-residence',
    name: 'ЖК «Сулайман Резиденс»',
    city: 'Ош',
    district: 'Центральный район',
    address: 'ул. Ленина, 147',
    propertyClass: 'Комфорт+',
    completionQuarter: 'II кв. 2026',
    constructionStatus: 'Старт продаж',
    ceilingHeight: 3.15,
    floorsCount: 14,
    sectionsCount: 3,
    totalUnits: 312,
    imageUrl: '/src/assets/images/project_sulaiman_residence_1795084733182.jpg',
    tagline: 'Семейный квартал с двором-парком площадью 1 га',
    description:
      'Масштабный жилой комплекс из трёх гармоничных корпусов с собственной зелёной аллеей, безопасными игровыми площадками, беговыми дорожками и коммерческой галереей на первых этажах.',
    features: [
      'Двор-парк 1 га',
      'Потолки 3,15 м',
      'Спортивные дорожки',
      'Trade-In без комиссии',
    ],
    installmentMaxMonths: 36,
    minDownPaymentPercent: 30,
    minPricePerSqmUsd: 960,
  },
  {
    id: 'akbuura-garden',
    name: 'ЖК «Ак-Буура Гарден»',
    city: 'Ош',
    district: 'Набережная Ак-Бууры',
    address: 'ул. Алымбек Датка, 167',
    propertyClass: 'Бизнес',
    completionQuarter: 'IV кв. 2026',
    constructionStatus: 'Строится',
    ceilingHeight: 3.2,
    floorsCount: 12,
    sectionsCount: 2,
    totalUnits: 144,
    imageUrl: '/src/assets/images/project_akbuura_garden_1795084733203.jpg',
    tagline: 'Террасная архитектура и прохлада у реки Ак-Буура',
    description:
      'Жилой комплекс с натуральной травертиновой отделкой фасадов, каскадными зелёными террасами и утопленными стеклянными лоджиями, выходящими на прогулочную набережную.',
    features: [
      'Зелёные террасы',
      'Фасад из травертина',
      'Вид на набережную',
      'Зарядки для электромобилей',
    ],
    installmentMaxMonths: 24,
    minDownPaymentPercent: 30,
    minPricePerSqmUsd: 1090,
  },
  {
    id: 'jibek-jolu',
    name: 'ЖК «Жибек Жолу»',
    city: 'Ош',
    district: 'Исторический центр',
    address: 'ул. Алымбек Датка, 149',
    propertyClass: 'Премиум',
    completionQuarter: 'Сдан',
    constructionStatus: 'Сдан',
    ceilingHeight: 3.3,
    floorsCount: 10,
    sectionsCount: 2,
    totalUnits: 96,
    imageUrl: '/src/assets/images/project_jibek_jolu_1795084734758.jpg',
    tagline: 'Готовые квартиры с ключами и двусветным мраморным лобби',
    description:
      'Введённый в эксплуатацию и заселённый дом клубного формата. Доступны последние квартиры от застройщика с возможностью мгновенного оформления права собственности и ипотеки ГИК.',
    features: [
      'Дом сдан — ключи сразу',
      'Двусветный вестибюль',
      'Консьерж-сервис 24/7',
      'Подходит под ГИК КР',
    ],
    installmentMaxMonths: 12,
    minDownPaymentPercent: 40,
    minPricePerSqmUsd: 1260,
  },
];

interface LayoutTemplate {
  layoutKey: LayoutKey;
  rooms: RoomCategory;
  roomsLabel: string;
  areaSqm: number;
  livingAreaSqm: number;
  kitchenAreaSqm: number;
  hasBalcony: boolean;
  hasMasterBath: boolean;
  roomBreakdown: RoomDimension[];
}

export const LAYOUT_TEMPLATES: Record<LayoutKey, LayoutTemplate> = {
  'studio-43': {
    layoutKey: 'studio-43',
    rooms: 'studio',
    roomsLabel: 'Студия',
    areaSqm: 43.4,
    livingAreaSqm: 23.2,
    kitchenAreaSqm: 8.6,
    hasBalcony: true,
    hasMasterBath: false,
    roomBreakdown: [
      { name: 'Гостиная-студия', area: 23.2, zoneId: 'living' },
      { name: 'Кухонная зона', area: 8.6, zoneId: 'kitchen' },
      { name: 'Санузел', area: 4.9, zoneId: 'bath' },
      { name: 'Прихожая', area: 3.5, zoneId: 'overview' },
      { name: 'Лоджия', area: 3.2, zoneId: 'balcony' },
    ],
  },
  '1br-52': {
    layoutKey: '1br-52',
    rooms: '1',
    roomsLabel: '1-комнатная',
    areaSqm: 52.8,
    livingAreaSqm: 19.4,
    kitchenAreaSqm: 14.8,
    hasBalcony: true,
    hasMasterBath: false,
    roomBreakdown: [
      { name: 'Спальня', area: 19.4, zoneId: 'bedroom' },
      { name: 'Кухня-гостиная', area: 18.6, zoneId: 'kitchen' },
      { name: 'Санузел', area: 5.4, zoneId: 'bath' },
      { name: 'Прихожая', area: 5.2, zoneId: 'overview' },
      { name: 'Лоджия', area: 4.2, zoneId: 'balcony' },
    ],
  },
  '2br-74': {
    layoutKey: '2br-74',
    rooms: '2',
    roomsLabel: '2-комнатная',
    areaSqm: 74.2,
    livingAreaSqm: 38.6,
    kitchenAreaSqm: 16.4,
    hasBalcony: true,
    hasMasterBath: false,
    roomBreakdown: [
      { name: 'Гостиная', area: 22.8, zoneId: 'living' },
      { name: 'Кухня-столовая', area: 16.4, zoneId: 'kitchen' },
      { name: 'Спальня', area: 15.8, zoneId: 'bedroom' },
      { name: 'Санузел', area: 6.2, zoneId: 'bath' },
      { name: 'Прихожая', area: 8.2, zoneId: 'overview' },
      { name: 'Балкон', area: 4.8, zoneId: 'balcony' },
    ],
  },
  '2br-86': {
    layoutKey: '2br-86',
    rooms: '2',
    roomsLabel: '2-комнатная Евро',
    areaSqm: 86.5,
    livingAreaSqm: 44.2,
    kitchenAreaSqm: 20.4,
    hasBalcony: true,
    hasMasterBath: true,
    roomBreakdown: [
      { name: 'Кухня-гостиная', area: 31.6, zoneId: 'living' },
      { name: 'Мастер-спальня', area: 19.4, zoneId: 'bedroom' },
      { name: 'Детская / Кабинет', area: 14.2, zoneId: 'bedroom' },
      { name: 'Ванная комната', area: 7.4, zoneId: 'bath' },
      { name: 'Прихожая и гардероб', area: 8.9, zoneId: 'overview' },
      { name: 'Терраса-балкон', area: 5.0, zoneId: 'balcony' },
    ],
  },
  '3br-112': {
    layoutKey: '3br-112',
    rooms: '3',
    roomsLabel: '3-комнатная',
    areaSqm: 112.4,
    livingAreaSqm: 62.5,
    kitchenAreaSqm: 21.8,
    hasBalcony: true,
    hasMasterBath: true,
    roomBreakdown: [
      { name: 'Просторная гостиная', area: 28.4, zoneId: 'living' },
      { name: 'Кухня-столовая', area: 21.8, zoneId: 'kitchen' },
      { name: 'Мастер-спальня', area: 19.6, zoneId: 'bedroom' },
      { name: 'Вторая спальня', area: 16.5, zoneId: 'bedroom' },
      { name: 'Санузел основной', area: 7.8, zoneId: 'bath' },
      { name: 'Прихожая', area: 11.3, zoneId: 'overview' },
      { name: 'Панорамная лоджия', area: 7.0, zoneId: 'balcony' },
    ],
  },
  '3br-136': {
    layoutKey: '3br-136',
    rooms: '3',
    roomsLabel: '3-комнатная Пентхаус',
    areaSqm: 136.0,
    livingAreaSqm: 76.4,
    kitchenAreaSqm: 25.2,
    hasBalcony: true,
    hasMasterBath: true,
    roomBreakdown: [
      { name: 'Парадная гостиная', area: 34.2, zoneId: 'living' },
      { name: 'Кухня с островом', area: 25.2, zoneId: 'kitchen' },
      { name: 'Мастер-спальня', area: 22.8, zoneId: 'bedroom' },
      { name: 'Спальня / Кабинет', area: 19.4, zoneId: 'bedroom' },
      { name: 'Ванная комната', area: 9.6, zoneId: 'bath' },
      { name: 'Холл-гардеробная', area: 14.8, zoneId: 'overview' },
      { name: 'Видовая терраса', area: 10.0, zoneId: 'balcony' },
    ],
  },
};

const FLOOR_LAYOUT_SEQUENCE: {
  layoutKey: LayoutKey;
  orientation: Unit['orientation'];
}[] = [
  { layoutKey: 'studio-43', orientation: 'Восток / Парк' },
  { layoutKey: '1br-52', orientation: 'Запад / Двор' },
  { layoutKey: '2br-74', orientation: 'Юг / Горы' },
  { layoutKey: '2br-86', orientation: 'Юг / Горы' },
  { layoutKey: '3br-112', orientation: 'Восток / Парк' },
  { layoutKey: '3br-136', orientation: 'Север / Проспект' },
];

function deterministicStatus(
  projectIndex: number,
  floor: number,
  slot: number,
  totalFloors: number
): UnitStatus {
  const hash = (projectIndex * 31 + floor * 17 + slot * 13) % 19;
  if (projectIndex === 4) {
    // Сданный ЖК «Жибек Жолу» — меньше свободных лотов
    if (hash <= 10) return 'sold';
    if (hash <= 13) return 'reserved';
    return 'available';
  }
  if (floor <= Math.floor(totalFloors * 0.35) && hash < 7) return 'sold';
  if (hash === 8 || hash === 15) return 'reserved';
  if (hash === 3) return 'sold';
  return 'available';
}

export function generateAllUnits(): Unit[] {
  const units: Unit[] = [];

  PROJECTS.forEach((project, pIdx) => {
    const slotsPerFloor = project.id === 'jibek-jolu' ? 5 : 6;
    let unitCounter = 1;

    for (let floor = 2; floor <= project.floorsCount; floor++) {
      // Floor elevation premium: +0.65% per floor above 2nd
      const floorMultiplier = 1 + (floor - 2) * 0.0065;

      for (let slot = 0; slot < slotsPerFloor; slot++) {
        const config = FLOOR_LAYOUT_SEQUENCE[slot % FLOOR_LAYOUT_SEQUENCE.length];
        const tpl = LAYOUT_TEMPLATES[config.layoutKey];

        // Slightly higher price per sqm for top floors and mountain views
        const viewMultiplier = config.orientation === 'Юг / Горы' ? 1.04 : 1.0;
        const pricePerSqmUsd = Math.round(
          project.minPricePerSqmUsd * floorMultiplier * viewMultiplier
        );
        const priceUsd = Math.round(pricePerSqmUsd * tpl.areaSqm);
        const status = deterministicStatus(
          pIdx,
          floor,
          slot,
          project.floorsCount
        );

        units.push({
          id: `${project.id}-s1-f${floor}-u${unitCounter}`,
          projectId: project.id,
          projectName: project.name,
          city: project.city,
          section: 1,
          floor,
          number: unitCounter,
          rooms: tpl.rooms,
          roomsLabel: tpl.roomsLabel,
          areaSqm: tpl.areaSqm,
          livingAreaSqm: tpl.livingAreaSqm,
          kitchenAreaSqm: tpl.kitchenAreaSqm,
          priceUsd,
          pricePerSqmUsd,
          orientation: config.orientation,
          status,
          layoutKey: tpl.layoutKey,
          hasBalcony: tpl.hasBalcony,
          hasMasterBath: tpl.hasMasterBath,
          installmentMonths: project.installmentMaxMonths,
          downPaymentMinPercent: project.minDownPaymentPercent,
          completionQuarter: project.completionQuarter,
          roomBreakdown: tpl.roomBreakdown,
        });

        unitCounter++;
      }
    }
  });

  return units;
}

export const ALL_UNITS: Unit[] = generateAllUnits();

export function convertUsd(amountUsd: number, currency: CurrencyCode): number {
  return currency === 'USD'
    ? Math.round(amountUsd)
    : Math.round(amountUsd * USD_TO_KGS_RATE);
}

export function formatMoney(
  amountUsd: number,
  currency: CurrencyCode,
  compact = false
): string {
  const val = convertUsd(amountUsd, currency);
  if (compact) {
    if (currency === 'KGS' && val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(2).replace('.', ',')} млн сом`;
    }
    if (currency === 'USD' && val >= 1_000) {
      return `$${Math.round(val / 1_000)} тыс.`;
    }
  }
  const formatted = new Intl.NumberFormat('ru-RU').format(val);
  return currency === 'USD' ? `$${formatted}` : `${formatted} сом`;
}

export function formatArea(area: number): string {
  return `${area.toFixed(1).replace('.', ',')} м²`;
}

export function calculateAnnuityMonthlyUsd(
  principalUsd: number,
  annualRatePercent: number,
  years: number
): number {
  if (principalUsd <= 0 || years <= 0) return 0;
  const months = years * 12;
  if (annualRatePercent <= 0) return Math.round(principalUsd / months);
  const monthlyRate = annualRatePercent / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principalUsd * monthlyRate * factor) / (factor - 1));
}
