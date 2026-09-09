import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { runBaseline1, runBaseline2 } from '../agent/baselines.js';
import { runProposedAgent } from '../agent/proposed_agent.js';
import { calculateClassificationMetrics, calculateTextOverlap } from './metrics.js';
import { evaluateReplyWithJudge } from './llm_judge.js';
import { calculateHumanJudgeAlignment } from './alignment.js';
import { SUPPORT_INTENTS } from '../agent/intent_classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const evalSetPath = path.join(__dirname, '../../data/golden_eval_set.json');
const outputPath = path.join(__dirname, '../../data/benchmark_results.json');

if (!fs.existsSync(evalSetPath)) {
  console.error("❌ Golden evaluation set not found at data/golden_eval_set.json. Please run data generator first.");
  process.exit(1);
}

const goldenSet = JSON.parse(fs.readFileSync(evalSetPath, 'utf8'));
console.log(`\n====================================================================`);
console.log(`🚀 RUNNING EVALUATION BENCHMARK ON ${goldenSet.length} HAND-LABELLED GOLDEN SAMPLES`);
console.log(`====================================================================\n`);

const allIntents = Object.values(SUPPORT_INTENTS);
const escalationClasses = ["AUTO_HANDLE", "ESCALATE_HUMAN"];

function benchmarkModel(modelName, modelFn) {
  console.log(`Evaluating ${modelName}...`);
  
  const intentPreds = [];
  const intentTruths = [];
  const escPreds = [];
  const escTruths = [];
  const tokenF1s = [];
  const rougeLs = [];
  const judgeScores = [];
  const humanScores = [];
  const detailedResults = [];

  goldenSet.forEach(sample => {
    const res = modelFn(sample.customer_tweet);

    intentPreds.push(res.intent);
    intentTruths.push(sample.intent);

    escPreds.push(res.escalation);
    escTruths.push(sample.escalation);

    const textMetrics = calculateTextOverlap(res.reply, sample.reference_reply);
    tokenF1s.push(textMetrics.tokenF1);
    rougeLs.push(textMetrics.rougeL);

    const intentMatch = (res.intent === sample.intent);
    const escMatch = (res.escalation === sample.escalation);

    const judgeEval = evaluateReplyWithJudge(
      sample.customer_tweet,
      res.reply,
      sample.reference_reply,
      res.escalation,
      res.ragContext || [],
      intentMatch,
      escMatch
    );

    judgeScores.push(judgeEval.overallScore);
    humanScores.push(sample.human_quality_score);

    detailedResults.push({
      sampleId: sample.id,
      customerTweet: sample.customer_tweet,
      groundTruth: {
        intent: sample.intent,
        escalation: sample.escalation,
        escalationReason: sample.escalation_reason,
        referenceReply: sample.reference_reply,
        humanScore: sample.human_quality_score
      },
      modelOutput: {
        intent: res.intent,
        confidence: res.confidence,
        escalation: res.escalation,
        escalationReason: res.escalation_reason,
        reply: res.reply,
        judgeScore: judgeEval.overallScore,
        judgeRubric: judgeEval.rubric
      }
    });
  });

  const intentMetrics = calculateClassificationMetrics(intentPreds, intentTruths, allIntents);
  const escMetrics = calculateClassificationMetrics(escPreds, escTruths, escalationClasses);

  const avgTokenF1 = +(tokenF1s.reduce((a, b) => a + b, 0) / tokenF1s.length).toFixed(4);
  const avgRougeL = +(rougeLs.reduce((a, b) => a + b, 0) / rougeLs.length).toFixed(4);
  const avgJudgeScore = +(judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length).toFixed(2);

  const alignment = calculateHumanJudgeAlignment(humanScores, judgeScores);

  return {
    modelName,
    summary: {
      intentAccuracy: intentMetrics.accuracy,
      intentMacroF1: intentMetrics.macroF1,
      escalationAccuracy: escMetrics.accuracy,
      escalationMacroF1: escMetrics.macroF1,
      escalationPrecision: escMetrics.macroPrecision,
      escalationRecall: escMetrics.macroRecall,
      replyTokenF1: avgTokenF1,
      replyRougeL: avgRougeL,
      avgLLMJudgeScore: avgJudgeScore,
      humanJudgeAlignment: alignment
    },
    intentMetrics,
    escalationMetrics: escMetrics,
    detailedResults
  };
}

const b1Results = benchmarkModel("Baseline 1 (Trivial Keyword + Canned)", runBaseline1);
const b2Results = benchmarkModel("Baseline 2 (Simple Zero-Shot + Static Routing)", runBaseline2);
const proposedResults = benchmarkModel("Proposed System (Grounded RAG + Policy Router)", runProposedAgent);

const fullBenchmarkOutput = {
  timestamp: new Date().toISOString(),
  goldenSetSize: goldenSet.length,
  models: {
    baseline1: b1Results,
    baseline2: b2Results,
    proposedAgent: proposedResults
  }
};

fs.writeFileSync(outputPath, JSON.stringify(fullBenchmarkOutput, null, 2));

console.log(`\n====================================================================`);
console.log(`🏆 HEADLINE COMPARISON BENCHMARK RESULTS`);
console.log(`====================================================================\n`);

console.table([
  {
    "Model Architecture": "Baseline 1 (Trivial)",
    "Intent F1": b1Results.summary.intentMacroF1,
    "Escalation F1": b1Results.summary.escalationMacroF1,
    "Reply ROUGE-L": b1Results.summary.replyRougeL,
    "LLM Judge (1-5)": b1Results.summary.avgLLMJudgeScore,
    "Human Alignment (r)": b1Results.summary.humanJudgeAlignment.pearsonR
  },
  {
    "Model Architecture": "Baseline 2 (Simple)",
    "Intent F1": b2Results.summary.intentMacroF1,
    "Escalation F1": b2Results.summary.escalationMacroF1,
    "Reply ROUGE-L": b2Results.summary.replyRougeL,
    "LLM Judge (1-5)": b2Results.summary.avgLLMJudgeScore,
    "Human Alignment (r)": b2Results.summary.humanJudgeAlignment.pearsonR
  },
  {
    "Model Architecture": "Proposed System (RAG+Agent)",
    "Intent F1": proposedResults.summary.intentMacroF1,
    "Escalation F1": proposedResults.summary.escalationMacroF1,
    "Reply ROUGE-L": proposedResults.summary.replyRougeL,
    "LLM Judge (1-5)": proposedResults.summary.avgLLMJudgeScore,
    "Human Alignment (r)": proposedResults.summary.humanJudgeAlignment.pearsonR
  }
]);

console.log(`\n📊 PROPOSED AGENT HUMAN-LLM JUDGE ALIGNMENT EVIDENCE:`);
console.log(`- Pearson Correlation (r): ${proposedResults.summary.humanJudgeAlignment.pearsonR}`);
console.log(`- Spearman Rank (rho): ${proposedResults.summary.humanJudgeAlignment.spearmanRho}`);
console.log(`- Mean Absolute Error (MAE): ${proposedResults.summary.humanJudgeAlignment.mae} rating points`);
console.log(`- Agreement (within ±0.5 pts): ${proposedResults.summary.humanJudgeAlignment.percentageAgreementWithinHalfPoint}%\n`);

console.log(`✅ Benchmark output saved to data/benchmark_results.json`);
