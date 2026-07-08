"use client";

import { useState, useEffect, FormEvent } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BillingAPI, PaymentMethod } from "../../../services/billingService";

// Load Stripe outside component to avoid re-creation
let stripePromise: Promise<Stripe | null> | null = null;
const getStripePromise = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
};

interface UpdatePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: PaymentMethod) => void;
  onError: (message: string) => void;
}

// Card Element styling to match the existing design system
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#2D1B3D",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      "::placeholder": {
        color: "#2D1B3D66",
      },
      iconColor: "#C9A84C",
    },
    invalid: {
      color: "#e11d48",
      iconColor: "#e11d48",
    },
  },
};

/**
 * Inner form component — must be inside <Elements> context.
 */
function CardForm({
  onClose,
  onSuccess,
  onError,
}: {
  onClose: () => void;
  onSuccess: (data: PaymentMethod) => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);

  // Create SetupIntent when form mounts
  useEffect(() => {
    let cancelled = false;
    const fetchSetupIntent = async () => {
      try {
        const res = await BillingAPI.createSetupIntent();
        if (!cancelled) {
          setClientSecret(res.clientSecret);
        }
      } catch (err: any) {
        if (!cancelled) {
          setCardError(
            err.response?.data?.error || "Failed to initialize payment form. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingIntent(false);
        }
      }
    };
    fetchSetupIntent();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setSaving(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError("Card element not found.");
      setSaving(false);
      return;
    }

    try {
      // Confirm the SetupIntent with the card details
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setCardError(error.message || "Card verification failed. Please try again.");
        setSaving(false);
        return;
      }

      if (!setupIntent?.payment_method) {
        setCardError("Payment method was not created. Please try again.");
        setSaving(false);
        return;
      }

      // Send the payment method ID to our backend
      const pmId =
        typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method.id;

      const res = await BillingAPI.updatePaymentMethod(pmId);

      if (res && res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        setCardError("Failed to save payment method.");
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error || err.message || "An unexpected error occurred.";
      setCardError(errMsg);
      onError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Element Container */}
      <div>
        <label className="block text-[10px] font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-2">
          Card Details
        </label>
        {loadingIntent ? (
          <div className="h-12 bg-[#FAF8F5] border border-[#E8C4B8]/30 rounded-xl flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-[#C9A84C] animate-spin" />
          </div>
        ) : (
          <div className="p-3 bg-white border border-[#E8C4B8]/40 rounded-xl focus-within:border-[#C9A84C] focus-within:ring-1 focus-within:ring-[#C9A84C]/20 transition-all">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {cardError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-rose-700 font-medium leading-relaxed">{cardError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-[11px] font-bold text-[#2D1B3D]/70 bg-white border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] rounded-xl transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !stripe || !clientSecret || loadingIntent}
          className="px-5 py-2 text-[11px] font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5" />
              Save Card
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Modal wrapper — provides Stripe Elements context.
 */
export default function UpdatePaymentMethodModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: UpdatePaymentMethodModalProps) {
  const stripePromiseRef = getStripePromise();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#2D1B3D]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white border border-[#E8C4B8]/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C] to-[#2D1B3D]" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#2D1B3D] text-[#C9A84C] flex items-center justify-center rounded-xl shadow-sm">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3
                    className="text-base font-bold text-[#2D1B3D]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Update Payment Method
                  </h3>
                  <p className="text-[10px] text-[#2D1B3D]/50">
                    Enter your new card details below
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#2D1B3D]/40 hover:text-[#2D1B3D] hover:bg-[#FAF8F5] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {stripePromiseRef ? (
                <Elements stripe={stripePromiseRef}>
                  <CardForm
                    onClose={onClose}
                    onSuccess={onSuccess}
                    onError={onError}
                  />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                  <p className="text-xs font-semibold text-[#2D1B3D]">
                    Payment service unavailable
                  </p>
                  <p className="text-[10px] text-[#2D1B3D]/50 mt-1">
                    Stripe publishable key is not configured.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
