const fs = require('fs');
const path = require('path');

const COMPONENT_DIR = path.join(__dirname, '..', 'apps', 'web', 'src', 'components');
const MAX_LINES = 500;

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

function findComponentFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findComponentFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkComponentSize() {
  console.log('🔍 Checking component sizes...\n');

  const componentFiles = findComponentFiles(COMPONENT_DIR);
  const largeComponents = [];

  for (const file of componentFiles) {
    const lines = countLines(file);
    const relativePath = path.relative(COMPONENT_DIR, file);

    if (lines > MAX_LINES) {
      largeComponents.push({
        path: relativePath,
        lines,
      });
    }
  }

  if (largeComponents.length === 0) {
    console.log('✅ All components are within the size limit!');
    console.log(`   Maximum allowed: ${MAX_LINES} lines`);
    return 0;
  } else {
    console.log(`❌ Found ${largeComponents.length} component(s) exceeding ${MAX_LINES} lines:\n`);

    largeComponents.sort((a, b) => b.lines - a.lines).forEach((component, index) => {
      console.log(`${index + 1}. ${component.path}`);
      console.log(`   Lines: ${component.lines} (exceeds by ${component.lines - MAX_LINES})\n`);
    });

    return 1;
  }
}

checkComponentSize();
