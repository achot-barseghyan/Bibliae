import { describe, expect, it } from 'vitest';
import { itemBlocks, textBlocks } from './liturgyBlocks';

// Extraits réels des réponses AELF / CatéGPT (16 octobre 2026).

describe('textBlocks', () => {
  it("fait de l'introduction V/ – R/ un dialogue", () => {
    expect(textBlocks('V/ Seigneur, ouvre mes lèvres,\n        <br />R/ et ma bouche publiera ta louange.')).toEqual([
      { t: 'vr', a: 'Seigneur, ouvre mes lèvres,', b: 'et ma bouche publiera ta louange.' }
    ]);
  });

  it('regroupe les vers sous leur numéro de verset, strophe par strophe', () => {
    const html =
      '<p><span class="verse_number">1</span> Venez, crions de j<u>o</u>ie pour le Seigneur,<br />\nacclamons notre Roch<u>e</u>r, notre salut !<br /><span class="verse_number">2</span> Allons jusqu\'à lu<u>i</u> en rendant grâce,<br />\npar nos hymnes de f<u>ê</u>te acclamons-le !<br /><br /><span class="verse_number">3</span> Oui, le grand Die<u>u</u>, c\'est le Seigneur,</p>';
    expect(textBlocks(html)).toEqual([
      {
        t: 'st',
        verses: [
          { n: '1', lines: ['Venez, crions de joie pour le Seigneur,', 'acclamons notre Rocher, notre salut !'] },
          { n: '2', lines: ["Allons jusqu'à lui en rendant grâce,", 'par nos hymnes de fête acclamons-le !'] }
        ]
      },
      { t: 'st', verses: [{ n: '3', lines: ["Oui, le grand Dieu, c'est le Seigneur,"] }] }
    ]);
  });

  it('isole le répons R/ et la conclusion des lectures', () => {
    expect(
      textBlocks('<p>Et maintenant, Seigneur, permets-nous de prier :</p><br />R/ <p>Pour ta plus grande gloire !</p>')
    ).toEqual([
      { t: 'p', x: 'Et maintenant, Seigneur, permets-nous de prier :' },
      { t: 'R', x: 'Pour ta plus grande gloire !' }
    ]);
    expect(textBlocks('<p>Frères,<br />\n dans le Christ.</p>\n\n<p>            – Parole du Seigneur.</p>').at(-1)).toEqual({
      t: 'vr',
      a: 'Parole du Seigneur.',
      b: 'Nous rendons grâce à Dieu.'
    });
  });
});

describe('itemBlocks', () => {
  it('encadre un psaume de son antienne et ajoute la doxologie repliable', () => {
    const blocks = itemBlocks(
      { key: 'psaume_1', label: 'Psaume 50', ref: '50', text: '<p>Pitié pour moi, mon Dieu.</p>', antienne: '<p>Purifie-moi, mon Dieu.</p>' },
      false
    );
    expect(blocks.map((b) => b.t)).toEqual(['ant', 'p', 'gl', 'ant']);
  });

  it('reprend le refrain du psaume de la messe après chaque strophe', () => {
    const blocks = itemBlocks(
      {
        key: 'psalm',
        label: 'Psaume',
        ref: 'Ps 32 (33), 1-2',
        text: '<p><strong>Heureux le peuple<br />\nque le Seigneur s’est choisi pour domaine.</strong></p>\n<p>Criez de joie pour le Seigneur, hommes justes !<br />\nHommes droits, à vous la louange !</p>\n\n<p>Oui, elle est droite, la parole du Seigneur ;<br />\nil est fidèle en tout ce qu’il fait.</p>'
      },
      true
    );
    expect(blocks.map((b) => b.t)).toEqual(['R', 'st', 'R', 'st', 'R']);
    expect(blocks[0]).toEqual({ t: 'R', x: 'Heureux le peuple que le Seigneur s’est choisi pour domaine.' });
  });

  it("place l'acclamation avant l'Évangile", () => {
    const blocks = itemBlocks(
      {
        key: 'gospel',
        label: 'Évangile',
        ref: 'Lc 12, 1-7',
        text: '<p>En ce temps-là,<br />\nJésus dit.</p>',
        acclamation: '<p><strong>Alléluia. Alléluia. </strong><br />\nQue ton amour, Seigneur, soit sur nous !<br /><strong>Alléluia.</strong></p>'
      },
      true
    );
    expect(blocks.slice(0, 2)).toEqual([
      { t: 'rub', x: 'Acclamation' },
      { t: 'R', x: 'Alléluia. Alléluia. Que ton amour, Seigneur, soit sur nous ! Alléluia.' }
    ]);
  });
});

describe('espaces', () => {
  it('colle la ponctuation haute au mot qui précède', () => {
    expect(textBlocks('<p>Seigneur, prends pitié ; écoute-moi !</p>')).toEqual([{ t: 'p', x: 'Seigneur, prends pitié ; écoute-moi !' }]);
  });
});
