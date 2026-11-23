/* ====== CẤU HÌNH – chỉnh nội dung thiệp tại đây ====== */
const CONFIG = {
  groom: "Thành Nam",
  bride: "Mỹ Ngọc",
  // Giờ bắt đầu tiệc chính (dùng cho đếm ngược & lịch)
  date: "2027-01-19T11:00:00+07:00",
  events: [
    { title: "Lễ Thành Hôn", time: "09:00", date: "Thứ Ba, 19/01/2027", place: "Tư gia nhà trai",
      address: "123 Đường Hoa Hồng, Quận 1, TP. Hồ Chí Minh (địa chỉ demo)",
      map: "https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City" },
    { title: "Tiệc Cưới", time: "11:00", date: "Thứ Ba, 19/01/2027", place: "Trung tâm tiệc cưới Hoa Mai",
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
const vnDate = new Date(target.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
const DOW = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
$("#heroDate").textContent = `${DOW[vnDate.getDay()]}, ${vnDate.getDate()} tháng ${vnDate.getMonth() + 1}, ${vnDate.getFullYear()}`;

// Tờ lịch tháng cưới (tuần bắt đầu Thứ Hai), ngày cưới khoanh tim
(() => {
  const y = vnDate.getFullYear(), mo = vnDate.getMonth(), day = vnDate.getDate();
  const offset = (new Date(y, mo, 1).getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  let cells = ["T2","T3","T4","T5","T6","T7","CN"].map(d => `<span class="dow">${d}</span>`).join("");
  cells += "<span></span>".repeat(offset);
  for (let d = 1; d <= days; d++) {
    cells += d === day
      ? `<span class="day-big" aria-label="Ngày cưới ${d}"><svg viewBox="0 0 40 36" aria-hidden="true"><use href="#heart"/></svg>${d}</span>`
      : `<span>${d}</span>`;
  }
  $("#calendar").innerHTML = `<div class="cal-head">Tháng ${mo + 1}, ${y}</div><div class="cal-grid">${cells}</div>`;
})();

// Chạm vào chú rể
const lines = ["Tụi mình cưới nhau rồi!", "Đừng chọc bụng anh mà!", "Nhớ đến ăn cỗ nha!", "Bụng này là bụng hạnh phúc đó.", "Vợ anh xinh chưa?", "Hẹn gặp bạn ngày 19/1 nhé!"];
let li = 0;
const groomBtn = $("#groomBtn"), bubble = $("#bubble");
groomBtn.addEventListener("click", () => {
  li = (li + 1) % lines.length; bubble.textContent = lines[li];
  groomBtn.classList.remove("hop"); void groomBtn.offsetWidth; groomBtn.classList.add("hop");
});
groomBtn.addEventListener("animationend", e => { if (e.animationName === "hop") groomBtn.classList.remove("hop"); });

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
  <div class="ev">
    <h3>${esc(e.title)}</h3>
    <p class="when">${esc(e.time)}, ${esc(e.date)}</p>
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
grid.innerHTML = CONFIG.gallery.map(src => `<button type="button" class="ph" aria-label="Xem ảnh" data-src="${esc(src)}" style="background-image:url('${esc(src)}')"></button>`).join("");
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

// Cánh hoa rơi
function petal() {
  const p = document.createElement("i"); p.className = "petal";
  const c = ["#FF6F91","#FFC94A","#7CC6A4","#FF9FB2"][Math.floor(Math.random() * 4)];
  p.innerHTML = `<svg viewBox="0 0 40 36"><path d="M20 33 C6 23 2 16 2 10 C2 5 6 2 11 2 C15 2 18 4 20 8 C22 4 25 2 29 2 C34 2 38 5 38 10 C38 16 34 23 20 33 Z" fill="${c}" stroke="#3D2C4E" stroke-width="4"/></svg>`;
  p.style.setProperty("--rot", (Math.random() * 360 - 180) + "deg");
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
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { for (let i = 0; i < 6; i++) setTimeout(petal, i * 300); setInterval(petal, 1800); }
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
    msg.textContent = "Đã gửi! Cảm ơn bạn, hẹn gặp ở đám cưới nha.";
    f.reset(); if (to) $("#fName").value = to.replace(/[-_+]/g, " ");
  } catch {
    msg.textContent = "Chưa gửi được. Bạn kiểm tra mạng rồi bấm gửi lại nhé.";
  }
});
