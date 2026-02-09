# Comprehensive Full-Stack Audit & Fix Plan

## 🔍 Issues Identified

### Backend Critical Issues

#### 1. **Authentication Issues in Mutations** (CRITICAL - Runtime Crashes)
**Problem:** Multiple mutations use `getUserId(context)` which can return `null`, but then use the value directly without null checks.

**Affected Files:**
- `booking.ts` - `createBooking`, `updateBooking`, `cancelBooking`
- `order.ts` - `createOrder`, `updateOrder`, `cancelOrder`
- `travel.ts` - `createTravelBooking`, `updateTravelBooking`, `cancelTravelBooking`
- `yurt.ts` - `createYurt`, `updateYurt`, `deleteYurt`

**Fix:** Replace `getUserId` with `requireUserId` for all mutations that require authentication.

#### 2. **Comment Resolver Using Wrong Prisma Instance**
**Problem:** `comment.ts` imports a hardcoded `prisma` instance instead of using `context.prisma`.

**Fix:** Update to use `context.prisma` for consistency and proper transaction support.

#### 3. **Potential Null Reference in Yurt Resolver**
**Problem:** Line 138 in `yurt.ts` has a try-catch that silently fails, potentially leaving `ownerId` as undefined.

**Fix:** Properly handle authentication requirement for yurt creation.

### Backend Type Safety Issues

#### 4. **Inconsistent Context Types**
**Problem:** Some resolvers don't properly type the Context interface.

**Fix:** Ensure all resolvers use consistent Context typing.

### Frontend Issues

#### 5. **Build Warnings**
**Problem:** Baseline-browser-mapping deprecation warning.

**Status:** Non-critical, build succeeds. Can be addressed later.

## ✅ Fixes to Apply

### Priority 1: Critical Runtime Fixes

1. **Fix Authentication in Booking Mutations**
   - Replace `getUserId` with `requireUserId` in `createBooking`, `updateBooking`, `cancelBooking`

2. **Fix Authentication in Order Mutations**
   - Replace `getUserId` with `requireUserId` in `createOrder`, `updateOrder`, `cancelOrder`

3. **Fix Authentication in Travel Mutations**
   - Replace `getUserId` with `requireUserId` in `createTravelBooking`, `updateTravelBooking`, `cancelTravelBooking`

4. **Fix Authentication in Yurt Mutations**
   - Replace `getUserId` with `requireUserId` in `createYurt`, `updateYurt`, `deleteYurt`
   - Remove try-catch block that silently fails

5. **Fix Comment Resolver Prisma Usage**
   - Replace hardcoded `prisma` import with `context.prisma`

### Priority 2: Code Quality Improvements

6. **Standardize Error Messages**
   - Ensure consistent error messages across all resolvers

7. **Add Null Checks for Optional Relations**
   - Ensure frontend handles null owner, null yurt, etc.

## 🧪 Testing Plan

1. **Backend Tests:**
   - Test all mutations with valid authentication
   - Test all mutations with invalid/missing authentication
   - Test all mutations with expired tokens
   - Test all queries with and without authentication

2. **Frontend Tests:**
   - Test all pages load without errors
   - Test all components render correctly
   - Test all API calls handle errors gracefully

## 📊 Current Status

- ✅ Backend TypeScript compilation: **PASSED**
- ✅ Frontend build: **PASSED**
- ⚠️ Runtime authentication: **NEEDS FIXES**
- ⚠️ Comment resolver: **NEEDS FIX**

## 🚀 Next Steps

1. Apply all Priority 1 fixes
2. Test backend with authentication scenarios
3. Test frontend integration
4. Document all changes
5. Provide restart instructions
