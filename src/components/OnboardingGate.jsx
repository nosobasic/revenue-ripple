import ProtectedRoute from './ProtectedRoute';

// Learning is free; subscription purchase is an explicit, separate action.
export default function OnboardingGate({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
