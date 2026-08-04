module.exports = {
  server: {
    baseDir: [".", "src/static"],
    routes: {
      "/svg": "src/svg",
      "/img": "src/img",
    },
  },
  files: ["**/*.html", "css/*.css", "js/**/*.js"],
  notify: false,
  open: false,
};
