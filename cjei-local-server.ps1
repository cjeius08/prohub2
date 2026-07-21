# Cjei Work Hub local server
# No Python needed. This uses Windows PowerShell/.NET to serve the site from localhost.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$port = if ($env:PORT) { [int]$env:PORT } else { 8787 }
$url = "http://127.0.0.1:$port/"

function Get-ContentType($filePath) {
  $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
  switch ($ext) {
    ".html" { "text/html; charset=utf-8"; break }
    ".htm"  { "text/html; charset=utf-8"; break }
    ".css"  { "text/css; charset=utf-8"; break }
    ".js"   { "text/javascript; charset=utf-8"; break }
    ".mjs"  { "text/javascript; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".svg"  { "image/svg+xml"; break }
    ".png"  { "image/png"; break }
    ".jpg"  { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".gif"  { "image/gif"; break }
    ".webp" { "image/webp"; break }
    ".ico"  { "image/x-icon"; break }
    ".wav"  { "audio/wav"; break }
    ".mp3"  { "audio/mpeg"; break }
    ".xlsx" { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break }
    default  { "application/octet-stream"; break }
  }
}

function Write-Response($stream, [int]$statusCode, [string]$statusText, [byte[]]$body, [string]$contentType) {
  if ($null -eq $body) { $body = [byte[]]::new(0) }
  $header = "HTTP/1.1 $statusCode $statusText`r`n" +
            "Content-Type: $contentType`r`n" +
            "Content-Length: $($body.Length)`r`n" +
            "Cache-Control: no-store`r`n" +
            "Access-Control-Allow-Origin: *`r`n" +
            "Connection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($body.Length -gt 0) {
    $stream.Write($body, 0, $body.Length)
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $port)
try {
  $listener.Start()
} catch {
  Write-Host "Port $port is already being used. Opening the site in your browser now..." -ForegroundColor Yellow
  Start-Process $url
  Write-Host "If the page still says it cannot be reached, close old Cjei Work Hub server windows first, then run the BAT again."
  Read-Host "Press Enter to close this window"
  exit 0
}

Write-Host "Cjei Work Hub is running." -ForegroundColor Green
Write-Host "Website: $url"
Write-Host "Root: $root"
Write-Host "Keep this window open while using the website. Press Ctrl + C to stop."
Write-Host ""
Start-Process $url

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
      $requestLine = $reader.ReadLine()

      while ($true) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) { break }
      }

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        Write-Response $stream 400 "Bad Request" ([System.Text.Encoding]::UTF8.GetBytes("Bad Request")) "text/plain; charset=utf-8"
        continue
      }

      $requestPath = "/"
      if ($requestLine -match "^[A-Z]+\s+([^\s]+)\s+HTTP/") {
        $requestPath = $Matches[1]
      }

      $requestPath = ($requestPath -split "\?")[0]
      $relativePath = [System.Uri]::UnescapeDataString($requestPath.TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = "index.html" }
      $relativePath = $relativePath -replace "/", "\"

      $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relativePath))
      $rootFull = [System.IO.Path]::GetFullPath($root)

      if (-not $fullPath.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-Response $stream 403 "Forbidden" ([System.Text.Encoding]::UTF8.GetBytes("Forbidden")) "text/plain; charset=utf-8"
        continue
      }

      if ([System.IO.Directory]::Exists($fullPath)) {
        $fullPath = [System.IO.Path]::Combine($fullPath, "index.html")
      }

      if ([System.IO.File]::Exists($fullPath)) {
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        Write-Response $stream 200 "OK" $bytes (Get-ContentType $fullPath)
      } else {
        Write-Response $stream 404 "Not Found" ([System.Text.Encoding]::UTF8.GetBytes("Not found")) "text/plain; charset=utf-8"
      }
    } catch {
      try {
        Write-Response $stream 500 "Server Error" ([System.Text.Encoding]::UTF8.GetBytes("Server error: $($_.Exception.Message)")) "text/plain; charset=utf-8"
      } catch {}
    } finally {
      if ($reader) { $reader.Dispose() }
      if ($client) { $client.Close() }
    }
  }
} finally {
  $listener.Stop()
}
