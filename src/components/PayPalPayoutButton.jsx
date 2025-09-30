import React, { useState } from "react";

const PayPalPayoutButton = ({
  userEmail,
  amount,
  onSuccess,
  onError,
  disabled = false,
  className = "cta-button",
  minimumAmount = 10.0,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  console.log("amount==-=-=",userEmail)

  const handlePayoutRequest = async () => {
    // Validation
    if (!userEmail) {
      setError("User email is required");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    if (amount < minimumAmount) {
      setError(`Minimum payout amount is $${minimumAmount}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setError("Invalid email format");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/paypal/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          amount: amount,
          currency: "USD",
        }),
      });

      const data = await response.json();
      console.log("DATA", data)

      if (data.ok) {
        onSuccess?.(data);
        // Show success message
        alert(
          `Payout request submitted successfully! Batch ID: ${data.batch_id}`
        );
      } else {
        throw new Error(data.error || "Failed to process payout request");
      }
    } catch (err) {
      console.error("Payout error:", err);
      setError(err.message);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="paypal-payout-container">
      <button
        onClick={handlePayoutRequest}
        disabled={
          disabled ||
          isLoading ||
          !userEmail ||
          !amount ||
          amount <= 0 ||
          amount < minimumAmount
        }
        className={`${className} ${isLoading ? "loading" : ""}`}
        style={{
          opacity:
            disabled ||
            isLoading ||
            !userEmail ||
            !amount ||
            amount <= 0 ||
            amount < minimumAmount
              ? 0.6
              : 1,
          cursor:
            disabled ||
            isLoading ||
            !userEmail ||
            !amount ||
            amount <= 0 ||
            amount < minimumAmount
              ? "not-allowed"
              : "pointer",
        }}
      >
        {isLoading ? (
          <>
            <span className="loading-spinner">⏳</span>
            Processing...
          </>
        ) : (
          <>
            <span className="paypal-icon">💰</span>
            Request Payout
          </>
        )}
      </button>

      {error && (
        <div
          className="error-message"
          style={{
            color: "#ef4444",
            fontSize: "0.875rem",
            marginTop: "0.5rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default PayPalPayoutButton;
