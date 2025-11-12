#!/bin/bash

echo "========================================="
echo "BAG Address Validation - Implementation Verification"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (MISSING)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ (MISSING)"
        return 1
    fi
}

missing=0

echo "Checking core application files..."
check_file "src/App.tsx" || ((missing++))
check_file "src/main.tsx" || ((missing++))
check_file "src/index.css" || ((missing++))
check_file "index.html" || ((missing++))
echo ""

echo "Checking components..."
check_file "src/components/BagUploadSection.tsx" || ((missing++))
check_file "src/components/BagProcessingView.tsx" || ((missing++))
check_file "src/components/BagDownloadSection.tsx" || ((missing++))
check_file "src/components/BagErrorView.tsx" || ((missing++))
check_file "src/components/ErrorBoundary.tsx" || ((missing++))
check_file "src/components/ui/button.tsx" || ((missing++))
check_file "src/components/ui/card.tsx" || ((missing++))
check_file "src/components/ui/progress.tsx" || ((missing++))
echo ""

echo "Checking state management & hooks..."
check_file "src/contexts/BagValidationContext.tsx" || ((missing++))
check_file "src/hooks/useBagFileUpload.ts" || ((missing++))
check_file "src/hooks/useBagValidation.ts" || ((missing++))
check_file "src/hooks/useBagValidationStatus.ts" || ((missing++))
check_file "src/hooks/useBagFileDownload.ts" || ((missing++))
check_file "src/lib/queryClient.ts" || ((missing++))
echo ""

echo "Checking API integration..."
check_file "src/api/bagClient.ts" || ((missing++))
check_file "src/api/types.ts" || ((missing++))
check_file "src/api/types/bag.types.ts" || ((missing++))
check_file "src/api/services/bagUpload.service.ts" || ((missing++))
check_file "src/api/services/bagValidation.service.ts" || ((missing++))
check_file "src/api/services/bagDownload.service.ts" || ((missing++))
check_file "src/api/services/bagCleanup.service.ts" || ((missing++))
check_file "src/api/utils/transformBagError.ts" || ((missing++))
check_file "src/api/bag-error-mapping.ts" || ((missing++))
echo ""

echo "Checking utilities & constants..."
check_file "src/lib/bagConstants.ts" || ((missing++))
check_file "src/lib/bagMessages.ts" || ((missing++))
check_file "src/lib/bagUtils.ts" || ((missing++))
check_file "src/lib/validation.ts" || ((missing++))
check_file "src/lib/utils.ts" || ((missing++))
echo ""

echo "Checking tests..."
check_file "src/test/setup.ts" || ((missing++))
check_file "src/mocks/handlers.ts" || ((missing++))
check_file "src/mocks/server.ts" || ((missing++))
check_file "src/__tests__/App.test.tsx" || ((missing++))
check_file "src/__tests__/bag-integration.test.tsx" || ((missing++))
check_file "src/components/__tests__/bag-components.test.tsx" || ((missing++))
check_file "src/hooks/__tests__/bag-hooks.test.ts" || ((missing++))
echo ""

echo "Checking configuration files..."
check_file "package.json" || ((missing++))
check_file "vite.config.ts" || ((missing++))
check_file "vitest.config.ts" || ((missing++))
check_file "tsconfig.json" || ((missing++))
check_file "tailwind.config.js" || ((missing++))
check_file "eslint.config.js" || ((missing++))
check_file ".env.example" || ((missing++))
check_file ".env.development" || ((missing++))
check_file ".env.production" || ((missing++))
check_file ".gitignore" || ((missing++))
echo ""

echo "Checking documentation..."
check_file "README.md" || ((missing++))
check_file "docs/api-integration.md" || ((missing++))
check_file "docs/deployment.md" || ((missing++))
check_file "docs/architecture.md" || ((missing++))
check_file "docs/troubleshooting.md" || ((missing++))
check_file "IMPLEMENTATION_SUMMARY.md" || ((missing++))
check_file "QUICK_START.md" || ((missing++))
echo ""

echo "========================================="
if [ $missing -eq 0 ]; then
    echo -e "${GREEN}✓ All files present! Implementation complete.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. npm install"
    echo "2. Configure .env.development"
    echo "3. npm run dev"
    echo ""
    exit 0
else
    echo -e "${RED}✗ $missing file(s) missing!${NC}"
    echo ""
    exit 1
fi
