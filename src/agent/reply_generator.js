// Grounded Reply Generator for Apple Support Twitter Voice
export function generateGroundedReply(customerTweet, intent, RAGDocs = [], escalationResult = null) {
  const isEscalation = escalationResult && escalationResult.decision === "ESCALATE_HUMAN";
  
  if (isEscalation) {
    if (escalationResult.policyTrigger === "SAFETY_THERMAL") {
      return "Your safety is our top priority. Please immediately disconnect your charger and stop using the device. Please DM us your device model so our senior safety engineering team can inspect this right away.";
    }
    if (escalationResult.policyTrigger === "ACCOUNT_TAKEOVER") {
      return "Account security is extremely important to us. Please visit iforgot.apple.com to initiate recovery, and send us a direct message (DM) right now so our Account Security team can secure your account.";
    }
    if (escalationResult.policyTrigger === "BILLING_DISPUTE") {
      return "We understand your frustration regarding billing. You can submit a refund claim directly at reportaproblem.apple.com. Please also send us a DM with your Apple ID email so we can review account charges with you.";
    }
    if (escalationResult.policyTrigger === "HARDWARE_DAMAGE") {
      return "We're sorry to hear about the physical damage. Because hardware issues require physical inspection, please DM us your serial number so we can help schedule a Genius Bar repair appointment.";
    }
    return `We hear you and want to make this right. Due to ${escalationResult.reason.toLowerCase()}, please send us a DM with your account details so a support specialist can assist you directly.`;
  }

  // Auto-handling grounded in retrieved historical RAG resolution context
  if (RAGDocs && RAGDocs.length > 0) {
    const topDoc = RAGDocs[0];
    const steps = topDoc.resolution_steps ? ` Suggested fix: ${topDoc.resolution_steps}` : '';
    return `We're here to help! ${topDoc.brand_reply}${steps} If you need extra step-by-step assistance, send us a DM!`;
  }

  // Standard fallback grounded reply
  return "We can help look into this with you! Try restarting your device and verifying your settings. Send us a DM with your iOS version if the issue persists.";
}
