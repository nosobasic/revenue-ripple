import { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MilestoneCheckIn from './components/MilestoneCheckIn';
import { STORAGE_KEYS, logger } from './config/constants';

// Immediate load components (critical path)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataDeletion from './pages/DataDeletion';
import OAuthTest from './pages/OAuthTest';
// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Training = lazy(() => import('./pages/Training'));
const Admin = lazy(() => import('./pages/Admin'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const AffiliateSign = lazy(() => import('./pages/AffiliateSign'));
const AffiliateLogin = lazy(() => import('./pages/AffiliateLogin'));
const AffiliateCentre = lazy(() => import('./pages/AffiliateCentre'));
const AffiliateTools = lazy(() => import('./pages/AffiliateTools'));
const AffiliateTraining = lazy(() => import('./pages/AffiliateTraining'));
const AffiliatePayouts = lazy(() => import('./pages/AffiliatePayouts'));
const AffiliateSupport = lazy(() => import('./pages/AffiliateSupport'));
const CourseOverview = lazy(() => import('./pages/CourseOverview'));
const CourseModule = lazy(() => import('./pages/CourseModule'));
const Courses = lazy(() => import('./pages/Courses'));
const Reseller = lazy(() => import('./pages/Reseller'));
const TripwireSuccess = lazy(() => import('./pages/TripwireSuccess'));
const ResellerSuccess = lazy(() => import('./pages/ResellerSuccess'));
const ProResellerUpsell = lazy(() => import('./pages/ProResellerUpsell'));
const ThreeMonthsFreeUpsell = lazy(() => import('./pages/ThreeMonthsFreeUpsell'));
const Profile = lazy(() => import('./pages/Profile'));
const DMDLanding = lazy(() => import('./pages/DMDLanding'));
const SpecialInvite = lazy(() => import('./pages/SpecialInvite'));
const ResellerCheckout = lazy(() => import('./pages/ResellerCheckout'));
const ResellerTrial = lazy(() => import('./pages/ResellerTrial'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const BookGiveaway = lazy(() => import('./pages/BookGiveaway'));
const BookGiveawayThankYou = lazy(() => import('./pages/BookGiveawayThankYou'));
const SurvivalPlaybook = lazy(() => import('./pages/SurvivalPlaybook'));
const ThankYouSurvivalPlaybook = lazy(() => import('./pages/ThankYouSurvivalPlaybook'));
const ProResellerSuccess = lazy(() => import('./pages/ProResellerSuccess'));
// New landing page components
const MembershipVariation1 = lazy(() => import('./pages/MembershipVariation1'));
const MembershipVariation2 = lazy(() => import('./pages/MembershipVariation2'));
const MembershipVariation3 = lazy(() => import('./pages/MembershipVariation3'));
const DMDVariation1 = lazy(() => import('./pages/DMDVariation1'));
const DMDVariation2 = lazy(() => import('./pages/DMDVariation2'));
const DMDVariation3 = lazy(() => import('./pages/DMDVariation3'));
const ThankYouMembershipMastery = lazy(() => import('./pages/ThankYouMembershipMastery'));
const ThankYouDMD = lazy(() => import('./pages/ThankYouDMD'));
// Lazy load training components
const EntrepreneurialBrainstorming = lazy(() => import('./pages/training/videos/EntrepreneurialBrainstorming'));
const MindsetMastery = lazy(() => import('./pages/training/videos/MindsetMastery'));
const ShoestringStartups = lazy(() => import('./pages/training/videos/ShoestringStartups'));
const AdwordsQualityScore = lazy(() => import('./pages/training/guides/AdwordsQualityScore'));
const AnalyzingData = lazy(() => import('./pages/training/guides/AnalyzingData'));
const ArticleMarketing = lazy(() => import('./pages/training/guides/ArticleMarketing'));
const BuildingMailingList = lazy(() => import('./pages/training/guides/BuildingMailingList'));
const KeywordTechnique = lazy(() => import('./pages/training/guides/KeywordTechnique'));
const LandingComponents = lazy(() => import('./pages/training/guides/LandingComponents'));
const PurchaseCycle = lazy(() => import('./pages/training/guides/PurchaseCycle'));
const BacklinksSocial = lazy(() => import('./pages/training/guides/BacklinksSocial'));
const BacklinksArticle = lazy(() => import('./pages/training/guides/BacklinksArticle'));
const LandingOptimization = lazy(() => import('./pages/training/guides/LandingOptimization'));
const MenGuide = lazy(() => import('./pages/training/guides/MenGuide'));
const MarketResearch = lazy(() => import('./pages/training/guides/MarketResearch'));
const KeywordResearch = lazy(() => import('./pages/training/guides/KeywordResearch'));
const PPCStart = lazy(() => import('./pages/training/guides/PPCStart'));
const SEOGoogle = lazy(() => import('./pages/training/guides/SEOGoogle'));
const TargetAudiences = lazy(() => import('./pages/training/guides/TargetAudiences'));
const MarketingMistakes = lazy(() => import('./pages/training/guides/MarketingMistakes'));
const UnderstandingRelevance = lazy(() => import('./pages/training/guides/UnderstandingRelevance'));
const WritingAdCopy = lazy(() => import('./pages/training/guides/WritingAdCopy'));
const SalesCopy = lazy(() => import('./pages/training/guides/SalesCopy'));
const ThankYouMemberToAffiliate = lazy(() => import('./pages/ThankyouMemberToAffiliate'));
// Founders Annual components
const FoundersAnnualCheckout = lazy(() => import('./pages/FoundersAnnualCheckout'));
const FoundersSuccess = lazy(() => import('./pages/FoundersSuccess'));
// Command Center components
const CommandCenter = lazy(() => import('./pages/CommandCenter'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const UnprotectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    fetch('/meta.json')
      .then(res => res.json())
      .then(meta => {
        const lastVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
        if (lastVersion && lastVersion !== meta.build) setShowReload(true);
        localStorage.setItem(STORAGE_KEYS.APP_VERSION, meta.build);
      })
      .catch((error) => {
        logger.warn('Could not fetch app version:', error);
      });
  }, []);

  return (
    <>
      {showReload && (
        <div className="fixed top-0 w-full bg-yellow-300 text-black text-center p-4 z-50">
          A new version is available. <button onClick={() => window.location.reload(true)} className="underline">Refresh</button>
        </div>
      )}
      <MilestoneCheckIn />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
        <Route path="/" element={<UnprotectedRoute><Home /></UnprotectedRoute>} />
        <Route path="/login" element={<UnprotectedRoute><Login /></UnprotectedRoute>} />
        <Route path="/register" element={<UnprotectedRoute><Register /></UnprotectedRoute>} />
        <Route path="/affiliate-login" element={<UnprotectedRoute><AffiliateLogin /></UnprotectedRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/oauth-test" element={<OAuthTest />} />
        
        {/* Public legal pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        {/* Checkout - unprotected for DMD tripwire, component handles auth check for other products */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
        <Route path="/affiliate/sign-up" element={<AffiliateSign />} />
        
        {/* Public landing pages for new customer acquisition */}
        <Route path="/special" element={<Reseller />} />
        <Route path="/DMD" element={<DMDLanding />} />
        
        {/* Protected checkout and success pages */}
        <Route path="/reseller-checkout" element={<ProtectedRoute><ResellerCheckout /></ProtectedRoute>} />
        <Route path="/tripwire-success" element={<ProtectedRoute><TripwireSuccess /></ProtectedRoute>} />
        <Route path="/reseller-success" element={<ProtectedRoute><ResellerSuccess /></ProtectedRoute>} />
        <Route path="/pro-reseller-success" element={<ProtectedRoute><ProResellerSuccess /></ProtectedRoute>} />
        <Route path="/pro-reseller-upsell" element={<ProtectedRoute><ProResellerUpsell /></ProtectedRoute>} />
        <Route path="/three-months-free-upsell" element={<ProtectedRoute><ThreeMonthsFreeUpsell /></ProtectedRoute>} />
        <Route path="/special-invite" element={<ProtectedRoute><SpecialInvite /></ProtectedRoute>} />
        <Route path="/reseller-trial" element={<ProtectedRoute><ResellerTrial /></ProtectedRoute>} />
        
        {/* Founders Annual Routes */}
        <Route path="/founders-checkout" element={<ProtectedRoute><FoundersAnnualCheckout /></ProtectedRoute>} />
        <Route path="/founders-success" element={<ProtectedRoute><FoundersSuccess /></ProtectedRoute>} />

        {/* Command Center Routes */}
        <Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute requirePayment={true}><Dashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute requirePayment={true}><Courses /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute requirePayment={true}><Training /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/courses/:courseSlug" element={<ProtectedRoute requirePayment={true}><CourseOverview /></ProtectedRoute>} />
        <Route path="/courses/:courseSlug/module-:moduleId" element={<ProtectedRoute requirePayment={true}><CourseModule /></ProtectedRoute>} />

        <Route path="/affiliate-centre/*" element={<ProtectedRoute>
          <Routes>
            <Route path="/" element={<AffiliateCentre />} />
            <Route path="tools" element={<AffiliateTools />} />
            <Route path="training" element={<AffiliateTraining />} />
            <Route path="payouts" element={<AffiliatePayouts />} />
            <Route path="support" element={<AffiliateSupport />} />
          </Routes>
        </ProtectedRoute>} />

        <Route path="/training/videos/entrepreneurial" element={<ProtectedRoute><EntrepreneurialBrainstorming /></ProtectedRoute>} />
        <Route path="/training/videos/mindset-mastery" element={<ProtectedRoute><MindsetMastery /></ProtectedRoute>} />
        <Route path="/training/videos/shoestring-startups" element={<ProtectedRoute><ShoestringStartups/></ProtectedRoute>} />
        <Route path="/training/guides/adwords-quality" element={<ProtectedRoute><AdwordsQualityScore /></ProtectedRoute>} />
        <Route path="/training/guides/analyzing-data" element={<ProtectedRoute><AnalyzingData /></ProtectedRoute>} />
        <Route path="/training/guides/article-marketing" element={<ProtectedRoute><ArticleMarketing /></ProtectedRoute>} />
        <Route path="/training/guides/mailing-list" element={<ProtectedRoute><BuildingMailingList /></ProtectedRoute>} />
        <Route path="/training/guides/keyword-technique" element={<ProtectedRoute><KeywordTechnique /></ProtectedRoute>} />
        <Route path="/training/guides/landing-components" element={<ProtectedRoute><LandingComponents /></ProtectedRoute>} />
        <Route path="/training/guides/purchase-cycle" element={<ProtectedRoute><PurchaseCycle /></ProtectedRoute>} />
        <Route path="/training/guides/backlinks-social" element={<ProtectedRoute><BacklinksSocial /></ProtectedRoute>} />
        <Route path="/training/guides/backlinks-article" element={<ProtectedRoute><BacklinksArticle /></ProtectedRoute>} />
        <Route path="/training/guides/landing-optimization" element={<ProtectedRoute><LandingOptimization /></ProtectedRoute>} />
        <Route path="/training/guides/men-guide" element={<ProtectedRoute><MenGuide /></ProtectedRoute>} />
        <Route path="/training/guides/market-research" element={<ProtectedRoute><MarketResearch /></ProtectedRoute>} />
        <Route path="/training/guides/keyword-research" element={<ProtectedRoute><KeywordResearch /></ProtectedRoute>} />
        <Route path="/training/guides/ppc-start" element={<ProtectedRoute><PPCStart /></ProtectedRoute>} />
        <Route path="/training/guides/seo-google" element={<ProtectedRoute><SEOGoogle /></ProtectedRoute>} />
        <Route path="/training/guides/target-audiences" element={<ProtectedRoute><TargetAudiences /></ProtectedRoute>} />
        <Route path="/training/guides/marketing-mistakes" element={<ProtectedRoute><MarketingMistakes /></ProtectedRoute>} />
        <Route path="/training/guides/understanding-relevance" element={<ProtectedRoute><UnderstandingRelevance /></ProtectedRoute>} />
        <Route path="/training/guides/writing-ad-copy" element={<ProtectedRoute><WritingAdCopy /></ProtectedRoute>} />
        <Route path="/training/guides/sales-copy" element={<ProtectedRoute><SalesCopy /></ProtectedRoute>} />
        <Route path="/command-center" element={<CommandCenter />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Book Giveaway Routes */}
        <Route path="/book-giveaway" element={<BookGiveaway />} />
        <Route path="/book-giveaway-thank-you" element={<BookGiveawayThankYou />} />
        
        {/* Survival Playbook Routes */}
        <Route path="/survival-playbook" element={<SurvivalPlaybook />} />
        <Route path="/thank-you-survival-playbook" element={<ThankYouSurvivalPlaybook />} />
        
        {/* Membership Mastery Landing Page Routes */}
        <Route path="/membership-variation-1" element={<MembershipVariation1 />} />
        <Route path="/membership-variation-2" element={<MembershipVariation2 />} />
        <Route path="/membership-variation-3" element={<MembershipVariation3 />} />
        <Route path="/thank-you-membership-mastery" element={<ThankYouMembershipMastery />} />
        <Route path="/thank-you-member-to-affiliate" element={<ThankYouMemberToAffiliate />} />
        
        {/* Digital Marketing Domination Landing Page Routes */}
        <Route path="/dmd-variation-1" element={<DMDVariation1 />} />
        <Route path="/dmd-variation-2" element={<DMDVariation2 />} />
        <Route path="/dmd-variation-3" element={<DMDVariation3 />} />
        <Route path="/thank-you-dmd" element={<ThankYouDMD />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;