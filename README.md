# 404-frontend

Frontend repo

## Environment Variables

Copy `.env.example` and set the values for your environment.

Optional variables:

- `VITE_KAKAO_JS_KEY`
- `VITE_API_BASE_URL`

## Vercel Deployment

This project uses `vercel.json` rewrites so the frontend can call `/api/...`
and Vercel will proxy those requests to the backend server.

Example:

```env
VITE_KAKAO_JS_KEY=your_kakao_javascript_key
```

Notes:

- In production on Vercel, `/api/*` is rewritten to `http://54.180.223.140:8080/api/*`.
- `VITE_API_BASE_URL` is optional and mainly useful for non-Vercel environments.
- On HTTPS deployments, insecure `http://...` API base URLs are ignored so the app can fall back to same-origin `/api/*`.
- Add the deployed frontend domain to the Kakao Developers allowed domain list.
