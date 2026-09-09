import { classifyIntentProposed } from './intent_classifier.js';
import { retrieveContext } from './retriever.js';
import { evaluateEscalation } from './escalation_router.js';
import { generateGroundedReply } from './reply_generator.js';

// Proposed System: Multi-Stage Grounded RAG Agent + Policy Router
export function runProposedAgent(customerTweet) {
  // Step 1: Classify Intent
  const intentResult = classifyIntentProposed(customerTweet);

  // Step 2: Retrieve RAG Context from Historical Apple Support Knowledge Base
  const RAGDocs = retrieveContext(customerTweet, intentResult.intent, 3);

  // Step 3: Evaluate Escalation Policy with Stated Rationale
  const escalationResult = evaluateEscalation(customerTweet, intentResult.intent, intentResult.confidence, RAGDocs);

  // Step 4: Generate Grounded Reply Draft
  const reply = generateGroundedReply(customerTweet, intentResult.intent, RAGDocs, escalationResult);

  return {
    modelName: "Proposed Agent (Grounded RAG + Policy Router)",
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    escalation: escalationResult.decision,
    escalation_reason: escalationResult.reason,
    riskLevel: escalationResult.riskLevel,
    policyTrigger: escalationResult.policyTrigger,
    reply: reply,
    ragContext: RAGDocs
  };
}
