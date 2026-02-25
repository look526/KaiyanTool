# PowerShell script to remove layout code from pages

$pages = @(
    "AIProvidersPage.tsx",
    "ModelConfigurationPage.tsx",
    "ProfilePage.tsx",
    "SecuritySettingsPage.tsx",
    "AppearanceSettingsPage.tsx",
    "NotificationSettingsPage.tsx",
    "ProjectDetailPage.tsx",
    "CreateProjectPage.tsx",
    "NovelsPage.tsx",
    "ScriptEditorPage.tsx",
    "ScriptViewerPage.tsx",
    "NovelEditorPage.tsx",
    "OutlinePage.tsx",
    "StorylinePage.tsx",
    "CharactersPage.tsx",
    "ScenesPage.tsx",
    "ShotsPage.tsx",
    "AssetsPage.tsx",
    "PanelsPage.tsx",
    "ImageGenerationPage.tsx",
    "VideoGenerationPage.tsx",
    "VideoMergePage.tsx",
    "DocumentDetailPage.tsx",
    "DocumentCreatePage.tsx"
)

$pagesDir = "d:\project\kaiyanTool\apps\web\src\pages"

foreach ($page in $pages) {
    $filePath = Join-Path $pagesDir $page
    
    if (Test-Path $filePath) {
        Write-Host "Processing $page..."
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        if ($content -match "import.*Sidebar.*from") {
            $backupPath = $filePath -replace '\.tsx$', '.tsx.backup'
            Copy-Item $filePath $backupPath
            
            $newContent = $content -replace "import.*Sidebar.*from.*`r`n", ""
            $newContent = $newContent -replace "import.*Breadcrumb.*from.*`r`n", ""
            
            $newContent = $newContent -replace '\s*<Sidebar\s*/\s*', ""
            
            $newContent = $newContent -replace '\s*<div\s+style=\{\{\s*minHeight:\s*[''"]100vh[''"],\s*backgroundColor:\s*var\(--bg-base\),\s*display:\s*flex['""]\s*\}\}>\s*', ""
            
            $newContent = $newContent -replace '\s*<main\s+style=\{\{\s*flex:\s*1,\s*display:\s*flex,\s*flexDirection:\s*column[^}]*\}>\s*', "<>"
            
            $newContent = $newContent -replace '\s*</main>\s*', "</>"
            
            $newContent = $newContent -replace '\s*</div>\s*', ""
            
            $newContent = $newContent -replace 'return \(\s*<>', "return ("
            
            $newContent = $newContent -replace '\s*</div>\s*\);', ");"
            
            Set-Content $filePath -Value $newContent -Encoding UTF8
            
            Write-Host "  - Removed layout code from $page"
        } else {
            Write-Host "  - No layout code found in $page"
        }
    }
}

Write-Host "Done!"
