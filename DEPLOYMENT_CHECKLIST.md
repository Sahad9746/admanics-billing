# 🚀 Production Deployment - Quick Checklist

## Before Deploying

- [ ] Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Test build locally: `npm run build`
- [ ] Remove test data from Sanity
- [ ] Create admin user with hashed password

## Vercel Setup

- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Add environment variables:
  - [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_SANITY_DATASET`
  - [ ] `SANITY_API_TOKEN`
  - [ ] `NEXTAUTH_SECRET` (new random value!)
  - [ ] `NEXTAUTH_URL` (your production domain)
- [ ] Deploy project

## Sanity Configuration

- [ ] Add production URL to CORS origins
- [ ] Enable "Allow credentials"
- [ ] Test API access from production

## Domain Setup (Optional)

- [ ] Add custom domain in Vercel
- [ ] Add CNAME record in domain registrar
- [ ] Update NEXTAUTH_URL to custom domain
- [ ] Add custom domain to Sanity CORS
- [ ] Verify SSL certificate

## Post-Deployment Testing

- [ ] Test login flow
- [ ] Test logout (should NOT redirect to localhost)
- [ ] Create a transaction
- [ ] Edit a transaction
- [ ] Delete a transaction (admin only)
- [ ] Verify audit trail shows your name
- [ ] Test with different user roles

## Security Review

- [ ] NEXTAUTH_SECRET is unique and random
- [ ] No .env files committed to Git
- [ ] Only necessary users have admin access
- [ ] All passwords are bcrypt hashed
- [ ] SSL/HTTPS is active

---

**Need help?** Check the full [Deployment Guide](file:///Users/sahad/.gemini/antigravity/brain/d34c338f-a2d7-4a82-962c-1298fa1df529/deployment_guide.md)
