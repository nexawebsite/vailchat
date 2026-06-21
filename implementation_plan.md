# Mfumo wa Backend kwa Vailnet Chat App (Node.js & Express)

Lengo la mpango huu ni kutengeneza backend API kamili itakayochukua nafasi ya `mockData` kwenye Frontend. Backend hii itajengwa kwa kutumia **Node.js na Express**, na itakaa ndani ya folder linaloitwa `backend` kama maelekezo ya kazi yanavyotaka. Pia itaruhusu deployment kwenye **Render**.

## User Review Required

> [!IMPORTANT]
> **Database:** Ili kuhifadhi watumiaji (Username, Phonenumber, Password) na meseji, tunahitaji Database. Ninapendekeza tutumie **MongoDB (MongoDB Atlas)** kwa sababu inaendana vizuri sana na Node.js kwa apps za real-time chat. Je, uko sawa na MongoDB au una database nyingine unayotaka kutumia (kama PostgreSQL/MySQL)?

> [!WARNING]
> **Video & Voice Calls:** Kuwezesha Voice na Video calls, tutatumia teknolojia inayoitwa **WebRTC**. Backend yetu (kwa kutumia **Socket.io**) itafanya kazi kama "Signaling Server" ili kuunganisha simu kati ya watumiaji wawili.

## Proposed Changes

Tutatengeneza folder jipya `backend/` ambalo litajitegemea (litakuwa na `package.json` yake) ili iwe rahisi ku-deploy kwenye Render kama Web Service inayojitegemea.

### Backend Infrastructure (Folder: `backend/`)

#### [NEW] `backend/package.json`
- Tuta-initialize mazingira ya Node.js.
- Tutainstall dependencies muhimu: `express`, `mongoose` (kwa database), `socket.io` (kwa real-time), `bcryptjs` (kwa security ya passwords), `jsonwebtoken` (kwa authentication), `cors`, na `dotenv`.

#### [NEW] `backend/server.js`
- Hili ndio litakuwa file kuu (entry point). 
- Lita-configure Express app, CORS (kuruhusu frontend kuwasiliana na backend), na ku-start HTTP server pamoja na Socket.io server.

#### [NEW] `backend/routes/authRoutes.js` na `backend/controllers/authController.js`
- Kutakuwa na API endpoints za `POST /api/auth/register` (kujisajili kwa Username, Phonenumber, Password).
- Endpoint ya `POST /api/auth/login` (kuingia na kupewa JWT Token).

#### [NEW] `backend/models/User.js` na `backend/models/Message.js`
- **User Schema:** Itahifadhi username, phonenumber (unique), password (hashed), na profile details.
- **Message Schema:** Itahifadhi text messages, nani katuma (sender), na nani anapokea (receiver/group).

#### [NEW] `backend/sockets/chatSocket.js`
- Hapa tutaweka logic yote ya Socket.io:
  - Kutuma na kupokea meseji (Text) real-time.
  - Kutuma "Offer", "Answer", na "ICE Candidates" kwa ajili ya kuunganisha **Voice na Video calls (WebRTC)**.

### Frontend Integration (Next.js)

Baada ya Backend kukamilika, tutarudi kwenye Frontend na kufanya haya:
- Kuondoa matumizi ya `lib/mockData.ts`.
- Kuweka `socket.io-client` kwenye Frontend.
- Kuunganisha UI ya Text Chat, Voice Call, na Video Call ili zitumie Backend API.

## Mpango wa Deployment (Render & Vercel)

1. **Backend (Render):** Kwenye Render, tutatengeneza "New Web Service". Tutaichagua hii GitHub repository (`Chief45/chat-system-vail`). Kisha kwenye settings, tutaweka *Root Directory* iwe `backend/`, na *Start Command* iwe `npm start`. Hii itafanya Render i-deploy backend pekee.
2. **Frontend (Vercel):** Frontend itaendelea ku-deploy kama kawaida Vercel, ila tutaweka Environment Variable (mf. `NEXT_PUBLIC_API_URL`) ku-point kwenye URL ya Render backend.

---

> [!NOTE]
> **Hatua inayofuata:** Kama mpango huu uko sawa kwako, nipe idhini (Approve) ili nianze kuandika kodi za Backend hatua kwa hatua!
