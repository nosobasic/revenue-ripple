import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import AffiliateSign from './pages/AffiliateSign';
import AffiliateLogin from './pages/AffiliateLogin';
import AffiliateCentre from './pages/AffiliateCentre';
import AffiliateTools from './pages/AffiliateTools';
import AffiliateTraining from './pages/AffiliateTraining';
import AffiliatePayouts from './pages/AffiliatePayouts';
import AffiliateSupport from './pages/AffiliateSupport';
import CourseOverview from './pages/CourseOverview';
import CourseModule from './pages/CourseModule';
import Courses from './pages/Courses';
import Reseller from './pages/Reseller';
import TripwireSuccess from './pages/TripwireSuccess';
import ResellerSuccess from './pages/ResellerSuccess';
import ProResellerUpsell from './pages/ProResellerUpsell';
import ThreeMonthsFreeUpsell from './pages/ThreeMonthsFreeUpsell';
import Profile from './pages/Profile';
import DMDLanding from './pages/DMDLanding';
import SpecialInvite from './pages/SpecialInvite';
import ResellerCheckout from './pages/ResellerCheckout';
import ResellerTrial from './pages/ResellerTrial';

// Import training pages
import EntrepreneurialBrainstorming from './pages/training/videos/EntrepreneurialBrainstorming';
import BulletproofBranding from './pages/training/videos/BulletproofBranding';
import ShoestringStartups from './pages/training/videos/ShoestringStartups';
import AdwordsQualityScore from './pages/training/guides/AdwordsQualityScore';
import AnalyzingData from './pages/training/guides/AnalyzingData';
import ArticleMarketing from './pages/training/guides/ArticleMarketing';
import BuildingMailingList from './pages/training/guides/BuildingMailingList';
import KeywordTechnique from './pages/training/guides/KeywordTechnique';
import LandingComponents from './pages/training/guides/LandingComponents';
import PurchaseCycle from './pages/training/guides/PurchaseCycle';
import BacklinksSocial from './pages/training/guides/BacklinksSocial';
import BacklinksArticle from './pages/training/guides/BacklinksArticle';
import LandingOptimization from './pages/training/guides/LandingOptimization';
import MenGuide from './pages/training/guides/MenGuide';
import MarketResearch from './pages/training/guides/MarketResearch';
import KeywordResearch from './pages/training/guides/KeywordResearch';
import PPCStart from './pages/training/guides/PPCStart';
import SEOGoogle from './pages/training/guides/SEOGoogle';
import TargetAudiences from './pages/training/guides/TargetAudiences';
import MarketingMistakes from './pages/training/guides/MarketingMistakes';
import UnderstandingRelevance from './pages/training/guides/UnderstandingRelevance';
import WritingAdCopy from './pages/training/guides/WritingAdCopy';
import SalesCopy from './pages/training/guides/SalesCopy';

console.log("App component loaded");

function App() {
  // Version check state
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    // Fetch meta.json on load
    fetch('/meta.json')
      .then(res => res.json())
      .then(meta => {
        const lastVersion = localStorage.getItem('app_version');
        if (lastVersion && lastVersion !== meta.build) {
          setShowReload(true);
        }
        localStorage.setItem('app_version', meta.build);
      });
  }, []);

  return (
    <div>
      {/* Version update banner */}
      {showReload && (
        <div style={{
          background: 'yellow',
          color: 'black',
          padding: '1rem',
          textAlign: 'center',
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 9999
        }}>
          A new version is available. <button onClick={() => window.location.reload(true)}>Refresh</button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/affiliate-login" element={<AffiliateLogin />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/affiliate/sign-up" element={<AffiliateSign />} />
        <Route path="/special" element={<Reseller />} />
        <Route path="/tripwire-success" element={<TripwireSuccess />} />
        <Route path="/reseller-success" element={<ResellerSuccess />} />
        <Route path="/pro-reseller-upsell" element={<ProResellerUpsell />} />
        <Route path="/three-months-free-upsell" element={<ThreeMonthsFreeUpsell />} />
        <Route path="/DMD" element={<DMDLanding />} />
        <Route path="/special-invite" element={<SpecialInvite />} />
        <Route path="/reseller-checkout" element={<ResellerCheckout />} />
        <Route path="/reseller-trial" element={<ResellerTrial />} />
        
        {/* Protected Routes */}
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

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Affiliate Centre Routes */}
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

        {/* Course Routes */}
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

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Training Video Routes */}
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

        {/* Training Guide Routes */}
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
     
    </div>
  );
}

export default App;