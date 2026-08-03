# PowerShell GCP Deployment Script for ETA SaaS ERP Stack
# Targeted GCP Project: saas-fintech

$PROJECT_ID = "saas-fintech"
$REGION = "me-central1" # Or us-central1 / europe-west1
$REPOSITORY = "saas-erp-repo"

Write-Host "🚀 Starting GCP Deployment for ETA SaaS ERP..." -ForegroundColor Green

# 1. Set Active Project
gcloud config set project $PROJECT_ID

# 2. Enable Required Google Cloud APIs
Write-Host "📦 Enabling Google Cloud APIs..." -ForegroundColor Cyan
gcloud services enable `
    run.googleapis.com `
    artifactregistry.googleapis.com `
    sqladmin.googleapis.com `
    cloudbuild.googleapis.com

# 3. Create Artifact Registry Repository for Docker Images
Write-Host "🐳 Creating Artifact Registry Repository..." -ForegroundColor Cyan
gcloud artifacts repositories create $REPOSITORY `
    --repository-format=docker `
    --location=$REGION `
    --description="Docker repository for ETA SaaS ERP Backend and Frontend" `
    2>$null

# 4. Build and Deploy Backend Service to Cloud Run
Write-Host "⚡ Building and Deploying Backend GraphQL Server to Cloud Run..." -ForegroundColor Cyan
cd backend
gcloud builds submit --tag "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/backend:latest" .
gcloud run deploy saas-erp-backend `
    --image="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/backend:latest" `
    --platform=managed `
    --region=$REGION `
    --allow-unauthenticated `
    --port=4000 `
    --set-env-vars="ETA_API_BASE_URL=https://api.preprod.invoicing.eta.gov.eg"
cd ..

# 5. Build and Deploy Frontend Service to Cloud Run
Write-Host "🌐 Building and Deploying Frontend Web App to Cloud Run..." -ForegroundColor Cyan
cd frontend
# Create simple Dockerfile for frontend if needed or deploy via Nginx
gcloud run deploy saas-erp-frontend `
    --source=. `
    --platform=managed `
    --region=$REGION `
    --allow-unauthenticated `
    --port=80 `
    2>$null
cd ..

Write-Host "✅ GCP Deployment Script Execution Finished!" -ForegroundColor Green
Write-Host "Check Google Cloud Console Cloud Run tab for live service URLs." -ForegroundColor Yellow
