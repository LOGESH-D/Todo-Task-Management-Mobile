# Todo Task Management Mobile App

## Objective
Develop a cross-platform Todo Task Management Mobile App that enables users to log in via social accounts (Google) and manage personal tasks on the go. The app supports full CRUD operations on tasks, with fields like title, description, due date, status, and priority. The UI is clean, intuitive, and responsive for both Android and iOS. Secure API integration with proper authentication and offline support is expected.

## Tech Stack
- **Mobile App:** React Native (Expo)
- **Backend:** Any / Optional (local state for hackathon)
- **Authentication:** Google (OAuth 2.0)

## Features & Scope
### 1. Onboarding & Authentication
- Social login flow using Google
- Error states on login failure

### 2. Task Management
- Full in-app CRUD: Create, Read (List), Update, Mark as Complete, Delete
- Task fields: title, description, due date, status (Not Complete/Complete), priority
- Task data stored in local state (offline support)

### 3. User Experience
- Tabs, filters, and search to find tasks
- No data states when there are no tasks
- Floating Action Button (FAB) for adding tasks
- Smooth animations for list interactions (insertion, deletion, completion)

### 4. Polish & Extras
- Pull-to-refresh and swipe-to-delete
- Crash reporting (Sentry integration, optional)

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/LOGESH-D/Todo-Task-Management-Mobile.git
   cd Todo-Task-Management-Mobile
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the app:**
   ```bash
   npx expo start
   ```
4. **Run on Android/iOS:**
   - Scan the QR code with Expo Go on your mobile device.

## APK
- [Attach your APK download link here after building with EAS or Expo]

## Architecture Diagram
- [Attach or link to your architecture diagram image here]

## Demo Video
- [Loom or similar video link explaining and demonstrating the app]

## Assumptions
- Backend/API is optional for hackathon; all data is stored locally for demo purposes.
- Only Google login is implemented for authentication (others can be added similarly).
- The app is designed primarily for mobile (Android/iOS), but works on web via Expo as well.
- Crash reporting is optional and can be enabled with Sentry or similar.

## Design & Code Quality
- Modular, scalable, and well-named code structure
- Proven design patterns (React Context for state, hooks for logic)
- Good looking, responsive UI
- All code is ready to be explained and demoed live

## Hackathon Statement
This project is a part of a hackathon run by https://www.katomaran.com

---

**Early submission, use of AI tools, and code explanations are encouraged as per hackathon rules.**