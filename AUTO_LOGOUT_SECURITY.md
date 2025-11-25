# 🔒 Auto-Logout Security Feature

## 🎯 Хэрэгжүүлсэн:

### 1. ✅ **5 минут idle timeout**
- Хэрэглэгч 5 минут ямар ч үйлдэл хийхгүй бол автоматаар logout
- localStorage бүрэн цэвэрлэгдэнэ
- Login хуудас руу redirect хийгдэнэ

### 2. ✅ **Activity tracking**
Дараах үйлдлүүд "activity" гэж тооцогдоно:
- `mousedown` - Mouse дарах
- `mousemove` - Mouse хөдөлгөх
- `keypress` - Товчлуур дарах
- `scroll` - Scroll хийх
- `touchstart` - Touch хийх (mobile)
- `click` - Click хийх

### 3. ✅ **localStorage цэвэрлэлт**
```javascript
localStorage.clear();  // Бүх data устгагдана
```

---

## 📁 Шинэ файл: `hooks/use-idle-logout.tsx`

### Implementation:
```typescript
export function useIdleLogout({ 
  timeout = 5 * 60 * 1000, // 5 minutes default
  onLogout 
}: UseIdleLogoutProps = {}) {
  const router = userouter();
  const timeoutId = useref<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    console.log("🔴 Auto-logout triggered");
    localStorage.clear();
    if (onLogout) onLogout();
    router.push("/login");
  };

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(handleLogout, timeout);
  };

  useEffect(() => {
    const events = [
      "mousedown", "mousemove", "keypress", 
      "scroll", "touchstart", "click"
    ];

    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeout]);
}
```

---

## 🔧 Dashboard integration:

### user Dashboard:
```typescript
export default function userDashboardContent() {
  const { logout, user } = useAuth();
  
  useIdleLogout({
    timeout: 5 * 60 * 1000,
    onLogout: logout,
  });
  // ...
}
```

### Herder Dashboard:
```typescript
export default function HerderDashboardContent() {
  const { logout, user } = useAuth();
  
  useIdleLogout({
    timeout: 5 * 60 * 1000,
    onLogout: logout,
  });
  // ...
}
```

### Admin Dashboard:
```typescript
export default function AdminDashboardContent() {
  const { logout, user } = useAuth();
  
  useIdleLogout({
    timeout: 5 * 60 * 1000,
    onLogout: logout,
  });
  // ...
}
```

---

## 💾 Payment Modal Updates:

### 1. Company Name:
```diff
- <p>Gerbook Travel LLC</p>
+ <p>Малчин Camp LLC</p>
```

### 2. Phone Number Placeholder:
```diff
- placeholder="99112233"
+ placeholder="********"
```

---

## 🧪 Testing:

### Test 1: Idle Timeout
```bash
1. Login to dashboard
2. Wait 5 minutes without any activity
3. Timer expires
✅ Auto-logout
✅ localStorage cleared
✅ Redirected to /login
```

### Test 2: Activity Reset
```bash
1. Login to dashboard
2. Wait 4 minutes
3. Move mouse
4. Timer resets
5. Wait another 4 minutes
6. Click somewhere
✅ Timer resets again
```

### Test 3: Multiple Activities
```bash
1. Login
2. Scroll (resets timer)
3. Type something (resets timer)
4. Click button (resets timer)
✅ Each activity resets the 5-minute timer
```

### Test 4: localStorage Clear
```bash
1. Login
2. Add items to cart
3. Save some camps
4. Wait 5 minutes
5. Auto-logout
6. Check localStorage
✅ All data cleared
```

---

## 📊 Timer Flow:

```
user logs in
     ↓
[5:00 Timer starts]
     ↓
user activity (e.g., click)
     ↓
[5:00 Timer resets]
     ↓
No activity for 5:00
     ↓
[0:00 Timer expires]
     ↓
Auto-logout:
  - localStorage.clear()
  - onLogout()
  - router.push("/login")
```

---

## 🔐 Security Benefits:

### 1. **Unattended Sessions**
- user forgets to logout
- Computer left unattended
- ✅ Auto-logout after 5 minutes

### 2. **Public Computers**
- Internet cafe
- Library
- ✅ Session automatically ends

### 3. **Data Protection**
- localStorage cleared
- No sensitive data left behind
- ✅ Fresh start on next login

### 4. **Token Expiry**
- JWT tokens in localStorage removed
- ✅ Prevents token hijacking

---

## ⚙️ Configuration:

### Change Timeout:
```typescript
// 10 minutes instead of 5
useIdleLogout({
  timeout: 10 * 60 * 1000,
  onLogout: logout,
});

// 1 minute (for testing)
useIdleLogout({
  timeout: 1 * 60 * 1000,
  onLogout: logout,
});
```

### Custom Logout Handler:
```typescript
useIdleLogout({
  timeout: 5 * 60 * 1000,
  onLogout: () => {
    // Custom cleanup
    console.log("Logging out...");
    clearuserData();
    logout();
  },
});
```

---

## 🚀 Future Enhancements:

### Phase 2: Warning Modal
```typescript
// Show warning 1 minute before logout
if (remainingTime === 60000) {
  showWarningModal({
    title: "Session expiring",
    message: "You will be logged out in 1 minute",
    action: "Stay logged in",
  });
}
```

### Phase 3: Session Extension
```typescript
// Allow user to extend session
const extendSession = () => {
  resetTimer();
  toast({ title: "Session extended by 5 minutes" });
};
```

### Phase 4: Different Timeouts
```typescript
const timeouts = {
  CUSTOMER: 5 * 60 * 1000,    // 5 minutes
  HERDER: 10 * 60 * 1000,     // 10 minutes
  ADMIN: 30 * 60 * 1000,      // 30 minutes
};

useIdleLogout({
  timeout: timeouts[user.role],
  onLogout: logout,
});
```

### Phase 5: Activity Log
```typescript
// Log user activity for security audit
const logActivity = (event: string) => {
  console.log(`[${new Date().toISOString()}] ${event}`);
};
```

---

## 📝 Console Logs:

### Development Mode:
```javascript
🔴 Auto-logout triggered due to inactivity
```

### Activity Tracking (if enabled):
```javascript
[2025-10-18T10:30:00] mousedown
[2025-10-18T10:30:15] scroll
[2025-10-18T10:31:00] click
```

---

## ✅ Summary:

✅ Auto-logout after 5 minutes
✅ Activity tracking (6 events)
✅ localStorage cleared on logout
✅ Redirect to login page
✅ Works on all dashboards (user, Herder, Admin)
✅ Configurable timeout
✅ Custom logout handler support
✅ Clean event listener cleanup

---

## 🔒 Security Checklist:

- ✅ Session timeout implemented
- ✅ localStorage cleared
- ✅ Tokens removed
- ✅ user redirected
- ✅ No sensitive data left
- ✅ Works on mobile (touch events)
- ✅ Works on desktop (mouse/keyboard)
- ✅ Cleanup on unmount

---

Амжилт хүсье! 🔐🚀

