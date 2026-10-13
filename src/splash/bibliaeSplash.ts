// Animation de lancement (partie web). Elle démarre sur la même image que
// l'écran natif (bordeaux + icône), qu'elle masque dès sa première image :
// le passage est invisible. Puis le parchemin s'ouvre depuis l'icône, la
// croix monte, « Bibliae » s'écrit et le verset apparaît (~4,8 s).
// Réglages natifs associés : capacitor.config.ts et res/values/styles.xml.

const EASE = 'cubic-bezier(.2,.7,.2,1)';
/** Attente maximale des polices avant de mesurer le « B » (hors ligne, on s'en passe). */
const FONTS_TIMEOUT_MS = 800;

interface SplashOptions {
  /** Appelé à la première image de l'animation : masquer l'écran natif. */
  onReady?: () => void;
  /** Appelé une fois l'animation retirée. */
  onDone?: () => void;
}

const MARKUP = `
  <div data-k="fill" style="position:absolute;left:50%;top:50%;width:132px;height:132px;margin:-66px 0 0 -66px;background:#EFE7D3"></div>
  <div data-k="glow" style="position:absolute;left:50%;top:35%;width:420px;height:420px;margin:-210px 0 0 -210px;border-radius:50%;background:radial-gradient(circle,rgba(240,213,142,.55),rgba(240,213,142,.12) 40%,transparent 68%);opacity:0"></div>
  <div data-k="rays" style="position:absolute;left:50%;top:35%;width:700px;height:700px;margin:-350px 0 0 -350px;border-radius:50%;background:repeating-conic-gradient(rgba(181,137,46,.16) 0deg 1.2deg,transparent 1.2deg 10deg);-webkit-mask:radial-gradient(circle,#000 0%,transparent 55%);mask:radial-gradient(circle,#000 0%,transparent 55%);opacity:0"></div>
  <div data-k="cross" style="position:absolute;left:50%;top:50%;width:27px;height:37px;margin:-55px 0 0 -13.5px">
    <div style="position:absolute;left:50%;top:0;bottom:0;width:7.5px;margin-left:-3.75px;background:#B5892E"></div>
    <div style="position:absolute;left:0;right:0;top:12px;height:8px;background:#B5892E"></div>
  </div>
  <div data-k="bigB" style="position:absolute;left:0;right:0;top:50%;margin-top:-16px;text-align:center;font:700 78px/1 'Cormorant Garamond',serif;color:#6B1E23">B</div>
  <div style="position:absolute;left:0;right:0;top:35%;margin-top:-34px;display:flex;flex-direction:column;align-items:center">
    <div data-k="r1" style="width:220px;height:.5px;background:#6B1E23;transform:scaleX(0)"></div>
    <div data-k="word" style="margin-top:16px;display:flex;font:500 64px/1 'Cormorant Garamond',serif;letter-spacing:.02em;color:#23201A">
      <span data-k="wb" style="font-weight:700;color:#6B1E23;opacity:0">B</span>${'ibliae'
        .split('')
        .map((c) => `<span data-l style="opacity:0;display:inline-block">${c}</span>`)
        .join('')}
    </div>
    <div data-k="r2" style="margin-top:16px;width:220px;height:.5px;background:#6B1E23;transform:scaleX(0)"></div>
    <div data-k="tag" style="margin-top:16px;display:flex;gap:12px;font:500 10px Inter,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#6B1E23;opacity:0">
      <span>Bible</span><span style="color:#B5892E">·</span><span>Prière</span><span style="color:#B5892E">·</span><span>Église</span>
    </div>
  </div>
  <div data-k="verse" style="position:absolute;left:44px;right:44px;top:65%;text-align:center;opacity:0">
    <div style="font:italic 19px/1.45 'EB Garamond',serif;color:rgba(35,32,26,.82)">Une lampe sur mes pas, ta parole, une lumière sur ma route.</div>
    <div style="margin-top:10px;font:500 9.5px Inter,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#B5892E">Psaume 118 (119), 105</div>
  </div>
  <div data-k="barW" style="position:absolute;left:50%;bottom:64px;width:120px;margin-left:-60px;height:1px;background:rgba(35,32,26,.15);opacity:0;overflow:hidden">
    <div data-k="bar" style="width:100%;height:100%;background:#B5892E;transform-origin:0 50%;transform:scaleX(0)"></div>
  </div>`;

/** Attend les polices du logo (déjà demandées par index.html), sans bloquer plus que nécessaire. */
async function waitForFonts(): Promise<void> {
  if (!document.fonts?.load) return;
  const fonts = Promise.all([
    document.fonts.load("700 78px 'Cormorant Garamond'"),
    document.fonts.load("500 64px 'Cormorant Garamond'"),
    document.fonts.load("italic 19px 'EB Garamond'"),
    document.fonts.load('500 10px Inter')
  ]);
  await Promise.race([fonts.catch(() => undefined), new Promise((r) => setTimeout(r, FONTS_TIMEOUT_MS))]);
}

export async function playBibliaeSplash({ onReady, onDone }: SplashOptions = {}): Promise<void> {
  await waitForFonts();

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const root = document.createElement('div');
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText = 'position:fixed;inset:0;z-index:99999;overflow:hidden;background:#6B1E23;';
  root.innerHTML = MARKUP;
  document.body.appendChild(root);

  const $ = (k: string) => root.querySelector<HTMLElement>(`[data-k="${k}"]`)!;
  const a = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) =>
    el.animate(kf, { easing: EASE, fill: 'both', ...o });

  // L'écran natif bloque tout dessin de l'app tant qu'il est affiché : aucune
  // image (requestAnimationFrame) n'arrive avant qu'on le masque. On le masque
  // donc dès que la couche, identique à lui, est en place, puis on anime à la
  // première image. Le délai de secours couvre un rAF qui tarderait.
  onReady?.();

  return new Promise((resolve) => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const finish = () => {
        root.remove();
        onDone?.();
        resolve();
      };
      if (reduce) {
        a(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 300 }).finished.then(finish);
        return;
      }
      a($('fill'), [{ transform: 'scale(1)' }, { transform: 'scale(14)' }], {
        duration: 900,
        delay: 600,
        easing: 'cubic-bezier(.7,0,.2,1)'
      });
      const lift = -(window.innerHeight * 0.15) - 34;
      a($('cross'), [{ transform: 'none' }, { transform: `translateY(${lift - 16}px) scale(1.15)` }], {
        duration: 1100,
        delay: 1500
      });
      a(
        $('glow'),
        [
          { opacity: 0, transform: 'translateY(130px) scale(.4)' },
          { opacity: 1, transform: 'translateY(-150px) scale(1)' }
        ],
        { duration: 1500, delay: 1500 }
      );
      a(
        $('rays'),
        [
          { opacity: 0, transform: 'translateY(-150px) rotate(-20deg)' },
          { opacity: 1, transform: 'translateY(-150px) rotate(0)' }
        ],
        { duration: 2400, delay: 1700 }
      );

      // Le grand « B » de l'icône glisse jusqu'à sa place dans « Bibliae ».
      const bigB = $('bigB');
      const wb = $('wb');
      const range = document.createRange();
      range.selectNodeContents(bigB);
      const g = range.getBoundingClientRect();
      const t = wb.getBoundingClientRect();
      const dx = t.left + t.width / 2 - (g.left + g.width / 2);
      const dy = t.top + t.height / 2 - (g.top + g.height / 2);
      a(bigB, [{ transform: 'none' }, { transform: `translate(${dx}px,${dy}px) scale(${64 / 78})` }], {
        duration: 900,
        delay: 1900,
        easing: 'cubic-bezier(.6,0,.2,1)'
      });
      a(bigB, [{ opacity: 1 }, { opacity: 0 }], { duration: 10, delay: 2800 });
      a(wb, [{ opacity: 0 }, { opacity: 1 }], { duration: 10, delay: 2800 });

      root.querySelectorAll('[data-l]').forEach((l, i) =>
        a(
          l,
          [
            { opacity: 0, transform: 'translateY(14px)', filter: 'blur(6px)' },
            { opacity: 1, transform: 'none', filter: 'blur(0)' }
          ],
          { duration: 700, delay: 2350 + i * 70 }
        )
      );
      a($('r1'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 900, delay: 2700 });
      a($('r2'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 900, delay: 2800 });
      a(
        $('tag'),
        [
          { opacity: 0, letterSpacing: '.6em' },
          { opacity: 1, letterSpacing: '.3em' }
        ],
        { duration: 1000, delay: 3000 }
      );
      a(
        $('verse'),
        [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'none' }
        ],
        { duration: 1000, delay: 3200 }
      );
      a($('barW'), [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 2900 });
      a(
        $('bar'),
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(.35)', offset: 0.4 }, { transform: 'scaleX(1)' }],
        { duration: 1400, delay: 3000, easing: 'ease-in-out' }
      );
      a(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 4300, easing: 'ease-in' }).finished.then(
        finish
      );
    };
    requestAnimationFrame(start);
    setTimeout(start, 250);
  });
}
