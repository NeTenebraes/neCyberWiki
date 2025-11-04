---
level: Bandit 7 → Bandit 8
target: Encontrar la contraseña junto a la palabra \"millionth\" dentro del archivo data.txt.
tags:
  - linux
  - bash
  - ctf
  - bandit
  - grep
  - texto
  - strings
difficulty:
  - ★☆☆☆☆
date: 2025-10-29
---
### Resumen
El reto consiste en buscar dentro del archivo `data.txt` la contraseña para el siguiente nivel. Esta contraseña se encuentra justo junto a la palabra \"millionth\", por lo que será necesario buscar esa palabra y extraer el texto relacionado.

### Objetivo
Extraer la contraseña para el nivel siguiente localizada junto a la palabra \"millionth\" dentro de `data.txt`.

### Contexto
Este nivel enseña el uso de comandos como `grep` y herramientas para procesar texto en archivos grandes, habilidades comunes para análisis y extracción de datos en sistemas Linux.

### Aplicación en Ciberseguridad
Manejo de búsquedas y filtrados de texto en archivos es fundamental para análisis forense y búsquedas de indicadores durante auditorías y revisiones de seguridad.

### Comandos y Conceptos Relevantes
* **`grep`**: Buscar texto.
* **`strings`**: Extraer cadenas legibles de archivos binarios.
* Herramientas para manipular y filtrar texto como `sort`, `uniq`.
* Conceptos básicos de procesamiento y búsqueda de texto en Linux.

---

### Solución

1. Conectar al servidor como `bandit7` y confirmar `data.txt`.  
```
ssh bandit7@bandit.labs.overthewire.org -p 2220
ls
```
![[Pasted image 20251029202541.png]]
	   Luego de digitada la contraseña procedemos a confirmar la existencia del archivo `data.txt`.
   
3. Buscar la palabra \"millionth\" dentro del archivo `data.txt`:  
```
grep millionth data.txt
```
![[Pasted image 20251029202226.png]]
	Nos apoyamos del comando `grep` para buscar la palabra "millionth" dentro del archivo `data.txt`, esto nos muestra la línea donde aparece la palabra, que contiene también la contraseña.

--- 

### TIPS
* Recuerda usar `grep` para búsqueda eficiente en archivos grandes.
* Puedes combinar comandos para limpiar y aislar datos si es necesario.

### Recursos para Profundizar
* `man grep`
* Tutoriales sobre búsqueda y manipulación de texto en Linux.

