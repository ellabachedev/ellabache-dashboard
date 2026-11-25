# Prints the HTTP headers Claude Code sends to the BigQuery MCP server.
# Claude Code runs this before connecting, so the short-lived gcloud token is always fresh.
# The token comes from the active gcloud account; nothing secret is stored in this repo.
$token = (gcloud auth print-access-token 2>$null)
if (-not $token) {
    Write-Error "No gcloud token. Run: gcloud auth login (or activate the service account)."
    exit 1
}
@{
    "Authorization"       = "Bearer $token"
    "x-goog-user-project" = "ellabache-singleview"
} | ConvertTo-Json -Compress
