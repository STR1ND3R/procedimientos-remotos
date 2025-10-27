import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import fs from 'fs';

const PROTO_PATH = './videojuegos.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const videojuegosProto = grpc.loadPackageDefinition(packageDefinition).videojuegos;

let db = JSON.parse(fs.readFileSync('../../videojuegos.json', 'utf8'));

const server = new grpc.Server();

server.addService(videojuegosProto.VideojuegosService.service, {
  Listar: (_, callback) => callback(null, { juegos: db }),
  Obtener: (call, callback) => {
    const juego = db.find(j => j.id === call.request.id);
    juego ? callback(null, juego) : callback(new Error('No encontrado'));
  },
  Crear: (call, callback) => {
    const nuevo = call.request;
    nuevo.id = Date.now();
    db.push(nuevo);
    fs.writeFileSync('../../videojuegos.json', JSON.stringify(db, null, 2));
    callback(null, nuevo);
  },
  Actualizar: (call, callback) => {
    const idx = db.findIndex(j => j.id === call.request.id);
    if (idx < 0) return callback(new Error('No encontrado'));
    db[idx] = call.request;
    fs.writeFileSync('../../videojuegos.json', JSON.stringify(db, null, 2));
    callback(null, db[idx]);
  },
  Eliminar: (call, callback) => {
    const before = db.length;
    db = db.filter(j => j.id !== call.request.id);
    fs.writeFileSync('../../videojuegos.json', JSON.stringify(db, null, 2));
    callback(null, { success: db.length < before, message: 'Eliminado' });
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('✅ gRPC server corriendo en puerto 50051');
  server.start();
});
