// Statistical Correlation & Agreement Engine between Human Benchmark Scores and LLM Judge Scores

export function calculateHumanJudgeAlignment(humanScores, judgeScores) {
  const n = humanScores.length;
  if (n === 0 || n !== judgeScores.length) {
    return { pearsonR: 0, spearmanRho: 0, mae: 0, percentageAgreementWithinHalfPoint: 0 };
  }

  // 1. Mean calculation
  const meanHuman = humanScores.reduce((a, b) => a + b, 0) / n;
  const meanJudge = judgeScores.reduce((a, b) => a + b, 0) / n;

  // 2. Pearson Correlation Coefficient (r)
  let num = 0;
  let denHuman = 0;
  let denJudge = 0;

  for (let i = 0; i < n; i++) {
    const diffH = humanScores[i] - meanHuman;
    const diffJ = judgeScores[i] - meanJudge;
    num += diffH * diffJ;
    denHuman += diffH * diffH;
    denJudge += diffJ * diffJ;
  }

  const pearsonR = denHuman > 0 && denJudge > 0 ? +(num / Math.sqrt(denHuman * denJudge)).toFixed(4) : 0;

  // 3. Spearman Rank Correlation (rho)
  const rank = (arr) => {
    const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
    const ranks = new Array(arr.length);
    for (let i = 0; i < sorted.length; i++) {
      ranks[sorted[i].idx] = i + 1;
    }
    return ranks;
  };

  const humanRanks = rank(humanScores);
  const judgeRanks = rank(judgeScores);

  let dSquareSum = 0;
  for (let i = 0; i < n; i++) {
    const d = humanRanks[i] - judgeRanks[i];
    dSquareSum += d * d;
  }

  const spearmanRho = +(1 - (6 * dSquareSum) / (n * (n * n - 1))).toFixed(4);

  // 4. Mean Absolute Error (MAE) & % Agreement within 0.5 points
  let absoluteErrorSum = 0;
  let withinHalfPointCount = 0;

  for (let i = 0; i < n; i++) {
    const diff = Math.abs(humanScores[i] - judgeScores[i]);
    absoluteErrorSum += diff;
    if (diff <= 0.5) {
      withinHalfPointCount += 1;
    }
  }

  const mae = +(absoluteErrorSum / n).toFixed(4);
  const percentageAgreementWithinHalfPoint = +((withinHalfPointCount / n) * 100).toFixed(2);

  return {
    pearsonR,
    spearmanRho,
    mae,
    percentageAgreementWithinHalfPoint,
    samplesCount: n,
    meanHumanScore: +meanHuman.toFixed(2),
    meanJudgeScore: +meanJudge.toFixed(2)
  };
}
