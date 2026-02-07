# PAIRLIVE - API Specification

> **Version:** 1.0  
> **Base URL:** `https://api.pairlive.com/v1`  
> **Protocol:** REST + WebSocket

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Matching](#3-matching)
4. [Sessions](#4-sessions)
5. [Feedback](#5-feedback)
6. [Coins & Transactions](#6-coins--transactions)
7. [Gifts](#7-gifts)
8. [Friends](#8-friends)
9. [Reports](#9-reports)
10. [WebSocket Events](#10-websocket-events)
11. [Error Codes](#11-error-codes)

---

## General Information

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-App-Version: 1.0.0
X-Platform: ios | android
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-05T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-02-05T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Pagination

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

## 1. Authentication

### 1.1 Register

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "display_name": "JohnDoe",
  "date_of_birth": "1995-05-15"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "email": "user@example.com",
    "display_name": "JohnDoe",
    "is_verified": false,
    "verification_sent": true
  }
}
```

**Errors:**
- `EMAIL_EXISTS` - Email already registered
- `INVALID_EMAIL` - Invalid email format
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `UNDERAGE` - User must be 18+

---

### 1.2 Login

**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "device_id": "device_xyz789",
  "push_token": "fcm_token_abc"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "display_name": "JohnDoe",
      "profile_photo_url": "https://cdn.pairlive.com/photos/...",
      "is_verified": true,
      "trust_score_category": "good",
      "coins_balance": 150
    }
  }
}
```

**Errors:**
- `INVALID_CREDENTIALS` - Wrong email or password
- `ACCOUNT_SUSPENDED` - Account is suspended
- `EMAIL_NOT_VERIFIED` - Email verification required

---

### 1.3 Refresh Token

**POST** `/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

---

### 1.4 Verify Email

**POST** `/auth/verify-email`

Verify user email with code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "is_verified": true,
    "message": "Email verified successfully"
  }
}
```

---

### 1.5 Resend Verification

**POST** `/auth/resend-verification`

Resend email verification code.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent",
    "retry_after": 60
  }
}
```

---

### 1.6 Forgot Password

**POST** `/auth/forgot-password`

Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Reset instructions sent to email"
  }
}
```

---

### 1.7 Reset Password

**POST** `/auth/reset-password`

Reset password with code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "new_password": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### 1.8 Logout

**POST** `/auth/logout`

Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "device_id": "device_xyz789"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 2. Users

### 2.1 Get Current User Profile

**GET** `/users/me`

Get authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "display_name": "JohnDoe",
    "profile_photo_url": "https://cdn.pairlive.com/photos/usr_abc123.jpg",
    "gender": "male",
    "language": "en",
    "is_verified": true,
    "trust_score_category": "good",
    "public_level": 5,
    "badges": ["early_adopter", "friendly"],
    "coins_balance": 150,
    "total_sessions": 42,
    "avg_rating": 4.2,
    "created_at": "2026-01-15T08:00:00Z",
    "stats": {
      "total_time_live": 12600,
      "friends_count": 15,
      "gifts_received": 230,
      "gifts_sent": 85
    }
  }
}
```

---

### 2.2 Update Profile

**PATCH** `/users/me`

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "display_name": "JohnD",
  "gender": "male",
  "language": "id"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "display_name": "JohnD",
    "gender": "male",
    "language": "id",
    "updated_at": "2026-02-05T10:30:00Z"
  }
}
```

---

### 2.3 Upload Profile Photo

**POST** `/users/me/photo`

Upload or update profile photo.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
photo: <binary file>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "profile_photo_url": "https://cdn.pairlive.com/photos/usr_abc123_v2.jpg"
  }
}
```

---

### 2.4 Get User Stats

**GET** `/users/me/stats`

Get detailed user statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessions": {
      "total": 42,
      "completed": 35,
      "skipped_by_me": 5,
      "skipped_by_others": 2,
      "avg_duration_seconds": 420
    },
    "ratings": {
      "average_received": 4.2,
      "total_received": 35,
      "distribution": {
        "5": 15,
        "4": 12,
        "3": 5,
        "2": 2,
        "1": 1
      }
    },
    "coins": {
      "total_earned": 5000,
      "total_spent": 850,
      "total_received_gifts": 3200,
      "total_sent_gifts": 850
    },
    "trust": {
      "category": "good",
      "public_level": 5,
      "trend": "improving"
    }
  }
}
```

---

### 2.5 Get User Behavior Summary

**GET** `/users/me/behavior`

Get user's behavior summary (limited visibility).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "standing": "good",
    "level": 5,
    "badges": ["early_adopter", "friendly", "generous"],
    "improvement_tips": [],
    "warnings": [],
    "next_level_progress": 0.7
  }
}
```

---

### 2.6 Delete Account

**DELETE** `/users/me`

Request account deletion.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "currentPassword123",
  "reason": "optional deletion reason"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Account scheduled for deletion",
    "deletion_date": "2026-02-12T10:30:00Z",
    "can_recover_until": "2026-02-12T10:30:00Z"
  }
}
```

---

## 3. Matching

### 3.1 Join Queue

**POST** `/matching/join`

Join the matching queue to find a partner.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "preferences": {
    "language": "any"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "queue_id": "que_xyz789",
    "position": 12,
    "estimated_wait_seconds": 30,
    "status": "waiting"
  }
}
```

**Errors:**
- `ALREADY_IN_QUEUE` - User already in queue
- `IN_ACTIVE_SESSION` - User has active session
- `ACCOUNT_RESTRICTED` - Account is restricted
- `COOLDOWN_ACTIVE` - Skip cooldown active

---

### 3.2 Leave Queue

**POST** `/matching/leave`

Leave the matching queue.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Left queue successfully"
  }
}
```

---

### 3.3 Get Queue Status

**GET** `/matching/status`

Get current queue status.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "in_queue": true,
    "queue_id": "que_xyz789",
    "position": 5,
    "estimated_wait_seconds": 15,
    "joined_at": "2026-02-05T10:30:00Z"
  }
}
```

---

## 4. Sessions

### 4.1 Get Active Session

**GET** `/sessions/active`

Get current active session details.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session_id": "ses_abc123",
    "partner": {
      "id": "usr_xyz789",
      "display_name": "JaneD",
      "profile_photo_url": "https://cdn.pairlive.com/photos/...",
      "public_level": 7,
      "badges": ["friendly"]
    },
    "started_at": "2026-02-05T10:30:00Z",
    "duration_seconds": 120,
    "can_skip": true,
    "agora_config": {
      "app_id": "agora_app_id",
      "channel": "channel_abc123",
      "token": "agora_token_xyz",
      "uid": 12345
    }
  }
}
```

---

### 4.2 Get Session History

**GET** `/sessions/history`

Get user's session history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20, max: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "session_id": "ses_abc123",
      "partner": {
        "id": "usr_xyz789",
        "display_name": "JaneD",
        "profile_photo_url": "https://cdn.pairlive.com/photos/..."
      },
      "started_at": "2026-02-05T10:30:00Z",
      "ended_at": "2026-02-05T10:45:00Z",
      "duration_seconds": 900,
      "end_reason": "normal",
      "my_rating": 5,
      "received_rating": 4,
      "coins_sent": 50,
      "coins_received": 25
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

---

### 4.3 Skip Session

**POST** `/sessions/{session_id}/skip`

Skip current session and find new partner.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "not_my_vibe",
  "rejoin_queue": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Session skipped",
    "skip_count_today": 3,
    "cooldown_seconds": 0,
    "rejoined_queue": true,
    "queue_position": 5
  }
}
```

**Errors:**
- `SESSION_NOT_FOUND` - No active session
- `SKIP_TOO_EARLY` - Must wait 30 seconds
- `SKIP_LIMIT_REACHED` - Too many skips, cooldown required

---

### 4.4 End Session

**POST** `/sessions/{session_id}/end`

End current session normally.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session_id": "ses_abc123",
    "duration_seconds": 900,
    "feedback_required": true,
    "can_add_friend": true
  }
}
```

---

### 4.5 Get Session Details

**GET** `/sessions/{session_id}`

Get details of a specific session.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session_id": "ses_abc123",
    "partner": {
      "id": "usr_xyz789",
      "display_name": "JaneD",
      "profile_photo_url": "https://cdn.pairlive.com/photos/..."
    },
    "started_at": "2026-02-05T10:30:00Z",
    "ended_at": "2026-02-05T10:45:00Z",
    "duration_seconds": 900,
    "end_reason": "normal",
    "ended_by": "partner",
    "my_feedback": {
      "rating": 5,
      "comment": "Great conversation!"
    },
    "gifts_exchanged": {
      "sent": [
        {"gift_id": "gift_heart", "count": 2, "total_coins": 20}
      ],
      "received": [
        {"gift_id": "gift_star", "count": 1, "total_coins": 25}
      ]
    }
  }
}
```

---

## 5. Feedback

### 5.1 Submit Feedback

**POST** `/feedback`

Submit feedback for a session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "session_id": "ses_abc123",
  "rating": 5,
  "comment": "Great conversation!",
  "tags": ["friendly", "interesting"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "feedback_id": "fb_xyz789",
    "session_id": "ses_abc123",
    "rating": 5,
    "bonus_coins": 5,
    "message": "Thanks for your feedback!"
  }
}
```

**Errors:**
- `SESSION_NOT_FOUND` - Session doesn't exist
- `ALREADY_SUBMITTED` - Feedback already submitted
- `SESSION_TOO_OLD` - Session too old for feedback

---

### 5.2 Get Feedback for Session

**GET** `/feedback/session/{session_id}`

Get feedback details for a session.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "my_feedback": {
      "rating": 5,
      "comment": "Great conversation!",
      "submitted_at": "2026-02-05T10:46:00Z"
    },
    "partner_feedback": {
      "rating": 4,
      "submitted_at": "2026-02-05T10:47:00Z"
    }
  }
}
```

---

## 6. Coins & Transactions

### 6.1 Get Coin Balance

**GET** `/coins/balance`

Get current coin balance.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": 1500,
    "pending_withdrawal": 0,
    "lifetime_earned": 5000,
    "lifetime_spent": 3500
  }
}
```

---

### 6.2 Get Coin Packages

**GET** `/coins/packages`

Get available coin purchase packages.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "pkg_100",
      "coins": 100,
      "price_usd": 0.99,
      "bonus_coins": 0,
      "popular": false
    },
    {
      "id": "pkg_500",
      "coins": 500,
      "price_usd": 4.49,
      "bonus_coins": 50,
      "popular": true
    },
    {
      "id": "pkg_1000",
      "coins": 1000,
      "price_usd": 8.49,
      "bonus_coins": 150,
      "popular": false
    },
    {
      "id": "pkg_5000",
      "coins": 5000,
      "price_usd": 39.99,
      "bonus_coins": 1000,
      "popular": false
    }
  ]
}
```

---

### 6.3 Purchase Coins

**POST** `/coins/purchase`

Purchase coins (integrate with app store).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "package_id": "pkg_500",
  "receipt": "app_store_receipt_data",
  "platform": "ios"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_abc123",
    "coins_added": 550,
    "new_balance": 2050,
    "message": "Purchase successful!"
  }
}
```

---

### 6.4 Get Transaction History

**GET** `/coins/transactions`

Get coin transaction history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20)
- `type` (string, optional: purchase, send, receive, bonus)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_abc123",
      "type": "receive",
      "amount": 25,
      "description": "Gift from JaneD",
      "related_user": {
        "id": "usr_xyz789",
        "display_name": "JaneD"
      },
      "session_id": "ses_abc123",
      "created_at": "2026-02-05T10:40:00Z"
    },
    {
      "id": "txn_def456",
      "type": "purchase",
      "amount": 550,
      "description": "Purchased 500 + 50 bonus coins",
      "created_at": "2026-02-05T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 85,
    "total_pages": 5
  }
}
```

---

### 6.5 Request Withdrawal (Phase 2)

**POST** `/coins/withdraw`

Request coin withdrawal to real money.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 10000,
  "method": "paypal",
  "account": "user@email.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "withdrawal_id": "wd_abc123",
    "coins": 10000,
    "usd_amount": 70.00,
    "fee": 0,
    "status": "pending",
    "estimated_completion": "2026-02-08T00:00:00Z"
  }
}
```

---

## 7. Gifts

### 7.1 Get Gift Catalog

**GET** `/gifts`

Get available gifts.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "gift_wave",
      "name": "Wave",
      "icon": "👋",
      "price_coins": 5,
      "animation": "simple_wave"
    },
    {
      "id": "gift_heart",
      "name": "Heart",
      "icon": "❤️",
      "price_coins": 10,
      "animation": "floating_hearts"
    },
    {
      "id": "gift_star",
      "name": "Star",
      "icon": "🌟",
      "price_coins": 25,
      "animation": "sparkle"
    },
    {
      "id": "gift_box",
      "name": "Gift Box",
      "icon": "🎁",
      "price_coins": 50,
      "animation": "box_opening"
    },
    {
      "id": "gift_diamond",
      "name": "Diamond",
      "icon": "💎",
      "price_coins": 100,
      "animation": "shine"
    },
    {
      "id": "gift_rocket",
      "name": "Rocket",
      "icon": "🚀",
      "price_coins": 500,
      "animation": "fullscreen_rocket"
    }
  ]
}
```

---

### 7.2 Send Gift

**POST** `/gifts/send`

Send a gift during session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "session_id": "ses_abc123",
  "gift_id": "gift_heart",
  "quantity": 1
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_xyz789",
    "gift_id": "gift_heart",
    "quantity": 1,
    "total_cost": 10,
    "new_balance": 490,
    "animation_trigger": "floating_hearts"
  }
}
```

**Errors:**
- `INSUFFICIENT_COINS` - Not enough coins
- `SESSION_NOT_FOUND` - No active session
- `GIFT_NOT_FOUND` - Invalid gift ID

---

### 7.3 Send Gift to Friend

**POST** `/gifts/send-friend`

Send a gift to a friend (outside session).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "friend_id": "usr_xyz789",
  "gift_id": "gift_star",
  "quantity": 1,
  "message": "Thanks for the great chat!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_abc456",
    "gift_id": "gift_star",
    "total_cost": 25,
    "new_balance": 465,
    "notification_sent": true
  }
}
```

---

## 8. Friends

### 8.1 Send Friend Request

**POST** `/friends/request`

Send friend request after session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "usr_xyz789",
  "session_id": "ses_abc123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "request_id": "fr_abc123",
    "status": "pending",
    "message": "Friend request sent"
  }
}
```

**Errors:**
- `ALREADY_FRIENDS` - Already friends
- `REQUEST_EXISTS` - Request already sent
- `SESSION_REQUIRED` - Can only add from session
- `LOW_RATING` - Cannot add, rating too low

---

### 8.2 Get Friend Requests

**GET** `/friends/requests`

Get pending friend requests.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "incoming": [
      {
        "request_id": "fr_xyz789",
        "from_user": {
          "id": "usr_abc123",
          "display_name": "JohnD",
          "profile_photo_url": "https://cdn.pairlive.com/photos/..."
        },
        "session_id": "ses_xyz789",
        "created_at": "2026-02-05T10:50:00Z"
      }
    ],
    "outgoing": [
      {
        "request_id": "fr_abc123",
        "to_user": {
          "id": "usr_xyz789",
          "display_name": "JaneD",
          "profile_photo_url": "https://cdn.pairlive.com/photos/..."
        },
        "created_at": "2026-02-05T10:45:00Z"
      }
    ]
  }
}
```

---

### 8.3 Accept Friend Request

**POST** `/friends/requests/{request_id}/accept`

Accept a friend request.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "friendship_id": "fs_abc123",
    "friend": {
      "id": "usr_abc123",
      "display_name": "JohnD",
      "profile_photo_url": "https://cdn.pairlive.com/photos/..."
    },
    "message": "You are now friends!"
  }
}
```

---

### 8.4 Decline Friend Request

**POST** `/friends/requests/{request_id}/decline`

Decline a friend request.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Request declined"
  }
}
```

---

### 8.5 Get Friends List

**GET** `/friends`

Get list of friends.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20)
- `online_only` (boolean, default: false)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "friendship_id": "fs_abc123",
      "friend": {
        "id": "usr_xyz789",
        "display_name": "JaneD",
        "profile_photo_url": "https://cdn.pairlive.com/photos/...",
        "public_level": 7,
        "is_online": true,
        "last_seen": null
      },
      "created_at": "2026-02-01T10:00:00Z",
      "total_sessions_together": 5
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

---

### 8.6 Remove Friend

**DELETE** `/friends/{friendship_id}`

Remove a friend.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Friend removed"
  }
}
```

---

## 9. Reports

### 9.1 Submit Report

**POST** `/reports`

Report a user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reported_user_id": "usr_xyz789",
  "session_id": "ses_abc123",
  "category": "inappropriate_content",
  "description": "Optional additional details"
}
```

**Categories:**
- `inappropriate_content`
- `harassment`
- `spam`
- `underage`
- `other`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "report_id": "rpt_abc123",
    "status": "submitted",
    "message": "Thank you for your report. We will review it shortly."
  }
}
```

---

### 9.2 Get My Reports

**GET** `/reports/mine`

Get reports I've submitted.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "report_id": "rpt_abc123",
      "reported_user": {
        "id": "usr_xyz789",
        "display_name": "User***"
      },
      "category": "inappropriate_content",
      "status": "resolved",
      "submitted_at": "2026-02-05T10:30:00Z",
      "resolved_at": "2026-02-05T12:00:00Z"
    }
  ]
}
```

---

### 9.3 Block User

**POST** `/reports/block`

Block a user (won't be matched again).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_id": "usr_xyz789"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "User blocked successfully"
  }
}
```

---

### 9.4 Unblock User

**DELETE** `/reports/block/{user_id}`

Unblock a previously blocked user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "User unblocked"
  }
}
```

---

### 9.5 Get Blocked Users

**GET** `/reports/blocked`

Get list of blocked users.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "user_id": "usr_xyz789",
      "display_name": "User***",
      "blocked_at": "2026-02-05T10:30:00Z"
    }
  ]
}
```

---

## 10. WebSocket Events

### Connection

```
WebSocket URL: wss://ws.pairlive.com
Auth: ?token=<jwt_token>
```

### 10.1 Client → Server Events

#### Join Queue
```json
{
  "event": "queue:join",
  "data": {
    "preferences": {
      "language": "any"
    }
  }
}
```

#### Leave Queue
```json
{
  "event": "queue:leave",
  "data": {}
}
```

#### Send Chat Message
```json
{
  "event": "session:chat",
  "data": {
    "session_id": "ses_abc123",
    "message": "Hello!"
  }
}
```

#### Toggle Media
```json
{
  "event": "session:media",
  "data": {
    "session_id": "ses_abc123",
    "video": true,
    "audio": false
  }
}
```

#### Send Gift
```json
{
  "event": "session:gift",
  "data": {
    "session_id": "ses_abc123",
    "gift_id": "gift_heart",
    "quantity": 1
  }
}
```

#### Heartbeat
```json
{
  "event": "heartbeat",
  "data": {
    "timestamp": 1707130200000
  }
}
```

---

### 10.2 Server → Client Events

#### Queue Update
```json
{
  "event": "queue:update",
  "data": {
    "position": 5,
    "estimated_wait_seconds": 15
  }
}
```

#### Match Found
```json
{
  "event": "match:found",
  "data": {
    "session_id": "ses_abc123",
    "partner": {
      "id": "usr_xyz789",
      "display_name": "JaneD",
      "profile_photo_url": "https://cdn.pairlive.com/photos/...",
      "public_level": 7
    },
    "agora_config": {
      "app_id": "agora_app_id",
      "channel": "channel_abc123",
      "token": "agora_token_xyz",
      "uid": 12345
    }
  }
}
```

#### Chat Message Received
```json
{
  "event": "session:chat:received",
  "data": {
    "session_id": "ses_abc123",
    "from_user_id": "usr_xyz789",
    "message": "Hi there!",
    "timestamp": "2026-02-05T10:31:00Z"
  }
}
```

#### Gift Received
```json
{
  "event": "session:gift:received",
  "data": {
    "session_id": "ses_abc123",
    "from_user_id": "usr_xyz789",
    "gift": {
      "id": "gift_heart",
      "name": "Heart",
      "icon": "❤️",
      "quantity": 1
    },
    "coins_received": 7,
    "animation": "floating_hearts"
  }
}
```

#### Partner Media Update
```json
{
  "event": "session:partner:media",
  "data": {
    "session_id": "ses_abc123",
    "video": false,
    "audio": true
  }
}
```

#### Session Ended
```json
{
  "event": "session:ended",
  "data": {
    "session_id": "ses_abc123",
    "ended_by": "partner",
    "reason": "normal",
    "duration_seconds": 900,
    "feedback_required": true
  }
}
```

#### Skip Enabled
```json
{
  "event": "session:skip:enabled",
  "data": {
    "session_id": "ses_abc123",
    "message": "You can now skip this session"
  }
}
```

#### AFK Warning
```json
{
  "event": "session:afk:warning",
  "data": {
    "session_id": "ses_abc123",
    "warning_for": "partner",
    "message": "Your partner seems away",
    "auto_end_in_seconds": 180
  }
}
```

#### Cooldown Notice
```json
{
  "event": "user:cooldown",
  "data": {
    "reason": "skip_limit",
    "cooldown_seconds": 300,
    "message": "Take a break. You can match again in 5 minutes."
  }
}
```

#### Friend Request Received
```json
{
  "event": "friend:request",
  "data": {
    "request_id": "fr_abc123",
    "from_user": {
      "id": "usr_xyz789",
      "display_name": "JaneD",
      "profile_photo_url": "https://cdn.pairlive.com/photos/..."
    }
  }
}
```

#### Notification
```json
{
  "event": "notification",
  "data": {
    "type": "gift_received",
    "title": "New Gift!",
    "message": "JaneD sent you a Star",
    "data": {
      "from_user_id": "usr_xyz789",
      "gift_id": "gift_star"
    }
  }
}
```

---

## 11. Error Codes

### Authentication Errors (1xxx)

| Code | Name | Description |
|------|------|-------------|
| 1001 | `INVALID_CREDENTIALS` | Wrong email or password |
| 1002 | `EMAIL_EXISTS` | Email already registered |
| 1003 | `EMAIL_NOT_VERIFIED` | Email verification required |
| 1004 | `TOKEN_EXPIRED` | Access token expired |
| 1005 | `TOKEN_INVALID` | Invalid token |
| 1006 | `ACCOUNT_SUSPENDED` | Account is suspended |
| 1007 | `ACCOUNT_DELETED` | Account has been deleted |

### User Errors (2xxx)

| Code | Name | Description |
|------|------|-------------|
| 2001 | `USER_NOT_FOUND` | User doesn't exist |
| 2002 | `PROFILE_INCOMPLETE` | Profile setup required |
| 2003 | `UNDERAGE` | User must be 18+ |
| 2004 | `INVALID_PHOTO` | Invalid photo format/size |

### Matching Errors (3xxx)

| Code | Name | Description |
|------|------|-------------|
| 3001 | `ALREADY_IN_QUEUE` | Already in matching queue |
| 3002 | `NOT_IN_QUEUE` | Not in queue |
| 3003 | `COOLDOWN_ACTIVE` | Cooldown period active |
| 3004 | `ACCOUNT_RESTRICTED` | Account is restricted |

### Session Errors (4xxx)

| Code | Name | Description |
|------|------|-------------|
| 4001 | `SESSION_NOT_FOUND` | Session doesn't exist |
| 4002 | `SESSION_ENDED` | Session already ended |
| 4003 | `NOT_IN_SESSION` | User not in this session |
| 4004 | `SKIP_TOO_EARLY` | Must wait before skip |
| 4005 | `SKIP_LIMIT_REACHED` | Too many skips |
| 4006 | `IN_ACTIVE_SESSION` | Already in active session |

### Coin Errors (5xxx)

| Code | Name | Description |
|------|------|-------------|
| 5001 | `INSUFFICIENT_COINS` | Not enough coins |
| 5002 | `INVALID_PACKAGE` | Invalid coin package |
| 5003 | `PURCHASE_FAILED` | Purchase failed |
| 5004 | `WITHDRAWAL_MIN_NOT_MET` | Minimum withdrawal not met |

### Gift Errors (6xxx)

| Code | Name | Description |
|------|------|-------------|
| 6001 | `GIFT_NOT_FOUND` | Gift doesn't exist |
| 6002 | `GIFT_UNAVAILABLE` | Gift not available |

### Friend Errors (7xxx)

| Code | Name | Description |
|------|------|-------------|
| 7001 | `ALREADY_FRIENDS` | Already friends |
| 7002 | `REQUEST_EXISTS` | Request already sent |
| 7003 | `REQUEST_NOT_FOUND` | Request doesn't exist |
| 7004 | `CANNOT_ADD_SELF` | Cannot add yourself |
| 7005 | `SESSION_REQUIRED` | Must have session to add |
| 7006 | `LOW_RATING` | Rating too low to add |

### Report Errors (8xxx)

| Code | Name | Description |
|------|------|-------------|
| 8001 | `ALREADY_REPORTED` | Already reported this session |
| 8002 | `INVALID_CATEGORY` | Invalid report category |
| 8003 | `USER_ALREADY_BLOCKED` | User already blocked |

### General Errors (9xxx)

| Code | Name | Description |
|------|------|-------------|
| 9001 | `BAD_REQUEST` | Invalid request |
| 9002 | `UNAUTHORIZED` | Authentication required |
| 9003 | `FORBIDDEN` | Permission denied |
| 9004 | `NOT_FOUND` | Resource not found |
| 9005 | `RATE_LIMITED` | Too many requests |
| 9006 | `SERVER_ERROR` | Internal server error |
| 9007 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## Rate Limiting

| Endpoint Category | Rate Limit |
|-------------------|------------|
| Authentication | 10 requests/minute |
| General API | 100 requests/minute |
| WebSocket messages | 50 messages/minute |
| Gift sending | 20 requests/minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707130260
```

---

## Versioning

API version is included in URL path: `/v1/`, `/v2/`, etc.

Deprecation notices will be sent via:
- Response header: `X-API-Deprecation: true`
- Email to developers
- Documentation updates

---

**Document Version:** 1.0  
**Last Updated:** February 2026
