const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'apps/web/src/pages');

const pagesToFix = [
  'ScriptEditorPage.tsx',
  'ScriptViewerPage.tsx',
  'ProfilePage.tsx',
  'SecuritySettingsPage.tsx',
  'ModelConfigurationPage.tsx',
  'StorylinePage.tsx',
  'ShotsPage.tsx',
  'OutlinePage.tsx',
  'NovelsPage.tsx',
  'ProjectDetailPage.tsx',
  'AppearanceSettingsPage.tsx',
  'CharactersPage.tsx',
  'DocumentCreatePage.tsx',
  'NotificationSettingsPage.tsx',
  'NovelEditorPage.tsx',
  'ScenesPage.tsx',
  'PanelsPage.tsx',
  'ImageGenerationPage.tsx',
  'VideoGenerationPage.tsx',
  'VideoMergePage.tsx',
  'DocumentDetailPage.tsx'
];

pagesToFix.forEach(page => {
  const filePath = path.join(pagesDir, page);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  - File not found: ${page}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { Sidebar }")) {
    console.log(`  - No Sidebar import in ${page}`);
    return;
  }
  
  const backupPath = filePath.replace('.tsx', '.backup4');
  fs.writeFileSync(backupPath, content);
  
  content = content.replace(/import \{ Sidebar \} from ['"].*\/components\/Sidebar['"];?\s*/g, '');
  
  content = content.replace(/\s*<Sidebar\s*\/>\s*/g, '');
  
  content = content.replace(/\s*<div\s+style=\{\{\s*minHeight:\s*['"']100vh['"']\s*,\s*backgroundColor:\s*var\(--bg-base\)\s*,\s*display:\s*flex['"']\s*\}\}>\s*/g, '');
  
  content = content.replace(/\s*<main\s+style=\{\{\s*flex:\s*1,\s*display:\s*flex,\s*flexDirection:\s*column[^}]*\}>\s*/g, '<>');
  
  content = content.replace(/\s*<\/main>\s*/g, '</>');
  
  content = content.replace(/\s*<\/div>\s*/g, '');
  
  content = content.replace(/return \(\s*</g, 'return (');
  
  content = content.replace(/\s*<\/div>\s*\);/g, ');');
  
  fs.writeFileSync(filePath, content);
  console.log(`  - Fixed ${page}`);
});

console.log('Done!');
