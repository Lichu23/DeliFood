import { app, httpServer } from './app';
import { env, validateEnv } from './config/env';
import { initializeSocket } from './lib/socket';

// Validar variables de entorno
validateEnv();

// Inicializar Socket.io
initializeSocket(httpServer);

// Iniciar servidor
httpServer.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
  console.log(`📍 Environment: ${env.nodeEnv}`);
  console.log(`🔌 WebSocket ready`);
});