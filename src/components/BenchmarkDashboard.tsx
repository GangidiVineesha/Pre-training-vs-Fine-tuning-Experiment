import React, { useState } from 'react';
import { DomainKey, DomainBenchmarkData } from '../types';
import { DOMAINS, BENCHMARK_DEFAULTS } from '../data/datasets';
import { BarChart3, TrendingUp, Compass, ShieldCheck, Activity, Award, Layers } from 'lucide-react';

interface BenchmarkDashboardProps {
  currentDomain: DomainKey;
  onDomainChange: (domain: DomainKey) => void;
}

export const BenchmarkDashboard: React.FC<BenchmarkDashboardProps> = ({
  currentDomain,
  onDomainChange,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainKey>(currentDomain);
  const [activeMatrixTab, setActiveMatrixTab] = useState<'finetuned' | 'pretrained'>('finetuned');

  const benchmark = BENCHMARK_DEFAULTS[selectedDomain] || BENCHMARK_DEFAULTS.clinical;
  const metrics = benchmark.metrics;
  const matrix = benchmark.confusionMatrix;

  // Radar chart points generator for SVG
  const radarDimensions = [
    { label: 'Domain Accuracy', base: 42, tuned: 92 },
    { label: 'Schema Compliance', base: 26, tuned: 98 },
    { label: 'Hallucination Suppression', base: 35, tuned: 94 },
    { label: 'Instruction Strictness', base: 48, tuned: 96 },
    { label: 'Inference Efficiency', base: 78, tuned: 84 },
    { label: 'General Knowledge (MMLU)', base: 82, tuned: 76 },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 95;

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const basePoints = radarDimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.base, i, radarDimensions.length);
      return `${x},${y}`;
    })
    .join(' ');

  const tunedPoints = radarDimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.tuned, i, radarDimensions.length);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>EMPIRICAL BENCHMARK EVALUATION</span>
              <span aria-hidden="true">·</span>
              <span>TEST-SET GENERALIZATION</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Task-Performance Comparison Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Quantitative comparison of the 1.5B Small Language Model before adaptation (Pre-trained Base) vs after Supervised Fine-Tuning across test-split evaluations.
            </p>
          </div>

          {/* Domain Picker */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(DOMAINS) as DomainKey[]).map((key) => {
              if (key === 'custom') return null;
              const meta = DOMAINS[key];
              const isActive = selectedDomain === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedDomain(key);
                    onDomainChange(key);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {meta.name.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Benchmark Dataset: {benchmark.domainName}</span>
          <span>Holdout Split: {benchmark.datasetSplit}</span>
        </div>
      </div>

      {/* KPI Comparison Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Accuracy */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Task Accuracy
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {metrics.accuracy.finetuned}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
              {metrics.accuracy.delta}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Pre-trained: {metrics.accuracy.pretrained}%
          </div>
        </div>

        {/* F1 Score */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Macro F1-Score
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {metrics.f1Score.finetuned}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
              {metrics.f1Score.delta}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Pre-trained: {metrics.f1Score.pretrained}
          </div>
        </div>

        {/* Exact Match */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Exact Match (EM)
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
              {metrics.exactMatch.finetuned}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
              {metrics.exactMatch.delta}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Pre-trained: {metrics.exactMatch.pretrained}%
          </div>
        </div>

        {/* Domain Perplexity */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Domain Perplexity
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {metrics.domainPerplexity.finetuned}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
              {metrics.domainPerplexity.delta}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Pre-trained: {metrics.domainPerplexity.pretrained}
          </div>
        </div>

        {/* Precision & Recall */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Precision / Recall
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {metrics.precision.finetuned} / {metrics.recall.finetuned}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Pre: {metrics.precision.pretrained} / {metrics.recall.pretrained}
          </div>
        </div>

        {/* Format Error Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Formatting Errors
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {metrics.formattingErrorRate.finetuned}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
              {metrics.formattingErrorRate.delta}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Pre-trained: {metrics.formattingErrorRate.pretrained}%
          </div>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix & Radar Capability Polygon */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Confusion Matrix (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Confusion Matrix Evaluation
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing true class targets vs predicted class distributions across 150 holdout validation samples.
              </p>
            </div>

            {/* Matrix Segmented Tab */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveMatrixTab('finetuned')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeMatrixTab === 'finetuned'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fine-Tuned
              </button>
              <button
                onClick={() => setActiveMatrixTab('pretrained')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeMatrixTab === 'pretrained'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pre-trained Base
              </button>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[420px] space-y-2">
              <div className="text-[11px] font-mono text-slate-500 text-center uppercase tracking-wider">
                Predicted Class Distribution →
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {/* Header Row */}
                <div className="p-2 text-slate-500 text-right pr-3 font-semibold">
                  Actual Target ↓
                </div>
                {matrix.labels.map((label, idx) => (
                  <div key={idx} className="p-2 text-slate-300 font-medium truncate">
                    {label}
                  </div>
                ))}

                {/* Rows */}
                {matrix.labels.map((rowLabel, rIdx) => {
                  const currentMatrixData = activeMatrixTab === 'finetuned' ? matrix.finetuned : matrix.pretrained;
                  const rowValues = currentMatrixData[rIdx] || [0, 0, 0];

                  return (
                    <React.Fragment key={rIdx}>
                      <div className="p-2 text-slate-400 font-medium text-right pr-3 flex items-center justify-end">
                        {rowLabel}
                      </div>
                      {rowValues.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        const total = 50;
                        const percentage = Math.round((val / total) * 100);

                        return (
                          <div
                            key={cIdx}
                            className={`p-4 rounded-lg border font-mono transition-all flex flex-col items-center justify-center ${
                              isDiagonal
                                ? activeMatrixTab === 'finetuned'
                                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-bold'
                                  : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                                : val > 10
                                ? 'bg-rose-950/40 border-rose-800/40 text-rose-300 font-medium'
                                : 'bg-slate-950 border-slate-800/80 text-slate-500'
                            }`}
                          >
                            <span className="text-lg tabular-nums">{val}</span>
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-white">Syllabus Insight: </span>
            {activeMatrixTab === 'finetuned' ? (
              <span>
                Diagonal concentration confirms effective transfer learning. The model has mapped ambiguous prompt tokens into distinct decision boundaries with minimal off-diagonal confusion.
              </span>
            ) : (
              <span>
                Pre-trained base model displays substantial off-diagonal dispersion across classes, reflecting zero-shot uncertainty and lack of task calibration.
              </span>
            )}
          </div>
        </div>

        {/* Multi-Dimensional Capability Radar (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Model Capability Radar
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Fine-Tuned
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                Pre-trained
              </span>
            </div>
          </div>

          {/* SVG Radar Chart */}
          <div className="flex items-center justify-center py-2">
            <svg width={size} height={size} className="overflow-visible">
              {/* Concentric Polygons */}
              {[0.25, 0.5, 0.75, 1.0].map((step, idx) => {
                const ringPoints = radarDimensions
                  .map((_, i) => {
                    const { x, y } = getCoordinates(step * 100, i, radarDimensions.length);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={idx}
                    points={ringPoints}
                    fill="none"
                    stroke="rgba(51, 65, 85, 0.5)"
                    strokeWidth="1"
                    strokeDasharray={step === 1 ? 'none' : '2,2'}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {radarDimensions.map((_, i) => {
                const { x, y } = getCoordinates(100, i, radarDimensions.length);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="rgba(51, 65, 85, 0.6)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Base Model Area */}
              <polygon
                points={basePoints}
                fill="rgba(244, 63, 94, 0.15)"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Fine-Tuned Model Area */}
              <polygon
                points={tunedPoints}
                fill="rgba(6, 182, 212, 0.25)"
                stroke="#06b6d4"
                strokeWidth="2"
              />

              {/* Dimension Labels */}
              {radarDimensions.map((d, i) => {
                const { x, y } = getCoordinates(115, i, radarDimensions.length);
                return (
                  <text
                    key={i}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Metric Interpretation Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Domain Task Specialization:</span>
              <span className="font-mono text-emerald-400 font-semibold">+119% gain</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>MMLU General Retention:</span>
              <span className="font-mono text-amber-400 font-semibold">92.7% preserved</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Notice the slight decrease in generic trivia (MMLU) from 82% to 76%: this visualizes the classic Transfer Learning trade-off known as <em>Catastrophic Forgetting</em>, mitigated effectively by LoRA parameter freezing.
            </p>
          </div>
        </div>
      </div>

      {/* Catastrophic Forgetting & Parameter Efficiency Comparison Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              Transfer Learning Strategy Comparison (Ablation Table)
            </h2>
            <p className="text-xs text-slate-400">
              Empirical trade-offs between Pre-trained Baseline, Full Fine-Tuning, and Low-Rank Adaptation (LoRA).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] uppercase font-mono text-slate-500 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Methodology</th>
                <th className="py-3 px-4">Trainable Weights</th>
                <th className="py-3 px-4">Domain Accuracy</th>
                <th className="py-3 px-4">Domain Perplexity</th>
                <th className="py-3 px-4">MMLU General Retention</th>
                <th className="py-3 px-4">VRAM Footprint</th>
                <th className="py-3 px-4">Catastrophic Forgetting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-sans font-medium text-slate-400">
                  Base Model (Unadapted)
                </td>
                <td className="py-3 px-4 text-slate-400">0 (0.0%)</td>
                <td className="py-3 px-4 text-rose-400 tabular-nums">41.2%</td>
                <td className="py-3 px-4 text-rose-400 tabular-nums">31.8</td>
                <td className="py-3 px-4 text-white tabular-nums">100.0%</td>
                <td className="py-3 px-4 text-slate-400 tabular-nums">3.8 GB</td>
                <td className="py-3 px-4 text-emerald-400 font-sans">None (Baseline)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-sans font-medium text-slate-300">
                  Full Model Fine-Tuning
                </td>
                <td className="py-3 px-4 text-slate-300">1,540M (100%)</td>
                <td className="py-3 px-4 text-emerald-400 tabular-nums">91.4%</td>
                <td className="py-3 px-4 text-emerald-400 tabular-nums">3.1</td>
                <td className="py-3 px-4 text-rose-400 tabular-nums">71.2%</td>
                <td className="py-3 px-4 text-rose-400 tabular-nums">18.4 GB</td>
                <td className="py-3 px-4 text-rose-400 font-sans">High (Degrades generic NLP)</td>
              </tr>
              <tr className="bg-cyan-950/20 hover:bg-cyan-950/30">
                <td className="py-3 px-4 font-sans font-medium text-cyan-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  LoRA (r=16, α=32) [Default]
                </td>
                <td className="py-3 px-4 text-cyan-300 tabular-nums">4.2M (0.27%)</td>
                <td className="py-3 px-4 text-cyan-300 font-bold tabular-nums">89.6%</td>
                <td className="py-3 px-4 text-cyan-300 font-bold tabular-nums">3.4</td>
                <td className="py-3 px-4 text-emerald-400 tabular-nums">96.0%</td>
                <td className="py-3 px-4 text-emerald-400 tabular-nums">4.9 GB</td>
                <td className="py-3 px-4 text-emerald-400 font-sans">Minimal (Weights frozen)</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-sans font-medium text-slate-300">
                  LoRA (r=8, α=16)
                </td>
                <td className="py-3 px-4 text-slate-300 tabular-nums">2.1M (0.13%)</td>
                <td className="py-3 px-4 text-slate-300 tabular-nums">86.2%</td>
                <td className="py-3 px-4 text-slate-300 tabular-nums">4.1</td>
                <td className="py-3 px-4 text-emerald-400 tabular-nums">97.8%</td>
                <td className="py-3 px-4 text-emerald-400 tabular-nums">4.4 GB</td>
                <td className="py-3 px-4 text-emerald-400 font-sans">Negligible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
