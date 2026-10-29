# ShareSpace

**Use what exists. Share what matters.**

A peer-to-peer platform where anyone in a college can lend underused equipment and spaces (cameras, 3D printers, lab rooms) and anyone can borrow them, with eligibility checks, fair-use limits, condition records and a full audit history.

Built for the hackathon problem statement: *Unlock Underused Equipment and Spaces*.

## Live demo
**https://sharespace-connect.netlify.app**

No sign-up needed. On the login page, choose a demo person (all data is fictional):

| Person | Use it to |
|---|---|
| Aarav Sharma | Borrow as a trained user |
| Dr. Meera Kulkarni | List items and review requests |
| Riya Patil | See the "training required" block (untrained user) |
| Admin User | Oversight |

## Try the full journey (about 3 minutes)
1. Log in as **Aarav**, open **Canon DSLR Camera**, and request it for 2 days with a purpose.
2. Open **My Bookings** to see it as **Pending**, with the reason shown.
3. Log in as **Meera**, open **My Listings**, and approve the request.
4. As Meera, check the item out (condition note), then confirm the return (condition note).
5. Open **History** on the booking to see every action recorded.
6. Open **Profile** to see points, level and badges.

Also try: request the same dates again (**Waitlisted**), request more than 3 days (blocked), and log in as **Riya** and request the 3D Printer (blocked, training required).

## Features
- Resource listings with location, rules, max days and training requirements
- Search and filter
- Anyone can list and anyone can borrow (you cannot book your own item)
- Eligibility checks (training) with clear reasons
- Booking requests with approve, reject and waiting-list outcomes
- Fair-use limits: max 2 active bookings per person and max days per resource
- Check-out and return with before-and-after condition notes
- Damage and overdue reporting
- In-app notifications
- Activity history for every important action
- Points, levels and badges that reward on-time returns and sharing
- Light (teal) and dark mode

## Fairness, privacy and safety
- Waiting list instead of rejection when dates clash
- Per-person booking limit prevents monopolising items
- Every decision shows a plain-language reason
- Owners always make approval and damage decisions; nothing is decided by AI alone
- Only fictional demo data; no sensitive personal data collected

## Tech stack
React, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, React Router, Supabase (Postgres database and storage), Netlify (hosting).

## AI tools and disclosure
- Google AI Studio (Gemini) was used to generate and edit application code.
- Claude was used for planning, database