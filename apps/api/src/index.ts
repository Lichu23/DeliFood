import { httpServer } from './app';
import { env, validateEnv } from './config/env';
import prisma from './lib/prisma';

async function main() {
  try {
    // Validar variables de entorno
    validateEnv();
    console.log('✅ Environment variables validated');

    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Database connected');

    // Iniciar servidor
    httpServer.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`📍 Environment: ${env.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${env.port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
