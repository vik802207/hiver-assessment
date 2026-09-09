// Intent classification engine with 6 defined intents from data analysis
export const SUPPORT_INTENTS = {
  DEVICE_HARDWARE: "device_hardware_issue",
  SOFTWARE_BUG: "software_bug_update",
  ACCOUNT_BILLING: "account_apple_id_billing",
  ACCESSORY_CONNECTIVITY: "accessory_connectivity",
  GENERAL_HOW_TO: "general_how_to",
  ORDER_SHIPPING_REPAIR: "order_shipping_repair"
};

export const INTENT_DESCRIPTIONS = {
  [SUPPORT_INTENTS.DEVICE_HARDWARE]: "Physical damage, screen flicker, battery drain, speaker distortion, heating, camera glass broken, face id",
  [SUPPORT_INTENTS.SOFTWARE_BUG]: "iOS update crash, app freezing, boot loop, system storage full bug, Wi-Fi disconnect software bug, lag",
  [SUPPORT_INTENTS.ACCOUNT_BILLING]: "Apple ID locked, unexpected charges, refund request, subscription cancel, password reset, payment declined",
  [SUPPORT_INTENTS.ACCESSORY_CONNECTIVITY]: "AirPods sound/charging, Apple Watch pairing error, Apple Pencil, MagSafe, Bluetooth disconnects, CarPlay",
  [SUPPORT_INTENTS.GENERAL_HOW_TO]: "Settings query, screenshot gesture, StandBy mode, dark mode automation, WhatsApp transfer, backup guide",
  [SUPPORT_INTENTS.ORDER_SHIPPING_REPAIR]: "Genius Bar appointment, repair status ID, trade-in kit delivery, order shipping delay, package stolen"
};

const KEYWORD_MAP = {
  [SUPPORT_INTENTS.DEVICE_HARDWARE]: [
    'battery', 'drain', 'dropping', 'screen', 'flashing', 'flicker', 'display', 'shattered', 'cracked', 'shatter', 'overheating',
    'hot', 'speaker', 'crackling', 'distorted', 'microphone', 'mic', 'hardware', 'liquid', 'water', 'drop', 'truedepth',
    'face id', 'button', 'stuck', 'physical', 'camera glass', 'lens', 'damage'
  ],
  [SUPPORT_INTENTS.SOFTWARE_BUG]: [
    'ios', 'update', 'bug', 'freeze', 'freezes', 'freezing', 'crash', 'crashes', 'crashing', 'boot loop', 'recovery',
    'bricked', 'storage', 'space', '0 bytes', 'app store', 'spinning', 'lag', 'typing', 'sluggish', 'macos', 'sonoma',
    'installer', 'corrupt', 'imessage', 'safari', 'backup', 'icloud backup'
  ],
  [SUPPORT_INTENTS.ACCOUNT_BILLING]: [
    'charge', 'charged', 'double charged', 'refund', 'billing', 'subscription', 'cancel', 'apple id', 'locked',
    'hacked', 'password', 'iforgot', 'payment', 'declined', 'card', 'invoice', 'receipt', 'phishing', 'fraud',
    'unauthorized', 'two-factor', '2fa', 'security questions', 'money back'
  ],
  [SUPPORT_INTENTS.ACCESSORY_CONNECTIVITY]: [
    'airpod', 'airpods', 'anc', 'case', 'charging', 'magsafe', 'watch', 'apple watch', 'pairing', 'pair', 'pencil',
    'bluetooth', 'carplay', 'homepod', 'adapter', 'mouse', 'trackpad', 'headphone', 'audio sharing'
  ],
  [SUPPORT_INTENTS.GENERAL_HOW_TO]: [
    'how do i', 'how to', 'where is', 'can i', 'screenshot', 'standby', 'dark mode', 'whatsapp', 'transfer',
    'screen recording', 'emergency sos', 'duplicate contacts', 'ringtone', 'webcam', 'family sharing', 'turn on', 'setup'
  ],
  [SUPPORT_INTENTS.ORDER_SHIPPING_REPAIR]: [
    'trade-in', 'trade in', 'repair', 'dispatch', 'order', 'shipping', 'delivery', 'processing', 'package', 'stolen',
    'genius bar', 'appointment', 'mysupport', 'return', 'valuation', 'tracking', 'shipping label'
  ]
};

// 1. Trivial Baseline Classifier (Naive TF-IDF / Keyword Count)
export function classifyIntentTrivial(text) {
  const normalized = text.toLowerCase();
  const scores = {};
  
  Object.keys(KEYWORD_MAP).forEach(intent => {
    scores[intent] = 0;
    KEYWORD_MAP[intent].forEach(word => {
      if (normalized.includes(word)) {
        scores[intent] += 1;
      }
    });
  });

  let bestIntent = SUPPORT_INTENTS.GENERAL_HOW_TO;
  let maxScore = -1;

  Object.entries(scores).forEach(([intent, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  });

  const totalHits = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalHits > 0 ? Math.min(1.0, +(maxScore / totalHits).toFixed(2)) : 0.40;

  return { intent: bestIntent, confidence, scoreMap: scores };
}

// 2. Simple Baseline Classifier (Rule + Simple prompt abstraction)
export function classifyIntentSimple(text) {
  const result = classifyIntentTrivial(text);
  if (text.toLowerCase().includes('charge') || text.toLowerCase().includes('refund')) {
    result.intent = SUPPORT_INTENTS.ACCOUNT_BILLING;
    result.confidence = 0.85;
  }
  return result;
}

// 3. Proposed Advanced Multi-Stage Intent Classifier
export function classifyIntentProposed(text) {
  const normalized = text.toLowerCase();
  const scores = {};

  Object.keys(KEYWORD_MAP).forEach(intent => {
    scores[intent] = 0;
    KEYWORD_MAP[intent].forEach(word => {
      if (normalized.includes(word)) {
        const weight = word.includes(' ') ? 3.0 : 1.2;
        scores[intent] += weight;
      }
    });
  });

  // Targeted Contextual Rules for High Precision
  if (/(airpod|watch|pencil|magsafe|carplay|headphone)/i.test(normalized)) {
    scores[SUPPORT_INTENTS.ACCESSORY_CONNECTIVITY] += 4.0;
  }
  if (/(trade-in|shipping|order|repair status|package stolen|genius bar)/i.test(normalized)) {
    scores[SUPPORT_INTENTS.ORDER_SHIPPING_REPAIR] += 4.0;
  }
  if (/(charge|charged|refund|subscription|apple id|hacked|password|billing)/i.test(normalized)) {
    scores[SUPPORT_INTENTS.ACCOUNT_BILLING] += 4.0;
  }
  if (/(ios|update|boot loop|storage|freez|crash|app store spinning|imessage)/i.test(normalized)) {
    scores[SUPPORT_INTENTS.SOFTWARE_BUG] += 4.0;
  }
  if (/(battery|screen|shattered|overheating|heat|hot|speaker|crackling|mic|liquid|water)/i.test(normalized)) {
    scores[SUPPORT_INTENTS.DEVICE_HARDWARE] += 4.0;
  }
  if (/(how do|how to|where is|can i|standby|dark mode|record my screen)/i.test(normalized)) {
    scores[SUPPORT_INTENTS.GENERAL_HOW_TO] += 4.0;
  }

  let bestIntent = SUPPORT_INTENTS.GENERAL_HOW_TO;
  let maxScore = -1;

  Object.entries(scores).forEach(([intent, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  let confidence = total > 0 ? +(maxScore / (total + 0.1)).toFixed(2) : 0.50;
  confidence = Math.min(0.98, Math.max(0.55, confidence));

  return { intent: bestIntent, confidence, scoreMap: scores };
}
