#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
#  FIFA 2026 — Dev Launcher
#  Arranca el API de Python (puerto 8000) y
#  el frontend de Next.js (puerto 3000) juntos.
#  Uso:  ./dev.sh
#  Salir: Ctrl+C  (mata ambos procesos automáticamente)
# ─────────────────────────────────────────────────────────

set -e

VENV_PYTHON=".venv/bin/python"
VENV_UVICORN=".venv/bin/uvicorn"

# ── Colores ───────────────────────────────────────────────
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "${YELLOW}"
echo "  ███████╗██╗███████╗ █████╗     ██████╗  ██████╗ ██████╗  ██████╗"
echo "  ██╔════╝██║██╔════╝██╔══██╗    ╚════██╗██╔═████╗╚════██╗██╔════╝"
echo "  █████╗  ██║█████╗  ███████║     █████╔╝██║██╔██║ █████╔╝███████╗"
echo "  ██╔══╝  ██║██╔══╝  ██╔══██║    ██╔═══╝ ████╔╝██║██╔═══╝ ╚════██║"
echo "  ██║     ██║██║     ██║  ██║    ███████╗╚██████╔╝███████╗ ██████╔╝"
echo "  ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝    ╚══════╝ ╚═════╝ ╚══════╝ ╚═════╝"
echo -e "${RESET}"
echo -e "${GREEN}  FIFA World Cup 2026 — Dev Environment${RESET}"
echo    "  ─────────────────────────────────────────"

# ── Verificar que existe el virtualenv ───────────────────
if [ ! -f "$VENV_PYTHON" ]; then
  echo -e "${YELLOW}[WARN] No se encontró el virtualenv en .venv/"
  echo -e "       Ejecuta: python -m venv .venv && .venv/bin/pip install -r requirements.txt${RESET}"
  exit 1
fi

# ── Función de limpieza al salir ─────────────────────────
cleanup() {
  echo -e "\n${YELLOW}[DEV] Cerrando servidores...${RESET}"
  kill "$API_PID" "$NEXT_PID" 2>/dev/null
  wait "$API_PID" "$NEXT_PID" 2>/dev/null
  echo -e "${GREEN}[DEV] ¡Hasta luego! 👋${RESET}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Iniciar FastAPI ───────────────────────────────────────
echo -e "\n${BLUE}[API]${RESET}  Iniciando FastAPI en http://localhost:8000 ..."
$VENV_PYTHON -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload \
  2>&1 | sed "s/^/$(printf '\033[0;34m')[API] $(printf '\033[0m')/" &
API_PID=$!

# ── Esperar un momento para que el API arranque ───────────
sleep 2

# ── Iniciar Next.js ───────────────────────────────────────
echo -e "${GREEN}[WEB]${RESET}  Iniciando Next.js en http://localhost:3000 ..."
npm run dev 2>&1 | sed "s/^/$(printf '\033[0;32m')[WEB] $(printf '\033[0m')/" &
NEXT_PID=$!

echo ""
echo -e "  ${GREEN}✅ Ambos servidores corriendo:${RESET}"
echo -e "     🌐 Frontend  →  ${BLUE}http://localhost:3000${RESET}"
echo -e "     🤖 API ML    →  ${BLUE}http://localhost:8000${RESET}"
echo -e "     📖 API Docs  →  ${BLUE}http://localhost:8000/docs${RESET}"
echo ""
echo -e "  ${YELLOW}Presiona Ctrl+C para detener todo.${RESET}"
echo ""

# ── Esperar a que alguno termine ─────────────────────────
wait "$API_PID" "$NEXT_PID"
