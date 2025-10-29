// quartz/components/KoFiOverlay.tsx
import { QuartzComponent, QuartzComponentConstructor } from "./types"  // [web:87][web:33]

export default (() => {
  const K: QuartzComponent = () => null  // sin markup, solo lógica de carga

  // Se ejecuta después de montar el DOM de la página
  K.afterDOMLoaded = `
    (function loadKoFi(){
      const SCRIPT_ID = 'kofi-overlay-script';
      function init(){
        if (typeof kofiWidgetOverlay !== 'undefined') {
          try {
            kofiWidgetOverlay.draw('netenebrae', {
              type: 'floating-chat',
              'floating-chat.donateButton.text': 'Support me',
              'floating-chat.donateButton.background-color': '#ffffff',
              'floating-chat.donateButton.text-color': '#323842'
            });
          } catch(e) {
            setTimeout(init, 300);
          }
        } else {
          setTimeout(init, 300);
        }
      }
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
        s.id = SCRIPT_ID;
        s.defer = true;
        s.onload = init;
        document.head.appendChild(s);
      } else {
        init();
      }
    })();
    `

    // Añade esto dentro de tu KoFiOverlay.tsx, debajo de K.afterDOMLoaded
K.css = `
  /* Botón flotante redondo (burbuja) */
  .floatingchat-container-wrap,
  .floatingchat-container-wrap-mobi {
    border-radius: 9999px !important;
    overflow: hidden; /* por si el contenedor usa imágenes/fondos */
  }

  /* Panel/iframe del chat con esquinas redondeadas */
  .floating-chat-kofi-popup-iframe,
  .floating-chat-kofi-popup-iframe-mobi {
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(0,0,0,.18);
  }

  /* Cierra bien el “closer” en móvil si aparece cuadrado */
  .floating-chat-kofi-popup-iframe-closer-mobi {
    border-radius: 9999px !important;
  }

  /* Opcional: posición en esquina inferior derecha coherente en desktop/móvil */
  .floatingchat-container-wrap,
  .floatingchat-container-wrap-mobi,
  .floating-chat-kofi-popup-iframe,
  .floating-chat-kofi-popup-iframe-mobi,
  .floating-chat-kofi-popup-iframe-closer-mobi {
    left: unset !important;
    right: 18px !important;
  }
`;


  return K
}) satisfies QuartzComponentConstructor
