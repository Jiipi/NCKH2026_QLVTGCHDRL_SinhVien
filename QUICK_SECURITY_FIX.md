/**
 * QUICK SECURITY FIX GUIDE
 * Follow these steps to secure your application immediately
 */

## STEP 1: Hash All Passwords (REQUIRED)
Run this command to convert all plain text passwords to bcrypt:

```bash
cd backend
node scripts/force_hash_passwords.js
```

This will:
- Find all users with plain text passwords
- Hash them securely with bcrypt
- Update the database

## STEP 2: Update Docker Compose Credentials (CRITICAL)

Open `docker-compose.yml` and replace:

### For Development (docker-compose.yml):
```yaml
# BEFORE:
POSTGRES_PASSWORD: abc
JWT_SECRET: supersecret_in_docker_change_me

# AFTER (use values from .env.secure):
POSTGRES_PASSWORD: HLIi/LPLN7t6Lfe6z3E+kI7yRIt3nZ+qm6SZD9RL8e0=
JWT_SECRET: Ya3kQuO1SqxwbxNJZGDI8+0hftsrvtk/3gjcgsAQb08=

# Or better - use environment variables:
POSTGRES_PASSWORD: ${DB_PASSWORD}
JWT_SECRET: ${JWT_SECRET}
```

Update DATABASE_URL too:
```yaml
# BEFORE:
DATABASE_URL: postgresql://admin:abc@db:5432/...

# AFTER:
DATABASE_URL: postgresql://admin:HLIi/LPLN7t6Lfe6z3E+kI7yRIt3nZ+qm6SZD9RL8e0=@db:5432/...
```

## STEP 3: Restart Containers

```bash
# Stop all containers
docker-compose down

# Remove database volume (WARNING: This deletes all data!)
docker volume rm dacn_web_quanly_hoatdongrenluyen-master_pgdata

# Or better: Backup first
docker-compose exec db pg_dump -U admin Web_QuanLyDiemRenLuyen > backup.sql

# Start with new credentials
docker-compose up -d

# Restore data if you backed up
docker-compose exec -T db psql -U admin Web_QuanLyDiemRenLuyen < backup.sql
```

## STEP 4: Verify Security

```bash
# Run security audit
node backend/scripts/security_audit.js

# Expected: 0 critical issues
```

## STEP 5: Clean Up

```bash
# Delete the temporary credentials file
rm .env.secure

# Verify secrets are not in git
git status
# Should NOT show .env or .env.secure
```

## STEP 6: Test Login

1. Go to http://localhost:3000
2. Try logging in with demo accounts:
   - Username: Admin
   - Password: 123456

If login fails with "migration required", run Step 1 again.

## IMPORTANT NOTES

⚠️  After changing DB password, you MUST:
1. Recreate the database volume OR
2. Change password inside existing database

⚠️  After changing JWT_SECRET:
1. All existing tokens become invalid
2. All users must login again

⚠️  For Production:
- Generate NEW secrets (don't use the ones in .env.secure)
- Use a proper secrets management system
- Enable HTTPS
- Use a reverse proxy (nginx)

## VERIFICATION CHECKLIST

- [ ] Ran force_hash_passwords.js
- [ ] Updated POSTGRES_PASSWORD in docker-compose.yml
- [ ] Updated JWT_SECRET in docker-compose.yml
- [ ] Updated DATABASE_URL in docker-compose.yml
- [ ] Restarted containers
- [ ] Ran security_audit.js (0 critical issues)
- [ ] Tested login functionality
- [ ] Deleted .env.secure file
- [ ] Verified no secrets in git status

## NEED HELP?

If you encounter issues:
1. Check Docker logs: `docker-compose logs backend-dev`
2. Check database connection: `docker-compose exec db psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT 1"`
3. Verify environment variables: `docker-compose exec backend-dev env | grep JWT_SECRET`

For production deployment, see: `SECURITY_AUDIT.md`
