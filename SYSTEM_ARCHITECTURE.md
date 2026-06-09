# CampusCoin System Architecture & Folder Structure

This document provides a comprehensive overview of the CampusCoin project. It covers the high-level system design, the technology stack, and a detailed breakdown of what each folder and key file does.

---

## 1. High-Level System Design

CampusCoin is a **Progressive Web Application (PWA)** built on the **MERN** stack (MongoDB, Express, React, Node.js). It uses a client-server architecture with REST APIs for standard data retrieval and WebSockets for real-time features.

### Architecture Flow:
1. **The Client (Frontend)**: A React application running in the user's browser. It manages local UI state (using React hooks) and global state (using Zustand). When a user takes an action, the frontend sends an HTTP request (via Axios) or a WebSocket event to the backend.
2. **The Gateway & API (Backend)**: An Express.js Node server. It receives requests, validates the incoming data using strict `Zod` schemas, and checks authentication using JWT (JSON Web Tokens) stored securely in HttpOnly cookies.
3. **The Business Logic (Services)**: The backend delegates work to "Services". If a user creates a task, the Task Service handles deducting CampusCoins, creating the task, and saving it to the database.
4. **The Database (MongoDB)**: Data is persistently stored in MongoDB. The backend communicates with MongoDB using `Mongoose` (an Object Data Modeling library).
5. **Real-Time Engine (Socket.io + Redis)**: For real-time chats and notifications, the backend maintains a WebSocket connection with the client. It uses a **Redis Adapter** so that if you deploy multiple backend servers (horizontal scaling), a message sent to Server A can successfully reach a user connected to Server B.
6. **Media Storage (Cloudinary)**: When a user uploads an image, the backend intercepts it and uploads it to Cloudinary, saving only the secure URL in MongoDB to save database space.

---

## 2. Backend Folder Structure (`/backend`)

The backend follows a **Layered Architecture** (Routes -> Controllers -> Services -> Models). This separation of concerns ensures the code is scalable and easy to test.

### `/src` Directory Breakdown

- **`/models`**
  - **Purpose**: Defines the structure of your database collections.
  - **What's inside**: `User.ts`, `Post.ts` (Flex Feed), `Task.ts` (Marketplace), and `Chat.ts`. These files define what fields exist, what types they are, and set up database indexes for fast searching.
  
- **`/routes`**
  - **Purpose**: The "traffic cops" of the API.
  - **What's inside**: Files like `auth.routes.ts` or `swap.routes.ts`. They define the URL endpoints (e.g., `POST /api/v1/swap/tasks`) and specify which controller should handle the request. They also apply middleware (like verifying if the user is logged in).

- **`/controllers`**
  - **Purpose**: The middle-men between routes and services. 
  - **What's inside**: `auth.controller.ts`, `task.controller.ts`. They extract data from the incoming HTTP request (`req.body`, `req.params`), pass it to the appropriate Service, and then send the final HTTP response (e.g., `res.status(200).json(...)`) back to the frontend.

- **`/services`**
  - **Purpose**: The core "brain" and business logic.
  - **What's inside**: `task.service.ts`, `coin.service.ts`. This is where the heavy lifting happens. For example, `coin.service.ts` contains the logic for locking escrow coins, transferring coins, and ensuring atomic database transactions so nobody loses money if the server crashes mid-transfer.

- **`/validations`**
  - **Purpose**: Security and data integrity.
  - **What's inside**: Zod schema files (e.g., `swap.schema.ts`). Before data ever reaches a controller, it is checked against these strict rules to ensure strings aren't too long, numbers are positive, and malicious data is rejected.

- **`/middlewares`**
  - **Purpose**: Reusable functions that run *before* a route's controller.
  - **What's inside**: `auth.middleware.ts` (checks the JWT cookie to identify the user), `validate.middleware.ts` (runs the Zod schemas), and `error.middleware.ts` (catches server crashes and formats them into clean JSON error messages).

- **`/utils`**
  - **Purpose**: Helper functions used across the app.
  - **What's inside**: `cloudinary.ts` (handles image uploads), `logger.ts` (Winston configuration for tracking server events), and `service.helpers.ts` (pagination calculators).

- **`/config`**
  - **Purpose**: Environment and setup logic.
  - **What's inside**: `db.ts` (the script that connects to MongoDB Atlas).

- **`/tests`**
  - **Purpose**: Automated quality assurance.
  - **What's inside**: Jest testing suites (`integration/` and `unit/`) that automatically run your API routes in a temporary database to ensure everything works before deploying to production.

- **`server.ts` & `app.ts`**
  - **Purpose**: The main entry points. `app.ts` sets up Express, security headers (Helmet), and rate limiting. `server.ts` actually turns the server on, connects to the database, and initializes WebSockets.

---

## 3. Frontend Folder Structure (`/frontend`)

The frontend is a React application heavily optimized for speed using Vite. It follows a feature-based structure.

### `/src` Directory Breakdown

- **`/components`**
  - **Purpose**: Reusable, generic UI building blocks.
  - **What's inside**: Generic buttons, layout wrappers, navigation bars, modal dialogs, and loaders. These components don't know anything about the app's business logic; they just display data and handle clicks.

- **`/features`**
  - **Purpose**: Complex, domain-specific modules.
  - **What's inside**: Folders for `auth`, `flex`, `swap`, and `chat`. Each feature folder contains the specific React components related to that domain (e.g., `TaskCard.tsx`, `ChatWindow.tsx`). This prevents the `/components` folder from becoming bloated.

- **`/pages`**
  - **Purpose**: The main "Screens" or "Views" of the app.
  - **What's inside**: `Home.tsx`, `Swap.tsx`, `Profile.tsx`. These files represent entire web pages. They usually just assemble components from `/features` and `/components` together to form a complete screen.

- **`/store`**
  - **Purpose**: Global State Management (using Zustand).
  - **What's inside**: `useAuthStore.ts`, `useCoinStore.ts`. When a user logs in, their data is saved here so it can be instantly accessed by *any* component across the entire app without needing to constantly pass "props" down the component tree.

- **`/lib`**
  - **Purpose**: Third-party library configurations.
  - **What's inside**: `axios.ts` (configures Axios to automatically attach cookies and base URLs to every API request) and `socket.ts` (initializes the Socket.io client).

- **`/hooks`**
  - **Purpose**: Reusable React logic.
  - **What's inside**: Custom hooks like `useSocketEvent` or `useDebounce` that abstract away complex React lifecycles or API fetching logic.

- **`/utils`**
  - **Purpose**: Helper functions.
  - **What's inside**: Date formatting, string capitalization, or specialized calculations.

- **`/assets`**
  - **Purpose**: Static media.
  - **What's inside**: Images, SVGs, and global CSS files (`index.css` where Tailwind is injected).

- **`App.tsx` & `main.tsx`**
  - **Purpose**: The roots of the React tree. `main.tsx` attaches React to the HTML document. `App.tsx` sets up the React Router (which dictates which Page to show based on the URL) and global providers (like Toast notifications).

---

## 4. Why is this design important?

1. **Maintainability**: If there's a bug in how tasks are saved to the database, you know exactly where to look (`backend/src/services/task.service.ts`), rather than digging through hundreds of lines of routing code.
2. **Security**: By utilizing the "Middleware -> Validation -> Controller" flow, malicious data is blocked at the gate before it ever touches your core business logic or database.
3. **Scalability**: Because the frontend handles routing and UI state locally, the backend only has to serve raw JSON data. This, combined with the Redis adapter for WebSockets, means you can handle thousands of concurrent students efficiently.
