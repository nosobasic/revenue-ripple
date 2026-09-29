import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Play,
  Sparkles,
  Target,
  Users,
  Waves,
  Wrench,
  Zap,
  Image,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAIAssistant } from "../context/AIAssistantContext";
import { supabase } from "../supabase/client.jsx";
import { courses } from "../data/courses";
import { memberApi } from "../lib/memberApi";
import { nextLesson, selectJourney } from "../lib/journey";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import ReferralTracker from "../components/ReferralTracker";
import LearningCoach from "../components/LearningCoach";
import OnboardingWizard from "../components/OnboardingWizard";
import GoalDashboard from "../components/GoalDashboard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import "../styles/workspace.css";

export default function Dashboard() {
  const { user } = useAuth();
  const { setIsOpen } = useAIAssistant();
  const location = useLocation();
  const [state, setState] = useState(null);
  const [progress, setProgress] = useState({});
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    setErrors([]);
    setState(null);
    setProgress({});
    setCompletions([]);
    async function load() {
      const results = await Promise.allSettled([
        memberApi(user, "/api/onboarding/state"),
        supabase
          .from("user_progress")
          .select("course_id, percent_done")
          .eq("user_id", user.id),
        supabase
          .from("user_module_completion")
          .select("course_id, module_id, completed")
          .eq("user_id", user.id),
      ]);
      if (cancelled) return;
      const failures = [];
      const [onboarding, courseProgress, modules] = results;
      if (onboarding.status === "fulfilled") {
        setState(onboarding.value.state);
        setShowOnboarding(
          !!onboarding.value.state && !onboarding.value.state.completed,
        );
      } else failures.push("Your learning plan could not be loaded.");
      if (
        courseProgress.status === "fulfilled" &&
        !courseProgress.value.error
      ) {
        setProgress(
          Object.fromEntries(
            (courseProgress.value.data || []).map((p) => [
              p.course_id,
              Math.max(0, Math.min(100, Number(p.percent_done) || 0)),
            ]),
          ),
        );
      } else failures.push("Course progress is temporarily unavailable.");
      if (modules.status === "fulfilled" && !modules.value.error)
        setCompletions(modules.value.data || []);
      else failures.push("Your next unfinished lesson could not be checked.");
      setErrors(failures);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, refresh]);
  useEffect(() => {
    if (!loading && new URLSearchParams(location.search).get("tab") === "goals")
      document.getElementById("goals")?.scrollIntoView({ behavior: "smooth" });
  }, [loading, location.search]);
  const profile = state?.data || {};
  const course = selectJourney(courses, progress, profile);
  const lesson = nextLesson(course, completions);
  const lessonPath = course
    ? `/courses/${course.slug}${lesson && !errors.length ? `/module-${lesson.id}` : ""}`
    : "/courses";
  const completedCourses = courses.filter(
    (c) => progress[c.slug] >= 100,
  ).length;
  const completedModules = completions.filter((c) => c.completed).length;
  const inProgress = courses.filter(
    (c) => progress[c.slug] > 0 && progress[c.slug] < 100,
  );
  const featured = [
    ...new Set([
      course,
      ...inProgress,
      ...courses.filter((c) =>
        ["email-marketing", "ai-essentials", "funnel-building"].includes(
          c.slug,
        ),
      ),
    ]),
  ]
    .filter(Boolean)
    .slice(0, 3);
  const name =
    user?.name?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    "there";
  const coachContext = JSON.stringify({
    goal: profile.goals,
    interests: profile.interests,
    experience: profile.experience,
    dailyMinutes: profile.dailyMinutes,
    nextCourse: course?.title,
    nextLesson: lesson?.title,
    nextLessonDescription: lesson?.description,
    completedModules,
    instruction:
      "Coach the learner through one concrete next action. Explain relevant course concepts, ask practice questions, and suggest a practical application. Do not claim to save goals, generate images, or execute tools.",
  });
  return (
    <>
      <Navbar />
      <div className="rr-workspace rr-shell rr-classic">
        <SEO
          title="Your learning journey"
          description="A clear next step toward your marketing goals."
          url="https://revenueripple.org/dashboard"
        />
        <ReferralTracker />
        <a href="#workspace-main" className="rr-skip">
          Skip to dashboard
        </a>
        <div className="rr-main-wrap">
          <main id="workspace-main" className="rr-main">
            <div className="rr-page-heading">
              <div>
                <h1>Welcome to Revenue Ripple</h1>
                <p>Good to see you, {name}. Let’s keep learning.</p>
              </div>
              <span className="rr-date">
                {new Intl.DateTimeFormat("en", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                }).format(new Date())}
              </span>
            </div>
            {!!errors.length && (
              <div className="rr-error" role="alert">
                {errors.join(" ")}{" "}
                <button onClick={() => setRefresh((n) => n + 1)}>
                  Try again
                </button>
              </div>
            )}
            {loading ? (
              <div className="rr-loading" role="status">
                <Sparkles />
                <p>Finding your next step…</p>
              </div>
            ) : (
              <>
                {!state?.completed && (
                  <div className="rr-setup-banner">
                    <div>
                      <Sparkles size={18} />
                      <span>
                        Give your learning a direction. Finish setting up your
                        plan.
                      </span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!state}
                      onClick={() => setShowOnboarding(true)}
                    >
                      Build my plan <ArrowRight />
                    </Button>
                  </div>
                )}
                <div className="rr-overview-grid">
                  <div className="rr-primary-column">
                    <GoalDashboard key={user?.id} refreshKey={refresh} />

                    <Card className="rr-hero">
                      <div className="rr-hero-content">
                        <span className="rr-pill">
                          <span /> Up next
                        </span>
                        <h2>
                          {course
                            ? progress[course.slug] > 0
                              ? "Continue your course"
                              : "Start your first course"
                            : "Your courses are complete"}
                        </h2>
                        <p>
                          {course
                            ? `${course.title}${lesson ? ` · ${lesson.title}` : ""}`
                            : "You’ve completed the course catalog. Revisit a skill and put it into practice."}
                        </p>
                        <div className="rr-hero-meta">
                          <span>
                            <Clock3 size={15} />{" "}
                            {lesson?.video?.duration
                              ? `${lesson.video.duration} video`
                              : course?.estimatedTime || "Learn at your pace"}
                          </span>
                          <span>
                            <GraduationCap size={16} /> Learn · Practice · Apply
                          </span>
                        </div>
                        <Button asChild size="lg" variant="gradient">
                          <Link to={lessonPath}>
                            <Play size={16} />
                            {course
                              ? progress[course.slug] > 0
                                ? "Continue learning"
                                : "Start learning"
                              : "Explore courses"}
                            <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                      <div className="rr-hero-bottom">
                        <span>
                          {profile.goals
                            ? `Working toward: ${profile.goals}`
                            : "Your progress is saved as you complete lessons."}
                        </span>
                        <Compass size={18} />
                      </div>
                    </Card>
                    <div className="rr-stats">
                      <Card>
                        <span>
                          <BookOpen size={17} /> In progress
                        </span>
                        <strong>
                          {errors.length ? "—" : inProgress.length}
                          <small>courses</small>
                        </strong>
                      </Card>
                      <Card>
                        <span>
                          <Check size={17} /> Steps taken
                        </span>
                        <strong>
                          {errors.length ? "—" : completedModules}
                          <small>lessons completed</small>
                        </strong>
                      </Card>
                      <Card>
                        <span>
                          <GraduationCap size={17} /> Keep growing
                        </span>
                        <strong>
                          {errors.length ? "—" : completedCourses}
                          <small>courses completed</small>
                        </strong>
                      </Card>
                    </div>
                    <Card className="rr-panel rr-learning-plan">
                      <div className="rr-section-heading">
                        <div>
                          <h2>
                            <GraduationCap size={22} /> Your learning plan
                          </h2>
                        </div>
                        <span className="rr-tag">
                          {profile.dailyMinutes || "15"} min / day
                          {!profile.dailyMinutes && " suggested"}
                        </span>
                      </div>
                      <div className="rr-journey">
                        <Link to={lessonPath}>
                          <span className="rr-step-icon">
                            <Play />
                          </span>
                          <div>
                            <small>01 · LEARN</small>
                            <h3>
                              {lesson?.title || "Explore your next course"}
                            </h3>
                            <p>Start with one clear idea.</p>
                          </div>
                          <ArrowRight />
                        </Link>
                        <Link
                          to={`${lessonPath}${lesson && !errors.length ? "#knowledge-check" : ""}`}
                        >
                          <span className="rr-step-icon">
                            <GraduationCap />
                          </span>
                          <div>
                            <small>02 · PRACTICE</small>
                            <h3>Make the knowledge stick</h3>
                            <p>Take the lesson’s knowledge check.</p>
                          </div>
                          <ArrowRight />
                        </Link>
                        <button onClick={() => setIsOpen(true)}>
                          <span className="rr-step-icon">
                            <Wrench />
                          </span>
                          <div>
                            <small>03 · APPLY</small>
                            <h3>Turn learning into doing</h3>
                            <p>Ask Ripple to help you put it to work.</p>
                          </div>
                          <ArrowRight />
                        </button>
                      </div>
                    </Card>
                  </div>
                  <div className="rr-secondary-column">
                    <Card className="rr-panel rr-coach-card">
                      <div className="rr-section-heading">
                        <div className="rr-coach-mark">
                          <Sparkles />
                        </div>
                        <span className="rr-tag">Learning assistant</span>
                      </div>
                      <h2>Need a hand?</h2>
                      <p>
                        {profile.goals
                          ? `Let’s break “${profile.goals}” into manageable steps.`
                          : "Bring your questions, your big ideas, or the concept that hasn’t clicked yet."}
                      </p>
                      <div className="rr-coach-note">
                        <span>Try asking</span>
                        <p>
                          “Help me apply{" "}
                          {course?.title.toLowerCase() || "what I’m learning"}{" "}
                          to my business.”
                        </p>
                      </div>
                      <Button variant="coach" onClick={() => setIsOpen(true)}>
                        Open learning assistant <ArrowRight />
                      </Button>
                      <small className="rr-muted">
                        Guidance that stays connected to your next lesson.
                      </small>
                    </Card>
                    <Card className="rr-panel rr-toolkit" id="toolkit">
                      <div className="rr-section-heading">
                        <div>
                          <h2>
                            <Wrench size={22} /> Your toolkit
                          </h2>
                        </div>
                        <Wrench size={18} />
                      </div>
                      <Link to="/vault">
                        <span className="rr-tool-icon">
                          <Zap />
                        </span>
                        <div>
                          <h3>Resource vault</h3>
                          <p>Find resources for your next project</p>
                        </div>
                        <ArrowRight size={16} />
                      </Link>
                      <Link to="/ai-visibility">
                        <span className="rr-tool-icon">
                          <Compass />
                        </span>
                        <div>
                          <h3>AI visibility</h3>
                          <p>Explore your brand’s visibility</p>
                        </div>
                        <ArrowRight size={16} />
                      </Link>
                      <Link to="/affiliate-centre/tools">
                        <span className="rr-tool-icon">
                          <Wrench />
                        </span>
                        <div>
                          <h3>Affiliate tools</h3>
                          <p>Put your marketing skills to work</p>
                        </div>
                        <ArrowRight size={16} />
                      </Link>
                      <div className="rr-coming">
                        <Image size={20} />
                        <div>
                          <h3>Image studio</h3>
                          <p>Create visuals for your campaigns</p>
                        </div>
                        <span className="rr-tag">Planned</span>
                      </div>
                    </Card>
                  </div>
                </div>
                <section className="rr-courses">
                  <div className="rr-section-heading">
                    <div>
                      <h2>Your courses</h2>
                    </div>
                    <Link to="/courses">
                      All courses <ArrowRight size={16} />
                    </Link>
                  </div>
                  <div className="rr-course-grid">
                    {featured.map((c, index) => (
                      <Card key={c.slug} className="rr-course-card">
                        <Link to={`/courses/${c.slug}`}>
                          <div
                            className={`rr-course-art rr-art-${index}`}
                            aria-hidden="true"
                          >
                            <BookOpen size={22} />
                          </div>
                          <div className="rr-course-copy">
                            <span className="rr-eyebrow">
                              {c.modules.length} LESSONS · {c.estimatedTime}
                            </span>
                            <h3>
                              {c.title}
                              <ArrowRight size={18} />
                            </h3>
                            <p>{c.description}</p>
                            <div className="rr-meter">
                              <span
                                style={{ width: `${progress[c.slug] || 0}%` }}
                              />
                            </div>
                            <small>
                              {errors.length
                                ? "Progress unavailable"
                                : `${progress[c.slug] || 0}% complete`}
                            </small>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </section>
                <footer className="rr-footer">
                  <Waves size={18} />
                  <span>Revenue Ripple · Learn. Apply. Grow.</span>
                </footer>
              </>
            )}
          </main>
        </div>
        {showOnboarding && (
          <OnboardingWizard
            initialState={state}
            onDismiss={() => setShowOnboarding(false)}
            onComplete={(data) => {
              setShowOnboarding(false);
              setState((old) => ({ ...old, data, completed: true }));
              setRefresh((n) => n + 1);
            }}
          />
        )}
        <LearningCoach
          context={coachContext}
          lessonPath={lessonPath}
          lessonTitle={lesson?.title}
        />
      </div>
    </>
  );
}
