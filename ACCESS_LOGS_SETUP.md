# Access Logs and Email Alerts

The website can only log access when opened through the local server, not through `file:///.../index.html`.

## Start the server

Run:

```powershell
& 'C:\Users\jabdu\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\server.mjs
```

Then open:

```text
http://localhost:8787
```

Access logs are written to:

```text
logs/access.log
```

## Enable Email Alerts

The first server run creates `access-config.json` from `access-config.example.json`.

Edit `access-config.json`:

- Add your own safe IPs to `allowedIps`.
- Set `smtp.enabled` to `true`.
- Add your SMTP email, app password, sender, and recipient.

For Gmail, use an app password, not your normal Gmail password.

Anyone whose IP is not in `allowedIps` will be logged and can trigger an email alert.
