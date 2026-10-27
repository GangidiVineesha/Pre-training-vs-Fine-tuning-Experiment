export type DomainKey = 'clinical' | 'finance' | 'legal' | 'nl2sql' | 'custom';

export type TuningMethod = 'full_finetuning' | 'lora_r8' | 'lora_r16' | 'lora_r32' | 'prefix_tuning';

export interface TaskSample {
  id: string;
  domain: DomainKey;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard / Edge Case';
  prompt: string;
  groundTruth: string;
  context?: string;
  expectedFormat: string;
  explanation: string;
}

export interface ModelPrediction {
  modelName: string;
  output: string;
  latencyMs: number;
  tokenCount: number;
  perplexity: number;
  confidenceScore: number;
  similarityScore: number;
  exactMatch: boolean;
  formatAdherence: number;
  hallucinationRisk: string;
  status: string;
}

export interface ComparisonResult {
  success: boolean;
  timestamp: string;
  prompt: string;
  groundTruth: string;
  domain: DomainKey;
  tuningMethod: TuningMethod;
  loraRank: number;
  results: {
    pretrained: ModelPrediction;
    finetuned: ModelPrediction;
  };
  evaluationSummary: {
    accuracyGain: string;
    perplexityDrop: string;
    formatIntegrityGain: string;
    verdict: string;
  };
}

export interface MetricComparison {
  pretrained: number | string;
  finetuned: number | string;
  delta: string;
}

export interface BenchmarkMetrics {
  accuracy: MetricComparison;
  precision: MetricComparison;
  recall: MetricComparison;
  f1Score: MetricComparison;
  exactMatch: MetricComparison;
  domainPerplexity: MetricComparison;
  formattingErrorRate: MetricComparison;
}

export interface EpochLoss {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  mmluGeneral: number;
}

export interface DomainBenchmarkData {
  domainName: string;
  datasetSplit: string;
  metrics: BenchmarkMetrics;
  confusionMatrix: {
    labels: string[];
    pretrained: number[][];
    finetuned: number[][];
  };
  lossHistory: EpochLoss[];
}
