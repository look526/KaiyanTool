# 批量移除页面中的 Sidebar 和布局代码

$pagesToFix = @(
    "ScriptEditorPage.tsx",
    "ScriptViewerPage.tsx",
    "ProfilePage.tsx",
    "SecuritySettingsPage.tsx",
    "ModelConfigurationPage.tsx",
    "StorylinePage.tsx",
    "ShotsPage.tsx",
    "OutlinePage.tsx",
    "NovelsPage.tsx",
    "ProjectDetailPage.tsx",
    "AppearanceSettingsPage.tsx",
    "CharactersPage.tsx",
    "DocumentCreatePage.tsx",
    "NotificationSettingsPage.tsx",
    "NovelEditorPage.tsx",
    "ScenesPage.tsx",
    "PanelsPage.tsx",
    "ImageGenerationPage.tsx",
    "VideoGenerationPage.tsx",
    "VideoMergePage.tsx",
    "DocumentDetailPage.tsx"
)

$pagesDir = "d:\project\kaiyanTool\apps\web\src\pages"

foreach ($page in $pagesToFix) {
    $filePath = Join-Path $pagesDir $page
    
    if (Test-Path $filePath) {
        Write-Host "Processing $page..."
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        if ($content -match "import.*Sidebar.*from") {
            $backupPath = $filePath -replace '\.tsx$', '.backup3'
            Copy-Item $filePath $backupPath
            
            $newContent = $content -replace "import.*Sidebar.*from.*`r`n", ""
            
            $newContent = $newContent -replace '\s*<Sidebar\s*/\s*', ""
            
            $newContent = $newContent -replace '\s*<div\s+style=\{\{\s*minHeight:\s*[''"]100vh['""],\s*backgroundColor:\s*var\(--bg-base\),\s*display:\s*flex['""]\s*\}\}>\s*', ""
            
            $newContent = $newContent -replace '\s*<main\s+style=\{\{\s*flex:\s*1,\s*display:\s*flex,\s*flexDirection:\s*column[^}]*\}>\s*', "<>"
            
            $newContent = $newContent -replace '\s*</main>\s*', "</>"
            
            $newContent = $newContent -replace '\s*</div>\s*', ""
            
            $newContent = $newContent -replace 'return \(\s*<>', "return ("
            
            $newContent = $newContent -replace '\s*</div>\s*\);', ");"
            
            Set-Content $filePath -Value $newContent -Encoding UTF8
            
            Write-Host "  - Fixed $page"
        } else {
            Write-Host "  - No Sidebar found in $page"
        }
    }
}

Write-Host "Done!"
