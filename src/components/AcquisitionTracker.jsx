import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureAcquisitionTouch } from "../utils/acquisitionAttribution";
export default function AcquisitionTracker() {
  const { search } = useLocation();
  useEffect(() => {
    try {
      captureAcquisitionTouch(search);
    } catch {
      /* Browser storage may be unavailable. */
    }
  }, [search]);
  return null;
}
