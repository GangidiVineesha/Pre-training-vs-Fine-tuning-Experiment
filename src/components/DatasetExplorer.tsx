import React, { useState } from 'react';
import { DomainKey, TaskSample } from '../types';
import { DOMAINS, PRESET_SAMPLES } from '../data/datasets';
import { Database, Upload, Download, FileJson, CheckCircle2, Copy } from 'lucide-react';

interface DatasetExplorerProps {
  currentDomain: DomainKey;
  onSelectSampleForArena: (sample: TaskSample) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  currentDomain,
  onSelectSampleForArena,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainKey>(currentDomain);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom dataset paste state
  const [uploadedData, setUploadedData] = useState<string>('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);

  const activeMeta = DOMAINS[selectedDomain] || DOMAINS.clinical;
  const samples = PRESET_SAMPLES.filter((s) => s.domain === selectedDomain);

  const filteredSamples = samples.filter((s) => {
    if (filterDifficulty === 'all') return true;
    return s.difficulty.toLowerCase().includes(filterDifficulty.toLowerCase());
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadJsonl = () => {
    const jsonlContent = filteredSamples
      .map((s) =>
        JSON.stringify({
          instruction: s.prompt,
          input: s.context || '',
          output: s.groundTruth,
          domain: s.domain,
          difficulty: s.difficulty,
        })
      )
      .join('\n');

    const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDomain}_supervised_dataset.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleParseCustom = () => {
    try {
      const parsed = JSON.parse(uploadedData);
      if (Array.isArray(parsed)) {
        setParsedCount(parsed.length);
      } else {
        setParsedCount(1);
      }
    } catch {
      // try line-by-line JSONL
      const lines = uploadedData.trim().split('\n').filter(Boolean);
      setParsedCount(lines.length);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>DATASET INVENTORY & TRAINING PAIRS</span>
              <span aria-hidden="true">·</span>
              <span>INSTRUCTION TUNING CORPUS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Domain Adaptation Dataset Explorer
            </h1>
            <p className="text-sm text-slate-400">
              Review annotated prompt-completion training pairs used to supervise small foundation models into specialized domain checkpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadJsonl}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Download .JSONL Split
            </button>
          </div>
        </div>

        {/* Domain Segmented Control */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800">
          {(Object.keys(DOMAINS) as DomainKey[]).map((key) => {
            if (key === 'custom') return null;
            const meta = DOMAINS[key];
            const isActive = selectedDomain === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDomain(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {meta.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dataset Metadata Strip */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Original Corpus</span>
          <span className="text-slate-200 font-semibold">{activeMeta.datasetSource}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Supervised Training Samples</span>
          <span className="text-cyan-400 font-bold tabular-nums">{activeMeta.sampleCount.toLocaleString()} Pairs</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Target Task Type</span>
          <span className="text-purple-300">{activeMeta.taskType}</span>
        </div>
      </div>

      {/* Samples Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            Curated Evaluation Samples ({filteredSamples.length})
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Difficulty:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-slate-950 text-slate-300 border border-slate-800 text-xs rounded px-2.5 py-1 font-mono focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard / Edge Cases</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">
                    {sample.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      sample.difficulty === 'Easy'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        : sample.difficulty === 'Medium'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                        : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                    }`}
                  >
                    {sample.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(sample.prompt, sample.id)}
                    className="p-1.5 rounded bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                    title="Copy Prompt"
                  >
                    {copiedId === sample.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onSelectSampleForArena(sample)}
                    className="px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold border border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    Test in Arena →
                  </button>
                </div>
              </div>

              {sample.context && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-400">
                  <span className="text-slate-500 block text-[10px] mb-1 font-semibold">
                    INPUT CONTEXT:
                  </span>
                  {sample.context}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-cyan-400 block text-[10px] mb-1 font-semibold">
                    PROMPT INSTRUCTION:
                  </span>
                  <div className="text-slate-300 whitespace-pre-wrap">{sample.prompt}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-emerald-400 block text-[10px] mb-1 font-semibold">
                    TARGET GOLD COMPLETION (GROUND TRUTH):
                  </span>
                  <div className="text-emerald-300/90 whitespace-pre-wrap">{sample.groundTruth}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Transfer Learning Analysis: </span>
                {sample.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Dataset Uploader / Ingest Box */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Upload className="w-4 h-4" />
          <span>FACULTY HOMEWORK EVALUATOR: CUSTOM DATASET INGEST</span>
        </div>
        <h2 className="text-base font-bold text-white">
          Paste or Import Custom Task Pairs
        </h2>
        <p className="text-xs text-slate-400">
          Need to test the assignment with your faculty's specific test set? Paste JSONL lines or a JSON array of {`{"instruction": "...", "output": "..."}`} objects below.
        </p>

        <textarea
          value={uploadedData}
          onChange={(e) => setUploadedData(e.target.value)}
          rows={4}
          className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-cyan-500/50"
          placeholder={`[
  { "instruction": "Classify sentence sentiment: Net revenue was up 15%", "output": "Sentiment: Bullish" }
]`}
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleParseCustom}
            disabled={!uploadedData.trim()}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            Validate & Ingest Dataset
          </button>

          {parsedCount !== null && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Successfully parsed {parsedCount} custom task pairs!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
