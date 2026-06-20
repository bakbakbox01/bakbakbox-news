# Opens all deploy signup/dashboard pages in browser
$links = @(
  'https://www.mongodb.com/cloud/atlas/register',
  'https://cloudinary.com/users/register/free',
  'https://dashboard.render.com/register',
  'https://vercel.com/signup',
  'https://github.com/bakbakbox01/bakbakbox-news',
  'https://dashboard.render.com/blueprints'
)

foreach ($url in $links) {
  Start-Process $url
  Start-Sleep -Milliseconds 800
}

Write-Host 'Browser tabs opened. Follow DEPLOY.md steps in order.'
