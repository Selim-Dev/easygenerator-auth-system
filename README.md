# Easygenerator Authentication System

A production-ready full-stack authentication system built with React, NestJS, and MongoDB Atlas.

## Technology Stack

- **Frontend**: React 18 + Vite + TypeScript + React Router v6
- **Backend**: NestJS + MongoDB Atlas (Mongoose) + JWT
- **Monorepo**: npm workspaces
- **Infrastructure**: Docker + nginx for production
- **Deployment**: AWS ECR + EC2 with GitHub Actions CI/CD

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **AWS Account** (for production deployment)
- **Git**

## Project Structure

```
easygenerator-auth-system/
├── apps/
│   ├── api/          # NestJS backend application
│   └── web/          # React frontend application
├── package.json      # Root package.json with workspace configuration
└── README.md
```

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd easygenerator-auth-system
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm install
```

### 3. Configure Environment Variables

#### Backend Configuration

1. Copy the example environment file:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

2. Update `apps/api/.env` with your MongoDB Atlas credentials:
   - Replace `<username>`, `<password>`, and `<cluster-url>` with your MongoDB Atlas connection details
   - Generate a secure JWT secret (use a random string generator)
   - Configure CORS origin to match your frontend URL

#### Frontend Configuration

1. Copy the example environment file:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

2. Update `apps/web/.env` if your backend runs on a different port

### 4. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster (free tier is sufficient for development)
3. Create a database user with read/write permissions
4. Whitelist your IP address in Network Access settings
5. Get your connection string from the "Connect" button
6. Update the `MONGODB_URI` in `apps/api/.env`

### 5. Run the Applications

#### Start Backend (API)

```bash
npm run dev:api
```

The backend will start on http://localhost:3000

#### Start Frontend (Web)

In a new terminal:

```bash
npm run dev:web
```

The frontend will start on http://localhost:5173

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api-docs

## Available Scripts

### Root Level

- `npm run dev:api` - Start backend in development mode
- `npm run dev:web` - Start frontend in development mode
- `npm run build:api` - Build backend for production
- `npm run build:web` - Build frontend for production
- `npm run test:api` - Run backend tests
- `npm run test:web` - Run frontend tests

### Backend (apps/api)

```bash
cd apps/api
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Lint code
```

### Frontend (apps/web)

```bash
cd apps/web
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests
npm run lint       # Lint code
```

## Testing

### Run All Tests

```bash
# Backend tests
npm run test:api

# Frontend tests
npm run test:web
```

### Test Coverage

The project includes:
- Unit tests for validation, password hashing, JWT tokens
- Property-based tests for authentication flows
- E2E tests for complete user workflows

## Production Deployment

### Docker Configuration

The project includes production-ready Docker configurations:

- `apps/api/Dockerfile` - Backend Docker image
- `apps/api/docker-compose.yml` - Backend deployment configuration
- `apps/web/Dockerfile` - Frontend Docker image with nginx
- `apps/web/docker-compose.yml` - Frontend deployment configuration

### AWS Infrastructure Setup

This section provides detailed instructions for setting up the AWS infrastructure required for production deployment.

#### Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured
- Basic understanding of AWS services (ECR, EC2, IAM)

#### 1. Create ECR Repositories

Amazon Elastic Container Registry (ECR) stores your Docker images.

**Using AWS CLI:**

```bash
# Create backend repository
aws ecr create-repository \
  --repository-name easygenerator-auth-api \
  --region us-east-1

# Create frontend repository
aws ecr create-repository \
  --repository-name easygenerator-auth-web \
  --region us-east-1
```

**Using AWS Console:**

1. Navigate to Amazon ECR in AWS Console
2. Click "Create repository"
3. Enter repository name: `easygenerator-auth-api`
4. Leave other settings as default
5. Click "Create repository"
6. Repeat for `easygenerator-auth-web`

**Note the repository URIs** - you'll need these for GitHub Secrets:
- Format: `<aws-account-id>.dkr.ecr.<region>.amazonaws.com/<repository-name>`

#### 2. Set Up EC2 Instance

**Launch EC2 Instance:**

1. Navigate to EC2 in AWS Console
2. Click "Launch Instance"
3. Configure instance:
   - **Name**: `easygenerator-auth-server`
   - **AMI**: Amazon Linux 2023 or Ubuntu Server 22.04 LTS
   - **Instance type**: t2.micro (free tier) or t2.small for production
   - **Key pair**: Create new or select existing SSH key pair (download and save the .pem file)
   - **Network settings**: Create or select VPC with public subnet
   - **Storage**: 8-20 GB gp3 (depending on needs)
4. Click "Launch instance"

**Configure Security Group:**

1. Select your EC2 instance
2. Go to "Security" tab → Click on the security group
3. Click "Edit inbound rules"
4. Add the following rules:

| Type  | Protocol | Port Range | Source    | Description           |
|-------|----------|------------|-----------|-----------------------|
| SSH   | TCP      | 22         | My IP     | SSH access            |
| HTTP  | TCP      | 80         | 0.0.0.0/0 | Frontend HTTP         |
| HTTPS | TCP      | 443        | 0.0.0.0/0 | Frontend HTTPS        |
| Custom TCP | TCP | 3000      | 0.0.0.0/0 | Backend API           |

5. Click "Save rules"

**Connect to EC2 Instance:**

```bash
# Set permissions on key file
chmod 400 your-key-pair.pem

# Connect via SSH
ssh -i your-key-pair.pem ec2-user@<EC2-PUBLIC-IP>
# For Ubuntu: ssh -i your-key-pair.pem ubuntu@<EC2-PUBLIC-IP>
```

**Install Docker and Docker Compose on EC2:**

For Amazon Linux 2023:
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
```

For Ubuntu:
```bash
# Update system
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
```

**Install Git on EC2:**

```bash
# Amazon Linux
sudo yum install -y git

# Ubuntu
sudo apt-get install -y git

# Verify
git --version
```

#### 3. Create IAM User for GitHub Actions

**Create IAM User:**

1. Navigate to IAM in AWS Console
2. Click "Users" → "Add users"
3. User name: `github-actions-deploy`
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"

**Attach Policies:**

1. Click "Attach existing policies directly"
2. Search and select the following policies:
   - `AmazonEC2ContainerRegistryPowerUser` (for ECR push/pull)
   - Or create a custom policy with minimal permissions (see below)
3. Click "Next: Tags" → "Next: Review" → "Create user"
4. **Important**: Download and save the Access Key ID and Secret Access Key

**Custom IAM Policy (Minimal Permissions):**

If you prefer minimal permissions, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 4. Configure SSH Access for GitHub Actions

**Generate SSH Key Pair (if not already done):**

On your local machine:
```bash
# Generate new SSH key pair
ssh-keygen -t rsa -b 4096 -f github-actions-key

# This creates:
# - github-actions-key (private key - for GitHub Secret)
# - github-actions-key.pub (public key - for EC2)
```

**Add Public Key to EC2:**

```bash
# Connect to EC2
ssh -i your-key-pair.pem ec2-user@<EC2-PUBLIC-IP>

# Add the public key to authorized_keys
echo "your-public-key-content" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

**Test SSH Connection:**

```bash
# From your local machine
ssh -i github-actions-key ec2-user@<EC2-PUBLIC-IP>
```

#### 4. Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions → New repository secret):

**AWS Credentials:**
- `AWS_ACCESS_KEY_ID` - AWS IAM user access key ID with ECR and EC2 permissions
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user secret access key
- `AWS_REGION` - AWS region where your resources are deployed (e.g., `us-east-1`)

**ECR Configuration:**
- `ECR_BACKEND_REPOSITORY` - Name of the ECR repository for backend (e.g., `easygenerator-auth-api`)
- `ECR_FRONTEND_REPOSITORY` - Name of the ECR repository for frontend (e.g., `easygenerator-auth-web`)

**EC2 Configuration:**
- `EC2_HOST` - Public IP address or hostname of your EC2 instance
- `EC2_USERNAME` - SSH username for EC2 instance (e.g., `ec2-user` for Amazon Linux, `ubuntu` for Ubuntu)
- `EC2_SSH_KEY` - Private SSH key for EC2 access (entire key content including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

**Backend Environment Variables:**
- `MONGODB_URI` - MongoDB Atlas connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
- `JWT_SECRET` - Secret key for JWT token signing (generate a secure random string, minimum 32 characters)
- `JWT_EXPIRATION` - JWT token expiration time (e.g., `24h`, `7d`)
- `BACKEND_PORT` - Port for backend API (e.g., `3000`)

**Frontend Environment Variables:**
- `VITE_API_URL` - Backend API URL for frontend to connect to (e.g., `https://api.yourdomain.com` or `http://your-ec2-ip:3000`)

**Repository Configuration:**
- `GITHUB_REPO_URL` - Your GitHub repository URL (e.g., `https://github.com/username/easygenerator-auth-system.git`)

### How to Add GitHub Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name (exactly as listed above)
5. Enter the secret value
6. Click **Add secret**
7. Repeat for all required secrets

### GitHub Actions CI/CD

The project includes automated deployment workflows:

- `.github/workflows/deploy-backend.yml` - Backend deployment
- `.github/workflows/deploy-frontend.yml` - Frontend deployment

Deployments are triggered automatically on push to the main branch.

#### Verify Deployment

After deployment completes, verify everything is working:

**1. Check Backend API:**
```bash
# Test health endpoint (if implemented)
curl http://<EC2-PUBLIC-IP>:3000

# Test Swagger documentation
curl http://<EC2-PUBLIC-IP>:3000/api-docs
```

**2. Check Frontend:**
```bash
# Access frontend in browser
http://<EC2-PUBLIC-IP>

# Or with domain
https://yourdomain.com
```

**3. Check Docker Containers on EC2:**
```bash
# SSH to EC2
ssh -i your-key-pair.pem ec2-user@<EC2-PUBLIC-IP>

# List running containers
docker ps

# Check backend logs
docker logs <backend-container-id>

# Check frontend logs
docker logs <frontend-container-id>
```

**4. Monitor GitHub Actions:**
- Go to your repository → Actions tab
- Check workflow runs for any errors
- Review deployment logs

#### Deployment Workflow

When you push to main branch:

1. **Build Phase**:
   - GitHub Actions checks out code
   - Configures AWS credentials
   - Builds Docker image
   - Pushes image to ECR

2. **Deploy Phase**:
   - SSH to EC2 instance
   - Pulls latest image from ECR
   - Stops old container
   - Starts new container with updated image
   - Verifies deployment

#### Rollback Strategy

If deployment fails or issues occur:

```bash
# SSH to EC2
ssh -i your-key-pair.pem ec2-user@<EC2-PUBLIC-IP>

# List all images
docker images

# Stop current container
docker stop <container-id>

# Run previous version
docker run -d --env-file .env -p 3000:3000 <previous-image-id>
```

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB Atlas

**Solutions**:
- Verify your IP address is whitelisted in MongoDB Atlas Network Access
  - Go to MongoDB Atlas → Network Access → Add IP Address
  - For development, you can temporarily allow access from anywhere (0.0.0.0/0)
- Check that your connection string is correct in `apps/api/.env`
  - Ensure username and password are URL-encoded if they contain special characters
  - Verify the database name is included in the connection string
- Ensure database user has proper read/write permissions
  - Go to MongoDB Atlas → Database Access → Edit user permissions
- Test connection string using MongoDB Compass or mongosh

**Problem**: "Authentication failed" error

**Solutions**:
- Double-check username and password in connection string
- Ensure the database user exists in MongoDB Atlas
- Verify the user has the correct database permissions

### Port Already in Use

**Problem**: Error "Port 3000 (or 5173) is already in use"

**Solutions**:

On macOS/Linux:
```bash
# Find process using the port
lsof -i :3000  # or :5173

# Kill the process
kill -9 <PID>
```

On Windows:
```bash
# Find process using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Alternatively, change the port in your configuration:
- Backend: Update `PORT` in `apps/api/.env`
- Frontend: Update `vite.config.ts` to use a different port

### CORS Errors

**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header is present"

**Solutions**:
- Ensure `CORS_ORIGIN` in `apps/api/.env` matches your frontend URL exactly
  - Development: `http://localhost:5173` (no trailing slash)
  - Production: Your actual frontend domain
- Check that frontend is making requests to the correct backend URL
  - Verify `VITE_API_URL` in `apps/web/.env`
- Restart the backend server after changing CORS configuration

### JWT Token Issues

**Problem**: "Unauthorized" errors when accessing protected routes

**Solutions**:
- Check that JWT_SECRET is set in `apps/api/.env`
- Verify token is being stored in localStorage (check browser DevTools → Application → Local Storage)
- Check token expiration time (JWT_EXPIRATION in backend .env)
- Clear localStorage and sign in again
- Verify the Authorization header is being sent with requests (check Network tab in DevTools)

### Build Errors

**Problem**: Build fails with dependency errors

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules package-lock.json
npm install
```

**Problem**: TypeScript compilation errors

**Solutions**:
- Ensure you're using Node.js v18 or higher
- Check that all dependencies are installed: `npm install`
- Verify TypeScript version: `npx tsc --version`
- Clear TypeScript cache: `rm -rf apps/*/dist`

### Docker Deployment Issues

**Problem**: Docker build fails

**Solutions**:
- Ensure Docker is installed and running
- Check Dockerfile syntax
- Verify all required files are present
- Try building with `--no-cache` flag: `docker build --no-cache -t image-name .`

**Problem**: Container exits immediately

**Solutions**:
- Check container logs: `docker logs <container-id>`
- Verify environment variables are set correctly
- Ensure MongoDB connection string is accessible from container
- Check that required ports are not already in use

### GitHub Actions Deployment Issues

**Problem**: Deployment workflow fails

**Solutions**:
- Verify all GitHub Secrets are configured correctly
- Check workflow logs in GitHub Actions tab
- Ensure AWS credentials have necessary permissions
- Verify ECR repository names match the secrets
- Check EC2 instance is running and accessible via SSH
- Ensure security groups allow necessary inbound traffic

**Problem**: Cannot SSH to EC2 instance

**Solutions**:
- Verify EC2_SSH_KEY secret contains the complete private key
- Check that EC2 security group allows SSH (port 22) from GitHub Actions IP ranges
- Ensure EC2 instance is running
- Verify EC2_HOST and EC2_USERNAME are correct

### Frontend Issues

**Problem**: Blank page or "Cannot GET /" error in production

**Solutions**:
- Verify nginx configuration includes try_files directive for SPA routing
- Check that build files are present in the nginx html directory
- Review nginx error logs: `docker logs <container-name>`
- Ensure VITE_API_URL is set correctly during build

**Problem**: API requests fail in production

**Solutions**:
- Verify VITE_API_URL is set to the correct backend URL
- Check that backend is accessible from frontend
- Review browser console for CORS errors
- Ensure nginx reverse proxy configuration is correct

### Testing Issues

**Problem**: Tests fail with "Cannot find module" errors

**Solutions**:
- Ensure all dependencies are installed: `npm install`
- Check that test files are in the correct location
- Verify import paths are correct
- Clear Jest/Vitest cache

**Problem**: Property-based tests timeout

**Solutions**:
- Increase test timeout in test configuration
- Reduce number of test iterations (numRuns)
- Check for infinite loops in test generators
- Ensure database connections are properly closed after tests

### General Tips

- Always check the browser console (F12) for frontend errors
- Review backend logs for API errors
- Use MongoDB Atlas monitoring to check database performance
- Test with a fresh browser session (incognito mode) to rule out caching issues
- Ensure all environment variables are set before starting applications
- Keep dependencies up to date: `npm outdated` and `npm update`

## Security Considerations

- Never commit `.env` files to version control
- Use strong, unique JWT secrets in production
- Regularly update dependencies for security patches
- Enable MongoDB Atlas IP whitelisting
- Use HTTPS in production (configured via Caddy in docker-compose)
- Implement rate limiting on authentication endpoints

## API Documentation

Once the backend is running, access the Swagger documentation at:

http://localhost:3000/api-docs

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure everything passes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue in the GitHub repository.
