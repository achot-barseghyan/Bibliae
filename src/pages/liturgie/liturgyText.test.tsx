import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ACCENT_CLOSE, ACCENT_OPEN, htmlToLines, renderRubrics, stripHtml } from './liturgyText';

describe('syllabes accentuées', () => {
  it('garde les <u> de l\'AELF seulement sur demande', () => {
    const html = 'crions de j<u>o</u>ie';
    expect(htmlToLines(html)).toBe('crions de joie');
    expect(htmlToLines(html, true)).toBe(`crions de j${ACCENT_OPEN}o${ACCENT_CLOSE}ie`);
    expect(stripHtml(html)).toBe('crions de joie');
  });

  it("les souligne à l'affichage", () => {
    const { container } = render(<p>{renderRubrics(`crions de j${ACCENT_OPEN}o${ACCENT_CLOSE}ie *`, 'k')}</p>);
    expect(container.querySelector('.lec-accent')?.textContent).toBe('o');
    expect(container.textContent).toBe('crions de joie *');
  });
});
