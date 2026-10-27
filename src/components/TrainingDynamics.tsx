import React, { useState } from 'react';
import { DomainKey } from '../types';
import { BENCHMARK_DEFAULTS, DOMAINS } from '../data/datasets';
import { Activity, Clock, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface TrainingDynamicsProps {
  currentDomain: DomainKey;
  onDomainChange: (domain: DomainKey) => void;
}

export const TrainingDynamics: React.FC<TrainingDynamicsProps> = ({
  currentDomain,
  onDomainChange,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainKey>(currentDomain);
  const [activeEpoch, setActiveEpoch] = useState<number>(3);

  const benchmark = BENCHMARK_DEFAULTS[selectedDomain] || BENCHMARK_DEFAULTS.clinical;
  const history = benchmark.lossHistory;

  // Epoch progression simulation output
  const epochSnapshots: Record<number, { output: string; status: string; lr: string }> = {
    0: {
      output: 'Patient might have something wrong with chest or heart. Chest pain could be acid reflux or anxiety or heart attack. Consult a doctor immediately.',
      status: 'Initial Foundation Weights (Zero Task Adaptation)',
      lr: '2.00e-4 (Peak Warmup)',
    },
    1: {
      output: 'Triage: Urgent or Emergent. Condition: Acute chest syndrome. Give aspirin 325 mg chewed and call physician.',
      status: 'Initial SFT Signal: Acquired high-level keywords, formatting incomplete',
      lr: '1.68e-4 (Cosine Decay)',
    },
    2: {
      output: '1. Triage Tier: Emergent\n2. Condition: Myocardial infarction (Troponin elevation noted)\n3. Action: Dual antiplatelet therapy. Monitor vitals.',
      status: 'Structure Emergence: Learned field headers and clinical tiering',
      lr: '1.24e-4 (Cosine Decay)',
    },
    3: {
      output: 'Triage Tier: Emergent\nPrimary Diagnosis: NSTEMI [ICD-10: I21.4]\nImmediate Action: Aspirin 325 mg + Ticagrelor 180 mg, Sublingual Nitroglycerin. Activate Cath Lab.',
      status: 'Optimal Generalization Checkpoint (Validation Loss Minima: 0.68)',
      lr: '7.80e-5 (Cosine Decay)',
    },
    4: {
      output: 'Triage Tier: Emergent\nPrimary Diagnosis: Non-ST-Elevation Myocardial Infarction (NSTEMI) [ICD-10: I21.4]\nImmediate Action: Dual antiplatelet therapy. Nitroglycerin sublingual (check PDE5 contraindication). Activate Cardiac Cath Lab.',
      status: 'Refined Precision: High ICD-10 exact match, minimal loss gradient',
      lr: '3.60e-5 (Cosine Decay)',
    },
    5: {
      output: 'Triage Tier: Emergent\nPrimary Diagnosis: NSTEMI [ICD-10: I21.4]\nImmediate Action: Dual antiplatelet therapy (Aspirin 325 mg chewed + Ticagrelor 180 mg), Sublingual Nitroglycerin (contraindicated if PDE-5 within 24-48h). Activate Cardiac Cath Lab.',
      status: 'Converged Checkpoint: Slight val-loss plateau; watch for over-fitting',
      lr: '1.00e-5 (Schedule Minima)',
    },
  };

  const currentSnapshot = epochSnapshots[activeEpoch] || epochSnapshots[3];
  const currentEpochData = history[activeEpoch] || history[3];

  // SVG Line Chart Coordinate Math
  const width = 560;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxLoss = 4.0;
  const minLoss = 0.0;

  const getX = (epoch: number) => padding.left + (epoch / 5) * graphWidth;
  const getY = (loss: number) => padding.top + (1 - (loss - minLoss) / (maxLoss - minLoss)) * graphHeight;

  // Build SVG path strings
  const trainPath = history
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.epoch)} ${getY(h.trainLoss)}`)
    .join(' ');

  const valPath = history
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.epoch)} ${getY(h.valLoss)}`)
    .join(' ');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>TRAINING DYNAMICS & LOSS OPTIMIZATION</span>
              <span aria-hidden="true">·</span>
              <span>GRADIENT DESCENT BEHAVIOR</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Cross-Entropy Loss Dynamics & Epoch Evolution
            </h1>
            <p className="text-sm text-slate-400">
              Inspect how the model's loss landscape transforms across training epochs and scrub through checkpoints to see output alignment emerge in real time.
            </p>
          </div>

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
      </div>

      {/* Main Grid: Loss Curve SVG & Interactive Epoch Scrubber */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Loss Graph (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Supervised Fine-Tuning Loss Curve
              </h2>
              <p className="text-xs text-slate-400">
                Cross-entropy loss over 5 training epochs with cosine learning rate decay.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
                Train Loss
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" />
                Validation Loss
              </span>
            </div>
          </div>

          {/* SVG Loss Curve Canvas */}
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              {/* Horizontal Grid lines */}
              {[0, 1, 2, 3, 4].map((lossVal) => {
                const y = getY(lossVal);
                return (
                  <g key={lossVal}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-500 font-mono"
                    >
                      {lossVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Epoch lines */}
              {[0, 1, 2, 3, 4, 5].map((epoch) => {
                const x = getX(epoch);
                return (
                  <g key={epoch}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={height - padding.bottom}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 16}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      Ep {epoch}
                    </text>
                  </g>
                );
              })}

              {/* Pre-training Baseline Plateau Guide Line */}
              <line
                x1={padding.left}
                y1={getY(3.5)}
                x2={width - padding.right}
                y2={getY(3.5)}
                stroke="rgba(244, 63, 94, 0.6)"
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />
              <text
                x={width - padding.right - 5}
                y={getY(3.5) - 6}
                textAnchor="end"
                className="text-[9px] fill-rose-400 font-mono"
              >
                Pre-trained Base Domain Loss (~3.50)
              </text>

              {/* Training Loss Curve */}
              <path
                d={trainPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Validation Loss Curve */}
              <path
                d={valPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4,2"
              />

              {/* Active Epoch Vertical Cursor */}
              <line
                x1={getX(activeEpoch)}
                y1={padding.top}
                x2={getX(activeEpoch)}
                y2={height - padding.bottom}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="2,2"
              />

              {/* Active Epoch Nodes */}
              <circle
                cx={getX(activeEpoch)}
                cy={getY(currentEpochData.trainLoss)}
                r="5"
                fill="#06b6d4"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <circle
                cx={getX(activeEpoch)}
                cy={getY(currentEpochData.valLoss)}
                r="5"
                fill="#f59e0b"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Interactive Epoch Scrubber */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Scrub Model Checkpoint Epoch:
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                Epoch {activeEpoch} / 5
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={activeEpoch}
              onChange={(e) => setActiveEpoch(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Epoch 0 (Base Model)</span>
              <span>Epoch 1</span>
              <span>Epoch 2</span>
              <span>Epoch 3 (Optimal)</span>
              <span>Epoch 4</span>
              <span>Epoch 5 (Converged)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Checkpoint Inspector & Output Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Checkpoint Status Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">
                  Epoch {activeEpoch} Checkpoint Telemetry
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentSnapshot.status}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Checkpoint #{activeEpoch}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TRAIN LOSS (L_train)</span>
                <span className="text-cyan-400 font-bold text-lg tabular-nums">
                  {currentEpochData.trainLoss.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">VAL LOSS (L_val)</span>
                <span className="text-amber-400 font-bold text-lg tabular-nums">
                  {currentEpochData.valLoss.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">ESTIMATED PERPLEXITY</span>
                <span className="text-white font-bold text-lg tabular-nums">
                  {Math.exp(currentEpochData.valLoss).toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LEARNING RATE</span>
                <span className="text-purple-400 font-bold text-sm tabular-nums">
                  {currentSnapshot.lr}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">
                Model Output at this Checkpoint:
              </span>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                {currentSnapshot.output}
              </div>
            </div>
          </div>

          {/* Mathematical Formulations Block */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Syllabus Mathematical Formulation
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-slate-300">
                <div className="text-[10px] text-slate-500 mb-1">1. PRE-TRAINING LOSS (Next-Token NLL):</div>
                <div className="text-cyan-300 text-[11px]">
                  L_PT(θ) = - ∑_(t=1)^T log P(w_t | w_(&lt;t); θ)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-slate-300">
                <div className="text-[10px] text-slate-500 mb-1">2. SUPERVISED FINE-TUNING (SFT) LOSS:</div>
                <div className="text-emerald-300 text-[11px]">
                  L_SFT(θ) = - ∑_(i=1)^M log P(y_i | x, y_(&lt;i); θ)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-slate-300">
                <div className="text-[10px] text-slate-500 mb-1">3. PERPLEXITY FORMULA:</div>
                <div className="text-purple-300 text-[11px]">
                  PPL(D) = exp( - 1/N ∑ log P(w_i) ) = exp( CrossEntropyLoss )
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
