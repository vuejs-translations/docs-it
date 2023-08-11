# Rilascio in produzione {#production-deployment}

## Sviluppo vs. Produzione {#development-vs-production}

Durante lo sviluppo, Vue mette a disposizione un numero di funzionalità per migliorare l'esperienza di sviluppo nella sua interezza:

- Avvisi per errori comuni ed incidenti di percorso
- Props / validazione degli eventi
- [hooks per la reattività del debugging](/guide/extras/reactivity-in-depth#reactivity-debugging)
- Integrazione degli strumenti di sviluppo

Alcune di queste funzionalità diventano inutili in produzione. Diversi avvisi di controllo possono andare incontro ad alcuni costi di performance. Quando ci si prepara per il rilascio in produzione, dovremmo abbandonare tutti i branch di solo sviluppo non utilizzati, affinchè si ottenga un carico minore delle suddette performance, per migliorarne la qualità.

## Senza strumenti di build {#without-build-tools}

Se ci si trova ad usare Vue senza strumenti di build, ossia caricandolo da una CDN o da uno script autosufficiente, ci si raccomanda di usare il build di produzione (file dist con nomenclatura `.prod.js`) in fase di rilascio. Le versioni di produzione sono pre-compresse (minified) con tutti i branch di sviluppo rimossi.

- Se si decide di usare il build globale (accedendovi tramite la `Vue` global): usare `vue.global.prod.js`.
- Se si decide di usare il build ESM (accedendovi tramite gli import nativi ESM): utilizzare `vue.esm-browser.prod.js`.

Consultare la [guida ai file dist](https://github.com/vuejs/core/tree/main/packages/vue#which-dist-file-to-use) per maggiori dettagli.

## Con strumenti di build {#with-build-tools}

Progetti montati tramite `create-vue` (basati su Vite) o Vue CLI (basato su webpack) sono pre-configurati per build di produzione.

Se invece ci si trova a dover usare un'installazione personalizzata, si raccomanda di:

1. `vue` si trasforma in `vue.runtime.esm-bundler.js`.
2. I [flag di funzionalità](https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags) sono correttamente configurati.
3. <code>process.env<wbr>.NODE_ENV</code> è sostituito con `"production"` durante il build.

Fonti addizionali:

- [guida di Vite al build in produzione](https://vitejs.dev/guide/build.html)
- [guida di Vite riguardante il rilascio](https://vitejs.dev/guide/static-deploy.html)
- [guida di Vue CLI riguardante il rilascio](https://cli.vuejs.org/guide/deployment.html)

## Seguire gli errori di runtime {#tracking-runtime-errors}

Lo strumento [gestore degli errori a livello di app](/api/application#app-config-errorhandler) può essere utilizzato per riportare suddetti errori agli assistenti al monitoraggio:

```js
import { createApp } from 'vue'

const app = createApp(...)

app.config.errorHandler = (err, instance, info) => {
  // riporta l'errore agli assistenti al monitoraggio
}
```

Tra questi assisenti di monitoraggio (dell'errore) abbiamo [Sentry](https://docs.sentry.io/platforms/javascript/guides/vue/) e [Bugsnag](https://docs.bugsnag.com/platforms/javascript/vue/) che a sua volta dispone di integrazione ufficiale per Vue.
