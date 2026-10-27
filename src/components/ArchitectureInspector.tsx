import React, { useState } from 'react';
import { Cpu, Layers, Zap, Lock, Unlock, Database, ArrowDown, Sparkles } from 'lucide-react';

export const ArchitectureInspector: React.FC = () => {
  const [loraRank, setLoraRank] = useState<number>(16);
  const [loraAlpha, setLoraAlpha] = useState<number>(32);
  const [targetModules, setTargetModules] = useState<{ q: boolean; k: boolean; v: boolean; o: boolean }>({
    q: true,
    k: false,
    v: true,
    o: false,
  });

  const baseParams = 1540000000; // 1.54 Billion (e.g. Qwen-1.5B / LLaMA-1.5B)
  const hiddenDim = 2048;
  const numLayers = 28;

  // Active targeted projection count
  const activeProjections = (targetModules.q ? 1 : 0) + (targetModules.k ? 1 : 0) + (targetModules.v ? 1 : 0) + (targetModules.o ? 1 : 0);

  // Trainable parameters in LoRA: 2 * rank * hiddenDim * activeProjections * numLayers
  const trainableParams = 2 * loraRank * hiddenDim * Math.max(1, activeProjections) * numLayers;
  const trainablePercentage = ((trainableParams / baseParams) * 100).toFixed(3);
  const vramSavingsGb = (18.4 - (3.8 + (trainableParams / 1e6) * 0.004)).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>TRANSFORMER ARCHITECTURE & PEFT MECHANISM</span>
            <span aria-hidden="true">·</span>
            <span>LOW-RANK ADAPTATION (LoRA)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Pre-training vs LoRA Adaptation Architecture
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl">
            Explore how parameter-efficient transfer learning freezes the billions of foundation weights while training lightweight low-rank decomposition matrices ($B \times A$) for domain adaptation.
          </p>
        </div>
      </div>

      {/* Interactive LoRA Parameter Calculator Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Total Base Parameters
          </div>
          <div className="text-2xl font-bold font-mono text-slate-300 tabular-nums">
            1.54 Billion
          </div>
          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            100% Frozen in LoRA
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
            Trainable Adapter Params
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            {(trainableParams / 1e6).toFixed(2)} Million
          </div>
          <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-1">
            <Unlock className="w-3 h-3 text-cyan-400" />
            Only {trainablePercentage}% of weights
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Scaling Factor (α / r)
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
            {(loraAlpha / loraRank).toFixed(2)}x
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            α={loraAlpha}, rank={loraRank}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Estimated VRAM Savings
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ~{vramSavingsGb} GB
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">
            Fits on single 8GB GPU
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Schematic & Hyperparameter Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Architectural Schematic (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Transformer Weight Adaptation Flow
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Forward Pass: <span className="text-cyan-300">h = W₀x + (α/r)·BAx</span>
            </span>
          </div>

          {/* Architecture Diagram Visualization */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-6">
            {/* Input Vector */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200">
                Input Activation: x ∈ ℝ^(d) [d=2048]
              </div>
              <ArrowDown className="w-4 h-4 text-slate-500 my-1" />
            </div>

            {/* Parallel Split: Frozen Base W0 vs Low-Rank Adapters A and B */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Path: Frozen Base Matrix W0 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-between text-center relative overflow-hidden">
                <div className="absolute top-2 right-2 text-slate-600">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block uppercase">
                    Frozen Foundation Matrix
                  </span>
                  <div className="text-sm font-bold text-slate-300 font-mono my-2">
                    W₀ ∈ ℝ^(d × k)
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Pre-trained on web tokens
                  </div>
                </div>
                <div className="mt-4 px-2 py-1 rounded bg-slate-950 text-[10px] font-mono text-rose-400 border border-rose-900/40">
                  Zero Gradients: ∇W₀ = 0
                </div>
              </div>

              {/* Right Path: LoRA Adapter Matrices A and B */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col items-center justify-between text-center relative overflow-hidden">
                <div className="absolute top-2 right-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 block uppercase">
                    Trainable Adapter Layers
                  </span>
                  {/* Decomposition Box */}
                  <div className="my-2 space-y-1.5 font-mono">
                    <div className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/30 text-xs text-cyan-200">
                      Matrix B ∈ ℝ^(d × r) [Zeros]
                    </div>
                    <div className="text-[10px] text-cyan-400">× (Matrix Multiplication)</div>
                    <div className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/30 text-xs text-cyan-200">
                      Matrix A ∈ ℝ^(r × k) [Gaussian]
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">
                    Rank bottleneck: r = {loraRank}
                  </div>
                </div>
                <div className="mt-2 px-2 py-1 rounded bg-cyan-950 text-[10px] font-mono text-cyan-300 border border-cyan-800/40">
                  Scale: × (α/r) = {(loraAlpha / loraRank).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Summation Node */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-300 text-sm">
                +
              </div>
              <ArrowDown className="w-4 h-4 text-slate-500 my-1" />
              <div className="px-4 py-2 rounded-lg bg-cyan-950/40 border border-cyan-500/50 text-xs font-mono text-cyan-200 text-center">
                Adapted Hidden Representation: h = W₀x + ΔWx
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Parameter Tuning Deck (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">
              LoRA Configuration Deck
            </h2>
            <p className="text-xs text-slate-400">
              Tune decomposition rank, scaling alpha, and target projection layers.
            </p>
          </div>

          {/* LoRA Rank Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Decomposition Rank (r):
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                r = {loraRank}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((r) => (
                <button
                  key={r}
                  onClick={() => setLoraRank(r)}
                  className={`py-1.5 text-xs font-mono rounded border transition-all cursor-pointer ${
                    loraRank === r
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  r = {r}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Higher rank captures more complex multi-step reasoning at the expense of additional trainable weights.
            </p>
          </div>

          {/* LoRA Alpha Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Scaling Factor (α):
              </span>
              <span className="font-mono text-purple-400 font-bold">
                α = {loraAlpha}
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              step="8"
              value={loraAlpha}
              onChange={(e) => setLoraAlpha(parseInt(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>α=8</span>
              <span>α=16</span>
              <span>α=32</span>
              <span>α=64</span>
            </div>
          </div>

          {/* Target Modules Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block">
              Target Attention Projections:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <label className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={targetModules.q}
                  onChange={(e) => setTargetModules({ ...targetModules, q: e.target.checked })}
                  className="accent-cyan-400"
                />
                q_proj (Query)
              </label>
              <label className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={targetModules.k}
                  onChange={(e) => setTargetModules({ ...targetModules, k: e.target.checked })}
                  className="accent-cyan-400"
                />
                k_proj (Key)
              </label>
              <label className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={targetModules.v}
                  onChange={(e) => setTargetModules({ ...targetModules, v: e.target.checked })}
                  className="accent-cyan-400"
                />
                v_proj (Value)
              </label>
              <label className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={targetModules.o}
                  onChange={(e) => setTargetModules({ ...targetModules, o: e.target.checked })}
                  className="accent-cyan-400"
                />
                o_proj (Output)
              </label>
            </div>
          </div>

          {/* Theoretical Summary Box */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-white">Why LoRA is Ideal for Coursework:</div>
            <p>
              By training only the low-rank delta ΔW (4.2M weights), you achieve ≥98% of the task performance of full fine-tuning without overwriting base linguistic competence or needing high-end datacenter VRAM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
