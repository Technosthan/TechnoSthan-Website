import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Filter, Search, ArrowLeft } from "lucide-react";
import SectionHeader from "../../../shared/components/SectionHeader";
import ProgramCard from "../../skill-programs/components/ProgramCard";
import { apiClient } from "../../../shared/services/apiClient";
import NotFoundState from "../../../shared/components/NotFoundState";
import { getMediaUrl } from "../../../shared/utils/media";
import { DEFAULT_SPECIALISATIONS } from "../../../shared/data/defaultSpecialisations";

const PROGRAM_TYPES = [
  ["", "All program types"],
  ["FOUNDATION_PROGRAM", "Foundation Program"],
  ["CAREER_ACCELERATOR", "Career Accelerator"],
  ["SKILL_DEVELOPMENT_PROGRAM", "Skill Development Program"],
  ["PROFESSIONAL_CERTIFICATION", "Professional Certification"],
  ["INDUSTRY_READINESS_PROGRAM", "Industry Readiness Program"],
  ["APPRENTICESHIP_PROGRAM", "Apprenticeship Program"],
  ["BOOTCAMP", "Bootcamp"],
  ["WORKSHOP", "Workshop"],
  ["MASTERCLASS", "Masterclass"],
  ["INNOVATION_CHALLENGE", "Innovation Challenge"],
  ["RESEARCH_FELLOWSHIP", "Research Fellowship"],
  ["FDP", "Faculty Development Program (FDP)"],
  ["TTT", "Train the Trainer (TTT)"],
  ["CORPORATE_LEARNING_PROGRAM", "Corporate Learning Program"],
  ["INTERNSHIP_PROGRAM", "Internship Program"],
  ["CAPSTONE_PROJECT", "Capstone Project"],
];

const CERTIFICATION_LEVELS = [
  ["", "All levels"],
  ["EXPLORER", "Explorer"],
  ["FOUNDATION", "Foundation"],
  ["PRACTITIONER", "Practitioner"],
  ["PROFESSIONAL", "Professional"],
  ["SPECIALIST", "Specialist"],
  ["EXPERT", "Expert"],
  ["MASTER", "Master"],
  ["FELLOW", "Fellow"],
  ["MENTOR", "Mentor"],
];

const MODE_OPTIONS = ["", "ONLINE", "OFFLINE", "HYBRID"];

const SpecialisationProgramsPage = () => {
  const { specialisationSlug } = useParams();
  const [specialisation, setSpecialisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programType, setProgramType] = useState("");
  const [certificationLevel, setCertificationLevel] = useState("");
  const [mode, setMode] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [minFees, setMinFees] = useState("");
  const [maxFees, setMaxFees] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/specialisations/${encodeURIComponent(specialisationSlug)}`);
        setSpecialisation(response.specialisation || null);
      } catch (_error) {
        const fallback = DEFAULT_SPECIALISATIONS.find((item) => item.slug === specialisationSlug) || null;
        if (!fallback) {
          setSpecialisation(null);
          return;
        }

        try {
          const programsResponse = await apiClient.get(
            `/programs/specialisation/${encodeURIComponent(specialisationSlug)}`,
          );
          setSpecialisation({
            ...fallback,
            programs: programsResponse.programs || [],
          });
        } catch (_programError) {
          setSpecialisation({
            ...fallback,
            programs: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (specialisationSlug) {
      load();
    }
  }, [specialisationSlug]);

  const filteredPrograms = useMemo(() => {
    const programs = specialisation?.programs || [];
    const normalizedSearch = search.trim().toLowerCase();
    const min = minFees === "" ? null : Number(minFees);
    const max = maxFees === "" ? null : Number(maxFees);

    return programs.filter((program) => {
      const matchesSearch =
        !normalizedSearch ||
        [program.title, program.shortDescription, program.overview, program.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesType = !programType || program.programType === programType;
      const matchesCertification = !certificationLevel || program.certificationLevel === certificationLevel;
      const matchesMode = !mode || program.mode === mode;
      const matchesLevel = !level || String(program.level || "").toLowerCase().includes(level.trim().toLowerCase());
      const matchesDuration =
        !duration || String(program.duration || "").toLowerCase().includes(duration.trim().toLowerCase());
      const feesValue = Number(program.discountFees || program.fees || 0);
      const matchesMin = min === null || Number.isNaN(min) || feesValue >= min;
      const matchesMax = max === null || Number.isNaN(max) || feesValue <= max;

      return (
        matchesSearch &&
        matchesType &&
        matchesCertification &&
        matchesMode &&
        matchesLevel &&
        matchesDuration &&
        matchesMin &&
        matchesMax
      );
    });
  }, [certificationLevel, duration, maxFees, minFees, mode, programType, search, level, specialisation]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">Loading specialisation...</div>
      </section>
    );
  }

  if (!specialisation) {
    return (
      <section className="section">
        <div className="container">
          <NotFoundState
            title="Specialisation not found"
            description="The track you selected is unavailable."
            primaryLabel="Browse programs"
            primaryTo="/programs"
            secondaryLabel="Back to home"
            secondaryTo="/"
          />
        </div>
      </section>
    );
  }

  const resetFilters = () => {
    setSearch("");
    setProgramType("");
    setCertificationLevel("");
    setMode("");
    setLevel("");
    setDuration("");
    setMinFees("");
    setMaxFees("");
  };

  return (
    <section className="section">
      <div className="container">
        <Link className="back-link" to="/programs">
          <ArrowLeft size={16} /> Back to specialisations
        </Link>

        <SectionHeader
          eyebrow={specialisation.name}
          title={specialisation.description || specialisation.shortDescription || specialisation.name}
          description="Use the filters below to narrow down the learning pathway that fits your goals."
        />

        {specialisation.bannerImageUrl ? (
          <div className="specialisation-hero card glass">
            <img
              src={getMediaUrl(specialisation.bannerImageUrl, "image")}
              alt={specialisation.name}
              className="specialisation-hero-image"
            />
          </div>
        ) : null}

        <div className="card glass programs-filter-shell">
          <div className="programs-filter-header">
            <div>
              <p className="badge">Filters</p>
              <h3>Refine the program list</h3>
            </div>
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>
              Reset filters
            </button>
          </div>

          <div className="programs-filters-grid">
            <label className="field">
              <span>
                <Filter size={14} /> Program Type
              </span>
              <select className="select" value={programType} onChange={(event) => setProgramType(event.target.value)}>
                {PROGRAM_TYPES.map(([value, label]) => (
                  <option key={value || label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Certification Level</span>
              <select
                className="select"
                value={certificationLevel}
                onChange={(event) => setCertificationLevel(event.target.value)}
              >
                {CERTIFICATION_LEVELS.map(([value, label]) => (
                  <option key={value || label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Mode</span>
              <select className="select" value={mode} onChange={(event) => setMode(event.target.value)}>
                {MODE_OPTIONS.map((value) => (
                  <option key={value || "all"} value={value}>
                    {value || "All modes"}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Level</span>
              <input
                className="input"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                placeholder="Professional, Beginner..."
              />
            </label>
            <label className="field">
              <span>Duration</span>
              <input
                className="input"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="3 months, 12 weeks..."
              />
            </label>
            <label className="field">
              <span>Search</span>
              <div className="search-field">
                <Search size={16} />
                <input
                  className="input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search programs"
                />
              </div>
            </label>
            <label className="field">
              <span>Fees minimum</span>
              <input className="input" type="number" value={minFees} onChange={(event) => setMinFees(event.target.value)} />
            </label>
            <label className="field">
              <span>Fees maximum</span>
              <input className="input" type="number" value={maxFees} onChange={(event) => setMaxFees(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="programs-result-meta">
          <span className="meta-pill">{filteredPrograms.length} programs found</span>
          <span className="meta-pill">Specialisation: {specialisation.name}</span>
        </div>

        {filteredPrograms.length ? (
          <div className="grid cards-grid-3">
            {filteredPrograms.map((program) => (
              <ProgramCard key={program.id || program.title} program={program} />
            ))}
          </div>
        ) : (
          <div className="card glass empty-state">No programs match the selected filters.</div>
        )}
      </div>
    </section>
  );
};

export default SpecialisationProgramsPage;
