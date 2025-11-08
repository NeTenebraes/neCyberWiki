---
title: "OTW Bandit: 8"
cover:
description:
tags:
  - linux
  - bash
  - ctf
  - bandit
  - grep
  - uniq
  - texto
difficulty:
  - ★☆☆☆☆
date: 2025-10-29
---
### Resumen
El objetivo es encontrar la contraseña que es representada por la única línea que aparece una sola vez en el archivo `data.txt`. Esto requiere procesar el archivo para identificar líneas únicas.

### Objetivo
Extraer la única línea de `data.txt` que ocurre una sola vez, que contiene la contraseña para el siguiente nivel.

### Contexto
Este reto fortalece habilidades de manipulación y filtrado avanzado de texto usando comandos como `uniq` y `grep`, esenciales en la administración y análisis en Linux. Identificar anomalías o líneas únicas en archivos de logs o datos es un método común en análisis forense y respuesta ante incidentes.

### Comandos y Conceptos Relevantes
* **`uniq -u`**: Filtra líneas que aparecen solo una vez.
* **`sort`**: Ordena líneas para que `uniq` pueda procesarlas correctamente.
* **`grep`**: Búsqueda de texto en archivos.
* Combinación de comandos mediante pipes para flujo eficiente de datos.

---

### Solución

1. Conectarse al servidor como `bandit8`.
```
ssh bandit8@bandit.labs.overthewire.org -p 2220
```
![[Pasted image 20251104023122.png]]

2. Procesar el archivo para encontrar líneas únicas:  
```
sort data.txt | uniq -u
```
![[Pasted image 20251104023203.png]]
	El resultado es la línea que aparece una sola vez, que es la contraseña buscada. **Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)

---

### TIPS
* `uniq` solo detecta líneas únicas si el archivo está previamente ordenado, por eso se usa `sort`.
* Explora la combinación de comandos para obtener resultados precisos en grandes archivos de texto.

### Recursos para Profundizar
* `man uniq`
* Tutoriales sobre pipes y manipulación de texto en Linux.

