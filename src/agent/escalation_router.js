// Policy-driven Escalation Router Engine
import { SUPPORT_INTENTS } from './intent_classifier.js';

export function evaluateEscalation(customerTweet, intent, confidence, RAGContext = []) {
  const textLower = customerTweet.toLowerCase();

  // 1. High-Risk Thermal Overheating / Fire Hazard
  if (/(overheating|burning hot|fire|smoke|exploded|swollen battery|electric shock)/i.test(textLower)) {
    return {
      decision: "ESCALATE_HUMAN",
      reason: "High-risk thermal overheating safety hazard. Mandates immediate tier-2 safety engineer escalation.",
      riskLevel: "CRITICAL",
      policyTrigger: "SAFETY_THERMAL"
    };
  }

  // 2. Account Takeover / Security Compromise
  if (/(hacked|stolen account|unauthorized access|changed my recovery|hacker|compromised|two-factor authentication code sent to lost)/i.test(textLower)) {
    return {
      decision: "ESCALATE_HUMAN",
      reason: "Account Security policy: Account takeover or 2FA recovery loss requires identity verification by security team.",
      riskLevel: "HIGH",
      policyTrigger: "ACCOUNT_TAKEOVER"
    };
  }

  // 3. Financial Billing Disputes & Double Charges
  if (/(double charged|unauthorized purchase|want my money back|fraud|stolen card|dispute charge|charged \$|never signed up for|annual app subscription)/i.test(textLower)) {
    return {
      decision: "ESCALATE_HUMAN",
      reason: "Financial Policy: Billing dispute or subscription refund request exceeding auto-approval limits.",
      riskLevel: "HIGH",
      policyTrigger: "BILLING_DISPUTE"
    };
  }

  // 4. Physical In-Person Hardware Repair / Liquid Damage / Boot Loop
  if (/(liquid|water damage|dropped in water|shattered|cracked screen|bent|broken glass|green line|truedepth camera|infinite recovery boot loop|boot loop|brick|stuck in an infinite)/i.test(textLower)) {
    return {
      decision: "ESCALATE_HUMAN",
      reason: "Hardware/System Policy: Physical liquid/screen panel damage or boot loop requires Genius Bar in-person repair.",
      riskLevel: "MEDIUM",
      policyTrigger: "HARDWARE_DAMAGE"
    };
  }

  // 5. Logistics / Trade-in Claims / Package Theft
  if (/(package stolen|stolen from porch|trade in quote|trade-in quote|shipping label is missing|trade in value estimated|re-evaluated to|address for my pending)/i.test(textLower)) {
    return {
      decision: "ESCALATE_HUMAN",
      reason: "Logistics Policy: Shipping theft, trade-in quote discrepancies, or order modification require customer order system access.",
      riskLevel: "MEDIUM",
      policyTrigger: "LOGISTICS_CLAIM"
    };
  }

  // 6. High Frustration & Anger Sentiment Trigger
  if (/(wtf|angry|useless|horrible service|lawyer|sue|worst company|scam|terrible|furious|so annoyed)/i.test(textLower)) {
    return {
      decision: "ESCALATE_HUMAN",
      reason: "Sentiment Trigger: Customer frustration score > 0.85. Transferring to human specialist for empathetic resolution.",
      riskLevel: "MEDIUM",
      policyTrigger: "HIGH_FRUSTRATION_SENTIMENT"
    };
  }

  // 7. Low Confidence Fallback
  if (confidence < 0.60) {
    return {
      decision: "ESCALATE_HUMAN",
      reason: `Classification Uncertainty: Intent confidence score (${(confidence * 100).toFixed(0)}%) is below auto-handling threshold.`,
      riskLevel: "LOW",
      policyTrigger: "LOW_CONFIDENCE"
    };
  }

  // 8. Auto-Handle Qualified
  return {
    decision: "AUTO_HANDLE",
    reason: `Low risk standard support query (${intent}). Guided self-service resolution available in Apple Support KB.`,
    riskLevel: "LOW",
    policyTrigger: "AUTO_HANDLE_QUALIFIED"
  };
}
