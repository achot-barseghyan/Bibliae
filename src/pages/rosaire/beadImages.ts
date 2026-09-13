import crucifix from '../../assets/chapelet/crusifix.png';
import medaille from '../../assets/chapelet/Beed principal.png';
import notrePere from '../../assets/chapelet/beed notre pere.png';
import blanc from '../../assets/chapelet/beed blanc-neutre.png';
import bleu from '../../assets/chapelet/beed bleu.png';
import vert from '../../assets/chapelet/beed vert.png';
import jaune from '../../assets/chapelet/beed jaune.png';
import violet from '../../assets/chapelet/beed violet.png';
import rouge from '../../assets/chapelet/bead rouge.png';
import type { BeadImageKey } from '../../data/rosary';

export const BEAD_IMAGES: Record<BeadImageKey, string> = {
  crucifix,
  medaille,
  'notre-pere': notrePere,
  blanc,
  bleu,
  vert,
  jaune,
  violet,
  rouge
};
