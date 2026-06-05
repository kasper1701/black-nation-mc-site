document.body.classList.add("fade-page");

document.addEventListener("DOMContentLoaded", () => {
  // Trigger fade-in on next frame so transition is always visible
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("fade-in");
    });
  });

  // Smooth page transitions — matches CSS transition duration
  document.querySelectorAll("a").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    link.addEventListener("click", e => {
      if (link.target === "_blank") return;
      e.preventDefault();
      const dest = link.href;
      document.body.classList.remove("fade-in");
      setTimeout(() => { window.location = dest; }, 300);
    });
  });

  // Mobile nav toggle — close on nav link tap
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => nav.classList.remove("open"));
    });
  }
});
