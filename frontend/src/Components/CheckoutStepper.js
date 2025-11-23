import { React } from "react";
import "./CheckoutStepper.css";

/**
 * CheckoutStepper Component
 * Multi-step checkout progress indicator
 */
function CheckoutStepper({ currentStep, steps = ["Cart", "Shipping", "Payment", "Review"] }) {
  return (
    <div className="checkout-stepper">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className={`stepper-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
            <div className="step-circle">
              {isCompleted ? "✓" : stepNumber}
            </div>
            <div className="step-label">{step}</div>
            {index < steps.length - 1 && <div className="step-connector" />}
          </div>
        );
      })}
    </div>
  );
}

export default CheckoutStepper;

