---
level: Bandit 4 → Bandit 5
target: Identificar y leer un único archivo de texto legible por humanos en un directorio.
tags:
  - linux
  - bash
  - ctf
  - bandit
  - file-types
  - file
  - find
difficulty:
  - ★☆☆☆☆
date: 2025-10-26
---
---
### Resumen
Este write-up detalla el proceso para identificar un archivo de texto plano (legible por humanos) entre múltiples archivos binarios en un directorio. La solución principal se basa en el uso del comando `file` para analizar el contenido de cada archivo. Se incluye un método alternativo que combina `find` y `file` para automatizar la búsqueda.

### Objetivo
La contraseña para el siguiente nivel, Bandit 5, está almacenada en el único archivo legible por humanos que se encuentra dentro del directorio `inhere`.

### Contexto
En sistemas Linux, no todos los archivos son texto plano. Muchos son binarios (ejecutables, imágenes, datos compilados). Este nivel enseña una habilidad fundamental: cómo determinar el tipo de un archivo antes de intentar leerlo. Esto previene la corrupción de la terminal y es un paso esencial en el análisis de sistemas de archivos desconocidos.

### Aplicación en Ciberseguridad
En análisis forense y respuesta a incidentes, es crucial distinguir entre archivos de registro (texto), ejecutables maliciosos (binarios) y otros tipos de datos. Un analista debe usar herramientas como `file` para clasificar rápidamente cientos de archivos y priorizar cuáles investigar. `cat`-ear un archivo binario no solo es inútil, sino que puede ocultar información o desestabilizar la sesión de análisis.

### Comandos y Conceptos Relevantes
* **`file`**: Determina el tipo de un archivo examinando su tipo de contenido (**Magic Numbers**).
* **Magic Numbers**:
* **`cat`**: Muestra el contenido de un archivo. Es efectivo para archivos de texto, pero produce una salida ilegible y problemática con archivos binarios.
* **`*` (Comodín)**: Un carácter especial del shell que expande a todos los nombres de archivo en el directorio actual. `file *` ejecuta el comando `file` sobre cada uno de ellos.
* **`reset`**: Restaura la terminal a su estado predeterminado si se desconfigura (por ejemplo, después de intentar leer un archivo binario).
* **`grep`**: Es una herramienta para buscar patrones de texto. Su función principal es filtrar grandes cantidades de texto para mostrar solo las líneas que coinciden con un patrón específico.     
* **Uso con tuberías (`|`)**: `grep` es extremadamente útil cuando se combina con una tubería. La tubería toma la salida de un comando y la usa como entrada para `grep`.  
---

### Solución Principal (Método con `file`)

1.  **Conectar al servidor como `bandit4`**
```
ssh bandit4@bandit.labs.overthewire.org -p 2220
 ```
![OverTheWire.bandit](_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit24.png)
    Se utiliza la contraseña del nivel anterior para la sesión SSH.

2.  **Confirma la existencia y navega hacia al directorio `inhere`**
```
ls 
cd inhere
```
![OverTheWire.bandit](_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit23.png)

3.  **Analizar todos los archivos con el comando `file`**
```
ls
file ./*
```
![OverTheWire.bandit](_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit22.png)
   Al ejecutar `ls`, se ven varios archivos con nombres como `-file00`, `-file01`, etc. Para saber cuál es de texto, se usa `file ./*`.  La salida mostrará el tipo de cada archivo. La mayoría serán de tipo `data` (binarios), pero uno será identificado como `ASCII text`.


4.  **Leer el contenido del archivo de texto**: Una vez identificado el archivo de texto (por ejemplo, `./-file07`), se usa `cat` para leerlo.

```
cat ./-file07
```
![OverTheWire.bandit](_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit21.png)
	**Nota**: El nombre del archivo comienza con un guion, por lo que es necesario usar la ruta relativa `./` para que `cat` no lo interprete como una opción.

### Métodos Alternativos (`grep`)

Este método es más avanzado y eficiente, ya que automatiza la identificación en un solo comando.

1.  **Buscar y analizar todos los archivos recursivamente**: Este comando encuentra todos los archivos (`-type f`) en el directorio actual (`.`) y ejecuta `file` sobre ellos.    
```
find . -type f -exec file {} +
```
![OverTheWire.bandit](_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit20.png)
    El resultado es similar al de `file ./*`, pero `find` es más potente ya que puede **buscar en subdirectorios y ejecutar find al unisono.**

2.  **Filtrar el resultado para encontrar solo archivos de texto**: Se puede mejorar el comando anterior usando una **tubería** (`|`) para enviar el resultado a `grep` y filtrar solo la línea que contiene "ASCII text".
 ```
 find . -type f -exec file {} + | grep "ASCII text"
 ```
![OverTheWire.bandit](_WRITEUPS/OverTheWire/bandit/assets/OverTheWire.bandit25.png)
    La salida de este comando mostrará únicamente la línea correspondiente al archivo de texto, haciendo su identificación inmediata. A partir de ahí, solo queda usar `cat` sobre ese nombre de archivo.

---
### TIPS
*   Si tu terminal se "rompe" al usar `cat` en un archivo binario (muestra caracteres extraños o no responde bien), simplemente escribe `reset` y presiona Enter.
	* Hay otras formas de agrupas comandos.

### Errores Comunes y Soluciones

*   **Error: La terminal se vuelve ilegible o no responde.**
    *   **Solución**: Has intentado leer un archivo binario con `cat`. Ejecuta el comando `reset` para restaurar la terminal.
*   **Error: `cat: -: No such file or directory` al intentar leer el archivo.**
    *   **Solución**: El nombre del archivo comienza con un guion. Debes especificar su ruta como `./-fileXX` para que el shell lo trate como un archivo y no como una opción de comando.

### Recursos para Profundizar
*   **Página del manual de `file`**: `man file` o [enlace web](https://man7.org/linux/man-pages/man1/file.1.html).
*   **Artículo sobre "Magic Numbers"**: [Wikipedia: File format identification](https://en.wikipedia.org/wiki/List_of_file_signatures).

