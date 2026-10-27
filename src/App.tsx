/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DomainKey, TaskSample } from './types';
import { Header } from './components/Header';
import { ArenaComparison } from './components/ArenaComparison';
import { BenchmarkDashboard } from './components/BenchmarkDashboard';
import { TrainingDynamics } from './components/TrainingDynamics';
import { ArchitectureInspector } from './components/ArchitectureInspector';
import { DatasetExplorer } from './components/DatasetExplorer';
import { FacultyReportModal } from './components/FacultyReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('arena');
  const [currentDomain, setCurrentDomain] = useState<DomainKey>('clinical');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const handleSelectSampleForArena = (sample: TaskSample) => {
    setCurrentDomain(sample.domain);
    setActiveTab('arena');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'arena' && (
          <ArenaComparison
            currentDomain={currentDomain}
            onDomainChange={setCurrentDomain}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarkDashboard
            currentDomain={currentDomain}
            onDomainChange={setCurrentDomain}
          />
        )}

        {activeTab === 'dynamics' && (
          <TrainingDynamics
            currentDomain={currentDomain}
            onDomainChange={setCurrentDomain}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureInspector />}

        {activeTab === 'datasets' && (
          <DatasetExplorer
            currentDomain={currentDomain}
            onSelectSampleForArena={handleSelectSampleForArena}
          />
        )}
      </main>

      {/* Academic Syllabus Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-8 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-semibold text-slate-300">
              NeuroForge Academic Experiment Studio
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Syllabus Concept: Pre-training & Transfer Learning · Use Case: Before & After Adaptation on Task-Specific Dataset
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
            <span>Model: 1.5B Parameter Small Language Model</span>
            <span aria-hidden="true">·</span>
            <span>Adapter: LoRA (r=16, α=32)</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Faculty Lab Report
            </button>
          </div>
        </div>
      </footer>

      {/* Faculty Assignment Report Modal */}
      <FacultyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentDomain={currentDomain}
      />
    </div>
  );
}
