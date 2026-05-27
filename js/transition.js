document.body.classList.add("fade-page");

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

document.querySelectorAll("a").forEach(link => {
  if (link.href.includes("#")) return;

  link.addEventListener("click", e => {
    e.preventDefault();
    document.body.classList.remove("fade-in");
    setTimeout(() => {
      window.location = link.href;
    }, 200);
  });
});
