const http = require("http");

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/html",
  });

  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SaadAgent Demo</title>
      </head>
      <body>
        <h1>Hello from SaadAgent Codding agent</h1>
        <p>The demo server is running...</p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Demo server running at http://localhost:${PORT}`);
});