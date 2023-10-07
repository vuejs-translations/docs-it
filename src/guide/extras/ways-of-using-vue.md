# Modi di utilizzare Vue {#ways-of-using-vue}

Crediamo che non esista una soluzione "unica per tutti" per il web. Ecco perché Vue è progettato per essere flessibile e adottabile in maniera incrementale. A seconda del tuo caso d'uso, Vue può essere utilizzato in modi diversi per trovare l'equilibrio ottimale tra complessità dello stack, esperienza dello sviluppatore e performance finale.

## Standalone Script {#standalone-script}

Vue può essere utilizzato come un file di script incorporato (standalone) - non è richiesta alcuna build! Se hai un framework backend che genera già la maggior parte dell'HTML, o la tua logica frontend non è abbastanza complessa da giustificare una build, questo è il modo più semplice per integrare Vue nel tuo stack. In questi casi puoi pensare a Vue come un sostituto più dichiarativo di jQuery.

Inoltre Vue dispone di una distribuzione alternativa chiamata [petite-vue](https://github.com/vuejs/petite-vue) che è specificamente ottimizzata per migliorare progressivamente l'HTML esistente. Ha un set di funzionalità più piccolo, ma è estremamente leggero e utilizza un'implementazione che è più efficiente in scenari senza step di build.

## Web Components Incorporati {#embedded-web-components}

Puoi usare Vue per [creare Web Components standard](/guide/extras/web-components) che possono essere incorporati in qualsiasi pagina HTML, indipendentemente da come vengono renderizzati. Questa opzione ti consente di sfruttare Vue in un modo completamente indipendente da ciò che lo integra: i web components risultanti possono essere incorporati in applicazioni legacy, HTML statico, o anche applicazioni costruite con altri framework.

## Applicazione Single-Page (SPA) {#single-page-application-spa}

Alcune applicazioni richiedono una grande interattività, una profonda gestione della sessione e una logica stateful non banale sul frontend. Il modo migliore per costruire tali applicazioni è utilizzare un'architettura dove Vue non solo controlla l'intera pagina, ma gestisce anche gli aggiornamenti dei dati e la navigazione senza dover ricaricare la pagina. Questo tipo di applicazione è tipicamente definita come Applicazione a Pagina Singola (SPA, Single-Page Application).

Per rendere ancora più piacevole l'esperienza di sviluppo, Vue dispone di librerie core e [strumenti di supporto completo](/guide/scaling-up/tooling) che includono:

- Router lato client
- Strumenti di build rapidissimi / estremamente veloci
- Supporto agli IDE
- Browser devtools
- Integrazioni per TypeScript
- Utility per i test

Tipicamente le SPA richiedono che il backend esponga endpoint API, ma soluzioni come [Inertia.js](https://inertiajs.com) possono essere abbinate a Vue per avere i vantaggi di una SPA e mantenere il modello di sviluppo lato server. 

## Fullstack / SSR {#fullstack-ssr}

Le SPA lato client "pure" presentano problemi quando l'app è soggetta alla SEO e al time-to-content. Questo perché il browser riceverà una pagina HTML sostanzialmente vuota e dovrà attendere che il JavaScript venga caricato prima di visualizzare qualsiasi cosa.

Vue fornisce API di prima classe per il "rendering" di un'app Vue in stringhe HTML sul server. Ciò consente al server di inviare HTML già renderizzato, permettendo agli utenti finali di vedere immediatamente il contenuto mentre il JavaScript è ancora in fase di download. Vue poi "idraterà" l'applicazione sul client per renderla interattiva. Questo è chiamato [Server-Side Rendering (SSR)](/guide/scaling-up/ssr) e migliora notevolmente le "Core Web Vital metrics" come [Largest Contentful Paint (LCP)](https://web.dev/lcp/).

Esistono Framework che si basano su Vue costruiti su questo paradigma, come [Nuxt](https://nuxt.com/), che ti permettono di sviluppare un'applicazione fullstack utilizzando Vue e JavaScript.

## JAMStack / SSG {#jamstack-ssg}

Il rendering lato server può essere eseguito in anticipo se i dati richiesti sono statici. Ciò significa che possiamo pre-renderizzare un'intera applicazione in HTML e distribuirla come file statici. Questo migliora le prestazioni del sito e semplifica molto il deployment, poiché non c'è più bisogno di fare il rendering dinamico delle pagine ad ogni richiesta. Vue può ancora idratare (hydrate) queste applicazioni per fornire una maggiore interattività sul client. Questa tecnica è comunemente chiamata Generazione di Siti Statici (SSG, Static-Site Generation), conosciuta anche come [JAMStack](https://jamstack.org/what-is-jamstack/).

Ci sono due tipi di SSG: single-page e multi-page. Entrambe le tipologie pre-renderizzano il sito in HTML statico, la differenza è che:

- Dopo il caricamento iniziale della pagina, un SSG (ServerSideGenerated) single-page "idrata" la pagina trasformandola in una SPA. Ciò richiede un peso maggiore del JS iniziale e un costo di idratazione (hydration), ma le navigazioni successive saranno più rapide, poiché c'è bisogno di aggiornare parzialmente solo il contenuto della pagina invece di ricaricare l'intera pagina.

- Una SSG (ServerSideGenerated) multi-pagina carica una nuova pagina ad ogni navigazione. Il vantaggio è che può fornire un JS minimo - o nessun JS se la pagina non richiede interazione! Alcuni framework SSG multi-pagina come [Astro](https://astro.build/) supportano anche l'"hydration parziale" - che ti permette di usare componenti Vue per creare "zone" interattive all'interno di HTML statico.

Le SSG single-page sono più adatte se ci si aspetta un'interattività non banale, sessioni lunghe, o elementi/stati persistenti durante la navigazione. Altrimenti, l'SSG multi-pagina sarebbe la scelta migliore.

Il team di Vue mantiene anche un generatore di siti statici chiamato [VitePress](https://vitepress.dev/), su cui si basa questo sito web che stai leggendo proprio ora! VitePress supporta entrambe le varianti di SSG. Anche [Nuxt](https://nuxt.com/)  supporta le SSG. Puoi persino mixare SSR e SSG per percorsi diversi nella stessa app Nuxt.

## Oltre il web {#beyond-the-web}

Anche se Vue è progettato principalmente per la creazione di applicazioni web, non è in alcun modo limitato solo ai browser. Puoi:

- Creare applicazioni desktop con [Electron](https://www.electronjs.org/) o [Tauri](https://tauri.studio/en/)
- Creare applicazioni mobile con [Ionic Vue](https://ionicframework.com/docs/vue/overview)
- Creare applicazioni desktop e mobile dallo stesso codice sorgente con [Quasar](https://quasar.dev/)
- Utilizzare la [Custom Renderer API](/api/custom-renderer) di Vue per creare renderer personalizzati per [WebGL](https://troisjs.github) o persino per [il terminale](https://github.com/vue-terminal/vue-termui)!
