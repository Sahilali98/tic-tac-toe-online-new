import 'dotenv/config';
import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { handleSocketConnection } from './server/gameHandler';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = new URL(req.url!, `http://${req.headers.host || 'localhost'}`);
      const query = Object.fromEntries(parsedUrl.searchParams.entries());
      await handle(req, res, { ...parsedUrl, query, pathname: parsedUrl.pathname } as any);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  handleSocketConnection(io);

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

