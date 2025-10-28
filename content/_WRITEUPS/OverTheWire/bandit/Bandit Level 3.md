---
level: "Bandit 3 → Bandit 4"
target: "Encontrar contraseña en archivo oculto con ls y find."
tags: [linux, bash, ctf, bandit, hidden-files, ls, find]
difficulty: "★☆☆☆☆"
date: 2025-10-26
---
---
### Resumen
Este write-up detalla dos métodos para encontrar una contraseña almacenada en un archivo oculto (dotfile). El primer método utiliza `ls -a` para la enumeración manual, mientras que el segundo, más didáctico, emplea el comando `find` para localizar la ruta del archivo y `cat` para leerlo.

### Objetivo
La contraseña para el siguiente nivel, Bandit 4, está guardada en un archivo oculto que se encuentra dentro del directorio `inhere`.

### Contexto
Este nivel refuerza la comprensión sobre los archivos ocultos en sistemas Unix. Demuestra tanto el método de inspección manual como un enfoque de búsqueda automatizada, una habilidad crucial para escenarios donde los archivos no están en ubicaciones obvias.

### Aplicación en Ciberseguridad
El comando `find` es una herramienta indispensable en pentesting y análisis forense. Permite a los profesionales de la seguridad localizar rápidamente archivos de configuración, logs, credenciales o artefactos de malware en sistemas de archivos complejos, basándose en atributos como nombre, permisos, tamaño o fecha.

### Comandos y Conceptos Relevantes
*   **`ls -a`**: Lista todo el contenido de un directorio, incluyendo los archivos y directorios ocultos.
*   **`cd`**: Cambia el directorio actual.
*   **`cat`**: Muestra el contenido de un archivo.
*   **`find`**: Busca archivos y directorios en una jerarquía de directorios.
    *   `find [ruta] -name "[patrón]"`: Busca archivos que coincidan con un patrón de nombre.

---
### Solución Principal (Método con `ls`)

1.  **Conectar al servidor como `bandit3`**
```
ssh bandit3@bandit.labs.overthewire.org -p 2220
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit18.png)
    Se utiliza la contraseña del nivel anterior para iniciar la sesión SSH.

2. **Confirmamos la existencia de los directorios**
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit17.png)

3. **Explorar el directorio `inhere`**
```
cd inhere
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit16.png)
    Se accede al directorio especificado en el objetivo.

4.  **Listar todos los archivos para encontrar el oculto**
```
ls -a
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit15.png)
    El uso de `ls -a` revela el archivo `.hidden` que no es visible con un `ls` simple.

5.  **Leer el contenido del archivo `...Hiding-From-You`**
```
cat ...Hiding-From-You
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit14.png)
- Se utiliza `cat` para mostrar la contraseña.
- **Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)
### Método Alternativo (Solución con `find`)

Este método simplificado separa la búsqueda de la lectura, lo cual es útil para entender el proceso en dos pasos.

1.  **Localizar el archivo con `find`**
```
find . 
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit13.png)
- Desde el directorio actual, se buscan todos los archivo (`.`)
- La salida de este comando será la ruta relativa de todos los archivos en la carpeta actual: `./inhere/...Hiding-From-You`

2.  **Leer el archivo usando la ruta encontrada**
```
cat ./inhere/...Hiding-From-You
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit19.png)
- Una vez localizada la ruta, se usa `cat` para leer el archivo.
- **Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)
---

### TIPS
* Si conoces la ruta de un archivo, no hay necesidad de desplazarte con `cd` hacia el directorio. Apóyate de **rutas relativas** y **absolutas** para realizar comandos mas eficientes.

### Errores Comunes y Soluciones

*   **Error: El directorio `inhere` parece estar vacío.**
    *   **Solución**: Ocurre al usar `ls` sin la opción `-a`. Siempre usa `-a` para asegurar que ves todos los archivos.
*   **Error: El comando `find` no devuelve nada o da un error.**
    *   **Solución**: Verifica la sintaxis.

### Recursos para Profundizar
*   **Página del manual de `find`**: Ejecutar `man find` en la terminal o visitar la [página del manual en línea](https://man7.org/linux/man-pages/man1/find.1.html).
*   **Página del manual de `ls`**: [Página del manual en línea](https://man7.org/linux/man-pages/man1/ls.1.html).

