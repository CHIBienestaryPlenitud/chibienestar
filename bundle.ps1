$html = Get-Content -Raw -Path "index.html" -Encoding utf8
$css = Get-Content -Raw -Path "style.css" -Encoding utf8
$js = Get-Content -Raw -Path "app.js" -Encoding utf8

$html = $html.Replace('<link rel="stylesheet" href="style.css">', "<style>`n$css`n</style>")
$html = $html.Replace('<script src="app.js"></script>', "<script>`n$js`n</script>")

Set-Content -Path "site123_embed.html" -Value $html -Encoding utf8
Write-Output "Bundled successfully!"
