import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Adiciona o mapeamento para arquivos YAML
Handler.extensions_map.update({
    '.yml': 'text/yaml',
    '.yaml': 'text/yaml',
})

print("Servindo HTTP em :: porta", PORT)
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()