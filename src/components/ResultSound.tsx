import { useEffect } from 'react';
import { playBuzz, playConfirm } from '../utils/sound';

// Joue une fois le son de résultat de manche : validation si réussi, buzz si
// dégonflé. Rendu invisible — monté uniquement sur l'écran de résultat.
export default function ResultSound({ refused }: { refused: boolean | null }) {
  useEffect(() => {
    if (refused) playBuzz();
    else playConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
