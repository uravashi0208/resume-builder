# Resume / Profile Builder — Angular + Node.js + Firebase

Aa app ma:
- Login/Register (Firebase Authentication - email/password)
- Template select karo (2 templates: Classic, Modern)
- **Common reusable form component** (`profile-form`) — badha fields ek j form ma: Full Name,
  Professional Title, Email, Phone, Location, About Me, Education, Core Competencies,
  Technical Skills, Interests, Experience, Social Links
- Data Node.js backend (Express) through **Firestore** ma save/update/delete thay che (CRUD)
- Dashboard par selected template design ma data preview thay

---

## 1. Firebase Project Setup

1. https://console.firebase.google.com par navu project banavo.
2. **Authentication** → Sign-in method → **Email/Password** enable karo.
3. **Firestore Database** → Create database (start in production mode or test mode).
4. **Project Settings → General → Your apps** → Web app (</>) add karo → config copy karo
   → `frontend/src/environments/environment.ts` ma paste karo.
5. **Project Settings → Service Accounts** → "Generate new private key" → JSON download karo
   → `backend/config/serviceAccountKey.json` name thi save karo (a file git ma commit NA karso).

---

## 2. Backend Setup (Node.js + Express + Firestore)

```bash
cd backend
npm install
cp .env.example .env
# .env ma FIREBASE_DATABASE_URL update karo (Firestore vaprta ho to optional pan rakhi shako)
npm run dev
```

Backend `http://localhost:5000` par chalu thashe.

**API Endpoints** (badha `Authorization: Bearer <firebase-id-token>` mangshe):
| Method | Endpoint              | Kaam                         |
|--------|------------------------|-------------------------------|
| POST   | /api/profiles          | Create / Upsert profile       |
| GET    | /api/profiles/me       | Logged-in user no profile     |
| GET    | /api/profiles/:id      | Koi pan ek profile by id      |
| GET    | /api/profiles/all      | Badha profiles list           |
| PATCH  | /api/profiles          | Partial update                |
| DELETE | /api/profiles          | Delete profile                |

---

## 3. Frontend Setup (Angular)

```bash
cd frontend
npm install
npm start
```

App `http://localhost:4200` par khulshe.

**Flow:**
1. `/register` → naya account banavo (Firebase Auth)
2. `/login` → login karo
3. `/template-select` → template choose karo (Classic / Modern)
4. `/profile-form` → **common component** — badha resume fields fill karo → Save
5. `/dashboard` → selected template design ma data joi shako, Edit / Delete kari shako

---

## 4. Project Structure

```
resume-builder-app/
├── backend/                          # Node.js + Express + Firestore
│   ├── config/firebaseAdmin.js
│   ├── middleware/verifyToken.js
│   ├── controllers/profileController.js
│   ├── routes/profileRoutes.js
│   └── server.js
└── frontend/                         # Angular
    └── src/app/
        ├── models/profile.model.ts
        ├── services/auth.service.ts       # Firebase Auth
        ├── services/profile.service.ts    # CRUD API calls
        ├── guards/auth.guard.ts
        └── components/
            ├── login/
            ├── register/
            ├── template-select/
            ├── profile-form/              # ⭐ COMMON REUSABLE FORM COMPONENT
            ├── dashboard/
            └── templates/
                ├── template-one/          # Classic layout
                └── template-two/          # Modern layout
```

---

## 5. Notes

- `profile-form` component **common/reusable** che — kai template select karo, form same j rehse.
  Fakt `template` field value (`template-one` / `template-two`) change thay, jena base par
  dashboard par different design render thay.
- Firestore collection: `profiles`, document ID = user no Firebase `uid` (એટલે per user 1 profile).
- Naya template add karvo hoy to: `components/templates/template-three/` banavo, `app.module.ts`
  ma declare karo, `dashboard.component.html` ma `*ngIf` condition add karo, ane
  `template-select.component.ts` na `templates` array ma entry ADD karo.
