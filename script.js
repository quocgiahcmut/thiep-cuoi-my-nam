/* ====== CẤU HÌNH – chỉnh nội dung thiệp tại đây ====== */
const CONFIG = {
  groom: "Thành Nam",
  bride: "Mỹ Ngọc",
  // Giờ bắt đầu tiệc chính (dùng cho đếm ngược & lịch)
  date: "2027-02-06T11:00:00+07:00",
  events: [
    { title: "Lễ Thành Hôn", time: "09:00", date: "Thứ Bảy, 06/02/2027", place: "Tư gia nhà trai",
      address: "123 Đường Hoa Hồng, Quận 1, TP. Hồ Chí Minh (địa chỉ demo)",
      map: "https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City" },
    { title: "Tiệc Cưới", time: "11:00", date: "Thứ Bảy, 06/02/2027", place: "Trung tâm tiệc cưới Hoa Mai",
      address: "456 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh (địa chỉ demo)",
      map: "https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City" }
  ],
  // Ảnh album: bỏ ảnh vào thư mục images/ rồi sửa danh sách này (để trống ô nào thì hiện nền hồng)
  gallery: ["images/1.jpg","images/2.jpg","images/3.jpg","images/4.jpg","images/5.jpg","images/6.jpg"],
  // Nhạc nền: ví dụ "images/music.mp3" (để "" nếu không dùng)
  music: "",
  // URL Google Apps Script Web App nhận RSVP (xem README). Để "" = chế độ demo (lưu tạm trên trình duyệt)
  rsvpEndpoint: ""
};
/* ====================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

// Tên
$$("[data-groom]").forEach(e => e.textContent = CONFIG.groom);
$$("[data-bride]").forEach(e => e.textContent = CONFIG.bride);

// Khách mời qua ?to=Anh-Nam hoặc ?to=Anh%20Nam
const to = new URLSearchParams(location.search).get("to");
if (to) {
  const name = to.replace(/[-_+]/g, " ").trim().slice(0, 60);
  $("#guestName").textContent = name;
  $("#fName").value = name;
}

// Ngày hiển thị
const target = new Date(CONFIG.date);
$("#heroDate").textContent = target.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " · ");

// Đếm ngược
function tick() {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5); diff %= 864e5;
  const h = Math.floor(diff / 36e5); diff %= 36e5;
  const m = Math.floor(diff / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  $("#cd-d").textContent = d; $("#cd-h").textContent = String(h).padStart(2, "0");
  $("#cd-m").textContent = String(m).padStart(2, "0"); $("#cd-s").textContent = String(s).padStart(2, "0");
}
tick(); setInterval(tick, 1000);

// Sự kiện
$("#eventList").innerHTML = CONFIG.events.map(e => `
  <div class="card reveal">
    <h4>${esc(e.title)}</h4>
    <p class="when">${esc(e.time)} · ${esc(e.date)}</p>
    <p class="where"><b>${esc(e.place)}</b><br>${esc(e.address)}</p>
    <a href="${esc(e.map)}" target="_blank" rel="noopener">Xem bản đồ</a>
  </div>`).join("");

// Thêm vào lịch (.ics)
$("#calBtn").addEventListener("click", () => {
  const fmt = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(target.getTime() + 3 * 36e5);
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Thiep Cuoi//VI","BEGIN:VEVENT",
    `UID:${Date.now()}@thiepcuoi`,`DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(target)}`,`DTEND:${fmt(end)}`,
    `SUMMARY:Đám cưới ${CONFIG.groom} & ${CONFIG.bride}`,`LOCATION:${CONFIG.events.at(-1).place}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })), download: "dam-cuoi.ics" });
  a.click(); URL.revokeObjectURL(a.href);
});

// Album + lightbox
const grid = $("#galleryGrid");
grid.innerHTML = CONFIG.gallery.map(src => `<div class="ph reveal" data-src="${esc(src)}" style="background-image:url('${esc(src)}')"></div>`).join("");
$$(".ph", grid).forEach(el => {
  const img = new Image();
  img.onload = () => el.classList.add("has");
  img.src = el.dataset.src;
});
const lb = document.body.appendChild(Object.assign(document.createElement("div"), { className: "lightbox" }));
lb.addEventListener("click", () => lb.classList.remove("on"));
grid.addEventListener("click", e => {
  const el = e.target.closest(".ph.has"); if (!el) return;
  lb.innerHTML = `<img src="${esc(el.dataset.src)}" alt="Ảnh cưới">`; lb.classList.add("on");
});

// Reveal khi cuộn
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
$$(".reveal").forEach(el => io.observe(el));

// Cánh hoa rơi
function petal() {
  const p = document.createElement("i"); p.className = "petal";
  p.style.left = Math.random() * 100 + "vw";
  p.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
  p.style.animationDuration = 7 + Math.random() * 6 + "s";
  p.style.transform = `scale(${.6 + Math.random() * .8})`;
  $("#petals").appendChild(p); setTimeout(() => p.remove(), 14000);
}

// Mở thiệp + nhạc
const bgm = $("#bgm"), musicBtn = $("#musicBtn");
if (CONFIG.music) { bgm.src = CONFIG.music; musicBtn.hidden = false; }
$("#openBtn").addEventListener("click", () => {
  $("#cover").classList.add("open"); document.body.classList.remove("locked");
  if (CONFIG.music) bgm.play().then(() => musicBtn.classList.add("on")).catch(() => {});
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { for (let i = 0; i < 6; i++) setTimeout(petal, i * 300); setInterval(petal, 1200); }
});
musicBtn.addEventListener("click", () => {
  if (bgm.paused) { bgm.play(); musicBtn.classList.add("on"); } else { bgm.pause(); musicBtn.classList.remove("on"); }
});

// RSVP
$("#rsvpForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, msg = $("#formMsg");
  if (f.website.value) return; // honeypot chống bot
  const data = Object.fromEntries(new FormData(f)); delete data.website; data.time = new Date().toISOString();
  msg.textContent = "Đang gửi...";
  try {
    if (CONFIG.rsvpEndpoint) {
      await fetch(CONFIG.rsvpEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
    } else {
      const old = JSON.parse(localStorage.getItem("rsvp-demo") || "[]"); old.push(data);
      localStorage.setItem("rsvp-demo", JSON.stringify(old));
    }
    msg.textContent = "Cảm ơn bạn! Chúng mình đã nhận được xác nhận ♥";
    f.reset(); if (to) $("#fName").value = to.replace(/[-_+]/g, " ");
  } catch {
    msg.textContent = "Gửi chưa được, bạn thử lại giúp mình nhé.";
  }
});
