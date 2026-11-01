(() => {
  try {
    document.documentElement.dataset.theme =
      localStorage.getItem("ahmet-portfolio-theme") === "light"
        ? "light"
        : "dark";
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
})();
