# Huong Dan Su Dung Web Cho Nguoi Moi

Tai lieu nay danh cho nguoi moi vao he thong hoc online. Doc theo thu tu tu tren xuong la dung duoc ngay.

## 1) Khoi dong du an tren may

### Backend (API - C#)

1. Mo terminal:

```powershell
cd C:\Users\TUNG\django-udemy-clone\apps\api
dotnet ef database update
dotnet run
```

2. Mac dinh API chay o `https://localhost:5001` hoac `http://localhost:5000` (tuy cau hinh).

### Frontend (Next.js)

1. Mo terminal moi:

```powershell
cd C:\Users\TUNG\django-udemy-clone\apps\web
npm install
npm run dev
```

2. Mo trinh duyet vao `http://localhost:3000`.

## 2) Dang ky va dang nhap

1. Vao trang `Register` tao tai khoan moi.
2. Dang nhap tai `Login`.
3. Co the dang nhap bang Google (neu da cau hinh `Google Client ID`).
4. He thong co One Tap (goi y dang nhap Google) giong Coursera.
5. Neu ban muon tao khoa hoc, tai khoan can role `Instructor` (hoac `Admin`).

### Cau hinh dang nhap Google (bat buoc neu muon dung)

1. Frontend: mo `apps/web/.env` va them:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

2. Backend: mo `apps/api/appsettings.Development.json` va them:

```
"GoogleAuth": {
  "ClientId": "YOUR_GOOGLE_CLIENT_ID"
}
```

3. Khoi dong lai ca API va Frontend.

## 3) Luong cho hoc vien

1. Vao danh sach khoa hoc, chon khoa hoc muon hoc.
2. Bam `Enroll` de dang ky.
3. Vao trang hoc (`/learn/[slug]`) de hoc tung lesson.
4. Ben phai co danh sach lesson + tien do.
5. Neu lesson la video, xem xong co the danh dau hoan thanh.
6. Neu lesson la exercise, can lam bai dat yeu cau moi mo khoa tiep theo.

## 4) Lam bai tap (Quiz) trong lesson

He thong moi da co cac tinh nang:

- Nhieu cau hoi trong 1 lesson.
- Cham diem theo phan tram.
- Muc diem dat (passing score), vi du 80%.
- Gioi han thoi gian (timer), co dem nguoc.
- Gioi han so lan doi tab.
- Ket qua chi tiet tung cau: ban chon gi, dap an dung la gi, giai thich.

### Cach lam bai

1. Chon dap an cho tung cau.
2. Bam `Submit answers`.
3. Xem ket qua:
   - Score (%)
   - So cau dung / tong so cau
   - Dat/khong dat
   - Co bi timeout hay vuot gioi han doi tab khong
4. Neu chua dat, co the lam lai.

### Luu y quan trong

- Neu timeout thi bai se khong dat.
- Neu doi tab qua so lan cho phep thi bai se khong dat.
- Khi chua pass, lesson tiep theo bi khoa.

## 5) Chuyen ngon ngu Viet/Anh (toan web)

Nut chuyen ngon ngu nam tren header, ap dung cho toan bo trang:

- `VI`: Tieng Viet
- `EN`: Tieng Anh

Web se luu lua chon vao localStorage (`app:locale`) de lan sau mo lai van giu nguyen.
Trang hoc (`/learn/[slug]`) se tu dong lay theo `app:locale` neu co.

## 6) Luong cho giang vien (Instructor)

Vao `Studio` de quan ly khoa hoc:

### Tao/sua khoa hoc

1. Nhap thong tin co ban: title, category, description, outcome, requirements...
2. Upload thumbnail.
3. Dat trang thai publish.

### Them lesson video

1. Chon `Lesson type = Video`.
2. Nhap video URL hoac upload video.
3. Dat duration + sort order.
4. Bam `Add lesson`.
5. Neu upload Cloudflare fail, he thong se tu dong fallback upload local.

### Them lesson exercise (quiz)

1. Chon `Lesson type = Exercise`.
2. Dat:
   - `Passing score (%)`
   - `Time limit (minutes)`
   - `Max tab switches`
3. Them tung cau hoi:
   - Noi dung cau hoi
   - 4 lua chon A/B/C/D
   - Dap an dung
   - Giai thich (optional)
4. Bam `Add another question` neu muon them cau.
5. Bam `Add lesson` de luu.

## 7) Cac loi thuong gap va cach xu ly

### Khong dang nhap duoc

- Kiem tra API co dang chay khong.
- Kiem tra token co het han khong.
- Thu dang xuat roi dang nhap lai.

### Trang hoc bao khong co bai tap

- Kiem tra lesson co `contentType = exercise`.
- Kiem tra da nhap day du cau hoi va dap an trong Studio.

### Submit bai tap that bai

- Kiem tra ket noi API.
- Kiem tra token dang nhap.
- Thu refresh trang roi submit lai.

### Khong mo duoc lesson tiep theo

- Thuong la do lesson exercise hien tai chua dat.
- Hoan thanh quiz dat passing score de mo khoa tiep.

### Upload video bi fail

- Kiem tra Cloudflare Stream (AccountId, ApiToken, CustomerCode).
- Neu fail, he thong se tu dong upload local o `apps/api/wwwroot/uploads/videos`.

## 8) Checklist nhanh cho nguoi moi

- [ ] Da chay API
- [ ] Da chay Frontend
- [ ] Da dang ky/dang nhap
- [ ] Da enroll khoa hoc
- [ ] Da vao trang hoc
- [ ] Da lam xong lesson exercise (neu co)
- [ ] Da thu chuyen ngon ngu VI/EN

---
