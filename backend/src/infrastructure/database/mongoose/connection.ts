import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error(
      'La variable MONGO_URI no está configurada. Copia .env.example como .env y define la conexión a MongoDB.',
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5_000,
    });
    console.log(`✅ [Database]: Conectado a MongoDB (${mongoose.connection.name})`);
  } catch (error) {
    console.error('❌ [Database]: No fue posible conectar a MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
