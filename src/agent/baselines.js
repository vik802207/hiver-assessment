import { classifyIntentTrivial, classifyIntentSimple, SUPPORT_INTENTS } from './intent_classifier.js';

// Baseline 1: Trivial Baseline (TF-IDF Keyword Intent + Canned Reply + Naive Escalation)
export function runBaseline1(customerTweet) {
  const intentResult = classifyIntentTrivial(customerTweet);
  const textLower = customerTweet.toLowerCase();
  
  // Naive escalation rule
  let decision = "AUTO_HANDLE";
  let reason = "Baseline 1 default auto-handle rule.";
  if (textLower.includes('refund') || textLower.includes('hacked') || textLower.includes('stolen')) {
    decision = "ESCALATE_HUMAN";
    reason = "Baseline 1 keyword trigger: detected sensitive keyword.";
  }

  const reply = "Thanks for reaching out to Apple Support. Please restart your device or visit support.apple.com for help.";

  return {
    modelName: "Baseline 1 (Trivial Keyword + Canned)",
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    escalation: decision,
    escalation_reason: reason,
    reply: reply,
    ragContext: []
  };
}

// Baseline 2: Simple Baseline (Zero-Shot Intent + Static Escalation + Un-grounded Draft)
export function runBaseline2(customerTweet) {
  const intentResult = classifyIntentSimple(customerTweet);
  
  let decision = "AUTO_HANDLE";
  let reason = "Baseline 2 simple intent-based routing.";
  if (intentResult.intent === SUPPORT_INTENTS.ACCOUNT_BILLING || intentResult.intent === SUPPORT_INTENTS.ORDER_SHIPPING_REPAIR) {
    decision = "ESCALATE_HUMAN";
    reason = "Baseline 2 policy: All billing and order queries escalated to human agent.";
  }

  const reply = `We're sorry you're experiencing issues with ${intentResult.intent.replace(/_/g, ' ')}. Please check your settings or contact customer care for assistance.`;

  return {
    modelName: "Baseline 2 (Simple Zero-Shot + Heuristic)",
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    escalation: decision,
    escalation_reason: reason,
    reply: reply,
    ragContext: []
  };
}
