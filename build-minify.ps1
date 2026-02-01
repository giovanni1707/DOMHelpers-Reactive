# Build and Minify Script for JavaScript Libraries
# This script combines and minifies JS files in each source folder using Terser

# Define source folders
$folders = @(
    "01_core",
    "02_enhancers",
    "03_conditions",
    "04_reactive"
)

# Define paths
$srcPath = "src"
$distPath = "dist"

# Create dist directory if it doesn't exist
if (-not (Test-Path $distPath)) {
    New-Item -ItemType Directory -Path $distPath | Out-Null
    Write-Host "Created dist directory" -ForegroundColor Green
}

# Process each folder
foreach ($folder in $folders) {
    $folderPath = Join-Path $srcPath $folder
    
    # Check if folder exists
    if (-not (Test-Path $folderPath)) {
        Write-Host "Warning: Folder '$folderPath' not found. Skipping..." -ForegroundColor Yellow
        continue
    }
    
    # Get all JS files in the folder
    $jsFiles = Get-ChildItem -Path $folderPath -Filter "*.js" -File
    
    if ($jsFiles.Count -eq 0) {
        Write-Host "No JS files found in '$folderPath'. Skipping..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`nProcessing folder: $folder" -ForegroundColor Cyan
    Write-Host "Found $($jsFiles.Count) file(s)" -ForegroundColor Gray
    
    # Create combined file name
    $combinedFileName = "$folder.combined.js"
    $minifiedFileName = "$folder.min.js"
    $combinedPath = Join-Path $distPath $combinedFileName
    $minifiedPath = Join-Path $distPath $minifiedFileName
    
    # Combine files
    $combinedContent = ""
    foreach ($file in $jsFiles) {
        Write-Host "  - Adding: $($file.Name)" -ForegroundColor Gray
        $content = Get-Content $file.FullName -Raw
        $combinedContent += $content + "`n"
    }
    
    # Write combined file
    $combinedContent | Out-File -FilePath $combinedPath -Encoding UTF8 -NoNewline
    Write-Host "  Created: $combinedFileName" -ForegroundColor Green
    
    # Minify using Terser
    Write-Host "  Minifying with Terser..." -ForegroundColor Gray
    
    $terserArgs = @(
        $combinedPath,
        "-o", $minifiedPath,
        "--compress",
        "--mangle"
    )
    
    try {
        $process = Start-Process -FilePath "npx" -ArgumentList (@("terser") + $terserArgs) -Wait -NoNewWindow -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host "  Created: $minifiedFileName" -ForegroundColor Green
            
            # Show file sizes
            $combinedSize = (Get-Item $combinedPath).Length
            $minifiedSize = (Get-Item $minifiedPath).Length
            $reduction = [math]::Round((1 - ($minifiedSize / $combinedSize)) * 100, 2)
            
            Write-Host "  Size: $combinedSize bytes -> $minifiedSize bytes (${reduction}% reduction)" -ForegroundColor Magenta
        } else {
            Write-Host "  Error: Terser failed for $folder" -ForegroundColor Red
        }
    } catch {
        Write-Host "  Error running Terser: $_" -ForegroundColor Red
        Write-Host "  Make sure Terser is installed. Run: npm install -g terser" -ForegroundColor Yellow
    }
}

Write-Host "`nBuild complete!" -ForegroundColor Green


# Usage:
# First, install Terser:   npm install -g terser
# Then run this script using PowerShell:   .\build-minify.ps1