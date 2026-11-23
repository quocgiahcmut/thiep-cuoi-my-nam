# Thiệp cưới Thành Nam & Mỹ Ngọc

Static site (HTML/CSS/JS), không cần build. Deploy bằng GitHub Pages qua GitHub Actions.

## Chỉnh nội dung
- Tên, ngày giờ, địa điểm, danh sách ảnh, nhạc, endpoint RSVP: sửa `CONFIG` ở đầu `script.js`.
- Ảnh: bỏ vào `images/` (`1.jpg`…`6.jpg`, `groom.jpg`, `bride.jpg`, `og.jpg` 1200x630 cho ảnh chia sẻ, `qr-groom.png`, `qr-bride.png`). Nén WebP/JPG dưới ~300KB mỗi ảnh.
- Cá nhân hóa lời mời: `https://.../?to=Anh-Nam` hiện "Trân trọng kính mời Anh Nam".

## Chạy thử local
    npx serve .

## Deploy lên GitHub Pages
    git init -b main
    git add .
    git commit -m "Thiep cuoi"
    gh repo create thiep-cuoi-my-nam --public --source=. --push
    gh api -X POST repos/:owner/thiep-cuoi-my-nam/pages -f build_type=workflow
Sau 1–2 phút thiệp ở `https://<username>.github.io/thiep-cuoi-my-nam/`.
(Không dùng gh CLI: tạo repo trên web, `git remote add origin ...`, `git push -u origin main`, rồi vào Settings > Pages > Source chọn **GitHub Actions**.)

## RSVP vào Google Sheets
Xem `apps-script.gs`. Có thể xóa file này khỏi repo sau khi dùng nếu không muốn public.
