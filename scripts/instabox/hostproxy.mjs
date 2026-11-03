// InstaBox's public-port gateway rewrites Host to 127.0.0.1:<port> and puts the public
// hostname in X-Forwarded-Host. The app picks the site by Host, so this tiny HTTP proxy
// restores Host from X-Forwarded-Host (falling back to a fixed host per port) and forwards
// to the Next server on 127.0.0.1:APP_PORT.
//   node hostproxy.mjs <listenPort> <appPort> <fallbackHost>
import http from 'node:http'
const [listen, app, fallback] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]]
http
  .createServer((req, res) => {
    const host = String(req.headers['x-forwarded-host'] || fallback || req.headers.host).split(',')[0].trim()
    const headers = { ...req.headers, host }
    const up = http.request({ host: '127.0.0.1', port: app, method: req.method, path: req.url, headers }, (r) => {
      res.writeHead(r.statusCode || 502, r.headers)
      r.pipe(res)
    })
    up.on('error', (e) => {
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' })
      res.end(`upstream error: ${e.message}`)
    })
    req.pipe(up)
  })
  .listen(listen, '0.0.0.0', () => console.log(`hostproxy :${listen} -> :${app} (fallback host ${fallback})`))
