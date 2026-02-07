# Auth & Admin System Setup

This project now has a complete authentication and admin system using Clerk and Convex.

## Features Implemented

### 1. User Authentication
- Clerk handles authentication
- Webhook integration creates Convex user records automatically
- Users start with `status: "pending"` and `role: "user"`
- Only confirmed users can access the application

### 2. Server-Side Access Control
- **SessionWrapper**: Wraps entire app in root layout, requires Clerk session for all routes except public ones
- **ConfirmedUserWrapper**: Used on individual pages, checks for confirmed status in Convex
- **AdminWrapper**: Used in admin layout, requires admin role
- Multiple security layers:
  - Root layout checks for session
  - Page wrappers check for confirmed status or admin role
  - Convex mutation authorization (all admin actions verified)
  - Audit logging for all admin operations

### 3. Admin Panel
- Located at `/admin/users`
- Features:
  - View all users in a table
  - Filter by status (all, pending, confirmed, disabled)
  - Confirm pending users
  - Delete users (removes from both Clerk and Convex)
  - Real-time updates via Convex
  - Toast notifications for actions

## Environment Variables Required

Add these to your `.env.local`:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
CLERK_SECRET_KEY=sk_***
CLERK_WEBHOOK_SECRET=whsec_***
CLERK_JWT_ISSUER_DOMAIN=your-clerk-domain.clerk.accounts.dev

# Convex
NEXT_PUBLIC_CONVEX_URL=https://***
CONVEX_DEPLOYMENT=***
```

**Important**: The `CLERK_SECRET_KEY` must be set as a Convex environment variable so the `deleteUser` mutation can call Clerk's API.

## Database Schema

### `users` table
- `clerk_user_id` (string, unique)
- `email` (string)
- `name` (string)
- `role` ("user" | "admin")
- `status` ("pending" | "confirmed" | "disabled")
- `created_at` (number)
- `confirmed_at` (number, optional)

### `admin_actions` table (audit log)
- `by_clerk_user_id` (string)
- `action_type` (string)
- `target_clerk_user_id` (string)
- `details` (any, optional)
- `created_at` (number)

## Setup Instructions

### 1. Configure Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Create a new webhook endpoint: `https://your-convex-deployment.convex.site/clerk-webhook`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret to `CLERK_WEBHOOK_SECRET`

### 2. Set Convex Environment Variable

Run this command to add the Clerk secret key to Convex:

```bash
npx convex env set CLERK_SECRET_KEY sk_***
```

### 3. Deploy Convex Schema

```bash
npx convex dev
# or
npx convex deploy
```

### 4. Create First Admin User

After your first user signs up via Clerk:

1. Go to Convex Dashboard → Data → `users` table
2. Find your user by email
3. Edit the row and change `role` to `"admin"` and `status` to `"confirmed"`
4. Save

Now you can access `/admin/users` and manage other users!

## File Structure

### Convex Functions
- `convex/schema.ts` - Database schema
- `convex/types/index.ts` - TypeScript types
- `convex/http.ts` - Webhook handler
- `convex/functions/queries.ts` - getUserByClerkId, listUsers
- `convex/functions/mutations.ts` - createUser, deleteUserByClerkId
- `convex/functions/adminMutations.ts` - confirmUser, deleteUser, disableUser

### Next.js Routes
- `app/page.tsx` - Main homepage (wrapped with ConfirmedUserWrapper)
- `app/admin/layout.tsx` - Admin-only routes (wrapped with AdminWrapper)
- `app/admin/users/page.tsx` - Admin user management page
- `app/pending/page.tsx` - Shown to unconfirmed users
- `app/account-not-found/page.tsx` - Shown when user not in DB
- `app/403/page.tsx` - Shown to non-admins accessing admin routes

### Components & Wrappers
- `components/wrappers/SessionWrapper.tsx` - Wraps entire app in root layout, checks for Clerk session
- `components/wrappers/ConfirmedUserWrapper.tsx` - Wraps protected pages, checks for confirmed status
- `components/wrappers/AdminWrapper.tsx` - Wraps admin pages, checks for admin role
- `components/admin/UserTable.tsx` - Main admin users table
- `components/admin/DeleteConfirmDialog.tsx` - Delete confirmation dialog
- `lib/convexAuth.ts` - Server-side auth helper

## Security Features

1. **Multi-Layer Access Control**
   - Server layouts verify user status before rendering
   - Convex mutations re-verify caller identity and role
   - Cannot be bypassed from client-side

2. **Audit Logging**
   - All admin actions logged to `admin_actions` table
   - Tracks who performed action, what was done, and when

3. **Webhook Verification**
   - Clerk webhooks verified using Svix signature
   - Prevents unauthorized user creation

4. **Full Deletion**
   - Admin delete removes user from Clerk (via SDK)
   - Then removes from Convex database
   - Prevents zombie accounts

## Usage Flow

### New User Registration
1. User signs up via Clerk
2. Clerk webhook fires `user.created`
3. Convex creates user with `status: "pending"`, `role: "user"`
4. User sees `/pending` page

### Admin Confirmation
1. Admin logs in and visits `/admin/users`
2. Sees pending users in table
3. Clicks "Confirm" on a user
4. Convex mutation verifies admin role, updates status
5. User can now access the application

### Admin Deletion
1. Admin clicks "Delete" on a user
2. Confirmation dialog appears
3. On confirm:
   - Clerk SDK deletes user from Clerk
   - Convex deletes user record
   - Action logged in audit table
4. Toast notification confirms success

## Testing

### Test Protected Routes
1. Sign out
2. Try to access any page → redirected to sign-in
3. Sign in as unconfirmed user → redirected to `/pending`
4. Have admin confirm you → can access app

### Test Admin Access
1. Sign in as regular user
2. Try to access `/admin/users` → redirected to `/403`
3. Sign in as admin → can access admin panel
4. Try admin mutations from browser console → will fail auth check

## Troubleshooting

**User not showing up after signup**
- Check Clerk webhook logs in Clerk dashboard
- Check Convex logs: `npx convex logs`
- Verify webhook secret is correct

**Admin mutations failing**
- Ensure `CLERK_SECRET_KEY` is set in Convex: `npx convex env list`
- Check Convex function logs for error details

**Type errors in TypeScript**
- Run `npx convex dev` to regenerate types
- Restart TypeScript server in your editor

## Next Steps

### Recommended Enhancements
1. Add email notifications when users are confirmed
2. Add bulk actions (confirm/delete multiple users)
3. Add user search and advanced filtering
4. Add pagination for large user lists
5. Add user detail pages with activity history
6. Add ability to promote users to admin from UI
7. Add admin dashboard with stats (total users, pending, etc.)

### Security Improvements
1. Add rate limiting to webhook endpoint
2. Add IP allowlist for admin routes
3. Add 2FA requirement for admin accounts
4. Add session timeout for admin users
5. Add detailed audit trail viewer for admins
