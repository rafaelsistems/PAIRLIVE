# PAIRLIVE - Folder Structure

> **Last Updated:** February 2026

---

## Project Root

```
PAIRLIVE/
│
├── README.md                           # Project overview & quick start
├── PAIRLIVE-PROJECT-CONCEPT.md         # Full project documentation
│
├── docs/                               # Documentation
│   ├── API-SPECIFICATION.md            # REST & WebSocket API docs
│   ├── WIREFRAMES.md                   # UI/UX wireframes & design system
│   ├── FOLDER-STRUCTURE.md             # This file
│   ├── api/                            # Additional API docs
│   └── guides/                         # Development guides
│
├── mobile/                             # Mobile application (Flutter/React Native)
│   ├── README.md
│   ├── pubspec.yaml                    # Flutter dependencies (or package.json for RN)
│   └── src/
│       ├── screens/                    # Screen components
│       ├── components/                 # Reusable UI components
│       ├── services/                   # API & external services
│       ├── store/                      # State management
│       ├── hooks/                      # Custom hooks
│       ├── utils/                      # Utility functions
│       ├── assets/                     # Static assets
│       ├── navigation/                 # Navigation configuration
│       ├── constants/                  # App constants
│       └── types/                      # TypeScript types/interfaces
│
├── backend/                            # Backend services
│   ├── README.md
│   ├── package.json                    # Node.js dependencies
│   ├── src/
│   │   ├── controllers/                # Request handlers
│   │   ├── services/                   # Business logic
│   │   ├── models/                     # Database models
│   │   ├── middleware/                 # Express middleware
│   │   ├── routes/                     # API routes
│   │   ├── utils/                      # Utility functions
│   │   ├── config/                     # Configuration files
│   │   ├── websocket/                  # WebSocket handlers
│   │   ├── jobs/                       # Background jobs
│   │   └── validators/                 # Input validation
│   └── tests/
│       ├── unit/                       # Unit tests
│       └── integration/                # Integration tests
│
└── infrastructure/                     # DevOps & Infrastructure
    ├── docker/                         # Docker configurations
    ├── kubernetes/                     # K8s manifests
    ├── terraform/                      # Infrastructure as code
    └── scripts/                        # Deployment scripts
```

---

## Mobile App Structure (`/mobile`)

### Screens (`/src/screens/`)

```
screens/
├── auth/
│   ├── SplashScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── EmailVerificationScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   └── ProfileSetupScreen.tsx
│
├── main/
│   ├── HomeScreen.tsx
│   ├── FriendsScreen.tsx
│   ├── ChatScreen.tsx
│   └── ProfileScreen.tsx
│
├── session/
│   ├── MatchingQueueScreen.tsx
│   ├── LiveSessionScreen.tsx
│   ├── SessionEndedScreen.tsx
│   └── FeedbackScreen.tsx
│
├── profile/
│   ├── EditProfileScreen.tsx
│   ├── CoinShopScreen.tsx
│   ├── SessionHistoryScreen.tsx
│   └── TransactionHistoryScreen.tsx
│
├── social/
│   ├── FriendProfileScreen.tsx
│   ├── FriendRequestsScreen.tsx
│   └── BlockedUsersScreen.tsx
│
└── settings/
    ├── SettingsScreen.tsx
    ├── NotificationSettingsScreen.tsx
    ├── PrivacySettingsScreen.tsx
    └── HelpScreen.tsx
```

### Components (`/src/components/`)

```
components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── BottomSheet.tsx
│   ├── Loading.tsx
│   ├── ErrorBoundary.tsx
│   └── Toast.tsx
│
├── session/
│   ├── VideoView.tsx
│   ├── PIPView.tsx
│   ├── ChatOverlay.tsx
│   ├── ActionBar.tsx
│   ├── GiftPanel.tsx
│   ├── GiftAnimation.tsx
│   ├── SkipButton.tsx
│   └── ReportButton.tsx
│
├── profile/
│   ├── StatCard.tsx
│   ├── BadgeList.tsx
│   ├── CoinBalance.tsx
│   └── LevelIndicator.tsx
│
├── social/
│   ├── FriendCard.tsx
│   ├── FriendRequestCard.tsx
│   └── OnlineIndicator.tsx
│
└── navigation/
    ├── TabBar.tsx
    ├── Header.tsx
    └── BackButton.tsx
```

### Services (`/src/services/`)

```
services/
├── api/
│   ├── client.ts               # Axios/fetch instance
│   ├── authApi.ts              # Auth endpoints
│   ├── userApi.ts              # User endpoints
│   ├── matchingApi.ts          # Matching endpoints
│   ├── sessionApi.ts           # Session endpoints
│   ├── coinApi.ts              # Coin/transaction endpoints
│   ├── giftApi.ts              # Gift endpoints
│   ├── friendApi.ts            # Friend endpoints
│   └── reportApi.ts            # Report endpoints
│
├── websocket/
│   ├── socketClient.ts         # WebSocket connection
│   ├── eventHandlers.ts        # Event handlers
│   └── eventEmitters.ts        # Event emitters
│
├── video/
│   ├── agoraService.ts         # Agora SDK wrapper
│   └── videoUtils.ts           # Video utilities
│
├── storage/
│   ├── secureStorage.ts        # Secure storage (tokens)
│   └── localStorage.ts         # General storage
│
├── notification/
│   └── pushService.ts          # Push notification service
│
└── analytics/
    └── analyticsService.ts     # Analytics tracking
```

### Store (`/src/store/`)

```
store/
├── index.ts                    # Store configuration
├── rootReducer.ts              # Combined reducers
│
├── slices/
│   ├── authSlice.ts            # Auth state
│   ├── userSlice.ts            # User profile state
│   ├── sessionSlice.ts         # Live session state
│   ├── matchingSlice.ts        # Matching queue state
│   ├── coinSlice.ts            # Coin balance state
│   ├── friendSlice.ts          # Friends state
│   └── notificationSlice.ts    # Notifications state
│
└── selectors/
    ├── authSelectors.ts
    ├── userSelectors.ts
    └── sessionSelectors.ts
```

### Assets (`/src/assets/`)

```
assets/
├── images/
│   ├── logo.png
│   ├── onboarding/
│   │   ├── onboard-1.png
│   │   ├── onboard-2.png
│   │   └── onboard-3.png
│   └── empty-states/
│       ├── no-friends.png
│       ├── no-history.png
│       └── error.png
│
├── icons/
│   ├── tab-home.svg
│   ├── tab-friends.svg
│   ├── tab-live.svg
│   ├── tab-chat.svg
│   ├── tab-profile.svg
│   └── ...
│
└── animations/
    ├── loading.json
    ├── match-found.json
    ├── gift-heart.json
    ├── gift-star.json
    └── ...
```

### Other Folders

```
hooks/
├── useAuth.ts                  # Auth hook
├── useUser.ts                  # User data hook
├── useSession.ts               # Live session hook
├── useWebSocket.ts             # WebSocket hook
├── useVideo.ts                 # Video call hook
└── useCoins.ts                 # Coin balance hook

utils/
├── formatters.ts               # Date, number formatters
├── validators.ts               # Input validation
├── helpers.ts                  # General helpers
└── constants.ts                # App constants

navigation/
├── AppNavigator.tsx            # Root navigator
├── AuthNavigator.tsx           # Auth flow navigator
├── MainNavigator.tsx           # Main app navigator
└── linking.ts                  # Deep linking config

constants/
├── colors.ts                   # Color palette
├── typography.ts               # Typography styles
├── spacing.ts                  # Spacing scale
├── api.ts                      # API endpoints
└── config.ts                   # App config

types/
├── user.ts                     # User types
├── session.ts                  # Session types
├── api.ts                      # API response types
├── navigation.ts               # Navigation types
└── common.ts                   # Common types
```

---

## Backend Structure (`/backend`)

### Controllers (`/src/controllers/`)

```
controllers/
├── authController.ts           # Auth: login, register, verify
├── userController.ts           # User: profile, stats
├── matchingController.ts       # Matching: join/leave queue
├── sessionController.ts        # Session: skip, end, history
├── feedbackController.ts       # Feedback: submit, get
├── coinController.ts           # Coins: balance, purchase, withdraw
├── giftController.ts           # Gifts: catalog, send
├── friendController.ts         # Friends: request, accept, list
└── reportController.ts         # Reports: submit, block
```

### Services (`/src/services/`)

```
services/
├── authService.ts              # Auth business logic
├── userService.ts              # User business logic
├── matchingService.ts          # Matching algorithm
├── sessionService.ts           # Session management
├── feedbackService.ts          # Feedback processing
├── coinService.ts              # Coin transactions
├── giftService.ts              # Gift delivery
├── friendService.ts            # Friend management
├── reportService.ts            # Report handling
├── behaviorService.ts          # Behavioral scoring
├── notificationService.ts      # Push notifications
├── emailService.ts             # Email sending
└── agoraService.ts             # Agora token generation
```

### Models (`/src/models/`)

```
models/
├── User.ts                     # User model
├── Session.ts                  # Session model
├── SessionEvent.ts             # Session event model
├── Feedback.ts                 # Feedback model
├── UserBehavior.ts             # User behavior metrics
├── Transaction.ts              # Coin transaction model
├── Gift.ts                     # Gift catalog model
├── Friendship.ts               # Friendship model
├── FriendRequest.ts            # Friend request model
├── Report.ts                   # Report model
├── BehaviorFlag.ts             # Behavior flag model
└── index.ts                    # Model exports
```

### Middleware (`/src/middleware/`)

```
middleware/
├── auth.ts                     # JWT authentication
├── validate.ts                 # Request validation
├── rateLimit.ts                # Rate limiting
├── errorHandler.ts             # Error handling
├── logger.ts                   # Request logging
└── cors.ts                     # CORS configuration
```

### Routes (`/src/routes/`)

```
routes/
├── index.ts                    # Route aggregator
├── authRoutes.ts               # /auth/*
├── userRoutes.ts               # /users/*
├── matchingRoutes.ts           # /matching/*
├── sessionRoutes.ts            # /sessions/*
├── feedbackRoutes.ts           # /feedback/*
├── coinRoutes.ts               # /coins/*
├── giftRoutes.ts               # /gifts/*
├── friendRoutes.ts             # /friends/*
└── reportRoutes.ts             # /reports/*
```

### WebSocket (`/src/websocket/`)

```
websocket/
├── index.ts                    # WebSocket server setup
├── connectionHandler.ts        # Connection management
├── events/
│   ├── queueEvents.ts          # Queue join/leave
│   ├── sessionEvents.ts        # Session chat/gift/media
│   └── notificationEvents.ts   # Real-time notifications
└── rooms/
    └── sessionRoom.ts          # Session room management
```

### Jobs (`/src/jobs/`)

```
jobs/
├── index.ts                    # Job scheduler setup
├── behaviorCalculator.ts       # Calculate trust scores
├── sessionCleanup.ts           # Clean stale sessions
├── reportProcessor.ts          # Process pending reports
└── coinReconciliation.ts       # Reconcile transactions
```

### Config (`/src/config/`)

```
config/
├── index.ts                    # Config aggregator
├── database.ts                 # Database config
├── redis.ts                    # Redis config
├── agora.ts                    # Agora config
├── email.ts                    # Email config
├── payment.ts                  # Payment config
└── app.ts                      # App settings
```

### Validators (`/src/validators/`)

```
validators/
├── authValidator.ts            # Auth request validation
├── userValidator.ts            # User request validation
├── sessionValidator.ts         # Session request validation
├── feedbackValidator.ts        # Feedback validation
├── coinValidator.ts            # Coin request validation
└── reportValidator.ts          # Report validation
```

---

## Infrastructure Structure (`/infrastructure`)

### Docker (`/docker/`)

```
docker/
├── Dockerfile.api              # API server Dockerfile
├── Dockerfile.worker           # Background worker Dockerfile
├── docker-compose.yml          # Local development compose
├── docker-compose.prod.yml     # Production compose
└── .dockerignore
```

### Kubernetes (`/kubernetes/`)

```
kubernetes/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── deployments/
│   ├── api-deployment.yaml
│   ├── worker-deployment.yaml
│   └── redis-deployment.yaml
├── services/
│   ├── api-service.yaml
│   └── redis-service.yaml
├── ingress/
│   └── api-ingress.yaml
└── hpa/
    └── api-hpa.yaml
```

### Terraform (`/terraform/`)

```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── providers.tf
├── modules/
│   ├── vpc/
│   ├── rds/
│   ├── elasticache/
│   ├── ecs/
│   └── cloudfront/
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

### Scripts (`/scripts/`)

```
scripts/
├── deploy.sh                   # Deployment script
├── rollback.sh                 # Rollback script
├── db-migrate.sh               # Database migration
├── backup.sh                   # Backup script
└── health-check.sh             # Health check script
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Screens | PascalCase + Screen | `HomeScreen.tsx`, `LoginScreen.tsx` |
| Services | camelCase | `authService.ts`, `apiClient.ts` |
| Hooks | camelCase with use prefix | `useAuth.ts`, `useSession.ts` |
| Utils | camelCase | `formatters.ts`, `validators.ts` |
| Types | PascalCase | `User.ts`, `Session.ts` |
| Constants | camelCase or SCREAMING_SNAKE | `colors.ts`, `API_URL` |
| Tests | *.test.ts or *.spec.ts | `authService.test.ts` |

---

## Import Order Convention

```typescript
// 1. External libraries
import React from 'react';
import { View, Text } from 'react-native';

// 2. Internal modules (absolute paths)
import { Button } from '@/components/common';
import { useAuth } from '@/hooks';

// 3. Relative imports
import { styles } from './styles';
import { Props } from './types';

// 4. Types (if separate)
import type { User } from '@/types';
```

---

**Document Version:** 1.0  
**Last Updated:** February 2026
