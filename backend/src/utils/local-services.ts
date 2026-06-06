import { execSync, spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;
let redisProcess: ChildProcess | null = null;

export async function startLocalServices(): Promise<{ mongoUri: string }> {
  // 1. Setup & Start Redis if needed
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');
  const redisHost = process.env.REDIS_HOST || 'localhost';
  
  if (redisHost === 'localhost' || redisHost === '127.0.0.1') {
    const isRedisRunning = await checkPort(redisPort);
    if (!isRedisRunning) {
      console.log('ℹ️ Local Redis is not running. Setting up portable Redis...');
      const databasesDir = path.resolve(__dirname, '../../../databases');
      const redisDir = path.join(databasesDir, 'redis');
      const redisExe = path.join(redisDir, 'redis-server.exe');
      
      if (!fs.existsSync(redisExe)) {
        console.log(`📥 Downloading portable Redis v5.0.14 to ${redisDir}...`);
        fs.mkdirSync(redisDir, { recursive: true });
        
        const zipPath = path.join(databasesDir, 'redis.zip');
        // Use PowerShell to download and extract
        const psCommand = [
          `$ErrorActionPreference = 'Stop'`,
          `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`,
          `Write-Host 'Downloading Redis ZIP...'`,
          `Invoke-WebRequest -Uri 'https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip' -OutFile '${zipPath.replace(/\\/g, '\\\\')}'`,
          `Write-Host 'Extracting Redis ZIP...'`,
          `Expand-Archive -Path '${zipPath.replace(/\\/g, '\\\\')}' -DestinationPath '${redisDir.replace(/\\/g, '\\\\')}' -Force`,
          `Remove-Item '${zipPath.replace(/\\/g, '\\\\')}'`
        ].join('; ');
        
        try {
          execSync(`powershell -NoProfile -NonInteractive -Command "${psCommand}"`, { stdio: 'inherit' });
          console.log('✅ Redis downloaded and extracted successfully.');
        } catch (err) {
          console.error('❌ Failed to download Redis using PowerShell:', err);
          throw new Error('Could not download portable Redis. Please install it manually or check internet connection.');
        }
      }
      
      console.log('🚀 Starting portable Redis server...');
      redisProcess = spawn(redisExe, ['--port', redisPort.toString()], {
        cwd: redisDir,
        stdio: 'ignore',
        detached: true, // run in background
      });
      redisProcess.unref();
      
      // Wait a moment for Redis to initialize
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('✅ Portable Redis server started.');
    } else {
      console.log('✅ Redis is already running on port', redisPort);
    }
  }

  // 2. Setup & Start Mongo Memory Server if needed
  let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';
  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    const mongoPort = 27017;
    const isMongoRunning = await checkPort(mongoPort);
    if (!isMongoRunning) {
      console.log('ℹ️ Local MongoDB is not running. Starting in-process MongoDB...');
      
      // Persist to databases/mongo-data under vedaai root so tests/data are saved
      const databasesDir = path.resolve(__dirname, '../../../databases');
      const mongoDataDir = path.join(databasesDir, 'mongo-data');
      fs.mkdirSync(mongoDataDir, { recursive: true });

      try {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            port: mongoPort,
            dbName: 'vedaai',
            dbPath: mongoDataDir,
            storageEngine: 'wiredTiger',
          },
        });
        mongoUri = mongoServer.getUri();
        console.log('✅ In-process MongoDB (persistent WiredTiger) started.');
      } catch (err) {
        console.warn('⚠️ MongoDB Memory Server failed with persistent store. Retrying in-memory mode...', err);
        // Fallback to ephemeral in-memory if WiredTiger / locking fails
        mongoServer = await MongoMemoryServer.create({
          instance: {
            port: mongoPort,
            dbName: 'vedaai',
          },
        });
        mongoUri = mongoServer.getUri();
        console.log('✅ In-process MongoDB (ephemeral) started.');
      }
    } else {
      console.log('✅ MongoDB is already running on port', mongoPort);
    }
  }

  return { mongoUri };
}

export async function stopLocalServices(): Promise<void> {
  if (mongoServer) {
    console.log('🛑 Stopping in-process MongoDB...');
    await mongoServer.stop();
    console.log('✅ MongoDB stopped.');
  }
  if (redisProcess) {
    console.log('🛑 Stopping portable Redis server...');
    redisProcess.kill();
    console.log('✅ Redis stopped.');
  }
}

// Utility function to check if a port is in use
import { Socket } from 'net';
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true); // Port is active / service is running
    });
    socket.once('error', () => {
      resolve(false); // Port is not active / service not running
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}
