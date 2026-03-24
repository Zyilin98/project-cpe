param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$NoRestart,
    [switch]$StartBackend,
    [string]$Target = "/home/root",
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ExtraArgs
)

$ErrorActionPreference = "Stop"

function Show-Usage {
    Write-Host "Usage: .\scripts\deploy.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -BackendOnly       Deploy backend only"
    Write-Host "  -FrontendOnly      Deploy frontend only"
    Write-Host "  -NoRestart         Do not stop the running backend before deploy"
    Write-Host "  -StartBackend      Start udx710 in background after deploy"
    Write-Host "  -Target PATH       Target path on device (default: /home/root)"
    Write-Host "  -Help              Show this help"
    Write-Host ""
    Write-Host "Also supports bash-style args:"
    Write-Host "  --backend-only"
    Write-Host "  --frontend-only"
    Write-Host "  --no-restart"
    Write-Host "  --start-backend"
    Write-Host "  --target=/home/root"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\scripts\deploy.ps1"
    Write-Host "  .\scripts\deploy.ps1 -BackendOnly"
    Write-Host "  .\scripts\deploy.ps1 --frontend-only"
    Write-Host "  .\scripts\deploy.ps1 -BackendOnly -StartBackend"
    Write-Host "  .\scripts\deploy.ps1 -NoRestart -Target /data/app"
}

foreach ($arg in $ExtraArgs) {
    switch -Regex ($arg) {
        '^--backend-only$' {
            $BackendOnly = $true
            continue
        }
        '^--frontend-only$' {
            $FrontendOnly = $true
            continue
        }
        '^--no-restart$' {
            $NoRestart = $true
            continue
        }
        '^--start-backend$' {
            $StartBackend = $true
            continue
        }
        '^--help$' {
            $Help = $true
            continue
        }
        '^--target=(.+)$' {
            $Target = $Matches[1]
            continue
        }
        '^-h$' {
            $Help = $true
            continue
        }
        default {
            if (-not $arg.StartsWith('-')) {
                $Target = $arg
                continue
            }

            throw "Unknown argument: $arg"
        }
    }
}

if ($Help) {
    Show-Usage
    exit 0
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$deployBackend = -not $FrontendOnly
$deployFrontend = -not $BackendOnly
$restartService = -not $NoRestart

$backendBin = Join-Path $repoRoot "backend\target\aarch64-unknown-linux-musl\release\udx710"
$frontendDir = Join-Path $repoRoot "frontend\dist"

function Invoke-Adb {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    & adb @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "adb command failed: adb $($Arguments -join ' ')"
    }
}

if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    throw "adb not found. Please install Android SDK Platform Tools and add adb to PATH."
}

$adbDevices = & adb devices
if ($LASTEXITCODE -ne 0) {
    throw "Failed to query adb devices."
}

if (-not ($adbDevices | Select-String "`tdevice$")) {
    throw "No adb device detected. Make sure the device is connected and adb is enabled."
}

Write-Host "Deploying via ADB to $Target"
Write-Host ""

if ($deployBackend -and $deployFrontend) {
    Write-Host "Mode: frontend + backend"
} elseif ($deployBackend) {
    Write-Host "Mode: backend only"
} else {
    Write-Host "Mode: frontend only"
}
Write-Host ""

if ($deployBackend -and -not (Test-Path $backendBin)) {
    throw "Backend binary not found: $backendBin`nBuild it first with .\scripts\build.sh"
}

if ($deployFrontend -and -not (Test-Path $frontendDir)) {
    throw "Frontend dist not found: $frontendDir`nBuild it first with .\scripts\build.sh --frontend-only"
}

if ($deployBackend -and $restartService) {
    Write-Host "Stopping running udx710 service..."
    Invoke-Adb -Arguments @("shell", "killall udx710 2>/dev/null || true")
}

if ($deployBackend) {
    Write-Host "Deploying backend..."
    Invoke-Adb -Arguments @("push", $backendBin, "$Target/udx710")
    Invoke-Adb -Arguments @("shell", "chmod +x $Target/udx710")
    Write-Host "Backend deployed."
}

if ($deployFrontend) {
    Write-Host "Deploying frontend..."
    Invoke-Adb -Arguments @("shell", "rm -rf $Target/www && mkdir -p $Target/www")
    Invoke-Adb -Arguments @("push", "$frontendDir\.", "$Target/www/")
    Write-Host "Frontend deployed."
}

if ($deployBackend -and $StartBackend) {
    Write-Host "Starting udx710 in background..."
    Invoke-Adb -Arguments @("shell", "cd $Target && ./udx710 -p 80 >/dev/null 2>&1 &")
    Write-Host "Backend started."
}

Write-Host ""
Write-Host "Deploy finished."
Write-Host ""
Write-Host "Run on device:"
Write-Host "  adb shell"
Write-Host "  cd $Target && ./udx710"
Write-Host ""
Write-Host "Or directly:"
Write-Host "  adb shell 'cd $Target && ./udx710'"
