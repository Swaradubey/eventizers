import { useState, useEffect, useCallback } from "react";
import { BillingUsage } from "../types/billing.types";
import { BillingAPI } from "../services/billingService";

export const useBillingUsage = (enabled: boolean = true) => {
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BillingAPI.getBillingUsage();
      setUsage(data);
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
