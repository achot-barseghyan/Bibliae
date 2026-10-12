import { useState } from 'react';
import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { ZoomIcon } from './nav/icons';
import { tapHaptic } from '../utils/haptics';
import './ZoomableImage.css';

interface ZoomableImageProps {
  src: string;
  alt: string;
  /** Classe du conteneur : c'est lui qui fixe la taille et le cadrage de l'image. */
  className?: string;
}

/**
 * Image avec une loupe en bas à droite qui l'ouvre en plein écran
 * (react-photo-view : pincer ou double-toucher pour zoomer, glisser vers le
 * bas pour fermer). Seule la loupe ouvre la visionneuse, pour ne pas gêner le
 * défilement de la page.
 */
const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`zoomable-image${className ? ` ${className}` : ''}`}>
      <img src={src} alt={alt} />
      <button
        type="button"
        className="zoomable-image-button"
        onClick={() => {
          tapHaptic();
          setIsOpen(true);
        }}
        aria-label={`Agrandir l'image : ${alt}`}
      >
        <ZoomIcon size={20} />
      </button>
      <PhotoSlider
        images={[{ key: src, src }]}
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        bannerVisible={false}
        maskOpacity={0.92}
      />
    </div>
  );
};

export default ZoomableImage;
