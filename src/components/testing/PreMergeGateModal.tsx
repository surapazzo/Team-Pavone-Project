/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { runAllPreMergeTests } from '../../services/preMergeTestSuite';
import { TestCaseResult } from '../../types';
import {
  ShieldCheck,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Play,
  Lock,
} from 'lucide-react';

export const PreMergeGateModal: React.FC = () => {
  const { isPreMergeGateOpen, setIsPreMergeGateOpen } = useApp();
  const [tests, setTests] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const executeSuite = async () => {
    setIsRunning(true);
    const results = await runAllPreMergeTests();
    setTests(results);
    setIsRunning(false);
    setHasRun(true);
  };

  useEffect(() => {
    if (isPreMergeGateOpen && !hasRun) {
      executeSuite();
    }
  }, [isPreMergeGateOpen, hasRun]);

  if (!isPreMergeGateOpen) return null;

  const passedCount = tests.filter((t) => t.status === 'PASSED').length;
  const totalCount = tests.length || 11;
  const allPassed = passedCount === 11;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Pre-Merge Gate & QA Security Suite (Sezione 7)
                </h2>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {allPassed ? '11/11 TEST SUPERATI' : `${passedCount}/${totalCount} TEST`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pipeline CI/CD automatizzata per i 6 Agenti Specializzati prima del merge su <code>master</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPreMergeGateOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Git Multi-Agent Branching Visualizer */}
        <div className="bg-slate-900 text-white p-5 rounded-xl text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-purple-300">
              <GitBranch className="w-4 h-4" />
              Strategia di Branching Git Classica Multi-Agente
            </span>
            <span className="text-[11px] text-emerald-400 font-mono-tabular">
              master: Branch Protection ATTIVA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-purple-400 block font-bold">Agente 1 & 4</span>
              <span className="text-slate-300">agent/analyst-domain</span>
            </div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-indigo-400 block font-bold">Agente 2</span>
              <span className="text-slate-300">agent/architect-backend</span>
            </div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-pink-400 block font-bold">Agente 3</span>
              <span className="text-slate-300">agent/ux-ui-frontend</span>
            </div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-emerald-400 block font-bold">Agente 5</span>
              <span className="text-slate-300">agent/qa-testing</span>
            </div>
            <div className="p-2 rounded bg-slate-800 border border-slate-700">
              <span className="text-amber-400 block font-bold">Agente 6</span>
              <span className="text-slate-300">agent/cybersec-gdpr</span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-600 font-semibold">
            Matrice dei Test Pre-Produzione (TC-SEC-01..04, TC-AI-01..02, TC-GDPR-01..02, TC-QA-01..03)
          </div>
          <button
            onClick={executeSuite}
            disabled={isRunning}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Esecuzione in corso...' : 'Riesegui Test Suite'}
          </button>
        </div>

        {/* Test Cases Table */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {tests.map((t) => (
            <div key={t.id} className="p-4 hover:bg-slate-50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 font-mono-tabular px-2 py-0.5 rounded bg-slate-100">
                    {t.id}
                  </span>
                  <span className="font-bold text-slate-900">{t.title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] flex items-center gap-1 ${
                  t.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {t.status === 'PASSED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {t.status}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                <div>
                  <span className="font-semibold text-slate-800">Procedura:</span> {t.procedure}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Criterio:</span> {t.pass_criterion}
                </div>
              </div>

              {t.execution_log && (
                <div className="p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[11px]">
                  {t.execution_log}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            Tutti i controlli devono passare per consentire la Pull Request su <code>master</code>.
          </div>
          <button
            onClick={() => setIsPreMergeGateOpen(false)}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Chiudi Finestra
          </button>
        </div>
      </div>
    </div>
  );
};
