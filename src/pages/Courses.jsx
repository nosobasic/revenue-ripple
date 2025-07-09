import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaGraduationCap, FaPlay } from "react-icons/fa";
import { coursesSecond } from "../constants/data/courses";
import "../../public/css/pages.css";

const Courses = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">VIDEO COURSES</h1>
          <div className="dashboard-welcome">
            Comprehensive Training Library
          </div>
        </div>
      </header>

      <div className="container dashboard-content">
        <div className="main-content">
          <div className="section-group">
            <h2 className="section-title">Video Courses</h2>
            <p className="section-subtitle">
              Master the skills you need with our comprehensive video training
              library
            </p>
            <div className="section">
              <div className="section-header">
                <FaGraduationCap className="section-icon" />
                <h2>ALL COURSES</h2>
              </div>
              <div className="section-content">
                {coursesSecond.map((course) => (
                  <div
                    key={course.id}
                    className={`course-item ${
                      expandedSection === course.id ? "expanded" : ""
                    }`}
                    onClick={() => toggleSection(course.id)}
                  >
                    <h3>{course.title}</h3>
                    {expandedSection === course.id && (
                      <div className="course-details">
                        <p>{course.description}</p>
                        <Link to={`/courses/${course.id}`} className="cta-link">
                          <FaPlay style={{ marginRight: "8px" }} />
                          Start Course →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side Content - Message from owner */}
        <div className="side-content">
          <div className="section">
            <div className="section-header">
              <h2>Message from the owner:</h2>
            </div>
            <div className="section-content">
              <div className="owner-message">
                <p>
                  From affiliate marketing and SEO to paid ads and social media,
                  these courses break down what actually works in the world of
                  online marketing. No fluff—just real strategies you can apply
                  to start growing your business today.
                </p>
                <p>
                  You'll learn how to run ad campaigns that convert, bring in
                  quality leads, and drive consistent traffic. We'll also show
                  you how to build optimized funnels, landing pages that sell,
                  and how to rank higher on search engines without wasting time.
                </p>
                <p>
                  Whether you're just getting started or looking to sharpen your
                  skills and scale up, this content is built to deliver value
                  fast. It's taught by people who've done it—not just theory,
                  but actual tactics that work in today's market.
                </p>
                <p>
                  If you're serious about growing your brand or business, tap
                  into these videos and start leveling up. And if you've got
                  questions or need support, hit us up—we've got you.
                </p>
                <p>Let's get it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
