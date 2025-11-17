<#
Start-project.ps1

Purpose:
  Convenience script to start the project on Windows PowerShell. Supports Docker Compose and
  local developer workflows (npm). The script opens new PowerShell windows for long-running dev
  processes so you can keep logs visible.

Usage:
  -Mode all           : Build and start full stack with docker compose (default)
  -Mode docker-only   : Same as 'all' but runs in foreground
  -Mode start-db      : Start only MySQL and Redis via docker compose
  -Mode local-dev     : Start infrastructure + backend and frontend in dev mode (opens windows)
  -Mode backend-dev   : Start only the backend locally in a new window
  -Mode frontend-dev  : Start only the frontend locally in a new window
  -Help               : Show the help text

Examples:
  .\scripts\start-project.ps1 -Mode local-dev
  .\scripts\start-project.ps1 -Mode all
#>

param(
  [string]$Mode = 'all'
)

function Show-Help {
  Write-Host "Usage: .\scripts\start-project.ps1 -Mode <all|docker-only|start-db|local-dev|backend-dev|frontend-dev>"
}

function Ensure-EnvFiles {
  $root = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent
  Push-Location $root
  if (Test-Path .env.example) {
    if (-not (Test-Path .env)) {
      Copy-Item .env.example .env
      Write-Host "Copied .env.example -> .env"
    } else {
      Write-Host ".env already exists in root, skipping copy"
    }
    if (-not (Test-Path frontend\.env)) {
      Copy-Item .env.example frontend\.env
      Write-Host "Copied .env.example -> frontend/.env"
    } else {
      Write-Host "frontend/.env already exists, skipping copy"
    }
    if (-not (Test-Path backend\.env)) {
      Copy-Item .env.example backend\.env
      Write-Host "Copied .env.example -> backend/.env"
    } else {
      Write-Host "backend/.env already exists, skipping copy"
    }
  } else {
    Write-Host "No .env.example found. Create .env files as needed."
  }
  Pop-Location
}

function Start-DockerCompose {
  param([string]$Args)
  Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent)
  if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker compose $Args
  } elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    docker-compose $Args
  } else {
    Write-Error "Docker not found. Please install Docker Desktop."
  }
  Pop-Location
}

function Wait-ForPort {
  param(
    [string]$Host = '127.0.0.1',
    [int]$Port = 3306,
    [int]$Retries = 20,
    [int]$DelaySeconds = 2
  )

  for ($i = 0; $i -lt $Retries; $i++) {
    $res = Test-NetConnection -ComputerName $Host -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($res -and $res.TcpTestSucceeded) {
      Write-Host "Port $Port on $Host is open."
      return $true
    }
    Write-Host "Waiting for ${Host}:${Port} ... ($($i+1)/$Retries)"
    Start-Sleep -Seconds $DelaySeconds
  }

  Write-Warning "Timed out waiting for ${Host}:${Port}"
  return $false
}

function Start-BackendDev {
  $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent
  $backendDir = Join-Path $scriptRoot 'backend'
  if (-not (Test-Path $backendDir)) { Write-Error "backend directory not found: $backendDir"; return }
  # Install deps then start in a new PowerShell window
  Start-Process powershell -ArgumentList "-NoExit", "-Command cd '$backendDir'; npm install; npm run start:dev" -WorkingDirectory $backendDir
}

function Start-FrontendDev {
  $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent
  $frontendDir = Join-Path $scriptRoot 'frontend'
  if (-not (Test-Path $frontendDir)) { Write-Error "frontend directory not found: $frontendDir"; return }
  Start-Process powershell -ArgumentList "-NoExit", "-Command cd '$frontendDir'; npm install; npm run dev" -WorkingDirectory $frontendDir
}

switch ($Mode.ToLower()) {
  'help' { Show-Help; break }
  'all' {
    Ensure-EnvFiles
    Start-DockerCompose '--build'
    break
  }
  'docker-only' {
    Ensure-EnvFiles
    Start-DockerCompose 'up --build'
    break
  }
  'start-db' {
    Start-DockerCompose 'up -d mysql redis'
    # Wait for MySQL to be reachable on host:3306
    if (Wait-ForPort -Host '127.0.0.1' -Port 3306 -Retries 30 -DelaySeconds 2) {
      Write-Host 'MySQL is reachable on 127.0.0.1:3306'
    } else {
      Write-Warning "MySQL did not become reachable. Check container logs: docker compose logs mysql -f"
    }
    break
  }
  'local-dev' {
    Ensure-EnvFiles
    Start-DockerCompose 'up -d mysql redis'
    if (-not (Wait-ForPort -Host '127.0.0.1' -Port 3306 -Retries 30 -DelaySeconds 2)) {
      Write-Warning "MySQL did not become reachable. Check container logs: docker compose logs mysql -f"
    }
    Start-BackendDev
    Start-FrontendDev
    break
  }
  'backend-dev' {
    Ensure-EnvFiles
    Start-BackendDev
    break
  }
  'frontend-dev' {
    Ensure-EnvFiles
    Start-FrontendDev
    break
  }
  'seed-db' {
    # Run SQL file inside the MySQL container to seed the DB (works even if DB already exists)
    $root = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent
    $sqlPath = Join-Path $root 'scripts\db\init.sql'
    if (-not (Test-Path $sqlPath)) { Write-Error "SQL file not found: $sqlPath"; break }
    $containerId = docker compose ps -q mysql
    if (-not $containerId) { Write-Error "MySQL container is not running. Start it with 'start-db' or 'all'"; break }

    Write-Host "Seeding DB using $sqlPath into container: $containerId"
    # Pipe the SQL into the mysql client inside the container (avoid '<' parsing issues)
    Get-Content -Raw $sqlPath | docker exec -i $containerId sh -c "mysql -uroot -proot saas"
    Write-Host "Done seeding DB."
    break
  }
  default {
    Write-Error "Unknown mode: $Mode"; Show-Help
  }
}
