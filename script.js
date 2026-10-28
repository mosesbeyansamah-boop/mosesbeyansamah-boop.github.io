// ====== SETTINGS ======
const RECIPIENT_EMAIL = "mosesbeyansamah@gmail.com";
// Messages are delivered to your inbox through FormSubmit (free, no server needed).
const ENDPOINT = "https://formsubmit.co/ajax/" + RECIPIENT_EMAIL;

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const safe = (fn) => { try { return fn(); } catch (e) { return null; } };

// Year
$("#year").textContent = new Date().getFullYear();

// Theme
const root = document.documentElement;
const saved = safe(() => localStorage.getItem("theme"));
if (saved) root.dataset.theme = saved;
const setIcon = () => ($("#themeToggle").textContent = root.dataset.theme === "dark" ? "☀" : "☾");
setIcon();
$("#themeToggle").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  safe(() => localStorage.setItem("theme", root.dataset.theme));
  setIcon();
});

// Mobile menu
const nav = $("#nav"), toggle = $("#menuToggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
$$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", false); }));

// Active nav link
const links = [...$$("#nav a")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((s) => sectionObserver.observe(s));

// Reveal + skill bars
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll?.(".progress span").forEach((b) => (b.style.width = b.dataset.w + "%"));
    revealObserver.unobserve(e.target);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach((el) => revealObserver.observe(el));

// Typing effect
const words = ["Future Software Developer", "IT & Networking Enthusiast", "Problem Solver", "Lifelong Learner"];
let w = 0, c = 0, del = false;
const typing = $("#typingText");
(function type() {
  const word = words[w];
  typing.textContent = word.slice(0, c);
  if (!del && c < word.length) c++;
  else if (!del) { del = true; return setTimeout(type, 1400); }
  else if (c > 0) c--;
  else { del = false; w = (w + 1) % words.length; }
  setTimeout(type, del ? 40 : 80);
})();

// Profile photo (remembered in this browser)
const photo = $("#profilePreview"), ph = $("#profilePlaceholder");
const showPhoto = (src) => { photo.src = src; photo.hidden = false; ph.hidden = true; };
const savedPhoto = safe(() => localStorage.getItem("profilePhoto"));
if (savedPhoto) showPhoto(savedPhoto);
$("#photoInput").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => { showPhoto(r.result); safe(() => localStorage.setItem("profilePhoto", r.result)); };
  r.readAsDataURL(f);
});

// Gallery
$("#galleryInput").addEventListener("change", (e) => {
  [...e.target.files].forEach((f) => {
    const img = document.createElement("img");
    img.alt = "Gallery photo";
    img.src = URL.createObjectURL(f);
    $("#galleryPhotos").appendChild(img);
  });
});

// Contact form
const form = $("#contactForm"), note = $("#formNote"), btn = $("#sendBtn");
const msg = $("#message");
msg.addEventListener("input", () => ($("#count").textContent = msg.value.length + "/1000"));

const say = (text, type) => { note.textContent = text; note.className = "form-note " + (type || ""); };

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if ($("#honey").value) return; // spam trap

  let ok = true;
  ["name", "email", "subject", "message"].forEach((id) => {
    const el = $("#" + id);
    const valid = el.value.trim() && (id !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
    el.closest(".field").classList.toggle("invalid", !valid);
    if (!valid) ok = false;
  });
  if (!ok) return say("Please fill in all fields correctly.", "err");

  btn.disabled = true;
  btn.querySelector(".btn-label").textContent = "Sending...";
  btn.querySelector(".spinner").hidden = false;
  say("");

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: $("#name").value.trim(),
        email: $("#email").value.trim(),
        subject: $("#subject").value.trim(),
        message: $("#message").value.trim(),
        _subject: "Portfolio message: " + $("#subject").value.trim(),
        _replyto: $("#email").value.trim(),
        _template: "table",
        _captcha: "false",
      }),
    });
    const data = await res.json();
    if (!res.ok || data.success === "false") throw new Error(data.message || "Failed");
    form.reset();
    $("#count").textContent = "0/1000";
    say("✅ Thank you! Your message was sent. I'll reply to your email soon.", "ok");
  } catch (err) {
    say("❌ Could not send right now. Please email me directly at " + RECIPIENT_EMAIL, "err");
  } finally {
    btn.disabled = false;
    btn.querySelector(".btn-label").textContent = "Send message ✈";
    btn.querySelector(".spinner").hidden = true;
  }
});