#!/usr/bin/env node

/**
 * SweetAlert2 Migration Helper Script
 * 
 * This script helps identify components that need SweetAlert2 integration
 * and provides guidance on what to update.
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const directories = [
  'src/pages',
  'src/dashboard/admin/pages',
  'src/dashboard/teacher/pages',
  'src/dashboard/student/pages',
  'src/components'
];

// Patterns to look for
const patterns = {
  consoleError: /console\.error\(/g,
  alert: /alert\(/g,
  confirm: /window\.confirm\(/g,
  errorState: /setError\(/g,
  successState: /setSuccessMessage\(/g,
  errorDiv: /bg-red-100.*border-red-400.*text-red-700/g,
  successDiv: /bg-green-100.*border-green-400.*text-green-700/g
};

function scanDirectory(dir) {
  const results = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...scanDirectory(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  
  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for patterns
  for (const [patternName, pattern] of Object.entries(patterns)) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: patternName,
        count: matches.length,
        pattern: pattern.toString()
      });
    }
  }
  
  // Check if SweetAlert2 is already imported
  const hasSweetAlertImport = content.includes('sweetAlert') || content.includes('SweetAlert');
  
  return {
    filePath,
    issues,
    hasSweetAlertImport,
    needsUpdate: issues.length > 0 && !hasSweetAlertImport
  };
}

function generateReport() {
  console.log('🔍 Scanning for components that need SweetAlert2 integration...\n');
  
  const allFiles = [];
  for (const dir of directories) {
    allFiles.push(...scanDirectory(dir));
  }
  
  const analysis = allFiles.map(analyzeFile);
  const needsUpdate = analysis.filter(file => file.needsUpdate);
  const alreadyUpdated = analysis.filter(file => file.hasSweetAlertImport);
  
  console.log(`📊 Analysis Results:`);
  console.log(`   Total files scanned: ${allFiles.length}`);
  console.log(`   Files needing updates: ${needsUpdate.length}`);
  console.log(`   Files already updated: ${alreadyUpdated.length}\n`);
  
  if (needsUpdate.length > 0) {
    console.log('🚨 Files that need SweetAlert2 integration:\n');
    
    needsUpdate.forEach(file => {
      console.log(`📁 ${file.filePath}`);
      file.issues.forEach(issue => {
        console.log(`   - ${issue.type}: ${issue.count} occurrences`);
      });
      console.log('');
    });
    
    console.log('💡 Recommended actions:');
    console.log('1. Add SweetAlert2 imports to each file');
    console.log('2. Replace console.error with handleApiError');
    console.log('3. Replace window.confirm with showDeleteConfirmDialog');
    console.log('4. Replace alert() with showErrorAlert or showSuccessAlert');
    console.log('5. Remove error/success state management and use SweetAlert2 instead');
    console.log('6. Remove error/success div elements from JSX');
    console.log('');
    
    console.log('📝 Example migration:');
    console.log('```typescript');
    console.log('// Before');
    console.log('try {');
    console.log('  await apiCall();');
    console.log('} catch (error) {');
    console.log('  console.error("Error:", error);');
    console.log('  setError("Something went wrong");');
    console.log('}');
    console.log('');
    console.log('// After');
    console.log('import { handleApiError } from "../utils/sweetAlert";');
    console.log('');
    console.log('try {');
    console.log('  await apiCall();');
    console.log('  showSuccessAlert("Success!", "Operation completed");');
    console.log('} catch (error) {');
    console.log('  handleApiError(error, "Operation failed");');
    console.log('}');
    console.log('```');
  } else {
    console.log('✅ All files are already using SweetAlert2!');
  }
  
  if (alreadyUpdated.length > 0) {
    console.log('\n✅ Files already using SweetAlert2:');
    alreadyUpdated.forEach(file => {
      console.log(`   - ${file.filePath}`);
    });
  }
}

// Run the analysis
generateReport(); 