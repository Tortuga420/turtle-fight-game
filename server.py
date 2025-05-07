from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/public/index.html'
        return super().do_GET()

if __name__ == '__main__':
    port = 8000
    print(f"Starting server at http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    server = HTTPServer(('localhost', port), CORSRequestHandler)
    server.serve_forever() 