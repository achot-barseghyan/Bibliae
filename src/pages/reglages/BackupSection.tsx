import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { exportAppData } from '../../services/backupExport';
import { pickImportFile, readAndValidateImportFile, type ImportValidationError } from '../../services/backupImport';
import { mergeAppData, replaceAppData, type AppData } from '../../services/appDataStore';
import { eraseAllUserData } from '../../services/eraseUserData';
import ImportChoiceSheet from './ImportChoiceSheet';
import EraseDataSheet from './EraseDataSheet';
import './BackupSection.css';

type Banner = { kind: 'success' | 'error'; message: string };

function importErrorMessage(error: ImportValidationError): string {
  switch (error) {
    case 'invalid-json':
      return "Ce fichier n'est pas un JSON valide.";
    case 'invalid-shape':
      return 'Ce fichier ne correspond pas à une sauvegarde Bibliae.';
    case 'unknown-version':
      return "Cette sauvegarde provient d'une version incompatible de l'application.";
  }
}

const BackupSection: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ data: AppData; bookmarksCount: number } | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isEraseConfirmOpen, setIsEraseConfirmOpen] = useState(false);

  const handleEraseChoice = async (choice: 'erase' | 'cancel') => {
    setIsEraseConfirmOpen(false);
    if (choice === 'cancel') return;
    await eraseAllUserData();
    setBanner({ kind: 'success', message: 'Toutes vos données ont été effacées.' });
  };

  const handleExport = async () => {
    setBanner(null);
    setIsExporting(true);
    const result = await exportAppData();
    setIsExporting(false);
    if (result.status === 'error') {
      setBanner({ kind: 'error', message: "L'export a échoué. Réessayez." });
    }
  };

  const handleImportClick = async () => {
    setBanner(null);
    setIsImporting(true);
    const picked = await pickImportFile();
    if (picked.status === 'cancelled') {
      setIsImporting(false);
      return;
    }

    const result = await readAndValidateImportFile(picked.file);
    setIsImporting(false);

    if (result.status === 'error') {
      setBanner({ kind: 'error', message: importErrorMessage(result.error) });
      return;
    }
    setPendingImport({ data: result.data, bookmarksCount: result.bookmarksCount });
  };

  const handleChoice = (choice: 'merge' | 'replace' | 'cancel') => {
    if (!pendingImport) return;

    if (choice === 'cancel') {
      setPendingImport(null);
      return;
    }

    if (choice === 'replace') {
      replaceAppData(pendingImport.data);
      setBanner({
        kind: 'success',
        message: `${pendingImport.bookmarksCount} favori${pendingImport.bookmarksCount > 1 ? 's' : ''} importé${pendingImport.bookmarksCount > 1 ? 's' : ''}.`
      });
    } else {
      const { importedBookmarksCount } = mergeAppData(pendingImport.data);
      setBanner({
        kind: 'success',
        message: `${importedBookmarksCount} nouveau${importedBookmarksCount > 1 ? 'x' : ''} favori${importedBookmarksCount > 1 ? 's' : ''} importé${importedBookmarksCount > 1 ? 's' : ''}.`
      });
    }
    setPendingImport(null);
  };

  return (
    <section className="backup-section">
      <h2 className="backup-section-title">Mes données</h2>
      <p className="backup-section-description">
        Vos favoris, notes, surlignages, progression et réglages restent sur cet appareil.
        Exportez-les avant de changer de téléphone pour les retrouver ensuite, sur Android comme
        sur iOS.
      </p>

      {banner && (
        <div className={`backup-banner backup-banner--${banner.kind}`} role="status">
          <span>{banner.message}</span>
          <button type="button" onClick={() => setBanner(null)} aria-label="Fermer le message">
            ×
          </button>
        </div>
      )}

      <button type="button" className="backup-button" onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Export en cours…' : 'Exporter mes données'}
      </button>
      <button
        type="button"
        className="backup-button backup-button--secondary"
        onClick={handleImportClick}
        disabled={isImporting}
      >
        {isImporting ? 'Sélection en cours…' : 'Importer mes données'}
      </button>
      <button
        type="button"
        className="backup-button backup-button--danger"
        onClick={() => {
          setBanner(null);
          setIsEraseConfirmOpen(true);
        }}
      >
        Effacer toutes mes données
      </button>

      <AnimatePresence>
        {isEraseConfirmOpen && <EraseDataSheet onChoice={handleEraseChoice} />}
      </AnimatePresence>
      <AnimatePresence>
        {pendingImport && (
          <ImportChoiceSheet bookmarksCount={pendingImport.bookmarksCount} onChoice={handleChoice} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default BackupSection;
