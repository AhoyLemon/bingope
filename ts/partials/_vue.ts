/**
 * Vue application setup
 */

// Import Vue from CDN (it should be loaded in the HTML)
declare const Vue: any;

const { createApp } = Vue;

const app = createApp({
  mounted() {
    document.documentElement.dataset.appReady = "true";
  },
});

app.mount("#app");

export default app;
