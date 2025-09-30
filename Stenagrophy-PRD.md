# Product Requirements Document (PRD): SteganoWeb App

## 1. Document Overview
### 1.1 Purpose
This Product Requirements Document outlines the functional, non-functional, and technical requirements for SteganoWeb, a web application that enables users to perform steganography operations on images. Steganography involves embedding hidden text messages within images without visibly altering them. The app aims to provide an accessible, user-friendly platform for both educational/honest and creative/nefarious use cases, while incorporating monetization through freemium and paid packages.

### 1.2 Scope
- **In Scope**: Landing page, user registration/authentication, steganography editing and verification, payment integration, usage tracking, basic security measures.
- **Out of Scope**: Advanced image editing beyond steganography, mobile app versions, multi-user collaboration, custom encryption beyond basic text embedding.
- **Assumptions**: Users will upload benign images; the app will not support embedding executable code or files, only plain text to mitigate risks. Integration with external services (e.g., Google Gemini API for image processing via a fictional "Nano Banana" service) will be optional for enhancement.

### 1.3 Target Audience
- Hobbyists and educators interested in digital forensics or cryptography.
- Creative users for fun or artistic purposes.
- Individuals seeking discreet communication (honest: journalists in restricted areas; nefarious: evading surveillance).

### 1.4 Key Stakeholders
- Product Owner: [User/Developer]
- Developers: Front-end (HTML/CSS/JS), Back-end (e.g., Node.js/Python), DevOps for Docker.
- Users: Free and paying customers.
- External: Stripe for payments, Google for OAuth.

### 1.5 Version History
- Version 1.0: Initial draft (September 28, 2025).

## 2. Business Objectives
- Provide a simple tool for steganography to educate and entertain users.
- Monetize through tiered packages after one free daily edit.
- Ensure security to prevent site exploitation via malicious uploads.
- Achieve a vibrant, engaging UI to drive user adoption.

## 3. Functional Requirements
### 3.1 Landing Page
- **Design**: Vibrant and catchy layout with bold colors (e.g., neon gradients), eye-catching animations (e.g., subtle image distortions revealing hidden text), and high-quality stock images demonstrating steganography.
- **Content**:
  - Headline: "Unlock the Hidden: SteganoWeb – Hide Messages in Plain Sight!"
  - Sections outlining reasons to use steganography:
    - **Honest Reasons**:
      - Educational: Learn about digital watermarking for copyright protection.
      - Secure Communication: Journalists embedding sources in photos without detection.
      - Fun: Hide Easter eggs in family photos or memes.
    - **Nefarious Reasons** (presented humorously but clearly, with disclaimers):
      - Sneaky Messaging: Bypass content filters or share secrets undetected.
      - Pranks: Embed embarrassing messages in shared images.
      - Evasion: Hide data from casual observers (e.g., in social media posts).
  - Disclaimer: "SteganoWeb promotes ethical use; misuse is at your own risk and may violate laws."
- **Call to Action**:
  - Prominent button: "Steganography My Image".
  - Text below: "One Steganography edit is free, sign up for more."
- **Behavior**: Button redirects unauthenticated users to the registration page; authenticated users to the steganography page (after usage checks).

### 3.2 Registration and Authentication
- **Page Layout**: Simple form with Google OAuth button and email/password fields.
- **Features**:
  - Google OAuth: Integrate via Google API for quick sign-up/login.
  - Email/Password: Require email verification; password must be at least 8 characters with one uppercase, one number, and one special character.
  - Upon registration: Grant 1 free daily steganography edit credit.
- **User Tracking**: Store user data in a database (e.g., MongoDB/PostgreSQL) including edit credits, purchase history, and daily free edit usage (reset at midnight UTC).

### 3.3 Payment and Packages
- **Integration**: Use Stripe API for secure payments.
- **Packages**:
  - 25 edits: $50.
  - 50 edits: $65.
  - 100 edits: $75.
- **Payment Flow**:
  - Dedicated payments page accessible from user dashboard.
  - After purchase, add credits to user's account.
  - Support one-time payments; no subscriptions.
- **Usage Checks**:
  - On accessing steganography page: Check if user has purchased credits > 0; if not, check if free daily edit is available.
  - If exhausted: Prompt to purchase with links to packages.
  - Deduct 1 credit per successful edit (free or paid).

### 3.4 Steganography Page
- **Core Functionality**:
  - **Upload Section**: Allow upload of one image (formats: JPEG, PNG; max size: 5MB).
  - **Embed Text**: Text input field (max 1000 characters); button to embed using LSB (Least Significant Bit) method or similar non-destructive technique.
  - **Optional Enhancement**: If using Google Gemini API key, integrate with "Nano Banana" image editing service for pre-processing (e.g., optimize image for better hiding capacity or add AI-generated overlays). Prompt user for confirmation if AI assistance is needed.
  - **Output**: Downloadable steganographic image.
- **Verification Section**:
  - Upload field for steganographic image.
  - Button to extract and display hidden text.
- **Security Measures** (see Section 5):
  - Process images server-side in a sandboxed environment.
  - Validate uploads: Scan for malware (integrate with antivirus API if possible); reject if suspicious.
  - Limit to text-only embedding; no file or code support.

### 3.5 User Dashboard
- View remaining credits, purchase history, and daily free edit status.
- Logout button.

### 3.6 Error Handling and Feedback
- User-friendly messages (e.g., "You've used your free edit today – upgrade now!").
- Loading indicators for image processing.

## 4. Non-Functional Requirements
### 4.1 Performance
- Page load time: < 2 seconds.
- Image processing: < 10 seconds for embedding/verification.
- Scalability: Handle up to 100 concurrent users initially.

### 4.2 Usability
- Responsive design for desktop/mobile.
- Accessibility: WCAG 2.1 compliance (e.g., alt text for images, keyboard navigation).

### 4.3 Reliability
- Uptime: 99%.
- Backup user data daily.

### 4.4 Technical Stack (Recommended)
- **Front-end**: React.js or Vue.js for dynamic UI.
- **Back-end**: Node.js/Express or Python/Flask for API endpoints.
- **Database**: MongoDB for user and credit data.
- **Image Processing**: Libraries like Pillow (Python) or Sharp (Node.js) for steganography; optional Google Gemini API integration for advanced features.
- **Authentication**: Passport.js or similar for OAuth and sessions.
- **Payments**: Stripe SDK.

## 5. Security Considerations
- **Risks**: Steganographic images could embed malicious code (e.g., scripts exploiting vulnerabilities).
- **Mitigations**:
  - Server-side only processing: Never execute image content; treat as data.
  - Sandboxing: Use containerized environments (aligns with Docker deployment).
  - Input Validation: Sanitize text inputs; limit image types/sizes.
  - Rate Limiting: Prevent DDoS (e.g., 5 uploads/hour per IP for free users).
  - HTTPS: Enforce for all traffic.
  - Logging: Monitor for suspicious activity (e.g., repeated failed verifications).
  - Compliance: GDPR for user data; no storage of uploaded images beyond processing.

## 6. Deployment Requirements
- **Build**: Use Docker Compose for containerization.
  - Services: Web server, database, optional worker for image processing.
  - Dockerfile for each component.
- **Hosting**: Deploy on a server/VM; expose on port 5678.
- **Environment**: Production-ready with environment variables for API keys (e.g., Google Gemini, Stripe).
- **CI/CD**: Optional integration with GitHub Actions for builds.

## 7. Testing Requirements
- **Unit Tests**: For steganography logic (embed/extract accuracy).
- **Integration Tests**: Authentication, payments, usage checks.
- **Security Tests**: Penetration testing for upload vulnerabilities.
- **User Acceptance**: Verify UI flow from landing to edit.

## 8. Timeline and Milestones (High-Level)
- Week 1: Design landing/registration pages.
- Week 2: Implement authentication and database.
- Week 3: Steganography core + verification.
- Week 4: Payments and usage tracking.
- Week 5: Security audits, Docker setup, deployment.

## 9. Appendices
### 9.1 User Stories
- As a visitor, I want a catchy landing page so I can understand steganography's appeal.
- As a new user, I want to register via Google or email so I can access free edits.
- As a registered user, I want to embed text in an image so I can create hidden messages.
- As a user, I want to verify hidden text so I can confirm embedding success.
- As a paying user, I want to buy edit packages via Stripe so I can perform more operations.

### 9.2 Risks and Dependencies
- Dependency: Google Gemini API key for optional features; fallback to basic steganography if unavailable.
- Risk: Legal issues from nefarious use – mitigate with disclaimers and monitoring.