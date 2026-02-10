# Admin Dashboard - Booking Confirmation Feature

Successfully implemented the booking confirmation feature in the Admin Dashboard.

## Changes

1.  **Backend (`tusul_back`)**
    *   Verified `booking` model in `prisma/schema.prisma` has `status` field with `CONFIRMED` enum value.
    *   Verified `updateBooking` mutation in `graphql/resolvers/booking.ts` supports status updates.

2.  **Frontend (`gerbook-travel-site`)**
    *   **Queries:** Added `UPDATE_BOOKING` mutation to `app/admin-dashboard/queries.ts`.
    *   **UI Component:** Updated `app/admin-dashboard/admin-dashboard-content.tsx`:
        *   Imported `Check` icon from `lucide-react`.
        *   Added `useMutation(UPDATE_BOOKING)` hook.
        *   Implemented `handleConfirmBooking` function to call the mutation with `confirm` status.
        *   Added a **Confirm** button (Check icon) to the bookings table. This button is only visible for bookings with `PENDING` status.

## How to Test

1.  Login as an Admin user.
2.  Navigate to the Admin Dashboard.
3.  Go to the **Orders/Bookings** tab (or check the "Camp Bookings" section).
4.  Find a booking with `PENDING` status.
5.  Click the green **Check** icon in the Actions column.
6.  The booking status should update to `CONFIRMED` (green badge) and a success toaster message should appear.
