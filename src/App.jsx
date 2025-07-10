import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Admin from "./pages/admin/Admin";
import AdwordsQualityScore from "./pages/training/guides/AdwordsQualityScore";
import AffiliateCentre from "./pages/affiliate/AffiliateCentre";
import AffiliateLogin from "./pages/affiliate/AffiliateLogin";
import AffiliatePayouts from "./pages/affiliate/AffiliatePayouts";
import AffiliateSign from "./pages/affiliate/AffiliateSign";
import AffiliateSupport from "./pages/affiliate/AffiliateSupport";
import AffiliateTools from "./pages/affiliate/AffiliateTools";
import AffiliateTraining from "./pages/affiliate/AffiliateTraining";
import AnalyzingData from "./pages/training/guides/AnalyzingData";
import ArticleMarketing from "./pages/training/guides/ArticleMarketing";
import BacklinksArticle from "./pages/training/guides/BacklinksArticle";
import BacklinksSocial from "./pages/training/guides/BacklinksSocial";
import BuildingMailingList from "./pages/training/guides/BuildingMailingList";
import BulletproofBranding from "./pages/training/videos/BulletproofBranding";
import Checkout from "./pages/checkout/Checkout";
import CourseModule from "./pages/course/CourseModule";
import CourseOverview from "./pages/course/CourseOverview";
import Courses from "./pages/course/Courses";
import DMDLanding from "./pages/DMDLanding";
import Dashboard from "./pages/Dashboard";
import EntrepreneurialBrainstorming from "./pages/training/videos/EntrepreneurialBrainstorming";
import Home from "./pages/Home";
import KeywordResearch from "./pages/training/guides/KeywordResearch";
import KeywordTechnique from "./pages/training/guides/KeywordTechnique";
import LandingComponents from "./pages/training/guides/LandingComponents";
import LandingOptimization from "./pages/training/guides/LandingOptimization";
import Login from "./pages/auth/Login";
import MarketResearch from "./pages/training/guides/MarketResearch";
import MarketingMistakes from "./pages/training/guides/MarketingMistakes";
import MenGuide from "./pages/training/guides/MenGuide";
import PPCStart from "./pages/training/guides/PPCStart";
import ProResellerUpsell from "./pages/seller/ProResellerUpsell";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import PurchaseCycle from "./pages/training/guides/PurchaseCycle";
import Register from "./pages/auth/Register";
import Reseller from "./pages/seller/Reseller";
import ResellerCheckout from "./pages/seller/ResellerCheckout";
import ResellerSuccess from "./pages/seller/ResellerSuccess";
import ResellerTrial from "./pages/seller/ResellerTrial";
import SEOGoogle from "./pages/training/guides/SEOGoogle";
import SalesCopy from "./pages/training/guides/SalesCopy";
import ShoestringStartups from "./pages/training/videos/ShoestringStartups";
import SpecialInvite from "./pages/seller/SpecialInvite";
import TargetAudiences from "./pages/training/guides/TargetAudiences";
import ThankYou from "./pages/checkout/ThankYou";
import ThreeMonthsFreeUpsell from "./pages/seller/ThreeMonthsFreeUpsell";
import Training from "./pages/course/Training";
import TripwireSuccess from "./pages/TripwireSuccess";
import UnderstandingRelevance from "./pages/training/guides/UnderstandingRelevance";
import WritingAdCopy from "./pages/training/guides/WritingAdCopy";

const UnprotectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("revenue-ripple-auth-token");
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    fetch("/meta.json")
      .then((res) => res.json())
      .then((meta) => {
        const lastVersion = localStorage.getItem("app_version");
        if (lastVersion && lastVersion !== meta.build) setShowReload(true);
        localStorage.setItem("app_version", meta.build);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {showReload && (
        <div className="fixed top-0 w-full bg-yellow-300 text-black text-center p-4 z-50">
          A new version is available.{" "}
          <button
            onClick={() => window.location.reload(true)}
            className="underline"
          >
            Refresh
          </button>
        </div>
      )}
      <Routes>
        <Route
          path="/"
          element={
            <UnprotectedRoute>
              <Home />
            </UnprotectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <UnprotectedRoute>
              <Login />
            </UnprotectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <UnprotectedRoute>
              <Register />
            </UnprotectedRoute>
          }
        />
        <Route
          path="/affiliate-login"
          element={
            <UnprotectedRoute>
              <AffiliateLogin />
            </UnprotectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/thank-you"
          element={
            <ProtectedRoute>
              <ThankYou />
            </ProtectedRoute>
          }
        />
        <Route
          path="/affiliate/sign-up"
          element={
            <UnprotectedRoute>
              <AffiliateSign />
            </UnprotectedRoute>
          }
        />
        <Route
          path="/special"
          element={
            <ProtectedRoute>
              <Reseller />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tripwire-success"
          element={
            <ProtectedRoute>
              <TripwireSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reseller-success"
          element={
            <ProtectedRoute>
              <ResellerSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro-reseller-upsell"
          element={
            <ProtectedRoute>
              <ProResellerUpsell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/three-months-free-upsell"
          element={
            <ProtectedRoute>
              <ThreeMonthsFreeUpsell />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DMD"
          element={
            <ProtectedRoute>
              <DMDLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/special-invite"
          element={
            <ProtectedRoute>
              <SpecialInvite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reseller-checkout"
          element={
            <ProtectedRoute>
              <ResellerCheckout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reseller-trial"
          element={
            <ProtectedRoute>
              <ResellerTrial />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseSlug"
          element={
            <ProtectedRoute>
              <CourseOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseSlug/module-:moduleId"
          element={
            <ProtectedRoute>
              <CourseModule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/affiliate-centre/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<AffiliateCentre />} />
                <Route path="tools" element={<AffiliateTools />} />
                <Route path="training" element={<AffiliateTraining />} />
                <Route path="payouts" element={<AffiliatePayouts />} />
                <Route path="support" element={<AffiliateSupport />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route
          path="/training/videos/entrepreneurial"
          element={
            <ProtectedRoute>
              <EntrepreneurialBrainstorming />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/videos/bulletproof-branding"
          element={
            <ProtectedRoute>
              <BulletproofBranding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/videos/shoestring-startups"
          element={
            <ProtectedRoute>
              <ShoestringStartups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/adwords-quality"
          element={
            <ProtectedRoute>
              <AdwordsQualityScore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/analyzing-data"
          element={
            <ProtectedRoute>
              <AnalyzingData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/article-marketing"
          element={
            <ProtectedRoute>
              <ArticleMarketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/mailing-list"
          element={
            <ProtectedRoute>
              <BuildingMailingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/keyword-technique"
          element={
            <ProtectedRoute>
              <KeywordTechnique />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/landing-components"
          element={
            <ProtectedRoute>
              <LandingComponents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/purchase-cycle"
          element={
            <ProtectedRoute>
              <PurchaseCycle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/backlinks-social"
          element={
            <ProtectedRoute>
              <BacklinksSocial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/backlinks-article"
          element={
            <ProtectedRoute>
              <BacklinksArticle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/landing-optimization"
          element={
            <ProtectedRoute>
              <LandingOptimization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/men-guide"
          element={
            <ProtectedRoute>
              <MenGuide />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/market-research"
          element={
            <ProtectedRoute>
              <MarketResearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/keyword-research"
          element={
            <ProtectedRoute>
              <KeywordResearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/ppc-start"
          element={
            <ProtectedRoute>
              <PPCStart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/seo-google"
          element={
            <ProtectedRoute>
              <SEOGoogle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/target-audiences"
          element={
            <ProtectedRoute>
              <TargetAudiences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/marketing-mistakes"
          element={
            <ProtectedRoute>
              <MarketingMistakes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/understanding-relevance"
          element={
            <ProtectedRoute>
              <UnderstandingRelevance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/writing-ad-copy"
          element={
            <ProtectedRoute>
              <WritingAdCopy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/guides/sales-copy"
          element={
            <ProtectedRoute>
              <SalesCopy />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
