# Infra moved

This folder used to be a Terraform root. That would have been a **second cookbook** for the same AWS resources.

Apply from the one remaining cookbook:

`terraform-practice/stacks/revenue-ripple/prod`

Do not run `terraform apply` here. Two cookbooks = two cakes (duplicate buckets, or a name collision).

## Course video CDN (playback)

| Resource | Value |
| --- | --- |
| S3 bucket | `revenue-ripple-prod-videos-359143808201` |
| CloudFront | `https://d3klssyvhh70us.cloudfront.net` |
| Object layout | `courses/{slug}/intro.mp4`, `courses/{slug}/module-N.mp4` |

### Vercel

Set this **Production** env var and redeploy:

```
VITE_VIDEO_CDN_BASE_URL=https://d3klssyvhh70us.cloudfront.net
```

(Also documented in `env_example.txt`.)

CloudFront is **referer-locked** to `revenueripple.org`. Playback works on the live site; bare requests, localhost, and `*.vercel.app` previews get `403`.

**Note:** `ads` and `landing-pages` have empty prefixes in S3 — those courses keep Vimeo-only playback until files are uploaded and normalized.

### Normalize / rename uploads

After dumping Synthesia-style filenames into the bucket:

```bash
npm run normalize:videos          # dry-run
npm run normalize:videos:apply    # aws s3 mv to stable keys
```

Requires AWS credentials with write access to the video bucket (`AWS_DEFAULT_REGION=us-east-1`).
