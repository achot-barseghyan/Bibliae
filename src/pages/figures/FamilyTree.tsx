import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChart, type Chart } from 'family-chart';
import 'family-chart/styles/family-chart.css';
import type { Figure } from '../../data/figures';
import { buildGenealogy } from '../../data/genealogy';
import { useAccessibility } from '../../hooks/useAccessibility';
import { tapHaptic } from '../../utils/haptics';
import './FamilyTree.css';

interface FamilyTreeProps {
  figureId: string;
  figures: Figure[];
}

/** Zoom de départ : assez pour lire les noms, assez peu pour voir les proches. */
const TREE_SCALE = 0.8;

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Remplace les interrupteurs « C1 / C2 » de family-chart (branche
 * d'ancêtres commune dessinée une seule fois) par une étiquette lisible.
 * La bibliothèque les recrée à chaque mise à jour de l'arbre : appelée
 * après chacune. Le clic reste géré par family-chart sur `.f3-toggle-div`.
 * - branche dépliée ici : rien à signaler, l'interrupteur est masqué ;
 * - branche repliée ici : « Ancêtres déjà affichés · Toucher pour les voir ici ».
 */
function restyleDuplicateToggles(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.f3-toggle-div:not(.family-tree-toggle)').forEach((toggle) => {
    const icon = toggle.querySelector<SVGElement>('.f3-toggle-icon');
    // family-chart ne signale l'état que par la couleur de l'icône (gris = replié).
    const isCollapsedHere = icon?.style.color === 'rgb(88, 86, 86)';
    toggle.classList.add('family-tree-toggle');

    if (!isCollapsedHere) {
      toggle.style.display = 'none';
      return;
    }

    // Centrage : family-chart place un bloc de 60 px de large par son bord gauche.
    toggle.style.left = `${parseFloat(toggle.style.left || '0') + 30}px`;
    toggle.innerHTML = `
      <span class="family-tree-toggle-pill">
        <span class="family-tree-toggle-title">↑ Ancêtres déjà affichés</span>
        <span class="family-tree-toggle-action">Toucher pour les voir ici</span>
      </span>`;
    // La pastille « proches masqués » ferait doublon avec l'étiquette.
    const miniTree = toggle.closest('.card')?.querySelector<HTMLElement>('.mini-tree');
    if (miniTree) miniTree.style.display = 'none';
  });
}

/**
 * Arbre généalogique interactif (family-chart, D3) centré sur une figure :
 * on peut le faire glisser et zoomer. Un appui sur un proche qui a sa
 * propre fiche ouvre celle-ci ; sur un proche sans fiche, l'arbre se
 * recentre sur lui pour poursuivre l'exploration de la lignée.
 */
const FamilyTree: React.FC<FamilyTreeProps> = ({ figureId, figures }) => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [mainId, setMainId] = useState(figureId);

  const figuresById = useMemo(() => new Map(figures.map((f) => [f.id, f])), [figures]);
  // Les callbacks de family-chart sont posés une seule fois : ils lisent
  // les valeurs à jour via des refs plutôt que par fermeture.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const figuresRef = useRef(figuresById);
  figuresRef.current = figuresById;

  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;
    setMainId(figureId);

    // family-chart annote les données qu'on lui passe : copie à chaque montage.
    // Il ne connaît pas les parents légaux : on les affiche comme parents
    // (Joseph au-dessus de Jésus, à côté de Marie), la nature du lien étant
    // précisée par la mention sur la carte (`note`).
    const data = structuredClone(buildGenealogy()).map((d) => ({
      ...d,
      rels: {
        ...d.rels,
        parents: [...d.rels.parents, ...d.rels.legalParents],
        children: [...d.rels.children, ...d.rels.legalChildren]
      }
    }));
    const chart = createChart(cont, data)
      .setTransitionTime(settings.reduceMotion ? 0 : 700)
      .setCardXSpacing(118)
      .setCardYSpacing(132)
      // Pas de limite de générations : toute la lignée directe (ancêtres et
      // descendants) est affichée d'emblée.
      .setShowSiblingsOfMain(true)
      // Les patriarches épousent leurs cousines (Isaac et Rébecca, Jacob et
      // Léa/Rachel) : sans cela, la lignée commune (Térah → … → Adam) serait
      // dessinée une fois par chemin. Un seul exemplaire reste déplié.
      .setDuplicateBranchToggle(true)
      .setSingleParentEmptyCard(false);

    const card = chart.setCardHtml();
    card
      // Pastille sur les cartes dont certains proches (frères et sœurs d'un
      // ancêtre, autres branches) ne sont pas affichés : family-chart ne
      // montre que la lignée directe de la personne au centre.
      .setMiniTree(true)
      .setCardInnerHtmlCreator((d) => {
        const person = d.data;
        const figure = figuresRef.current.get(person.id);
        const name = escapeHtml(person.data.name);
        const classes = [
          'family-tree-card',
          figure ? 'has-figure' : '',
          person.data.unnamed ? 'is-unnamed' : ''
        ]
          .filter(Boolean)
          .join(' ');
        const portrait = figure
          ? `<img src="${figure.image}" alt="" draggable="false" />`
          : `<span class="family-tree-card-initial">${person.data.unnamed ? '?' : escapeHtml(person.data.name.charAt(0))}</span>`;
        return `
          <div class="card-inner ${classes}">
            <div class="family-tree-card-portrait">${portrait}</div>
            <div class="family-tree-card-name">${person.data.unnamed ? 'Non nommés' : name}</div>
            ${person.data.note ? `<div class="family-tree-card-note">${escapeHtml(person.data.note)}</div>` : ''}
          </div>`;
      })
      .setOnCardClick((_e: MouseEvent, d: { data: { id: string } }) => {
        const id = d.data.id;
        if (id === chart.getMainDatum().id) return;
        tapHaptic();
        if (figuresRef.current.has(id)) {
          navigateRef.current(`/figures/${id}`);
          return;
        }
        chart.updateMainId(id);
        chart.updateTree({ tree_position: 'main_to_middle', scale: TREE_SCALE });
        setMainId(id);
      });

    chart.setAfterUpdate(() => restyleDuplicateToggles(cont));
    // Les mises à jour internes de family-chart (dépliage d'une branche
    // commune) recadrent tout l'arbre par défaut, ce qui le rend minuscule
    // pour les grandes lignées : on garde plutôt la vue où elle est. Nos
    // propres appels précisent toujours `tree_position` ou `initial`.
    const storeUpdateTree = chart.store.updateTree;
    chart.store.updateTree = (props) =>
      storeUpdateTree(props?.tree_position || props?.initial ? props : { ...props, tree_position: 'inherit' });
    chart.updateMainId(figureId);
    chart.updateTree({ initial: true });
    chartRef.current = chart;

    // family-chart cadre l'arbre d'après la taille du conteneur au moment
    // du rendu : pendant la transition d'entrée de la page Ionic, elle est
    // encore nulle. On recentre donc dès que le conteneur a une vraie
    // taille — sur la figure plutôt qu'en cadrant tout l'arbre, qui
    // rendrait les grandes familles illisibles sur un écran de téléphone.
    let positioned = false;
    const observer = new ResizeObserver(([entry]) => {
      if (positioned || entry.contentRect.width === 0 || entry.contentRect.height === 0) return;
      positioned = true;
      chart.updateTree({ tree_position: 'main_to_middle', scale: TREE_SCALE, transition_time: 0 });
    });
    observer.observe(cont);

    return () => {
      observer.disconnect();
      chartRef.current = null;
      cont.innerHTML = '';
    };
  }, [figureId, settings.reduceMotion]);

  const recenter = () => {
    const chart = chartRef.current;
    if (!chart) return;
    tapHaptic();
    chart.updateMainId(figureId);
    chart.updateTree({ tree_position: 'main_to_middle', scale: TREE_SCALE });
    setMainId(figureId);
  };

  const figureName = figuresById.get(figureId)?.name ?? '';

  return (
    <div className="family-tree">
      <div ref={containerRef} className="f3 family-tree-canvas" />
      <div className="family-tree-footer">
        <p className="family-tree-hint">Glisser pour explorer · toucher un portrait pour ouvrir sa fiche</p>
        {mainId !== figureId && (
          <button type="button" className="family-tree-recenter" onClick={recenter}>
            Revenir à {figureName}
          </button>
        )}
      </div>
    </div>
  );
};

export default FamilyTree;
