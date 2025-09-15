# AutoHire.ai

A modern, web-based hiring platform designed to streamline the technical interview process with distinct experiences for candidates and HR administrators.

## 🚀 Features

### 🎯 Landing & Authentication
- **Modern Landing Page**: Interactive, animated background with globe and tech-themed SVGs
- **Email-Based Authentication**: Simple login system using only email addresses
- **Role-Based Access**: Automatic role detection (Admin vs Candidate)
- **Session Management**: Persistent sessions with 24-hour expiry stored in localStorage

### 👨‍💼 Admin Panel (HR View)
Access with `hr@microsoft.com` to unlock the full admin experience:
- **Dashboard**: Comprehensive metrics and analytics overview
- **Schedule Interview**: Easy-to-use interview scheduling system
- **Candidates Management**: View and manage all candidates with search and filtering
- **Reports & Analytics**: Interview statistics and performance insights

### 👨‍💻 Candidate Dashboard
Available for all non-admin users:
- **Welcome Dashboard**: Personalized experience with user-specific content
- **Practice Mode**: Interactive coding problems with built-in editor
- **Quick Start**: Fast-track assessment sessions
- **Progress Tracking**: Personal statistics and achievement metrics

### 🧑‍💻 Practice Environment
- **Interactive Code Editor**: Multi-language support (JavaScript, Python, Java, C++)
- **Problem Library**: Curated coding challenges with varying difficulty levels
- **Real-time Execution**: Run and test code directly in the browser
- **Detailed Problem Descriptions**: Examples, constraints, and hints for each problem

## 🛠️ Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router DOM for SPA navigation
- **Build Tool**: Vite for fast development and building
- **State Management**: React Context API with custom hooks

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd autohire-ai-vite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 🔐 Authentication Guide

### Admin Access
- **Email**: `hr@microsoft.com`
- **Features**: Full admin panel with all management capabilities

### Candidate Access
- **Email**: Any valid email address (except `hr@microsoft.com`)
- **Features**: Practice environment and personal dashboard

## 📱 User Experience

### 🎨 Design Principles
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Optimized for desktop and mobile devices
- **Accessibility**: Focus management and keyboard navigation support
- **Performance**: Lazy loading and optimized animations

### 🔄 Session Management
- **Automatic Login**: Sessions persist across browser refreshes
- **24-Hour Expiry**: Automatic logout after session timeout
- **Role Persistence**: User roles maintained throughout the session
- **Secure Storage**: Session data safely stored in localStorage

## 🎯 Key Components

### Authentication System
- `useAuth` hook for session management
- Role-based route protection
- Persistent session storage
- Email validation and error handling

### Animated Background
- SVG-based animations using Framer Motion
- Tech-themed icons (globe, code, brain, etc.)
- Floating particles for enhanced visual appeal
- Performance-optimized animations

### Practice Environment
- Monaco-like code editor experience
- Multi-language syntax support
- Problem categorization by difficulty
- Real-time code execution simulation

### Admin Dashboard
- Tabbed interface for different admin functions
- Data visualization with charts and metrics
- Advanced filtering and search capabilities
- Responsive table layouts for data management

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnimatedBackground.tsx
│   └── index.ts
├── pages/              # Main application pages
│   ├── LandingPage.tsx
│   ├── CandidateDashboard.tsx
│   ├── AdminPanel.tsx
│   ├── PracticePage.tsx
│   └── index.ts
├── hooks/              # Custom React hooks
│   └── useAuth.tsx
├── utils/              # Utility functions
│   └── auth.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── App.css             # Global styles
```

## 🎨 Styling & Theming

- **Color Palette**: Modern gradient scheme with blue and purple accents
- **Typography**: System fonts with careful hierarchy
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Animations**: Subtle micro-interactions for better UX
- **Dark Mode**: Ready for dark mode implementation

## 🔧 Customization

### Adding New Problems
Edit the `mockProblems` array in `PracticePage.tsx`:

```typescript
const newProblem: Problem = {
  id: 'unique-id',
  title: 'Problem Title',
  difficulty: 'Easy' | 'Medium' | 'Hard',
  description: 'Problem description...',
  examples: [...],
  constraints: [...]
};
```

### Modifying Authentication
Update the admin email in `src/utils/auth.ts`:

```typescript
const ADMIN_EMAIL = 'your-admin@email.com';
```

### Customizing Session Duration
Modify session expiry in `src/utils/auth.ts`:

```typescript
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Lucide for beautiful icons
- Vite for blazing fast build tools

---

**AutoHire.ai** - Revolutionizing technical interviews with AI-powered solutions.
