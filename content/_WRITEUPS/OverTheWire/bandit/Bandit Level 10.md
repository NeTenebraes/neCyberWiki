---
title: "OTW Bandit: 10"
cover: content/_WRITEUPS/OverTheWire/bandit/assets/otwcover11.png
description: Te guío para encontrar la contraseña del nivel descifrando un archivo protegido con ROT13. Aprenderás no solo a aplicar y revertir este cifrado clásico desde la terminal usando el comando adecuado, sino también a profundizar en el manejo de texto y en los comandos básicos de Linux fundamentales para administración y pentesting.
tags:
  - linux
  - bash
  - bandit
  - base64
  - cifrado
difficulty:
  - ★☆☆☆☆
date: 2025-10-30
---
### Resumen
Este nivel consiste en decodificar datos codificados en base64 contenidos en el archivo `data.txt` para obtener la contraseña del siguiente nivel.

### Objetivo
Decodificar el contenido base64 de `data.txt` y extraer la contraseña para el nivel siguiente.

### Contexto
Base64 es un esquema de codificación que convierte datos binarios en texto ASCII. Aprender a decodificar base64 es básico para manejar datos codificados en sistemas y comunicaciones. El análisis de datos codificados o cifrados es común en pentesting y análisis forense; manejar encoding y decodificaciones es crucial para entender y extraer información.

### Comandos y Conceptos Relevantes
- `base64 -d`: Decodifica datos codificados en base64.
- Redirección y visualización en terminal.

### Solución
1. Conectar al servidor como usuario del nivel actual:

```
ssh bandit10@bandit.labs.overthewire.org -p 2220
```
![[Pasted image 20251104023457.png]]

2. Decodificar el archivo `data.txt` para mostrar la contraseña:
```
base64 -d data.txt
```
![[Pasted image 20251104023525.png]]
