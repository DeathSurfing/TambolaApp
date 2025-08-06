## 🧩 Smart Tambola Web App – Development Artifacts

This document includes the structured specifications (artifacts) for both the **frontend** and **backend** of the Smart Tambola Web App.

---

## 🎨 Frontend Artifact (Next.js + Tailwind CSS + ShadCN)

### 🛠️ Tech Stack

* **Next.js (App Router)**
* **Tailwind CSS** (without hardcoded colors)
* **ShadCN UI** (with no colors for future `tweakcn` theming)
* **Framer Motion** for animation

### 🔧 UI Components

#### 1. Ticket Generator

* Page: `/tickets`
* Components:

  * `TicketGrid` – renders 3x9 grid
  * `GenerateTicketsForm` – ticket count input (default: 6)
  * `AnimatedTicketReveal` – animation wrapper

#### 2. Number Picker

* Page: `/play`
* Components:

  * `CurrentNumberDisplay` – highlights current number
  * `HistoryPanel` – shows all picked numbers
  * `PickNumberButton` – triggers new number
  * `SpeechSynth` – calls `SpeechSynthesisUtterance`

#### 3. General UI

* Mobile-first responsive layout
* Dark mode enabled
* Uses `@/components/ui/*` from ShadCN
* No `cn()` or custom colors applied

### 📁 Suggested Folder Structure

```
app/
  layout.tsx
  page.tsx
  /tickets
    page.tsx
  /play
    page.tsx
components/
  TicketGrid.tsx
  AnimatedTicketReveal.tsx
  NumberDisplay.tsx
  HistoryPanel.tsx
lib/
  api.ts // wrapper for backend calls
```

### 🧾 Frontend Schemas (from Backend)

These TypeScript types match the backend API response structures.

```
export type Cell = number | null;

export type Ticket = {
  id: string;
  grid: Cell[][]; // 3x9 grid
};

export type GameState = {
  current_number: number | null;
  picked_numbers: number[];
  remaining_numbers: number[];
};

export type AnnounceResponse = {
  spoken: string;
};
```

---

## 🧪 Backend Artifact (FastAPI)

### 🛠️ Tech Stack

* **FastAPI**
* **Pydantic**
* **SQLite** as the default database
* **SQLModel (or SQLAlchemy)**
* **SQLite**

### 📌 API Endpoints

#### 🎫 Ticket Generator

`POST /api/tickets/generate`

* Input: `{ count: int }`
* Output: List of generated ticket grids

#### 🔢 Number Picker

`POST /api/game/start`

* Resets/initializes number pool

`POST /api/game/pick`

* Picks one unused number from pool
* Returns: `{ number: int, history: List[int] }`

`GET /api/game/state`

* Returns current game state:

  ```
  {
    "current_number": 47,
    "picked_numbers": [3, 17, 47],
    "remaining_numbers": [1,2,4,5,...]
  }
  ```

#### 🔊 Voice Text Helper

`GET /api/announce/{number}`

* Returns: `{ "spoken": "fifty-five" }`

#### ♻️ Game Reset (Optional)

`POST /api/game/reset`

* Clears game state and history

### 🗄️ Database

* Use **SQLite** as the backend database.
* Use **SQLModel** or **SQLAlchemy ORM** for data persistence.
* Store game sessions, picked numbers, and ticket records in the database.

### 📦 Data Models

```
class Cell(BaseModel):
    value: Optional[int]  # None means blank

class Ticket(BaseModel):
    id: UUID
    grid: List[List[Optional[int]]]

class GameState(BaseModel):
    current_number: Optional[int]
    picked_numbers: List[int]
    remaining_numbers: List[int]
```

### 📁 Suggested Folder Structure

```
app/
  main.py
  api/
    tickets.py
    game.py
    announce.py
models/
  ticket.py
  game.py
schemas/
  ticket.py
  game.py
utils/
  generator.py  # ticket logic
  announcer.py  # number to words
```

---

### Ticket Format

* Each ticket is a **9x3 grid** (9 columns, 3 rows)
* **Each row has exactly 5 numbers** and 4 blanks (i.e., 15 numbers per ticket)
* Numbers range from **1 to 90**, and must be unique in each ticket

### Column Constraints

* Each column `i` (1-indexed) contains numbers from:

  * Column 1 → 1–10
  * Column 2 → 11–20
  * ...
  * Column 9 → 81–90

### Constraints

* A number must appear only once in the entire ticket
* Each column must have at least one number
* Rows should be randomly filled while satisfying all constraints

### Requirements

* Generate a **single ticket** or **multiple tickets** (e.g., 6 per sheet)
* Return ticket(s) as a list of 2D arrays (rows with numbers and `null`/empty for blanks)

### Endpoint

* `POST /tickets/generate`
* Request: `{ "count": 6 }`
* Response: JSON list of ticket grids

---

## 🔢 Random Number Picker

Create a backend-powered **Number Picker** for the game:

### Logic

* Pick numbers randomly from **1 to 90**
* Ensure **no repetition**; once a number is picked, it cannot be picked again
* Maintain a **history of called numbers**
* Provide:

  * Current picked number
  * All previous numbers (in order)
  * Remaining numbers
  * Reset functionality

### Endpoints

* `POST /picker/start` – Start a new session (optionally clear history)
* `POST /picker/next` – Pick next number randomly
* `GET /picker/status` – Get:

  * current number
  * history
  * remaining numbers
* `POST /picker/reset` – Reset the picker (clears history)

---

## 🗃️ Database Schema (SQLite)

Use `sqlalchemy` models for:

### `Ticket`

* `id`: int
* `grid`: JSON (2D array of numbers and blanks)

### `NumberSession`

* `id`: UUID
* `history`: List\[int] – numbers called
* `remaining`: List\[int] – numbers not yet called
* `current_number`: Optional\[int]

Store each session separately if supporting multiplayer or persistent games.

---

## ✅ Additional Backend Features

* CORS middleware for frontend
* Use `.env` to store database URL
* Organize routers: `ticket_router`, `picker_router`
* Add logging for debug

Let me know if you’d like me to generate the actual code for either or both parts!

