document.body.classList.add("fade-page");

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // Smooth page transitions
  document.querySelectorAll("a").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    link.addEventListener("click", e => {
      if (link.target === "_blank") return;
      e.preventDefault();
      document.body.classList.remove("fade-in");
      setTimeout(() => {
        window.location = link.href;
      }, 200);
    });
  });

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }
});
