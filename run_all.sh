#!/bin/bash
# ============================================
# 🚀 Script para iniciar todos los servidores
# ============================================

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

echo -e "${GREEN}🔧 Iniciando entorno de procedimientos remotos...${NC}"

# Manejo de interrupción (Ctrl + C)
trap "echo -e '\n${YELLOW}🛑 Deteniendo todos los servidores...${NC}'; pkill -f 'node server.js'; pkill -f 'rmiregistry'; pkill -f 'mono Program.exe'; pkill -f 'vite'; exit 0" SIGINT

# ================
# gRPC SERVER (Node)
# ================
echo -e "${GREEN}🧩 Iniciando servidor gRPC...${NC}"
cd back/grpc-server
node server.js > ../../logs_grpc.txt 2>&1 &
cd ../../

# ================
# JAVA RMI SERVER
# ================
echo -e "${GREEN}☕ Iniciando servidor Java RMI...${NC}"
cd back/rmi-server
rmiregistry 1099 > ../../logs_rmi_registry.txt 2>&1 &
sleep 1
javac *.java
java Main > ../../logs_rmi.txt 2>&1 &
cd ../../

# ================
# .NET Remoting SERVER
# ================
echo -e "${GREEN}🧱 Iniciando servidor .NET Remoting...${NC}"
cd back/netremoting-server
mono Program.exe > ../../logs_remoting.txt 2>&1 &
cd ../../

# ================
# FRONTEND (Vite)
# ================
echo -e "${GREEN}🎨 Iniciando frontend React (Vite)...${NC}"
cd frontend
npm run dev > ../logs_frontend.txt 2>&1 &
cd ..

# ================
# MONITOR
# ================
sleep 3
echo -e "${YELLOW}📜 Servidores corriendo:${NC}"
echo -e "   • gRPC:       http://localhost:50051"
echo -e "   • Java RMI:   puerto 1099"
echo -e "   • .NET Remoting: tcp://localhost:8085/VideojuegosService"
echo -e "   • Frontend:   http://localhost:5173"
echo -e "\n${GREEN}✅ Todo está corriendo. Usa Ctrl + C para detener.${NC}"

# Mantener el script activo
while true; do sleep 2; done
