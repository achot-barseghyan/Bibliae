import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { ChevronLeftIcon } from '../../components/nav/icons';
import { tapHaptic } from '../../utils/haptics';
import './InfoPage.css';
import WorldButton from '../../components/nav/WorldButton';
import { ARTIST_SHOP_URL } from '../../data/credits';
import { PLAN_SOURCE } from '../../data/readingPlan';
import { ROSARY_SOURCE } from '../../data/rosary';

interface SourceEntry {
  title: string;
  description: string;
  link?: { label: string; url: string };
}

// Chaque source utilisée dans l'app, regroupée par espace. À tenir à jour
// quand une donnée externe est ajoutée (les pages concernées citent aussi
// leur source sur place).
const SOURCE_GROUPS: Array<{ title: string; entries: SourceEntry[] }> = [
  {
    title: 'Bible et liturgie',
    entries: [
      {
        title: 'Bible Crampon (1923)',
        description: 'Texte biblique du domaine public, adapté et modernisé pour cette application.'
      },
      {
        title: 'TopBible · La Bible en 1 an',
        description: 'Répartition des lectures du plan « La Bible en 1 an ».',
        link: { label: 'Voir le plan', url: PLAN_SOURCE.url }
      },
      {
        title: 'AELF',
        description:
          'Association Épiscopale Liturgique pour les pays Francophones : messe et liturgie des heures du calendrier romain actuel (introduction, hymnes, psaumes, lectures, oraisons…).',
        link: { label: 'aelf.org', url: 'https://www.aelf.org' }
      },
      {
        title: 'CatéGPT · Divinum Officium',
        description: 'Calendrier liturgique, messe et office selon le calendrier traditionnel (Vetus Ordo, 1962).'
      }
    ]
  },
  {
    title: 'Prière',
    entries: [
      {
        title: "Prières traditionnelles de l'Église",
        description:
          'Textes publics de l’Église catholique (Notre Père, Je vous salue Marie, Credo…), avec leurs versions historiques en latin, grec ou araméen.'
      },
      {
        title: 'Jean-Paul II · Rosarium Virginis Mariae (2002)',
        description:
          'Lettre apostolique sur le Rosaire : mystères lumineux, répartition des mystères dans la semaine et rappel de chaque mystère.',
        link: { label: 'Lire sur vatican.va', url: ROSARY_SOURCE.url }
      },
      {
        title: 'Prier le chapelet',
        description: 'Déroulé du chapelet et prières facultatives proposées dans les réglages du Rosaire.',
        link: { label: 'prierlechapelet.com', url: 'https://www.prierlechapelet.com' }
      },
      {
        title: 'Wikipédia · Liste de saints catholiques',
        description: 'Noms, qualités et dates de fête des saints, sous licence CC BY-SA 4.0.',
        link: { label: 'Voir la liste', url: 'https://fr.wikipedia.org/wiki/Liste_de_saints_catholiques' }
      }
    ]
  },
  {
    title: 'Église',
    entries: [
      {
        title: "Catéchisme de l'Église catholique",
        description:
          'Paragraphes cités dans les réponses de la page Église. Ils y sont résumés fidèlement, sans reprendre mot pour mot la traduction officielle.',
        link: { label: 'Texte officiel sur vatican.va', url: 'https://www.vatican.va/archive/FRA0013/_INDEX.HTM' }
      },
      {
        title: 'Open Church · Wikidata',
        description: 'Annuaire des paroisses de France et des églises qui leur sont rattachées.',
        link: { label: 'open-church.io', url: 'https://open-church.io' }
      },
      {
        title: 'messes.info',
        description: 'Horaires des messes de chaque paroisse (service de la Conférence des évêques de France).',
        link: { label: 'messes.info', url: 'https://www.messes.info' }
      },
      {
        title: 'Base Adresse Nationale',
        description: 'Localisation des villes saisies dans la recherche de paroisse (api-adresse.data.gouv.fr).',
        link: { label: 'adresse.data.gouv.fr', url: 'https://adresse.data.gouv.fr' }
      },
      {
        title: 'Wikipédia · Liste des congrégations catholiques',
        description: 'Ordres religieux et communautés nouvelles, sous licence CC BY-SA 4.0.',
        link: {
          label: 'Voir la liste',
          url: 'https://fr.wikipedia.org/wiki/Liste_des_congr%C3%A9gations_catholiques'
        }
      },
      {
        title: 'Wikipédia · Abbayes et monastères actifs en France',
        description:
          'Liste des abbayes et monastères catholiques actifs en France, complétée par le Service des moniales, sous licence CC BY-SA 4.0.',
        link: {
          label: 'Voir la liste',
          url: 'https://fr.wikipedia.org/wiki/Liste_des_abbayes_et_monast%C3%A8res_catholiques_actifs_en_France'
        }
      }
    ]
  },
  {
    title: 'Figures',
    entries: [
      {
        title: 'New Advent · Catholic Encyclopedia (1907-1913)',
        description:
          'Compléments historiques et traditions anciennes des fiches, reformulés à partir des articles de l’encyclopédie. Le récit biblique renvoie à la Bible Crampon.',
        link: { label: 'newadvent.org', url: 'https://www.newadvent.org/cathen/' }
      }
    ]
  },
  {
    title: 'Images',
    entries: [
      {
        title: 'Illustrations des figures et des événements',
        description: 'Artwork by DolceDreamsStudio.',
        link: { label: 'Boutique Etsy', url: ARTIST_SHOP_URL }
      },
      {
        title: 'Wikimedia Commons',
        description: 'Photos des abbayes et monastères ; l’auteur et la licence sont indiqués sous chaque photo.',
        link: { label: 'commons.wikimedia.org', url: 'https://commons.wikimedia.org' }
      }
    ]
  }
];

const Sources: React.FC = () => {
  const navigate = useNavigate();

  return (
    <IonPage>
      <IonContent fullscreen className="info-page-content">
        <header className="info-page-header">
          <button
            type="button"
            className="info-page-back"
            onClick={() => {
              tapHaptic();
              navigate(-1);
            }}
            aria-label="Retour"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <h1 className="info-page-header-title">Sources</h1>
        </header>

        <div className="info-page-body">
          <p className="info-page-paragraph">
            Les textes et les données affichés dans Bibliae proviennent des sources suivantes.
          </p>

          {SOURCE_GROUPS.map((group) => (
            <Fragment key={group.title}>
              <h2 className="info-page-section-title">{group.title}</h2>
              <ul className="info-page-list">
                {group.entries.map((entry) => (
                  <li key={entry.title} className="info-page-list-item">
                    <p className="info-page-list-title">{entry.title}</p>
                    <p className="info-page-list-desc">
                      {entry.description}
                      {entry.link && (
                        <>
                          {' · '}
                          <a className="info-page-link" href={entry.link.url} target="_blank" rel="noopener noreferrer">
                            {entry.link.label}
                          </a>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
        </div>
        <WorldButton />
      </IonContent>
    </IonPage>
  );
};

export default Sources;
