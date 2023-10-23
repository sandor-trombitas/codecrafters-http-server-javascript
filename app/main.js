const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const parseRequest = data => {
  const request = data.toString().split(/[\r\n]+/).reduce((acc, line, index) => {
    if(index === 0) {
      const [method, path] = line.split(' ');

      return {
        ...acc,
        method,
        path
      }
    }

    if (line.startsWith('Host:')) {
      const [_, host] = line.split(' ');

      return {
        ...acc,
        host
      }
    }

    if (line.startsWith('User-Agent')) {
      const [_, userAgent] = line.split(' ');

      return {
        ...acc,
        userAgent
      }
    }

    return acc;
  }, {});

  return request;
}

const buildTextResponse = (statusCode, body) => {
  let response = 'HTTP/1.1 200 OK\r\n';
  response = response.concat('Content-Type: text/plain\r\n');
  response = response.concat(`Content-Length: ${body.length}\r\n`);
  response = response.concat('\r\n');
  return response.concat(body.toString());
};

const handleData = socket => data => {
  if (!data instanceof Buffer) {
    //throw new Error('Data must be a Buffer');
    console.log('Data must be a Buffer');
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    return socket.end();
  }
  const request = parseRequest(data);

  if (request.path === '/') {
    socket.write('HTTP/1.1 200 OK\r\n\r\n');
    return socket.end();
  }
  if (request.path.startsWith('/echo/')) {
    const body = request.path.split('/echo/')[1];
    socket.write (buildTextResponse(200, body));
    return socket.end();
  }
  if (request.path.startsWith('/user-agent')) {
    socket.write(buildTextResponse(200, request.userAgent));
    return socket.end();
  }

  socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
  socket.end();
};
const server = net.createServer(socket => {
  socket.on('close', () => {
    socket.end();
  });
  socket.on('data', handleData(socket));
});

server.listen(4221, 'localhost');

