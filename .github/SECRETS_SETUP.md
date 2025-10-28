# GitHub Secrets Setup Guide

This guide explains how to configure GitHub repository secrets for the automated TBO API health checks.

## Required Secrets

Navigate to your repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### 1. TBO_CLIENT_ID
- **Description:** Your TBO API Client ID
- **Example Value:** `tboprod` or `ApiIntegrationNew`
- **How to get:** Provided by TBO support team
- **Required:** Yes

### 2. TBO_USERNAME
- **Description:** Your TBO API Username
- **Example Value:** `Multi.1` or your assigned username
- **How to get:** Provided by TBO support team
- **Required:** Yes

### 3. TBO_PASSWORD
- **Description:** Your TBO API Password
- **Example Value:** Your assigned password
- **How to get:** Provided by TBO support team
- **Required:** Yes
- **Security:** Never commit this to code!

### 4. END_USER_IP
- **Description:** Your server's public IP address (whitelisted by TBO)
- **Example Value:** `216.225.197.7` or `157.245.100.148`
- **How to get:** 
  - Run `curl ifconfig.me` from your server
  - Or check your hosting provider's control panel
- **Required:** Yes
- **Note:** This IP must be whitelisted by TBO support

## How to Add Secrets

### Via GitHub Web Interface

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the secret name (e.g., `TBO_CLIENT_ID`)
6. Enter the secret value
7. Click **Add secret**
8. Repeat for all required secrets

### Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Login to GitHub
gh auth login

# Add secrets
gh secret set TBO_CLIENT_ID -b "your_client_id"
gh secret set TBO_USERNAME -b "your_username"
gh secret set TBO_PASSWORD -b "your_password"
gh secret set END_USER_IP -b "your_ip_address"
```

## Verifying Secrets

After adding secrets, you can verify they're configured:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all four secrets listed
3. Note: Values are hidden for security

To test if secrets work:

1. Go to **Actions** tab
2. Select **Live TBO API Health Check** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**
5. Wait for completion and check results

## Security Best Practices

### ✅ DO:
- Use GitHub Secrets for all sensitive data
- Rotate credentials periodically
- Use different credentials for production/staging
- Monitor workflow runs for unauthorized access
- Limit repository access to trusted team members

### ❌ DON'T:
- Commit credentials to `.env` files
- Share secrets in issues or PRs
- Use production credentials in public repositories
- Log secret values in workflows
- Share repository access publicly

## Testing Locally

For local development, use environment variables instead of secrets:

```bash
# Create a .env file (never commit this!)
cat > .env.test << EOF
TBO_CLIENT_ID=your_client_id
TBO_USERNAME=your_username
TBO_PASSWORD=your_password
END_USER_IP=your_ip
EOF

# Source the file
source .env.test

# Run tests
bash qa/scripts/healthcheck.sh
```

## Troubleshooting

### Issue: Workflow fails with "Secret not found"

**Solution:**
1. Verify secret name matches exactly (case-sensitive)
2. Check that secrets are added at repository level, not environment level
3. Ensure you have admin access to the repository

### Issue: Authentication fails with valid credentials

**Possible causes:**
1. IP address not whitelisted by TBO
2. Credentials expired or changed
3. TBO API endpoint changed
4. Network issues

**Solution:**
1. Contact TBO support to verify IP whitelist
2. Verify credentials are current
3. Check TBO API status
4. Review workflow logs for detailed errors

### Issue: Secrets work locally but not in GitHub Actions

**Solution:**
1. Ensure secrets are added to repository (not just local `.env`)
2. Check workflow has correct secret names
3. Verify branch protection rules allow workflow runs

## Updating Secrets

To update an existing secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret name
3. Click **Update secret**
4. Enter new value
5. Click **Update secret**

Or via GitHub CLI:
```bash
gh secret set TBO_PASSWORD -b "new_password"
```

## Alternative: Environment Secrets

For organization-level secrets (multiple repositories):

1. Go to Organization **Settings**
2. Click **Secrets and variables** → **Actions**
3. Click **New organization secret**
4. Select repositories that can access the secret
5. Add the secret

This is useful if you have multiple repositories using the same TBO credentials.

## Required Permissions

To add secrets, you need:
- **Repository:** Admin access
- **Organization:** Owner or Admin access (for org secrets)

## Support

If you encounter issues with secrets configuration:

1. Check GitHub's [Encrypted Secrets documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
2. Review workflow logs for error messages
3. Verify TBO credentials with support
4. Contact repository maintainer

---

**Last Updated:** 2025-10-28
**Workflow:** `.github/workflows/live-tbo-health.yml`
