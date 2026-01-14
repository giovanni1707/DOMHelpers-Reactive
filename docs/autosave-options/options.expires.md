# `options.expires` - Data Expiration Configuration

## Quick Start (30 seconds)

```javascript
const sessionToken = state({ token: 'abc123' });

// Without expiration - stays forever
autoSave(sessionToken, 'token');

// With expiration - automatically expires after time
autoSave(sessionToken, 'token', {
  expires: 3600  // Expires in 1 hour (3600 seconds)
});

// After 1 hour:
console.log(sessionToken.$exists()); // false (expired and auto-deleted)
console.log(sessionToken.token);     // null (data gone) ✨
```

**What just happened?** You set an automatic expiration time - data self-destructs after the specified duration!

  

## What is `options.expires`?

`options.expires` is a configuration option that **automatically deletes saved data after a specified time period**.

Simply put: it's like a self-destruct timer for your data. After the time expires, the data is automatically removed from storage.

Think of it as **setting an expiration date** - like milk in the fridge, your data goes bad after a while.

  

## Syntax

```javascript
autoSave(state, key, {
  expires: seconds
})
```

**Value:**
- Number of seconds until expiration (e.g., `60`, `3600`, `86400`)
- `null` or omitted for no expiration

**Default:** `null` (no expiration)

  

## Why Does This Exist?

### The Problem: Data That Should Be Temporary

Some data shouldn't persist forever:

```javascript
const authToken = state({ token: 'secure123' });

// Without expiration
autoSave(authToken, 'auth');

// Token saved permanently
// Problems:
// - Security risk (token stays on disk)
// - Stale data (token might be invalid)
// - Manual cleanup required
// - Users stay "logged in" forever ❌
```

**What's the Real Issue?**

```
Save data to storage
        |
        v
Data persists forever
        |
        v
Security and privacy risks
        |
        v
Manual cleanup needed ❌
```

**Problems:**
❌ **Security risks** - Sensitive data stays on disk  
❌ **Stale data** - Old data never cleaned up  
❌ **Manual cleanup** - Must remember to delete old data  
❌ **Storage bloat** - Accumulates unnecessary data  

### The Solution with `options.expires`

```javascript
const authToken = state({ token: 'secure123' });

// Expires in 1 hour
autoSave(authToken, 'auth', {
  expires: 3600
});

// After 1 hour:
// - Data automatically deleted
// - Security improved ✅
// - No manual cleanup needed ✅
// - User automatically "logged out" ✅
```

**What Just Happened?**

```
Save with expiration timestamp
        |
        v
User tries to load later
        |
        v
Check: Is it expired?
        |
    YES |  NO
        |   └──> Return data
        v
Delete and return null ✅
```

**Benefits:**
✅ **Automatic cleanup** - Old data self-destructs  
✅ **Better security** - Sensitive data doesn't linger  
✅ **No manual work** - Expiration handled automatically  
✅ **Fresh data** - Stale data automatically removed  

  

## Mental Model

Think of data without expiration as **non-perishable food**:

```
No Expiration (Canned Food)
┌─────────────────────┐
│  Stays good forever │
│                     │
│  Never goes bad     │
│                     │
│  Must manually      │
│  remove when done   │
└─────────────────────┘
```

Think of expiration as **fresh food with dates**:

```
With Expiration (Fresh Food)
┌─────────────────────┐
│  Best before: 1 hr  │
│                     │
│  After 1 hour:      │
│  Automatically      │
│  thrown away        │
│                     │
│  No action needed ✨│
└─────────────────────┘
```

**Key Insight:** Expiration makes temporary data truly temporary.

  

## How Does It Work?

Expiration works by storing a timestamp with your data:

### The Expiration Process

**1️⃣ Save with Expiration**
```javascript
autoSave(state, 'token', {
  expires: 3600  // 1 hour
});
```

**2️⃣ Storage Format**
```javascript
// What gets saved to localStorage:
{
  value: { token: 'abc123' },      // Your actual data
  timestamp: 1704123456789,         // When it was saved
  expires: 1704127056789            // timestamp + 3600000ms
}
```

**3️⃣ Load and Check**
```javascript
// Later, when loading:
const stored = JSON.parse(localStorage.getItem('token'));

if (stored.expires && Date.now() > stored.expires) {
  // Expired!
  localStorage.removeItem('token');
  return null;  // No data available
}

return stored.value;  // Still valid
```

### Visual Timeline

```
Save:    Now
         |
         v
[========= 1 hour validity period =========]
                                            |
                                            v
                                     Expires: Auto-deleted
                                     
User tries to load:
  Within 1 hour  → Data returned ✅
  After 1 hour   → null returned, data deleted ✅
```

  

## Basic Usage

### Example 1: Session Token (1 Hour)

```javascript
const session = state({ token: '', userId: '' });

autoSave(session, 'session', {
  expires: 3600  // 1 hour
});

// Auto-expires after 1 hour
// User automatically "logged out"
```

  

### Example 2: Cache (24 Hours)

```javascript
const apiCache = state({ data: {} });

autoSave(apiCache, 'cache', {
  expires: 86400  // 24 hours (60 * 60 * 24)
});

// Cache refreshes daily automatically
```

  

### Example 3: Temporary Draft (7 Days)

```javascript
const draft = state({ content: '' });

autoSave(draft, 'draft', {
  expires: 604800  // 7 days (60 * 60 * 24 * 7)
});

// Old drafts auto-delete after a week
```

  

## Real-World Examples

### Example 1: Authentication with Auto-Logout

```javascript
const auth = state({
  token: '',
  user: null,
  expiresAt: null
});

// Session expires in 2 hours
autoSave(auth, 'auth', {
  expires: 7200
});

// Check auth status
effect(() => {
  if (!auth.$exists()) {
    // Session expired - show login
    showLoginScreen();
  } else {
    showDashboard();
  }
});

function login(username, password) {
  auth.token = authenticateUser(username, password);
  auth.user = username;
  auth.expiresAt = Date.now() + (7200 * 1000);
  // Automatically logs out after 2 hours ✨
}
```

  

### Example 2: Temporary Download Links

```javascript
const downloadLinks = state({ links: [] });

// Links expire in 1 hour
autoSave(downloadLinks, 'downloads', {
  expires: 3600
});

function generateDownload(file) {
  const link = {
    url: generateSecureLink(file),
    filename: file.name,
    expires: Date.now() + 3600000
  };
  
  downloadLinks.links.push(link);
  // Link auto-expires after 1 hour ✨
}
```

  

### Example 3: OTP Verification

```javascript
const otpState = state({
  code: '',
  phone: '',
  verified: false
});

// OTP expires in 5 minutes
autoSave(otpState, 'otp', {
  expires: 300
});

function sendOTP(phone) {
  const code = generateOTP();
  otpState.code = code;
  otpState.phone = phone;
  otpState.verified = false;
  
  // User has 5 minutes to verify ✨
}

function verifyOTP(input) {
  if (!otpState.$exists()) {
    return { success: false, error: 'OTP expired' };
  }
  
  if (input === otpState.code) {
    otpState.verified = true;
    return { success: true };
  }
  
  return { success: false, error: 'Invalid OTP' };
}
```

  

### Example 4: Promo Code with Expiration

```javascript
const promoState = state({
  code: '',
  discount: 0,
  appliedAt: null
});

// Promo expires in 30 minutes
autoSave(promoState, 'promo', {
  expires: 1800
});

function applyPromo(code) {
  if (validatePromo(code)) {
    promoState.code = code;
    promoState.discount = 0.2; // 20% off
    promoState.appliedAt = Date.now();
    
    showToast('Promo applied! Valid for 30 minutes');
  }
}

// Check if promo is still valid
effect(() => {
  const isValid = promoState.$exists();
  document.getElementById('promo-badge').style.display = 
    isValid ? 'block' : 'none';
});
```

  

### Example 5: Search Results Cache

```javascript
const searchCache = state({ results: {}, queries: [] });

// Cache expires in 15 minutes
autoSave(searchCache, 'searchCache', {
  expires: 900
});

async function search(query) {
  // Check if cached and valid
  if (searchCache.results[query]) {
    return searchCache.results[query];
  }
  
  // Not cached or expired - fetch fresh
  const results = await fetchSearchResults(query);
  
  searchCache.results[query] = results;
  searchCache.queries.push({ query, time: Date.now() });
  
  return results;
}
```

  

## Common Patterns

### Pattern 1: Different Expiration Times

```javascript
// Short-lived: Session token (1 hour)
const session = state({ token: '' });
autoSave(session, 'session', { expires: 3600 });

// Medium-lived: API cache (6 hours)
const cache = state({ data: {} });
autoSave(cache, 'cache', { expires: 21600 });

// Long-lived: User preferences (30 days)
const prefs = state({ theme: 'light' });
autoSave(prefs, 'prefs', { expires: 2592000 });
```

  

### Pattern 2: Countdown Display

```javascript
const tempData = state({
  value: '',
  savedAt: Date.now()
});

autoSave(tempData, 'temp', {
  expires: 3600
});

// Show time remaining
setInterval(() => {
  if (tempData.$exists()) {
    const elapsed = Date.now() - tempData.savedAt;
    const remaining = 3600 - Math.floor(elapsed / 1000);
    
    if (remaining > 0) {
      document.getElementById('timer').textContent = 
        `Expires in ${Math.floor(remaining / 60)}m ${remaining % 60}s`;
    }
  }
}, 1000);
```

  

### Pattern 3: Extend Expiration on Activity

```javascript
const session = state({ token: '', lastActivity: Date.now() });

autoSave(session, 'session', {
  expires: 1800  // 30 minutes
});

// Extend session on user activity
document.addEventListener('click', () => {
  if (session.$exists()) {
    session.lastActivity = Date.now();
    session.$save();  // Resets expiration timer
  }
});
```

  

### Pattern 4: Warn Before Expiration

```javascript
const sessionData = state({
  data: {},
  expiresAt: null
});

autoSave(sessionData, 'session', {
  expires: 3600
});

// Warn 5 minutes before expiration
setInterval(() => {
  if (sessionData.expiresAt) {
    const timeLeft = sessionData.expiresAt - Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (timeLeft < fiveMinutes && timeLeft > 0) {
      showToast('Session expiring soon!');
    }
  }
}, 60000);
```

  

### Pattern 5: Graceful Expiration Handling

```javascript
const cachedData = state({ items: [] });

autoSave(cachedData, 'cache', {
  expires: 3600,
  autoLoad: true
});

// Handle expiration gracefully
if (!cachedData.$exists() || cachedData.items.length === 0) {
  // Cache expired or empty - fetch fresh data
  fetchFreshData().then(data => {
    cachedData.items = data;
  });
} else {
  // Use cached data
  displayData(cachedData.items);
}
```

  

## Common Expiration Times

```
┌─────────────────────┬──────────┬─────────────────┐
│ Use Case            │ Seconds  │ Duration        │
├─────────────────────┼──────────┼─────────────────┤
│ OTP verification    │ 300      │ 5 minutes       │
│ Form drafts         │ 1800     │ 30 minutes      │
│ Session tokens      │ 3600     │ 1 hour          │
│ API cache           │ 21600    │ 6 hours         │
│ Download links      │ 86400    │ 24 hours        │
│ Temporary data      │ 604800   │ 7 days          │
│ Long-term cache     │ 2592000  │ 30 days         │
└─────────────────────┴──────────┴─────────────────┘
```

### Quick Calculations

```javascript
const MINUTE = 60;
const HOUR = 60 * MINUTE;      // 3600
const DAY = 24 * HOUR;         // 86400
const WEEK = 7 * DAY;          // 604800
const MONTH = 30 * DAY;        // 2592000

// Usage
autoSave(state, 'key', { expires: 5 * MINUTE });   // 5 min
autoSave(state, 'key', { expires: 2 * HOUR });     // 2 hours
autoSave(state, 'key', { expires: 7 * DAY });      // 1 week
```

  

## Security Benefits

### Pattern: Sensitive Data Auto-Cleanup

```javascript
// Credit card info (expires in 5 minutes)
const paymentData = state({
  cardNumber: '',
  cvv: '',
  expiry: ''
});

autoSave(paymentData, 'payment', {
  expires: 300,  // 5 minutes
  storage: 'sessionStorage'  // Extra security
});

// After payment or 5 minutes:
// - Data automatically deleted
// - No manual cleanup needed
// - Reduced security risk ✨
```

  

## Summary

**What is `options.expires`?**  
A configuration option that automatically deletes saved data after a specified time period.

**Why use it?**
- ✅ Automatic data cleanup
- ✅ Better security (sensitive data doesn't linger)
- ✅ Fresher data (stale data removed)
- ✅ Storage hygiene (no manual cleanup needed)
- ✅ Privacy protection

**Key Takeaway:**

```
No Expiration           With Expiration
      |                        |
Data forever            Auto-expires
      |                        |
Manual cleanup          Self-cleaning
      |                        |
Security risk ❌        Secure ✅
```

**One-Line Rule:** Use expiration for data that should be temporary.

**Best Practices:**
- Use for authentication tokens
- Use for temporary caches
- Use for sensitive data
- Match expiration to business logic
- Combine with sessionStorage for extra security

**Common Times:**
- **5 min**: OTP codes
- **30 min**: Form drafts
- **1 hour**: Session tokens
- **24 hours**: API cache
- **7 days**: Temporary data

**Remember:** Data that expires is more secure! 🎉