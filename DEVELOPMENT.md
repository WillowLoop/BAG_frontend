# Development Guide

## Quick Start

### Starting the Application

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd /Users/cheersrijneau/Developer/BAG_01/web-ui/backend
./start_dev.sh
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔧 Troubleshooting Checklist

### Before Every Test Session

**Use this checklist if you encounter unexpected behavior:**

#### 1. Clean Restart (5 min)
```bash
# Kill all old processes
pkill -f "npm run dev"
pkill -f "uvicorn"

# Remove build artifacts
rm -rf dist excelflow node_modules/.vite

# Restart servers
npm run dev                    # Terminal 1
cd /path/to/backend && ./start_dev.sh  # Terminal 2
```

#### 2. Browser Cache Clear (CRITICAL!)
**Option A: Incognito Mode (Recommended)**
- Open new incognito/private window
- Navigate to http://localhost:5173
- This bypasses all cache issues

**Option B: Manual Cache Clear**
1. Open DevTools (F12 / Cmd+Option+I)
2. Go to Application → Storage
3. Click "Clear site data"
4. Close and reopen browser tab
5. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

⚠️ **Hard refresh alone is NOT enough!**

#### 3. Verify Servers Are Running
```bash
# Check frontend (should return HTML)
curl -s http://localhost:5173 | head -5

# Check backend (should return JSON)
curl -s http://localhost:8000/api/v1/health | python3 -m json.tool
```

#### 4. Check CORS Configuration
Backend must allow both ports 5173 and 5175:
```bash
# Should see both ports in logs
grep "CORS Enabled" /path/to/backend/logs
```

---

## 🐛 Common Issues & Solutions

### Issue: "Refused to connect" / CSP Errors
**Symptoms:**
- Console shows: `Refused to connect to 'http://localhost:3000'`
- References to `api.excelflow.com`

**Cause:** Browser is loading cached ExcelFlow code

**Solution:**
1. Check for old folders: `ls -la | grep -E "(excelflow|dist)"`
2. Remove if found: `rm -rf excelflow dist`
3. Clear browser cache (see above)
4. Use incognito mode

---

### Issue: Upload gives 422 Error
**Symptoms:**
- Backend logs show: `422 Unprocessable Content`
- Frontend shows validation error

**Cause:** Config parameter format issue

**Solution:**
Upload service should NOT send config parameter (backend uses defaults):
```typescript
// ✅ Correct - No config parameter
const formData = new FormData();
formData.append('file', file);

// ❌ Wrong - Sends config (causes 422)
formData.append('config', JSON.stringify(config));
```

---

### Issue: No Progress Updates (WebSocket)
**Symptoms:**
- Upload works but no progress shown
- Backend warns: "Attempted to send progress to non-existent session"

**Cause:** Frontend WebSocket not connecting

**Debug Steps:**
1. Check WebSocket connection in DevTools Network tab (filter: WS)
2. Verify endpoint: `ws://localhost:8000/api/v1/ws/progress/{sessionId}`
3. Check browser console for WebSocket errors

**Solution:**
```typescript
// Frontend hook should connect on validation start
useEffect(() => {
  if (!sessionId || state !== 'validating') return;

  const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/progress/${sessionId}`);
  // ... rest of implementation
}, [sessionId, state]);
```

---

### Issue: HMR Not Working
**Symptoms:**
- Code changes don't reflect in browser
- Vite logs show updates but browser unchanged

**Cause:** Service worker or aggressive caching

**Solution:**
1. Disable service workers in DevTools
2. Full server restart (see Clean Restart above)
3. Use incognito mode for testing

---

## 📝 Development Workflow

### Making Code Changes

1. **Make your edits**
2. **Check Vite HMR logs** - Should see: `hmr update /src/path/to/file.tsx`
3. **If no HMR:** Restart dev server
4. **Test in incognito** - Avoids cache issues

### Testing Upload Flow

```bash
# Manual API test
curl -X POST http://localhost:8000/api/v1/upload \
  -F file=@/path/to/test.xlsx

# Should return:
# {"success": true, "data": {"session_id": "...", ...}}
```

### Monitoring Logs

```bash
# Frontend (shows HMR, errors)
# Check terminal running npm run dev

# Backend (shows requests, WebSocket)
# Check terminal running ./start_dev.sh

# Filter for specific issues
# Backend: grep "ERROR\|WARNING" in terminal
# Frontend: Check browser console
```

---

## 🎯 Before Reporting Issues

Run through this checklist:

- [ ] Servers fully restarted (killed + fresh start)
- [ ] Old folders removed (`excelflow`, `dist`)
- [ ] Browser cache cleared OR using incognito
- [ ] Both servers showing "ready" in logs
- [ ] CORS includes current frontend port
- [ ] No console errors in browser DevTools
- [ ] Backend health endpoint returns 200

If all checked and issue persists, note:
1. Exact error message (console + logs)
2. Steps to reproduce
3. Which URL you're accessing
4. Browser + version

---

## 🔗 Related Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - User-facing issues
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Backend API reference
