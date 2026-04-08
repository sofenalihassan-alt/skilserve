

# Booking System Enhancement

## Overview
Add a "Book" button to every provider card that opens a booking dialog. The dialog collects problem details, preferred date/time, and urgency. On submit, it creates a pending booking request. On the provider side (Bookings page), providers can manage requests with confirm/decline/start/complete workflow. Message button on booking cards is only shown after a booking is confirmed (except for emergency 24/7 providers where both message and book work simultaneously).

## 1. Create BookingDialog Component
**New file:** `src/components/BookingDialog.tsx`

A dialog/sheet that opens when "Book" is clicked on a provider card:
- Fields: Problem description (textarea, required), preferred date (date picker), estimated duration (select: 1-8 hrs), additional notes, urgency toggle (normal/urgent)
- Auto-calculates estimated cost from provider's hourly rate × duration
- On submit: inserts into `bookings` table with status `pending`
- Shows success toast with booking confirmation
- Validates all inputs with Zod

## 2. Update ProviderCard -- Add Book Button
**Edit:** `src/components/ProviderCard.tsx`

- Add a "Book" button alongside Call and Message in the action row
- For non-emergency providers: show Book + Call buttons; hide Message until booking is confirmed (this requires checking if user has an active/confirmed booking with this provider)
- For emergency (24/7) providers: show all three buttons (Book, Call, Message) always
- The Book button opens the `BookingDialog`

## 3. Update Bookings Page -- Provider Management
**Edit:** `src/pages/Bookings.tsx`

Enhance the provider-side "Client Requests" tab:
- Add summary stats at top: pending count, confirmed count, in-progress count, completed count
- Show customer phone number (from profiles) on confirmed bookings
- Message button only appears on confirmed+ bookings (provider side)
- Add a filter/sort for booking status
- Provider workflow: Pending → Confirm/Decline → Start Work → Mark Complete

## 4. Conditional Message Button Logic
**Edit:** `src/components/ProviderCard.tsx`

- Query `bookings` table to check if current user has a confirmed/in_progress booking with this provider
- If yes OR if provider is 24/7 emergency: show Message button
- If no confirmed booking and not emergency: hide Message button, show tooltip "Book first to message"

## What won't change
- Database schema stays the same (bookings table already has all needed columns)
- No new tables or migrations needed
- RLS policies already support user inserts and provider reads

## Files
- **Create:** `src/components/BookingDialog.tsx`
- **Edit:** `src/components/ProviderCard.tsx`, `src/pages/Bookings.tsx`
- No database changes needed

