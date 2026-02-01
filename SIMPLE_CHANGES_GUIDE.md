# Website Changes Guide - Simple Instructions

## What You've Already Done ✅
1. ✅ Added `acceptRequest` method to `src/services/api.js` 
2. ✅ Updated `confirmResponse` function to call `acceptRequest` instead of `respondToAlert`
3. ✅ Removed the `eta` state variable

---

## What's Left To Do (2 Simple Changes)

### Change 1: Remove ETA Input Field from Modal

**File**: `src/pages/dashboard/donor/NearbyRequests.jsx`

**What to do**: Delete lines 245-251 (the ETA input box)

**Find this code** (around line 244-251):
```jsx
<input
    type="text"
    placeholder="ETA (e.g., 20 mins)"
    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
    value={eta}
    onChange={e => setEta(e.target.value)}
/>
```

**Delete it!** That's it. Just remove those 7 lines.

---

### Change 2: Add More Sender Details to Accepted Card

**File**: `src/pages/dashboard/donor/NearbyRequests.jsx`

**What to do**: Add more information fields to show when you accept a request

**Find this code** (around line 140-153 - inside the "Accepted Card" section):
```jsx
<div className="space-y-4">
    <h4 className="text-neutral-400 font-bold uppercase text-xs tracking-wider border-b border-neutral-700/50 pb-2">Patient Details</h4>
    <div>
        <label className="text-neutral-500 text-sm">Patient Name</label>
        <p className="text-xl font-bold">{req.patientName}</p>
    </div>
    {req.patientNumber && (
        <div>
            <label className="text-neutral-500 text-sm">Patient Phone</label>
            <p className="text-xl font-bold">{req.patientNumber}</p>
        </div>
    )}
    <div>
        <label className="text-neutral-500 text-sm">Hospital</label>
        <p className="text-lg font-bold text-white/90">{req.hospitalName}</p>
    </div>
</div>
```

**Add these new fields** (right after the Hospital div, before the closing `</div>`):
```jsx
{req.attenderName && (
    <div>
        <label className="text-neutral-500 text-sm">Attender Name</label>
        <p className="text-lg font-bold text-white/90">{req.attenderName}</p>
    </div>
)}
{req.attenderNumber && (
    <div>
        <label className="text-neutral-500 text-sm">Attender Contact</label>
        <p className="text-lg font-bold text-white/90">{req.attenderNumber}</p>
    </div>
)}
{req.requesterName && (
    <div>
        <label className="text-neutral-500 text-sm">Requester Name</label>
        <p className="text-lg font-bold text-white/90">{req.requesterName}</p>
    </div>
)}
{req.requiredTime && (
    <div>
        <label className="text-neutral-500 text-sm">Required Time</label>
        <p className="text-lg font-bold text-white/90">{req.requiredTime}</p>
    </div>
)}
```

---

## That's It!

After these 2 changes:
1. The ETA input will be removed from the confirmation popup  
2. When you accept a request, you'll see all the sender's details (attender info, requester, required time)

Then you're 100% done! 🎉
