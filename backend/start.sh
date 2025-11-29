#!/bin/bash
# Script de inicio para Render
cd "$(dirname "$0")"
uvicorn main:app --host 0.0.0.0 --port $PORT

