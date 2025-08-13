import { useEffect, useState, lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { STORAGE_KEYS, logger } from './config/constants';

// Immediate load components (critical path)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
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
import ResetPassword from './pages/ResetPassword';
import AffiliateSignupFixed from './pages/AffiliateSignupFixed';
import EntrepreneurialBrainstorming from './pages/training/videos/EntrepreneurialBrainstorming';
import MindsetMastery from './pages/training/videos/MindsetMastery';
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
import AIVisibilityTracker from './pages/AIVisibilityTracker';
import ProductComparison from './pages/ProductComparison';
import Insights from './pages/Insights';

const UnprotectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  console.log('App component rendering...');
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Revenue Ripple</h1>
      <p>App is loading successfully!</p>
      <p>Environment check:</p>
      <ul>
        <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT_SET'}</li>
        <li>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET'}</li>
        <li>Node Env: {import.meta.env.NODE_ENV}</li>
      </ul>
    </div>
  );
};

export default App;