/**
 * Vue application setup.
 *
 * The card page (`card/?card=<name>`) resolves its card from the query string
 * at runtime. The homepage mounts the same app but references none of this
 * card state, so it is simply inert there.
 */

// Vue is loaded from the CDN in the HTML.
declare const Vue: any;

import { resolveCard } from "./_deal.js";

const { createApp } = Vue;

const rawCard = new URLSearchParams(window.location.search).get("card");
const resolved = resolveCard(rawCard);

const app = createApp({
  data() {
    return {
      resolved,
      hasCard: resolved !== null,
      displayName: resolved ? resolved.name : "",
    };
  },
  mounted() {
    document.documentElement.dataset.appReady = "true";
  },
});

app.mount("#app");

export default app;
