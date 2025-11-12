# Troubleshooting Guide - BAG Address Validation Frontend

## Common Issues and Solutions

### Upload Issues

#### Problem: "Alleen .xlsx bestanden zijn toegestaan"

**Cause**: File type is not .xlsx

**Solutions**:
1. Verify file extension is exactly `.xlsx`
2. Convert .xls files to .xlsx format
3. Ensure file is not renamed from another format
4. Check file MIME type is correct

#### Problem: "Bestand te groot"

**Cause**: File exceeds 10MB limit

**Solutions**:
1. Reduce number of rows in Excel file
2. Remove unnecessary columns
3. Compress images if embedded in Excel
4. Split into multiple smaller files

#### Problem: Upload progress stuck at 0%

**Cause**: Network connection or CORS issue

**Solutions**:
1. Check internet connection
2. Verify BAG API is running
3. Check browser console for CORS errors
4. Verify `VITE_BAG_API_BASE_URL` is correct
5. Ensure backend CORS is configured

### Validation Issues

#### Problem: Validation stuck at same percentage

**Cause**: Backend processing issue or polling stopped

**Solutions**:
1. Wait for 5-minute timeout
2. Check backend logs for errors
3. Verify status endpoint is responding
4. Check browser network tab for failed requests
5. Refresh page and try again

#### Problem: "Validatie mislukt"

**Cause**: Backend validation error

**Solutions**:
1. Check Excel file structure (required columns)
2. Verify addresses are in correct format
3. Check backend logs for specific error
4. Try with a smaller test file
5. Contact support if persistent

#### Problem: Progress shows but no status updates

**Cause**: Polling not receiving data

**Solutions**:
1. Check browser console for errors
2. Verify status endpoint URL is correct
3. Check network tab for 404 or 500 errors
4. Ensure backend status endpoint is implemented
5. Verify session_id is valid

### Download Issues

#### Problem: "Download mislukt"

**Cause**: File not ready or session expired

**Solutions**:
1. Wait a few seconds and retry
2. Verify validation completed successfully
3. Check if session is still active
4. Start new validation if session expired
5. Check browser console for errors

#### Problem: Downloaded file is corrupted

**Cause**: Incomplete download or encoding issue

**Solutions**:
1. Try downloading again
2. Check browser download settings
3. Verify backend is sending correct content-type
4. Check file size matches expected size
5. Try different browser

#### Problem: Download starts but fails partway

**Cause**: Network interruption

**Solutions**:
1. Check internet connection stability
2. Try downloading again
3. Use wired connection if on WiFi
4. Check if download timeout is too short
5. Contact support if persistent

### Error Messages

#### "Geen verbinding met de server"

**Cause**: Network connection lost

**Solutions**:
1. Check internet connection
2. Verify BAG API is running
3. Check firewall settings
4. Try different network
5. Check VPN if applicable

#### "Te veel verzoeken"

**Cause**: Rate limit exceeded (429)

**Solutions**:
1. Wait 1 minute before retrying
2. Reduce upload frequency
3. Check if multiple users sharing IP
4. Contact support to increase limits
5. Use different network if urgent

#### "Server fout"

**Cause**: Backend error (500)

**Solutions**:
1. Wait a few minutes and retry
2. Try with different file
3. Check if backend is under maintenance
4. Contact support
5. Check status page if available

#### "Sessie niet gevonden"

**Cause**: Session expired or not found

**Solutions**:
1. Start new validation
2. Don't refresh page during validation
3. Complete validation within session timeout
4. Check if backend cleaned up session too early
5. Contact support if happening frequently

### Configuration Issues

#### Problem: API calls going to wrong URL

**Cause**: Environment variable not set or incorrect

**Solutions**:
1. Verify `.env.development` exists
2. Check `VITE_BAG_API_BASE_URL` is set correctly
3. Restart development server after changing env
4. Check for typos in URL
5. Verify port number is correct

#### Problem: Build fails with TypeScript errors

**Cause**: Type errors in code

**Solutions**:
1. Run `npm run lint` to see all errors
2. Fix type errors shown
3. Check for missing type definitions
4. Update `@types/*` packages if needed
5. Check TypeScript version compatibility

#### Problem: Tests failing

**Cause**: Various - check specific test

**Solutions**:
1. Run `npm test` to see which tests fail
2. Check test setup in `src/test/setup.ts`
3. Verify mocks are configured correctly
4. Check for async timing issues
5. Update snapshots if UI changed: `npm test -- -u`

### Browser Compatibility Issues

#### Problem: App not working in Safari

**Cause**: Browser-specific API not supported

**Solutions**:
1. Check Safari version (14+ required)
2. Enable JavaScript if disabled
3. Clear cache and cookies
4. Check console for specific errors
5. Try different browser temporarily

#### Problem: Drag-and-drop not working

**Cause**: Browser restrictions or event handlers

**Solutions**:
1. Try using file picker button instead
2. Check if browser has drag-and-drop enabled
3. Verify file permissions
4. Try different browser
5. Check browser console for errors

### Performance Issues

#### Problem: Initial load is slow

**Cause**: Large bundle size or slow network

**Solutions**:
1. Check bundle size: `npm run build`
2. Enable caching in browser
3. Check network speed
4. Verify CDN is working (if using)
5. Consider code splitting if bundle >500KB

#### Problem: UI feels sluggish

**Cause**: Too many re-renders or slow operations

**Solutions**:
1. Check browser dev tools performance tab
2. Reduce polling frequency if needed
3. Check for memory leaks
4. Close other browser tabs
5. Restart browser

### Development Issues

#### Problem: Hot reload not working

**Cause**: Vite dev server issue

**Solutions**:
1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Check if port 5173 is blocked
4. Try different port in `vite.config.ts`
5. Check for file watcher issues

#### Problem: Cannot install dependencies

**Cause**: npm/node version or network issue

**Solutions**:
1. Check Node version (18+ or 20+ required)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`
4. Run `npm install` again
5. Try using `npm ci` for clean install

## Debugging Tips

### Browser Console

1. Open Developer Tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for storage issues

### Network Debugging

1. Filter by XHR in Network tab
2. Check request/response headers
3. Verify request payload
4. Check response status code
5. Look for CORS errors

### React DevTools

1. Install React Developer Tools extension
2. Check component tree
3. Inspect component props and state
4. Check context values
5. Profile component renders

### TanStack Query DevTools

Already included in development mode:
1. Look for floating TanStack Query icon
2. Click to open DevTools
3. Check query states
4. Verify mutations
5. Check cache data

## Getting Help

### Before Contacting Support

Gather this information:
1. Error message (exact text)
2. Browser and version
3. Steps to reproduce
4. Screenshots if applicable
5. Browser console errors
6. Network tab showing failed requests

### Contact Information

- **Development Team**: [team email]
- **Support**: [support email]
- **Documentation**: See README.md
- **Bug Reports**: [issue tracker URL]

### Useful Commands

```bash
# Check versions
node --version
npm --version

# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install

# Run with verbose logging
npm run dev --verbose

# Build with debug info
npm run build -- --debug

# Check for outdated packages
npm outdated

# Security audit
npm audit

# Fix security issues
npm audit fix
```

## Known Issues

### Issue: Polling continues after page close

**Status**: Won't fix (expected behavior)

**Workaround**: Polling stops when component unmounts

### Issue: Multiple toasts on rapid errors

**Status**: Under investigation

**Workaround**: Debounce error handling

### Issue: File size validation slightly off

**Status**: Known (JavaScript binary vs decimal)

**Workaround**: Keep files well under 10MB

## Frequently Asked Questions

**Q: Can I upload .xls files?**
A: No, only .xlsx format is supported for BAG validation.

**Q: Why does validation take so long?**
A: Processing time depends on file size and BAG API load. Large files may take several minutes.

**Q: Can I close the browser during validation?**
A: No, validation will be interrupted. Keep the page open until complete.

**Q: How do I know if my file has the right structure?**
A: Check the error message. Required columns will be mentioned if structure is incorrect.

**Q: Can I validate the same file multiple times?**
A: Yes, upload it again to start a new validation.

**Q: Why can't I download after refreshing the page?**
A: Session is lost on page refresh. Complete validation in one session.

**Q: Is there a limit to file size?**
A: Yes, 10MB maximum. Files larger than this must be split.

**Q: How long are results stored?**
A: Results are cleaned up after download. Download immediately after validation.

## Additional Resources

- **README**: `/README.md`
- **API Documentation**: `/docs/api-integration.md`
- **Architecture**: `/docs/architecture.md`
- **Deployment**: `/docs/deployment.md`
- **Backend API Docs**: `/API_DOCUMENTATION.md`
