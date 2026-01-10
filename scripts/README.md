Helper scripts to POST JSON with CSRF handling

Files:

- `post_json_with_csrf.ps1` (PowerShell)
  - Example:
    - powershell -ExecutionPolicy Bypass -File ./scripts/post_json_with_csrf.ps1 -Url /welcome/ -Data '{"city":"Mumbai"}'

- `post_json_with_csrf.sh` (bash)
  - Example:
    - ./scripts/post_json_with_csrf.sh /welcome/ '{"city":"Mumbai"}'

Behavior:
- Requests `GET /api/csrf/` to set the cookie
- Extracts `csrftoken` from the cookie file (cookies.txt)
- POSTs the JSON payload to the given URL including cookies and `X-CSRFToken` header

Notes:
- The PowerShell script accepts `-Data` as a JSON string or `@path/to/file.json` to load from a file.
- Use the bash script in WSL or Git Bash on Windows.
- Both default to `http://localhost:8000` for the host; modify the scripts if you use a different host or port.
