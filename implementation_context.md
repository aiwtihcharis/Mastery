# Implementation Context

## 1. Authentication & Profile
- **Current State:** Dedicated Auth Page (Login/Signup).
- **Flow:** Loading Screen -> Auth Page -> Onboarding (if new) -> Dashboard.
- **Persistence:** Uses Firebase Auth persistence. Onboarding status stored in `user_data/profile/onboardingComplete`.

## 2. Theme Engine
- **Strategy:** Using a simple state in `App.tsx` that toggles a `dark` class on the root `div` (or `body` via effect).
- **Default:** Defaults to Dark mode (as per original design), but togglable to Light mode.

## 3. AI Coach UI Overhaul
- **Layout:** "Hero" style layout with Collapsible Sidebar.
- **Navigation:** Global Navigation moves to the **Top** for this view.
- **Components:**
    - **Sidebar:** Collapsible, Searchable history, "New Chat" button.
    - **Hero Input Area:** Centered "Hey, {Name}" greeting. Distinct "Glow" style input bar.
    - **Capabilities:**
        - **File Upload:** Visual feedback for uploads.
        - **Voice Input:** Webkit Speech Recognition.
    - **Chat History:** Mocked data to demonstrate search and list functionality.

## 4. Onboarding
- **Steps:** 4-Step Process (Identity, Role, Focus, Commitment).
- **Storage:** Data saved to Firestore profile document.

## 5. Visual Style
- **Transitions:** 0.5s blur/fade transition between all main views.
- **Aesthetic:** Premium SaaS, Bricolage Grotesque font, thin borders, glass effects.
