<#
post_json_with_csrf.ps1
Usage:
  powershell -ExecutionPolicy Bypass -File ./scripts/post_json_with_csrf.ps1 -Url /welcome/ -Data '{"city":"Mumbai"}'
  powershell -ExecutionPolicy Bypass -File ./scripts/post_json_with_csrf.ps1 -Url http://localhost:8000/welcome/ -Data @data.json

Description:
  - Fetches CSRF cookie from /api/csrf/ and saves cookies to a cookie file (default cookies.txt)
  - Extracts csrftoken from the cookie file
  - Posts JSON to the provided Url with the cookie and X-CSRFToken header
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Url,

    [Parameter(Mandatory=$true)]
    [string]$Data,

    [string]$Host = "http://localhost:8000",
    [string]$CookieFile = "cookies.txt"
)

function Get-FullUrl($u, $host) {
    if ($u -match '^https?://') { return $u }
    $hostTrim = $host.TrimEnd('/')
    return "$hostTrim$u"
}

# Request CSRF cookie
Write-Output "Fetching CSRF cookie from $Host/api/csrf/ ..."
& curl.exe -s -S -c $CookieFile "$Host/api/csrf/" | Out-Null
if (-not (Test-Path $CookieFile)) {
    Write-Error "Failed to create cookie file $CookieFile"
    exit 1
}

# Extract token from cookie file
$line = Select-String -Path $CookieFile -Pattern 'csrftoken' | Select-Object -First 1
if (-not $line) {
    Write-Error "csrftoken not found in $CookieFile"
    exit 1
}
$token = ($line.Line -split '\s+')[6]
Write-Output "CSRF token: $token"

# Read JSON data: if argument starts with @ treat as file
$payload = $Data
if ($Data.StartsWith('@')) {
    $path = $Data.Substring(1)
    if (-not (Test-Path $path)) { Write-Error "Data file $path not found"; exit 1 }
    $payload = Get-Content -Raw -Path $path
}

$fullUrl = Get-FullUrl $Url $Host
Write-Output "POSTing JSON to $fullUrl"
$resp = & curl.exe -s -S -b $CookieFile -H "Content-Type: application/json" -H "X-CSRFToken: $token" -d $payload -X POST $fullUrl
Write-Output "Response:`n$resp"