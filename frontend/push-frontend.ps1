param (
    [Parameter(Mandatory=$true, HelpMessage="Enter your commit message")]
    [string]$CommitMessage
)

Write-Host "Adding frontend files to Git..." -ForegroundColor Cyan
git add .

Write-Host "Creating commit..." -ForegroundColor Cyan
git commit -m "$CommitMessage"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "Done!" -ForegroundColor Green
