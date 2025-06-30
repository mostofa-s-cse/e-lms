#!/usr/bin/env node

/**
 * Quick script to update all admin pages with SweetAlert2
 */

const fs = require('fs');
const path = require('path');

const adminPages = [
  'src/dashboard/admin/pages/NotesPage.tsx',
  'src/dashboard/admin/pages/VideosPage.tsx',
  'src/dashboard/admin/pages/QuizzesPage.tsx',
  'src/dashboard/admin/pages/QuestionsPage.tsx',
  'src/dashboard/admin/pages/EvaluationsPage.tsx'
];

const sweetAlertImport = `import { 
  showSuccessAlert, 
  showErrorAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';`;

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Add SweetAlert2 import if not present
  if (!content.includes('sweetAlert')) {
    const importMatch = content.match(/import.*from.*['"]\.\.\/\.\.\/\.\.\/services\/api['"];?/);
    if (importMatch) {
      content = content.replace(importMatch[0], importMatch[0] + '\n' + sweetAlertImport);
      updated = true;
    }
  }

  // Replace console.error with handleApiError
  content = content.replace(/console\.error\([^)]+\);/g, 'handleApiError(error, "Operation failed");');
  
  // Replace window.confirm with showDeleteConfirmDialog
  content = content.replace(
    /if \(window\.confirm\(`([^`]+)`\)\) \{/g,
    'const result = await showDeleteConfirmDialog("$1");\n    \n    if (result.isConfirmed) {'
  );

  // Add success alerts after API calls
  content = content.replace(
    /await \w+API\.delete\([^)]+\);\s*\n\s*fetch\w+\(\);/g,
    'await $&API.delete($1);\n        showSuccessAlert(\n          "Item Deleted", \n          "Item has been successfully deleted."\n        );\n        fetch$&();'
  );

  // Remove general error divs
  content = content.replace(
    /\{\s*formErrors\.general\s*&&\s*\(\s*<div[^>]*>.*?<\/div>\s*\)\s*\}/gs,
    ''
  );

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

console.log('🔄 Updating admin pages with SweetAlert2...\n');

adminPages.forEach(updateFile);

console.log('\n✅ Admin pages update complete!');
console.log('Note: You may need to manually review and adjust some specific patterns.'); 