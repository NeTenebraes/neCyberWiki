---
level: Bandit 10 → Bandit 11
target: Obtener la contraseña decodificando el contenido base64 del archivo data.txt.
tags:
  - linux
  - bash
  - ctf
  - bandit
  - base64
  - encoding
difficulty:
  - ★☆☆☆☆
date: 2025-10-30
---
### Resumen
Este nivel consiste en decodificar datos codificados en base64 contenidos en el archivo `data.txt` para obtener la contraseña del siguiente nivel.

### Objetivo
Decodificar el contenido base64 de `data.txt` y extraer la contraseña para el nivel siguiente.

### Contexto
Base64 es un esquema de codificación que convierte datos binarios en texto ASCII. Aprender a decodificar base64 es básico para manejar datos codificados en sistemas y comunicaciones.

### Aplicación en Ciberseguridad
El análisis de datos codificados o cifrados es común en pentesting y análisis forense; manejar encoding y decodificaciones es crucial para entender y extraer información.

### Comandos y Conceptos Relevantes
- `base64 -d`: Decodifica datos codificados en base64.
- Redirección y visualización en terminal.

### Solución
1. Conectar al servidor como usuario del nivel actual:

```
ssh bandit10@bandit.labs.overthewire.org -p 2220
```

2. Decodificar el archivo `data.txt` para mostrar la contraseña:

```
base64 -d data.txt
```

---