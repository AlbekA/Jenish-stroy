export type CurrencyCode = 'KGS' | 'USD';

export type City = 'Бишкек' | 'Ош';

export type RoomFilter = 'all' | 'studio' | '1' | '2' | '3';

export type RoomCategory = 'studio' | '1' | '2' | '3';

export type UnitStatus = 'available' | 'reserved' | 'sold';

export type FinishPreset = 'whitebox' | 'scandi' | 'turnkey';

export type LightingMode = 'day' | 'evening';

export type CameraRoomId =
  | 'overview'
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bath'
  | 'balcony';

export type LayoutKey =
  | 'studio-43'
  | '1br-52'
  | '2br-74'
  | '2br-86'
  | '3br-112'
  | '3br-136';

export type CalculatorTab = 'mortgage' | 'installment' | 'tradein';

export interface Project {
  id: string;
  name: string;
  city: City;
  district: string;
  address: string;
  propertyClass: 'Комфорт+' | 'Бизнес' | 'Премиум';
  completionQuarter: string;
  constructionStatus: 'Сдан' | 'Строится' | 'Старт продаж';
  ceilingHeight: number;
  floorsCount: number;
  sectionsCount: number;
  totalUnits: number;
  imageUrl: string;
  tagline: string;
  description: string;
  features: string[];
  installmentMaxMonths: number;
  minDownPaymentPercent: number;
  minPricePerSqmUsd: number;
}

export interface RoomDimension {
  name: string;
  area: number;
  zoneId: CameraRoomId;
}

export interface Unit {
  id: string;
  projectId: string;
  projectName: string;
  city: City;
  section: number;
  floor: number;
  number: number;
  rooms: RoomCategory;
  roomsLabel: string;
  areaSqm: number;
  livingAreaSqm: number;
  kitchenAreaSqm: number;
  priceUsd: number;
  pricePerSqmUsd: number;
  orientation: 'Юг / Горы' | 'Восток / Парк' | 'Запад / Двор' | 'Север / Проспект';
  status: UnitStatus;
  layoutKey: LayoutKey;
  hasBalcony: boolean;
  hasMasterBath: boolean;
  installmentMonths: number;
  downPaymentMinPercent: number;
  completionQuarter: string;
  roomBreakdown: RoomDimension[];
}

export interface FinancialSummaryPayload {
  mode: CalculatorTab;
  programName: string;
  propertyPriceUsd: number;
  downPaymentUsd: number;
  monthlyPaymentUsd: number;
  termLabel: string;
  tradeInValueUsd?: number;
}

export interface BookingSubmission {
  id: string;
  customerName: string;
  phone: string;
  unitId?: string;
  unitSummary?: string;
  financialSummary?: FinancialSummaryPayload;
  createdAt: string;
}
