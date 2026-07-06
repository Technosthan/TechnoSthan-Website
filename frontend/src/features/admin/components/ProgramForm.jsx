import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { apiClient } from "../../../shared/services/apiClient";
import { ROUTES } from "../../../shared/constants/routes";

const emptyModule = () => ({ title: "", description: "", order: 0, lessons: [] });
const emptyLesson = () => ({ title: "", duration: "", order: 0, isPreview: false });

const ProgramForm = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    overview: "",
    thumbnailUrl: "",
    heroImageUrl: "",
    heroVideoUrl: "",
    duration: "",
    level: "",
    mode: "ONLINE",
    fees: "",
    discountFees: "",
    category: "",
    isFeatured: false,
    isActive: true,
    certificateIncluded: true,
    internshipSupport: false,
    placementSupport: "",
    projectsCount: 0,
    whatYouWillLearn: "",
    toolsCovered: "",
    mentorName: "",
    mentorRole: "",
    mentorBio: "",
    mentorAvatarUrl: "",
    faqs: "",
    curriculumModules: [emptyModule()],
    projects: [],
  });

  useEffect(() => {
    const loadProgram = async () => {
      if (!id) return;
      const response = await apiClient.get(`/admin/programs/${id}`);
      const program = response.program;
      if (!program) return;
      setForm((prev) => ({
        ...prev,
        ...program,
        fees: program.fees ? String(program.fees) : "",
        discountFees: program.discountFees ? String(program.discountFees) : "",
        whatYouWillLearn: Array.isArray(program.whatYouWillLearn)
          ? program.whatYouWillLearn.join("\n")
          : "",
        toolsCovered: Array.isArray(program.toolsCovered)
          ? program.toolsCovered.join("\n")
          : "",
        faqs: Array.isArray(program.faqs)
          ? program.faqs.map((faq) => `${faq.question} :: ${faq.answer}`).join("\n")
          : "",
        curriculumModules: program.curriculumModules?.length
          ? program.curriculumModules.map((module) => ({
              ...module,
              lessons: module.lessons || [],
            }))
          : [emptyModule()],
        projects: program.projects || [],
      }));
    };

    loadProgram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      curriculumModules: [...prev.curriculumModules, emptyModule()],
    }));
  };

  const updateModule = (moduleIndex, name, value) => {
    setForm((prev) => ({
      ...prev,
      curriculumModules: prev.curriculumModules.map((module, index) =>
        index === moduleIndex ? { ...module, [name]: value } : module,
      ),
    }));
  };

  const removeModule = (moduleIndex) => {
    setForm((prev) => ({
      ...prev,
      curriculumModules: prev.curriculumModules.filter((_, index) => index !== moduleIndex),
    }));
  };

  const addLesson = (moduleIndex) => {
    setForm((prev) => ({
      ...prev,
      curriculumModules: prev.curriculumModules.map((module, index) =>
        index === moduleIndex
          ? { ...module, lessons: [...(module.lessons || []), emptyLesson()] }
          : module,
      ),
    }));
  };

  const updateLesson = (moduleIndex, lessonIndex, name, value) => {
    setForm((prev) => ({
      ...prev,
      curriculumModules: prev.curriculumModules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: (module.lessons || []).map((lesson, currentIndex) =>
                currentIndex === lessonIndex ? { ...lesson, [name]: value } : lesson,
              ),
            }
          : module,
      ),
    }));
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    setForm((prev) => ({
      ...prev,
      curriculumModules: prev.curriculumModules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: (module.lessons || []).filter((_, currentIndex) => currentIndex !== lessonIndex),
            }
          : module,
      ),
    }));
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", tools: "" }],
    }));
  };

  const updateProject = (projectIndex, name, value) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((project, index) =>
        index === projectIndex ? { ...project, [name]: value } : project,
      ),
    }));
  };

  const removeProject = (projectIndex) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, index) => index !== projectIndex),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      whatYouWillLearn: form.whatYouWillLearn
        ? form.whatYouWillLearn.split("\n").filter(Boolean)
        : [],
      toolsCovered: form.toolsCovered
        ? form.toolsCovered.split("\n").filter(Boolean)
        : [],
      faqs: form.faqs
        ? form.faqs
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const [question, answer] = line.split("::").map((part) => part.trim());
              return { question, answer };
            })
        : [],
      curriculumModules: form.curriculumModules.map((module, moduleIndex) => ({
        ...module,
        order: module.order ?? moduleIndex,
        lessons: (module.lessons || []).map((lesson, lessonIndex) => ({
          ...lesson,
          order: lesson.order ?? lessonIndex,
        })),
      })),
      projects: form.projects,
      fees: Number(form.fees || 0),
      discountFees: form.discountFees ? Number(form.discountFees) : null,
      projectsCount: Number(form.projectsCount || 0),
    };

    if (mode === "edit" && id) {
      await apiClient.put(`/programs/${id}`, payload);
    } else {
      await apiClient.post("/programs", payload);
    }

    navigate(ROUTES.ADMIN_PROGRAMS);
  };

  return (
    <form className="card glass form-grid" onSubmit={handleSubmit}>
      <div className="cards-grid-2">
        <label className="field"><span>Title</span><input className="input" value={form.title} onChange={(e) => updateField("title", e.target.value)} /></label>
        <label className="field"><span>Slug</span><input className="input" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} /></label>
        <label className="field"><span>Short description</span><textarea className="textarea" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} /></label>
        <label className="field"><span>Overview</span><textarea className="textarea" value={form.overview} onChange={(e) => updateField("overview", e.target.value)} /></label>
        <label className="field"><span>Thumbnail URL</span><input className="input" value={form.thumbnailUrl} onChange={(e) => updateField("thumbnailUrl", e.target.value)} /></label>
        <label className="field"><span>Hero image URL</span><input className="input" value={form.heroImageUrl} onChange={(e) => updateField("heroImageUrl", e.target.value)} /></label>
        <label className="field"><span>Hero video URL</span><input className="input" value={form.heroVideoUrl} onChange={(e) => updateField("heroVideoUrl", e.target.value)} /></label>
        <label className="field"><span>Duration</span><input className="input" value={form.duration} onChange={(e) => updateField("duration", e.target.value)} /></label>
        <label className="field"><span>Level</span><input className="input" value={form.level} onChange={(e) => updateField("level", e.target.value)} /></label>
        <label className="field"><span>Mode</span>
          <select className="select" value={form.mode} onChange={(e) => updateField("mode", e.target.value)}>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </label>
        <label className="field"><span>Fees</span><input className="input" value={form.fees} onChange={(e) => updateField("fees", e.target.value)} /></label>
        <label className="field"><span>Discount fees</span><input className="input" value={form.discountFees} onChange={(e) => updateField("discountFees", e.target.value)} /></label>
        <label className="field"><span>Category</span><input className="input" value={form.category} onChange={(e) => updateField("category", e.target.value)} /></label>
        <label className="field"><span>Projects count</span><input className="input" type="number" value={form.projectsCount} onChange={(e) => updateField("projectsCount", e.target.value)} /></label>
      </div>

      <div className="form-toggle-row">
        <label className="checkbox-row"><input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField("isFeatured", e.target.checked)} /> Featured</label>
        <label className="checkbox-row"><input type="checkbox" checked={form.isActive} onChange={(e) => updateField("isActive", e.target.checked)} /> Active</label>
        <label className="checkbox-row"><input type="checkbox" checked={form.certificateIncluded} onChange={(e) => updateField("certificateIncluded", e.target.checked)} /> Certificate included</label>
        <label className="checkbox-row"><input type="checkbox" checked={form.internshipSupport} onChange={(e) => updateField("internshipSupport", e.target.checked)} /> Internship support</label>
      </div>

      <label className="field"><span>Placement support</span><textarea className="textarea" value={form.placementSupport} onChange={(e) => updateField("placementSupport", e.target.value)} /></label>
      <label className="field"><span>What you will learn, one per line</span><textarea className="textarea" value={form.whatYouWillLearn} onChange={(e) => updateField("whatYouWillLearn", e.target.value)} /></label>
      <label className="field"><span>Tools covered, one per line</span><textarea className="textarea" value={form.toolsCovered} onChange={(e) => updateField("toolsCovered", e.target.value)} /></label>
      <label className="field"><span>Mentor name</span><input className="input" value={form.mentorName} onChange={(e) => updateField("mentorName", e.target.value)} /></label>
      <label className="field"><span>Mentor role</span><input className="input" value={form.mentorRole} onChange={(e) => updateField("mentorRole", e.target.value)} /></label>
      <label className="field"><span>Mentor bio</span><textarea className="textarea" value={form.mentorBio} onChange={(e) => updateField("mentorBio", e.target.value)} /></label>
      <label className="field"><span>Mentor avatar URL</span><input className="input" value={form.mentorAvatarUrl} onChange={(e) => updateField("mentorAvatarUrl", e.target.value)} /></label>
      <label className="field"><span>FAQs, one per line as question :: answer</span><textarea className="textarea" value={form.faqs} onChange={(e) => updateField("faqs", e.target.value)} /></label>

      <div className="builder-section">
        <div className="builder-header">
          <h2>Curriculum builder</h2>
          <button type="button" className="btn btn-secondary" onClick={addModule}><Plus size={16} /> Add module</button>
        </div>
        <div className="builder-stack">
          {form.curriculumModules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="card builder-card">
              <div className="builder-header">
                <strong>Module {moduleIndex + 1}</strong>
                <button type="button" className="icon-btn" onClick={() => removeModule(moduleIndex)}><Trash2 size={16} /></button>
              </div>
              <input className="input" placeholder="Module title" value={module.title} onChange={(e) => updateModule(moduleIndex, "title", e.target.value)} />
              <textarea className="textarea" placeholder="Module description" value={module.description || ""} onChange={(e) => updateModule(moduleIndex, "description", e.target.value)} />
              <input className="input" type="number" placeholder="Order" value={module.order || 0} onChange={(e) => updateModule(moduleIndex, "order", Number(e.target.value))} />
              <div className="builder-header">
                <strong>Lessons</strong>
                <button type="button" className="btn btn-secondary" onClick={() => addLesson(moduleIndex)}><Plus size={16} /> Add lesson</button>
              </div>
              {(module.lessons || []).map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="lesson-card">
                  <div className="builder-header">
                    <span>Lesson {lessonIndex + 1}</span>
                    <button type="button" className="icon-btn" onClick={() => removeLesson(moduleIndex, lessonIndex)}><Trash2 size={14} /></button>
                  </div>
                  <input className="input" placeholder="Lesson title" value={lesson.title} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)} />
                  <input className="input" placeholder="Duration" value={lesson.duration || ""} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "duration", e.target.value)} />
                  <input className="input" type="number" placeholder="Order" value={lesson.order || 0} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "order", Number(e.target.value))} />
                  <label className="checkbox-row"><input type="checkbox" checked={Boolean(lesson.isPreview)} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "isPreview", e.target.checked)} /> Preview</label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="builder-section">
        <div className="builder-header">
          <h2>Projects</h2>
          <button type="button" className="btn btn-secondary" onClick={addProject}><Plus size={16} /> Add project</button>
        </div>
        <div className="builder-stack">
          {form.projects.map((project, projectIndex) => (
            <div key={projectIndex} className="card builder-card">
              <div className="builder-header">
                <strong>Project {projectIndex + 1}</strong>
                <button type="button" className="icon-btn" onClick={() => removeProject(projectIndex)}><Trash2 size={16} /></button>
              </div>
              <input className="input" placeholder="Project title" value={project.title} onChange={(e) => updateProject(projectIndex, "title", e.target.value)} />
              <textarea className="textarea" placeholder="Project description" value={project.description || ""} onChange={(e) => updateProject(projectIndex, "description", e.target.value)} />
              <input className="input" placeholder="Tools" value={project.tools || ""} onChange={(e) => updateProject(projectIndex, "tools", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" type="submit">
        {mode === "edit" ? "Update program" : "Save program"}
      </button>
    </form>
  );
};

export default ProgramForm;
