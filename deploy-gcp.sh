#!/usr/bin/env bash
# Bash GCP Deployment Script for ETA SaaS ERP Stack
# Targeted GCP Project: saas-fintech

set -e

PROJECT_ID="saas-fintech"
REGION="me-central1"
REPOSITORY="saas-erp-repo"

echo "🚀 Starting GCP Deployment for ETA SaaS ERP..."

# 1. Set Active Project
gcloud config set project "$PROJECT_ID"

# 2. Enable Required GCP APIs
echo "📦 Enabling Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com \
    cloudbuild.googleapis.com

# 3. Create Artifact Registry Repository
echo "🐳 Creating Artifact Registry Repository..."
gcloud artifacts repositories create "$REPOSITORY" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for ETA SaaS ERP" \
    || true

# 4. Build & Deploy Backend
echo "⚡ Deploying Backend GraphQL Server to Cloud Run..."
pushd backend
gcloud builds submit --tag "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/backend:latest" .
gcloud run deploy saas-erp-backend \
    --image="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/backend:latest" \
    --platform=managed \
    --region="$REGION" \
    --allow-unauthenticated \
    --port=4000 \
    --set-env-vars="ETA_API_BASE_URL=https://api.preprod.invoicing.eta.gov.eg"
popd

# 5. Build & Deploy Frontend
echo "🌐 Deploying Frontend Web App to Cloud Run..."
pushd frontend
gcloud builds submit --tag "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/frontend:latest" .
gcloud run deploy saas-erp-frontend \
    --image="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/frontend:latest" \
    --platform=managed \
    --region="$REGION" \
    --allow-unauthenticated \
    --port=80
popd

echo "✅ GCP Deployment script complete!"
