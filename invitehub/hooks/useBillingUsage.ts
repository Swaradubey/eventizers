import { useState, useEffect, useCallback, useRef } from "react";
import { BillingUsage } from "../types/billing.types";
import { BillingAPI } from "../services/billingService";

export const useBillingUsage = (enabled: boolean = true) => {
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchUsage = useCallback(async () => {
    // Only show the loading skeleton on the very first fetch.
    // Subsequent background refreshes silently update data.
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await BillingAPI.getBillingUsage();
      setUsage(data);
      hasLoadedOnce.current = true;
    } catch (err: any) {
      console.error("Error fetching billing usage:", err);
      setError("Unable to load billing usage.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchUsage();
    } else {
      // Auth not yet ready – don't show loading spinner indefinitely.
      setLoading(false);
    }
  }, [enabled, fetchUsage]);

  return {
    usage,
    loading,
    error,
    refetch: fetchUsage
  };
};

export default useBillingUsage;
