---
title: "OTW Bandit: 9"
cover:
description:
tags:
  - linux
  - bash
  - ctf
  - bandit
  - grep
  - sort
  - uniq
difficulty:
  - ★☆☆☆☆
publishDate: 2025-10-30
---
### Resumen
En este nivel se debe encontrar la única línea que aparece solo una vez en el archivo `data.txt`. Esto es un buen ejercicio para aprender a usar comandos que filtren líneas duplicadas.

### Objetivo
Extraer la línea única del archivo `data.txt` que no se repite para obtener la contraseña del siguiente nivel.

### Contexto
Este nivel enseña comandos como `sort` y `uniq` que permiten identificar líneas únicas y duplicadas en archivos de texto, habilidades que son útiles para análisis y manipulación de datos de texto en sistemas Linux. El filtrado de datos únicos o indicadores de interés dentro de grandes archivos de log o resultados de análisis es una habilidad fundamental para encontrar artefactos únicos en análisis forense o auditorías.

### Comandos y Conceptos Relevantes
- `sort`: Ordena líneas de texto.
- `uniq -u`: Muestra solo líneas únicas que no están repetidas.
- Uso de tuberías (`|`) para encadenar comandos.

### Solución
1. Conectar al servidor usando SSH con la contraseña del nivel anterior:
```
ssh bandit9@bandit.labs.overthewire.org -p 2220
```
![[content/_WRITEUPS/OverTheWire/bandit/assets/Bandit_Level_9-01.webp]]

2. Ejecutar el siguiente comando para mostrar la línea única en `data.txt`:

```
strings data.txt | grep ==
```
![[content/_WRITEUPS/OverTheWire/bandit/assets/Bandit_Level_9-02.webp]]
	**Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)