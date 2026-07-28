import { Download, RotateCcw, SaveOff, Shuffle } from 'lucide-react';

export function RankingToolbar({ onReset, onShuffle, onClearSaved, onExport, exportDisabled }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button className="btn btn-secondary focus-ring" type="button" onClick={onReset}>
        <RotateCcw size={14} aria-hidden="true" />
        Reset Ranking
      </button>
      <button className="btn btn-secondary focus-ring" type="button" onClick={onShuffle}>
        <Shuffle size={14} aria-hidden="true" />
        Shuffle Remaining
      </button>
      <button className="btn btn-secondary focus-ring" type="button" onClick={onClearSaved}>
        <SaveOff size={14} aria-hidden="true" />
        Clear Saved Progress
      </button>
      <button className="btn btn-primary focus-ring" type="button" onClick={onExport} disabled={exportDisabled}>
        <Download size={14} aria-hidden="true" />
        Export Ranking
      </button>
    </div>
  );
}
