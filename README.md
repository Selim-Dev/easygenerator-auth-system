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

#### 1. Create ECR Repositories

```bash
# Create backend repository
aws ecr create-repository --repository-name easygenerator-auth-api

# Create frontend repository
aws ecr create-repository --repository-name easygenerator-auth-web
```

#### 2. Set Up EC2 Instance

1. Launch an EC2 instance (t2.micro or larger)
2. Install Docker and Docker Compose
3. Configure security groups:
   - Allow inbound traffic on ports 80, 443 (frontend)
   - Allow inbound traffic on port 3000 (backend)
   - Allow SSH access (port 22)

#### 3. Create IAM User

Create an IAM user with permissions for:
- ECR push/pull access
- EC2 access for deployment

#### 4. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**AWS Credentials:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

**ECR Configuration:**
- `ECR_REGISTRY`
- `ECR_REPOSITORY_API`
- `ECR_REPOSITORY_WEB`

**EC2 Configuration:**
- `EC2_HOST`
- `EC2_USERNAME`
- `EC2_SSH_KEY`

**Environment Variables:**
- `MONGODB_URI`
- `JWT_SECRET`
- `VITE_API_URL`

### GitHub Actions CI/CD

The project includes automated deployment workflows:

- `.github/workflows/deploy-backend.yml` - Backend deployment
- `.github/workflows/deploy-frontend.yml` - Frontend deployment

Deployments are triggered automatically on push to the main branch.

## Troubleshooting

### MongoDB Connection Issues

- Verify your IP address is whitelisted in MongoDB Atlas Network Access
- Check that your connection string is correct in `.env`
- Ensure database user has proper permissions

### Port Already in Use

If ports 3000 or 5173 are already in use:

```bash
# Find process using the port
lsof -i :3000  # or :5173

# Kill the process
kill -9 <PID>
```

### CORS Errors

- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Check that frontend is making requests to the correct backend URL

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
npm install
```

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
