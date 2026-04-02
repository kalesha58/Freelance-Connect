# 📱 Tasker Mobile Application

A comprehensive Freelance Marketplace platform connecting skilled professionals (**Taskers**) with clients (**Requester/Hiring Partner**). Tasker provides a seamless, real-time environment for hiring, task management, and professional growth.

---

## 👥 User Roles

1.  **Freelancer / Tasker**: Skilled professionals looking to showcase their portfolio, apply for jobs, and earn through the platform.
2.  **Requester / Hiring Partner**: Individuals or businesses looking to post jobs and hire top talent efficiently.

---

## 🏗️ Screen Architecture (≈ 48 Screens)

### 🔐 1. Authentication (Common)
*   **Splash Screen**: App Branding & Auto-token check.
*   **Onboarding**: Platform introduction highlighting "Hire Skilled People" and "Earn as Freelancer".
*   **Role Selection**: Toggle between Tasker or Hiring Partner.
*   **Signup & Login**: Secure email/phone-based authentication.
*   **Forgot Password Flow**: OTP verification & secure reset.

### 👨‍💼 2. Freelancer / Tasker Experience
*   **Profile Setup**: Multi-step onboarding (Basic Info, Multi-select Services, Education & Experience).
*   **Portfolio Management**: High-quality media uploads with titles, descriptions, and tags.
*   **Job Discovery**: Real-time Job Feed with category/budget/location filters.
*   **Messaging & Proposals**: Direct chat with clients, proposal submission, and attachment support.
*   **Social & Engagement**: Personal post creation, activity dashboard, and professional insights (likes/views/requests).
*   **Growth**: Post boosting for visibility and subscription management.

### 🧑‍💼 3. Requester / Hiring Partner Experience
*   **Discover Talent**: Specialized Tasker List with deep-dive profiles (reviews/portfolios).
*   **Job Posting**: Structured job creation (Title, Budget, Deadline, Attachments).
*   **Job Management**: Dashboard for Active/Completed jobs and applicant tracking.
*   **Hiring Flow**: Reviewing applicants, direct chatting, and hire confirmation.

### 🔁 4. Shared Components
*   **Notifications**: Real-time alerts for jobs, messages, and engagement.
*   **Search & Discovery**: Global search with advanced modal filters.
*   **Security**: Report/Block functionality.
*   **Social Proof**: Comprehensive ratings and reviews system.

### ⚙️ 5. System & Utilities
*   **Settings**: Account management and preferences.
*   **Support**: Help center, T&C, and Privacy Policy.
*   **Logout**: Secure session termination.

---

## 🚀 Advanced Features

*   **Wallet & Earnings**: Transparent financial tracking for Taskers.
*   **Gig Packages**: Tiered service offerings (Basic / Standard / Premium).
*   **Video Intro**: Personality-focused video uploads for profiles.
*   **AI Matching**: Intelligent freelancer recommendations based on job requirements.
*   **Availability Calendar**: Real-time scheduling for Tasker services.

---

## 💰 Monetization & Growth

*   **Freemium Chat**: Chat unlock after 3 free clients to encourage subscriptions.
*   **Subscription Model**: Unlimited chat and advanced features for power users.
*   **Post Boosting**: Paid visibility feature for Taskers to reach more clients.
*   **Engagement Tracking**: Built-in insights to help freelancers optimize their reach.

---

## 🛠️ Technical Stack (React Native)

*   **Framework**: React Native
*   **Language**: TypeScript
*   **State Management**: React Context / Redux (as applicable)
*   **Navigation**: React Navigation
*   **API Layer**: Axios / TanStack Query
*   **Styling**: StyleSheet.create / Styled Components
*   **Theming**: Complete Dark/Light mode support

---

## 🏁 Getting Started

### Prerequisites
*   Node.js (LTS)
*   React Native CLI / Expo CLI
*   Android Studio / Xcode

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/kalesha58/Freelance-Connect.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the application:
    ```bash
    # Android
    npm run android
    
    # iOS
    npm run ios
    ```

---

## 🔔 Important Notes
*   **Portfolio is Critical**: High emphasis on visual presentation for Taskers.
*   **Theme Support**: Ensure all UI elements work seamlessly in both Dark and Light modes.
*   **Cross-Platform**: Icons and UI elements optimized for both iOS and Android.

---
*Created for Freelance-Connect Project*
