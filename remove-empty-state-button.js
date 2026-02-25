const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/web/src/pages/ProjectsPage.tsx');

let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/      <\/p>\s*\s*<button\s+onClick=\{[^}]*navigate\('\/projects\/new'\)[^}]*\}[^}]*>\s*创建项目\s*<\/button>\s*<\/div>\s*\);/g, '      </p>\n    </div>\n  );');

fs.writeFileSync(filePath, content);
console.log('Done!');
