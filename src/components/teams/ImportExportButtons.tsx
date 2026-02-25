'use client';

import React, { useState } from 'react';
import Modal from '~/components/ui/Modal';

interface ImportExportButtonsProps {
  onImport: (text: string) => void;
  teamHasMembers: boolean;
  getExportText: () => string;
}

export default function ImportExportButtons({
  onImport,
  teamHasMembers,
  getExportText,
}: ImportExportButtonsProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    const text = getExportText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmImport = () => {
    onImport(importText);
    setImportText('');
    setImportOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setImportOpen(true)}
        className="px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors bg-surface border-border text-subtle hover:border-indigo-400 hover:text-primary"
      >
        Import
      </button>

      <button
        type="button"
        onClick={handleExport}
        disabled={!teamHasMembers}
        className={[
          'px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
          teamHasMembers
            ? 'bg-surface border-border text-subtle hover:border-indigo-400 hover:text-primary'
            : 'bg-surface border-border text-subtle opacity-40 cursor-not-allowed',
        ].join(' ')}
      >
        {copied ? '✓ Copied!' : 'Export'}
      </button>

      <Modal
        isOpen={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportText('');
        }}
        showTrigger={false}
        modalTitle="Import Team (PokePaste)"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-subtle">
            Paste your PokePaste / Pokémon Showdown team export below.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-64 px-3 py-2 text-sm bg-surface border border-border rounded-lg text-primary font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Charizard (M) @ Life Orb\nAbility: Blaze\nLevel: 100\nEVs: 252 SpA / 4 SpD / 252 Spe\nTimid Nature\n- Fire Blast\n- Air Slash\n- Dragon Pulse\n- Roost`}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setImportOpen(false);
                setImportText('');
              }}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-border bg-surface text-subtle hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={!importText.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Import Team
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
