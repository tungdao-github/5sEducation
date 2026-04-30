# Web Frontend

Day la frontend Next.js chinh cua du an.

## Chay local

```bash
npm run dev
```

Mo:

```text
http://localhost:3000
```

## Cau truc quan trong

- `src/app`: route App Router
- `src/components`: UI va feature component dang duoc su dung
- `src/contexts`: state/context dung cho app
- `src/services`: API/service layer
- `src/lib`: API client, i18n, auth helper

## Ghi chu

- `apps/web` la frontend Next.js duy nhat cua du an.
- Cac thu muc duplicate/legacy nhu `src (1)`, `codefigma`, `src/figma` khong thuoc luong production.
- Frontend can backend `apps/api` de lay du lieu that.

