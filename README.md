# Revenue Ripple

## Backend CORS and Health

- The backend runs on Render (Flask). CORS is configured via `ALLOWED_ORIGINS`.
- Preflight (OPTIONS) is handled globally and returns 204 with proper headers.
- Health endpoints:
  - `/health` → `{ ok: true }`
  - `/cors-test` → echoes method and headers; supports OPTIONS.

### Configure allowed origins
Set `ALLOWED_ORIGINS` in Render (comma-separated):
```
https://*.vercel.app,https://revenue-ripple.vercel.app,https://revenueripple.org,https://www.revenueripple.org,http://localhost:3000,http://localhost:5173
```

## Frontend API base and proxy

<<<<<<< Current (Your changes)
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
- Use `VITE_API_BASE_URL` or `NEXT_PUBLIC_API_URL` to override API base.
- Fallbacks: prod → `https://revenue-ripple.onrender.com`, dev → `http://localhost:5001`.
- Toggle proxy with `VITE_USE_PROXY` or `NEXT_PUBLIC_USE_PROXY` (if a proxy route is added).
- Ensure the Ripple widget is enabled: `NEXT_PUBLIC_ENABLE_RIPPLE=1`.

## Diagnostics

- Probe CORS and endpoints:
```
npm run diag:options
# Env:
API_URL=https://revenue-ripple.onrender.com TEST_ORIGIN=https://your-branch-yourapp.vercel.app npm run diag:options
```
- Print env flags at runtime:
```
npm run diag:env
```

## Tests/Health Checks

- Add CI/deploy step to call `/health` and fail if non-200.
>>>>>>> Incoming (Background Agent changes)
