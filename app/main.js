const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const buildTextResponse = (statusCode, body) => {
  let response = 'HTTP/1.1 200 OK\r\n';
  response = response.concat('Content-Type: text/plain\r\n');
  response = response.concat(`Content-Length: ${body.length}\r\n`);
  response = response.concat('\r\n');
  return response.concat(body.toString());
};
  
const getData = socket => data => {
  if (!data instanceof Buffer) {
    //throw new Error('Data must be a Buffer');
    console.log('Data must be a Buffer');
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    return socket.end();
  }
  const request = data.toString().split(/[\r\n]+/);
  const [_, path] = request[0].split(' ');

  if (path === '/') {
    socket.write('HTTP/1.1 200 OK\r\n\r\n');
    return socket.end();
  }
  if (path.startsWith('/echo/')) {
    const body = path.split('/echo/')[1];
    socket.write (buildTextResponse(200, body));
    return socket.end();
  }

  socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
  socket.end();
};
const server = net.createServer(socket => {
  socket.on('close', () => {
    socket.end();
    server.close();
  });
  socket.on('data', getData(socket));
});

server.listen(4221, 'localhost');

