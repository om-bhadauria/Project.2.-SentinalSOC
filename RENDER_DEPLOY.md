# Deploy SentinelSOC on Render

This project is ready for Render Blueprint deployment with `render.yaml`.

## What Render Creates

- `sentinelsoc-api`: Docker web service for the Node backend.
- `sentinelsoc-dashboard`: Static React frontend.

## Required Secret During Blueprint Setup

Render will ask for:

```text
DEMO_ADMIN_PASS
VT_API_KEY
```

Use this demo password if you want the current login hint to work:

```text
SentinelDemo123!
```

`VT_API_KEY` can be left blank for demo mode.

## Deploy Steps

1. Push this folder to a GitHub repository.
2. In Render, choose **New +** > **Blueprint**.
3. Select the repository.
4. Render will detect `render.yaml`.
5. Enter `DEMO_ADMIN_PASS`.
6. Apply the Blueprint.

After deployment:

```text
Frontend: https://sentinelsoc-dashboard.onrender.com
Backend:  https://sentinelsoc-api.onrender.com
Health:   https://sentinelsoc-api.onrender.com/health
```

Login:

```text
admin@sentinel.soc
SentinelDemo123!
```

## Important

Render cannot deploy directly from a local folder on your computer. It needs a Git repository, or a Render API call that points to a Git repository.
