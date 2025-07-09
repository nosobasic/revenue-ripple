import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import "../../../../public/css/pages.css";

const LandingOptimization = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">LANDING PAGE OPTIMIZATION</h1>
          <div className="dashboard-welcome">Marketing Training & Guide</div>
        </div>
      </header>
      <div className="container dashboard-content">
        <div className="main-content">
          <div className="section">
            <div className="section-header">
              <h2>Guide Content</h2>
            </div>
            <div className="section-content">
              <div className="guide-content">
                <style>
                  {`
                    .guide-image {
                      max-width: 100%;
                      height: auto;
                      display: block;
                      margin: 2rem auto;
                      border-radius: 8px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      max-height: 500px;
                      object-fit: contain;
                    }
                    .guide-image-block {
                      margin: 2rem 0;
                      text-align: center;
                    }
                    .guide-image-block figcaption {
                      margin-top: 1rem;
                      font-style: italic;
                      color: #666;
                    }
                  `}
                </style>

                <div className="guide-intro">
                  <h3>Boost Your Landing Page Click-Through Rate</h3>
                  <p>
                    This guide breaks down powerful ways to turn visitors into
                    buyers — with better headlines, strategic benefits, smart
                    links, and a layout that gets results.
                  </p>
                </div>

                <div className="guide-section">
                  <h4>🧠 Lesson 1: Headlines That Convert</h4>
                  <p>
                    Most people leave within 5–10 seconds. Headlines must hook
                    them immediately. Try asking a powerful question, raising
                    doubt, and ending with a strong benefit.
                  </p>
                  <ul>
                    <li>
                      <strong>Question:</strong> Are You Maximizing the
                      Potential of Your Website Traffic?
                    </li>
                    <li>
                      <strong>Doubt:</strong> If Not, You're Losing Thousands
                      Every Year!
                    </li>
                    <li>
                      <strong>Benefit:</strong> Learn How Opt-In Lists Can Boost
                      Profits by 500%!
                    </li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h4>💥 Lesson 2: Highlight Benefits</h4>
                  <p>
                    People want results, not features. Highlight what they'll
                    gain. Use bullets to keep it skimmable:
                  </p>
                  <ul>
                    <li>✅ Make more money from your existing traffic</li>
                    <li>✅ Increase opt-in rates by 500%</li>
                    <li>✅ Build lists of hungry customers</li>
                    <li>✅ Get lifetime visitors back to your site</li>
                  </ul>

                  <figure className="guide-image-block">
                    <img
                      src="/assets/images/images/Landing-Page-Opt1.png"
                      alt="Landing Page Benefits Example"
                      className="guide-image"
                    />
                    <figcaption>
                      Example of effective benefit presentation on a landing
                      page.
                    </figcaption>
                  </figure>
                </div>

                <div className="guide-section">
                  <h4>🔗 Lesson 3: Smart Text Links</h4>
                  <p>
                    Links should guide—not overwhelm—readers. Use relevant
                    phrases and action-based links:
                  </p>
                  <ul>
                    <li>Click to learn more</li>
                    <li>Sign up today</li>
                    <li>Visit the site now</li>
                    <li>Read on</li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h4>👆 Lesson 4: Solo Links</h4>
                  <p>
                    These are your most clickable elements. Place them mid-page
                    or at the bottom using a bold font and clear CTA like:
                  </p>
                  <blockquote>
                    Click Here and Learn How to Improve Your Golf Game by 7
                    Strokes
                  </blockquote>
                </div>

                <div className="guide-section">
                  <h4>👁️ Lesson 5: Readability</h4>
                  <p>
                    Clean design = better conversions. Keep your text legible
                    and easy to scan:
                  </p>
                  <ul>
                    <li>🧾 Black text on white background works best</li>
                    <li>❌ Avoid clashing text/background colors</li>
                    <li>🔤 Use consistent fonts (12pt Arial recommended)</li>
                    <li>
                      🎯 Skip decorative banners—lead with a strong headline
                    </li>
                  </ul>
                </div>

                <div className="guide-section">
                  <h4>✅ Wrap-Up</h4>
                  <p>
                    You don't need to apply every tactic—but implementing even a
                    few will lift your performance. Focus on clarity, urgency,
                    and value, and watch your conversions grow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="side-content">
          <div className="section">
            <div className="section-header">
              <h2>Related Guides</h2>
            </div>
            <div className="section-content">
              <div className="related-guides">
                <Link
                  to="/training/guides/landing-components"
                  className="related-guide-item"
                >
                  <h4>Components of a Landing Page</h4>
                  <p>Landing pages are your digital pitchman...</p>
                </Link>
                <Link
                  to="/training/guides/sales-copy"
                  className="related-guide-item"
                >
                  <h4>Writing Effective Sales Copy</h4>
                  <p>Sales copy is what turns visits into money...</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingOptimization;
