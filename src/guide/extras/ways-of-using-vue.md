# Modi di utilizzare Vue {#ways-of-using-vue}

Noi crediamo alla storia che c'è un modo giusto in assoluto che vada per tutti nel mondo del web. Questo è il principale motivo per la quale abbiamo disegnato Vue per essere versatile e flessibile. A seconda del tuo caso d'uso, Vue può essere utilizzato in modi diversi per trovare l'equilibrio ottimale tra complessità dello stack, esperienza dello sviluppatore e performance.

## Standalone Script {#standalone-script}

Vue può essere utilizzato con script file "standalone", ovvero senza necessità di build. Se hai un framework backend che già renderizza la maggior parte del HTML, o la tua logica di frontend non è complessa a tal punto da giustificare una build, questo è il modo più semplice per integrare Vue all'interno del vostro stack. In questi casi puoi pensare a Vue come un sostituto più dichiarativo di JQuery.

Inoltre Vue dispone di una distribuzione alternativa chiamata [petite-vue](https://github.com/vuejs/petite-vue) che è specificatamente ottimizzata per migliorare progressivamente il codice HTML esistente. Ha un set di funzionalità più limitato ma estremamente leggero ed è molto efficace soprattutto negli scenari senza step di build. 

## Embedded Web Components {#embedded-web-components}

Puoi usare Vue per [creare Web Components nativi](/guide/extras/web-components) che potrai embeddare in ogni pagina HTML, indipendentemente da come quest'ultime vengano renderizzate. Questa opzione ti consente di sfruttare Vue in modo completamente indipendente da chi lo integra: i web components creati potranno essere incorporati in applicazioni legacy, HTML statico o persino applicazioni create con altri framework.

## Single-Page Application (SPA) {#single-page-application-spa}

Molte delle applicazioni richiedono molta interattività, gestione della sessione, e una logica stateful complessa lato frontend. Il modo migliore per creare applicazioni è di usare un architettura dove Vue non controlla solamente l'intera pagina, ma controlla anche l'aggiornamento dei dati e navigazione senza necessità di ricaricare la pagina. Questo tipo di applicazione è tipicamente chiamata come Single-Page Application (SPA).

Per rendere ancora più piacevole l'esperienza di sviluppo, Vue dispone di librerie core e [strumenti di supporto completo](/guide/scaling-up/tooling) che  includono:

- Client-side router 
- Blazing fast build tool chain (Strumenti di costruzione delle applicazioni incredibilmente veloce)
- Supporto agli IDE
- Browser devtools
- Integrazioni per TypeScript
- Utility per i test

Tipicamente le SPA richiedono un backend che espone API, ma soluzioni come [Inertia.js](https://inertiajs.com) possono essere abbinate a Vue per avere i vantaggi di una SPA ma mantenere il modello di sviluppo lato server. 

## Fullstack / SSR {#fullstack-ssr}

Pure client-side SPAs are problematic when the app is sensitive to SEO and time-to-content. This is because the browser will receive a largely empty HTML page, and has to wait until the JavaScript is loaded before rendering anything.

Vue provides first-class APIs to "render" a Vue app into HTML strings on the server. This allows the server to send back already-rendered HTML, allowing end users to see the content immediately while the JavaScript is being downloaded. Vue will then "hydrate" the application on the client side to make it interactive. This is called [Server-Side Rendering (SSR)](/guide/scaling-up/ssr) and it greatly improves Core Web Vital metrics such as [Largest Contentful Paint (LCP)](https://web.dev/lcp/).

There are higher-level Vue-based frameworks built on top of this paradigm, such as [Nuxt](https://nuxt.com/), which allow you to develop a fullstack application using Vue and JavaScript.

## JAMStack / SSG {#jamstack-ssg}

Server-side rendering can be done ahead of time if the required data is static. This means we can pre-render an entire application into HTML and serve them as static files. This improves site performance and makes deployment a lot simpler since we no longer need to dynamically render pages on each request. Vue can still hydrate such applications to provide rich interactivity on the client. This technique is commonly referred to as Static-Site Generation (SSG), also known as [JAMStack](https://jamstack.org/what-is-jamstack/).

There are two flavors of SSG: single-page and multi-page. Both flavors pre-render the site into static HTML, the difference is that:

- After the initial page load, a single-page SSG "hydrates" the page into an SPA. This requires more upfront JS payload and hydration cost, but subsequent navigations will be faster, since it only needs to partially update the page content instead of reloading the entire page.

- A multi-page SSG loads a new page on every navigation. The upside is that it can ship minimal JS - or no JS at all if the page requires no interaction! Some multi-page SSG frameworks such as [Astro](https://astro.build/) also support "partial hydration" - which allows you to use Vue components to create interactive "islands" inside static HTML.

Single-page SSGs are better suited if you expect non-trivial interactivity, deep session lengths, or persisted elements / state across navigations. Otherwise, multi-page SSG would be the better choice.

The Vue team also maintains a static-site generator called [VitePress](https://vitepress.dev/), which powers this website you are reading right now! VitePress supports both flavors of SSG. [Nuxt](https://nuxt.com/) also supports SSG. You can even mix SSR and SSG for different routes in the same Nuxt app.

## Beyond the Web {#beyond-the-web}

Although Vue is primarily designed for building web applications, it is by no means limited to just the browser. You can:

- Build desktop apps with [Electron](https://www.electronjs.org/) or [Tauri](https://tauri.studio/en/)
- Build mobile apps with [Ionic Vue](https://ionicframework.com/docs/vue/overview)
- Build desktop and mobile apps from the same codebase with [Quasar](https://quasar.dev/)
- Use Vue's [Custom Renderer API](/api/custom-renderer) to build custom renderers targeting [WebGL](https://troisjs.github.io/) or even [the terminal](https://github.com/vue-terminal/vue-termui)!
