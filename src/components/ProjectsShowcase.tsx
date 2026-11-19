import { ArrowUpRight, Building2 } from 'lucide-react';
import { formatMoney } from '../data/realEstateData';
import { City, CurrencyCode, Project, Unit } from '../types/realEstate';

interface ProjectsShowcaseProps {
  projects: Project[];
  units: Unit[];
  currency: CurrencyCode;
  selectedCity: City | 'all';
  onSelectCity: (city: City | 'all') => void;
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export function ProjectsShowcase({
  projects,
  units,
  currency,
  selectedCity,
  onSelectCity,
  selectedProjectId,
  onSelectProject,
}: ProjectsShowcaseProps) {
  const filteredProjects =
    selectedCity === 'all'
      ? projects
      : projects.filter((p) => p.city === selectedCity);

  return (
    <section id="projects" className="py-14 bg-[#F5F7FA] border-y border-[#E5EAF0]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + City Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#007BFB] tracking-wide mb-2">
              Портфель жилых комплексов
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14181F]"
              style={{ textWrap: 'balance' }}
            >
              Проекты в Бишкеке и Оше
            </h2>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-white rounded-lg border border-[#E5EAF0] self-start md:self-auto">
            {(['all', 'Бишкек', 'Ош'] as const).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => onSelectCity(city)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCity === city
                    ? 'bg-[#007BFB] text-white'
                    : 'text-[#5E6773] hover:text-[#14181F]'
                }`}
              >
                {city === 'all' ? 'Все проекты' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Modular Grid of Complexes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const projectUnits = units.filter(
              (u) => u.projectId === project.id && u.status === 'available'
            );
            const minUnitPriceUsd =
              projectUnits.length > 0
                ? Math.min(...projectUnits.map((u) => u.priceUsd))
                : Math.round(project.minPricePerSqmUsd * 45);
            const isSelected = project.id === selectedProjectId;
            const spanClass =
              idx === 0 && filteredProjects.length >= 4 ? 'lg:col-span-2' : '';

            return (
              <article
                key={project.id}
                className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col ${spanClass} ${
                  isSelected
                    ? 'border-[#007BFB] shadow-sm'
                    : 'border-[#E5EAF0] hover:border-[#C7D2E0] hover:-translate-y-0.5'
                }`}
              >
                {/* Media Container (4:3 / wide) with Zero-Broken-Image fallback */}
                <div className="relative h-60 sm:h-64 bg-[#E9EEF5] overflow-hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5E6773] bg-gradient-to-br from-[#EEF2F7] to-[#E1E8F0]">
                    <Building2 className="w-8 h-8 mb-2 opacity-60" />
                    <span className="text-xs font-medium">{project.name}</span>
                  </div>
                  <img
                    src={project.imageUrl}
                    alt={`${project.name} — ${project.city}, ${project.address}`}
                    referrerPolicy="no-referrer"
                    className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                  />
                  <div className="absolute bottom-4 left-5 right-5 z-20 flex items-end justify-between gap-4 text-white">
                    <div>
                      <p className="text-xs text-white/85 mb-0.5">
                        {project.city} · {project.district} · {project.address}
                      </p>
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                        {project.name}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-white/95 whitespace-nowrap shrink-0">
                      {project.completionQuarter}
                    </span>
                  </div>
                </div>

                {/* Card Content: Unboxed metadata + concrete architectural specs */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                  <div>
                    <div className="text-xs font-medium text-[#5E6773] mb-2">
                      Класс {project.propertyClass} · Потолки {project.ceilingHeight} м ·{' '}
                      {project.constructionStatus}
                    </div>
                    <p className="text-sm text-[#14181F] font-medium mb-2">
                      {project.tagline}
                    </p>
                    <p className="text-sm text-[#5E6773] leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5EAF0] flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-[#5E6773]">
                        {projectUnits.length} свободных квартир
                      </div>
                      <div className="font-mono text-base sm:text-lg font-bold text-[#14181F] tabular-nums">
                        от {formatMoney(minUnitPriceUsd, currency, currency === 'KGS')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProject(project.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-[#007BFB] text-white'
                          : 'bg-[#F5F7FA] hover:bg-[#007BFB] text-[#14181F] hover:text-white border border-[#E5EAF0]'
                      }`}
                    >
                      <span>Выбрать на плане</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
