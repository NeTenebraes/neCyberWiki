---
level: Bandit 5 → Bandit 6
target: Encontrar un archivo con múltiples propiedades específicas usando 'find'.
tags:
  - linux
  - bash
  - ctf
  - bandit
  - find
  - file-attributes
  - permissions
  - size
difficulty:
  - ★☆☆☆☆
date: 2025-10-26
---
---
### Resumen
Este write-up demuestra cómo localizar un archivo basándose en un conjunto complejo de criterios: ser legible, no ejecutable y tener un tamaño específico. La solución se centra en la construcción de un comando `find` preciso que filtra a través de una estructura de directorios anidada para aislar el único archivo que cumple con todas las condiciones.

### Objetivo
La contraseña para el siguiente nivel, Bandit 6, está almacenada en un archivo ubicado en algún lugar dentro del directorio `inhere` y tiene las siguientes tres propiedades:
1.  Es legible por humanos.
2.  Tiene un tamaño de 1033 bytes.
3.  No tiene permisos de ejecución.

### Contexto
Este nivel representa un paso adelante en la búsqueda de archivos. En lugar de buscar por un solo atributo (como el nombre o el tipo), el desafío requiere combinar múltiples predicados (filtros) en un solo comando `find`. Esta es una técnica esencial para realizar búsquedas granulares y eficientes en sistemas de archivos grandes y complejos.

### Aplicación en Ciberseguridad
En escenarios de Threat Hunting y análisis forense, los analistas a menudo buscan Indicadores de Compromiso (IOCs) que tienen características muy específicas. Por ejemplo, un malware puede crear archivos temporales con un tamaño exacto o sin permisos de ejecución para pasar desapercibido. La capacidad de construir un comando `find` con múltiples condiciones es fundamental para automatizar la búsqueda de estos artefactos en un sistema comprometido.

### Comandos y Conceptos Relevantes
*   **`find`**: Herramienta para buscar archivos y directorios.
    *   `-size 1033c`: Filtra por un tamaño exacto de 1033 bytes (`c` especifica bytes).
    *   `-type f`: Filtra para buscar solo archivos.
    *   `! -executable`: Filtra archivos que **no** tienen el bit de ejecución activado para el usuario. El `!` niega la condición.
    *   `-readable`: Filtra archivos que el usuario actual tiene permiso para leer.
*   **`ls -laR`**: Lista archivos de forma recursiva (`R`) con detalles (`la`), útil para inspeccionar visualmente una estructura de directorios compleja.

---
### Solución

1.  **Conectar al servidor como `bandit5`**
```
ssh bandit5@bandit.labs.overthewire.org -p 2220
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit29.png)

2.  **Explorar la estructura del directorio `inhere`**
    Antes de buscar, es útil entender la complejidad del directorio.
```
ls -R
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit28.png)
    La salida mostrará muchos directorios anidados, lo que confirma que una búsqueda manual con `ls` y `cd` sería ineficiente.
	- `-R`:  Hacemos que la respuesta sea **recursive.**

3.  **Construir y ejecutar el comando `find`**
    Se combinan los criterios clave del objetivo en un solo comando `find` que se ejecuta desde el directorio `inhere`.
```
find . -type f -size 1033c
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit27.png)
	*   `find .`: Busca en el directorio actual y sus subdirectorios.
    *   `-type f`: Limita la búsqueda solo a archivos.
    *   `-size 1033c`: Especifica el tamaño exacto en bytes `(c)`.

Este comando devolverá la ruta al único archivo que cumple las condiciones clave, en este caso: `./inhere/maybehere07/.file2`.

4.  **Leer el contenido del archivo encontrado**
```
cat ./inhere/maybehere07/.file2
```
![OverTheWire.bandit](content/_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit26.png)
    Una vez que `find` devuelve la ruta, se usa `cat` para leer el archivo y obtener la contraseña.

---
### TIPS
* Para una solución más directa, se puede ejecutar la acción de `cat` directamente desde `find` con el predicado `-exec` y todas las condiciones requeridas:
```
find . -type f -size 1033c ! -executable -readable -exec cat {} \;
```

### Errores Comunes y Soluciones

* **Error: `find` no devuelve ningún resultado.**
    *   **Solución**: Revisa cuidadosamente cada parte del comando. Un error común es olvidar la `c` en `-size 1033c`, lo que haría que `find` interpretara el número como bloques de 512 bytes. También verifica que el `!` esté antes de `-executable`.
* **Error: `find: paths must precede expression`**
    *   **Solución**: Olvidaste especificar la ruta de inicio (en este caso, `.`). El comando siempre debe empezar con `find <ruta> [expresiones]`.

### Recursos para Profundizar
*   **Página del manual de `find`**: `man find` o [enlace web](https://man7.org/linux/man-pages/man1/find.1.html).
*   **Tutorial sobre predicados de `find`**: [DigitalOcean: How To Use Find and Locate to Search for Files on Linux](https://www.digitalocean.com/community/tutorials/how-to-use-find-and-locate-to-search-for-files-on-linux).

