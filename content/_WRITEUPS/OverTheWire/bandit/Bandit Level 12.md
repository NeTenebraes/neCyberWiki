---
title: "OTW Bandit: 12"
description: "Explicación detallada paso a paso de cómo resolver el nivel 12 de OverTheWire: Bandit. Abordando hexdump y extracción de archivos con herramientas gzip, bzip2 y tar."
tags:
  - linux
  - bash
  - bandit
  - hexdump
  - gzip
  - bzip2
  - tar
difficulty:
  - ★★☆☆☆
publishDate: 2025-11-08
---
## Introducción
[Este nivel](https://overthewire.org/wargames/bandit/bandit13.html) consiste en revertir un [hexdump](https://es.wikipedia.org/wiki/Volcado_hexadecimal) contenido en el archivo `data.txt`. Esto con el fin de obtener un archivo binario que está comprimido **múltiples veces** por herramientas como **`tar`, `bzip2` y `gzip`**. El objetivo es extraer la contraseña del siguiente nivel deshaciendo todas las capas de compresión.
## Hexdump
Un **hexdump** es la **representación en texto de un archivo binario** mostrando los datos en formato hexadecimal. Es útil porque los archivos binarios no se pueden leer directamente con comandos normales (como `cat`), el hexdump convierte esos datos en un formato legible para humanos y herramientas.

Solemos identificar un hexdump porque el archivo contiene líneas formadas por códigos hexadecimales (0-9, A-F) agrupados, y usualmente posiciones o desplazamientos en hexadecimal al inicio o al final de cada línea y, a veces, **representaciones en ASCII**.

```
00000000: 1f8b 0808 2817 ee68 0203 6461 7461 322e  ....(..h..data2.
00000010: 6269 6e00 013c 02c3 fd42 5a68 3931 4159  bin..<...BZh91AY
00000020: 2653 59cc 46b5 2d00 0018 ffff da5f e6e3  &SY.F.-......_..
00000030: 9fcr f59d bc69 ddd7 f7ff a7e7 dbdd b59f  .....i..........
00000040: fff7 cfdd ffbf bbdf ffff ff5e b001 3b58  ...........^..;X
00000050: 2406 8000 00d0 6834 6234 d000 6869 9000  $.....h4b4..hi..
00000060: 1a7a 8003 40d0 01a1 a006 8188 340d 1a68  .z..@.......4..h
00000070: d340 d189 e906 8f41 0346 4d94 40d1 91a0  .@.....A.FM.@...
00000080: 681a 0681 a068 0680 c400 3207 a269 a189  h....h....2..i..
00000090: a326 8000 c800 c81a 1883 1000 00d0 c023  .&.............#
000000a0: 4311 a034 30ca 6800 0680 0681 a680 6868  C..40.h.......hh
000000b0: d068 6868 c04c d400 0003 4d06 87a8 d000  .hhh.L....M.....
000000c0: 3086 8c20 3268 068d 000c 9a64 0698 8d04  0.. 2h.....d....
```
## Herramientas para este nivel

Este nivel también va de la multiple decompresión archivos, por lo que conocer cómo funcionan juntos estos formatos te da una gran ventaja para manejar archivos eficientemente en Linux, especialmente en contextos de administración de sistemas, desarrollo y ciberseguridad.
### 1. Gzip
Herramienta muy popular en Linux para **comprimir archivos**. Usa un algoritmo que comprime rápido y bien para textos, código o páginas web. Cuando ves un archivo que termina en `.gz`, generalmente es un archivo comprimido con `gzip`. Por sí mismo, `gzip` trabaja con un solo archivo, pero normalmente lo combinamos con `tar`﻿ para empaquetar y comprimir varias carpetas o archivos en uno solo (por ejemplo, `.tar.gz`).

### 2. Bzip2
Ofrece una compresión más eficiente que `gzip`, aunque tarda un poco más. Genera archivos con extensión `.bz2`. Su algoritmo es distinto y usa técnicas avanzadas para lograr archivos aún más pequeños, ideal para archivos pesados o donde importar un poco más de tiempo para comprimir vale la pena. Como `gzip`, también suele combinarse con `tar`﻿ para comprimir directorios completos.

### 3. Tar
**La función de "Tape Archive" no es comprimir**, sino agrupar varios archivos y carpetas en uno solo llamado "**tarball**". Por sí solo, tar no reduce el tamaño, solo **crea un archivo que contiene todo lo que agrupaste**, luego se se combina con `gzip` o `bzip2` para crear archivos comprimidos que además están empaquetados, como `.tar.gz` o `.tar.bz2`.

Además, tar conserva la estructura original de carpetas y permisos, lo que es fundamental para preservar la integridad en backups o migraciones.

---
## Comandos Clave

- **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante protocolo Secure Shell (SSH).
- **`file`**: Identifica el tipo de archivo analizando su contenido (no solo extensión).
- **`cat`**: Muestra contenido del archivo en terminal. Útil para ver texto plano.
- **`mkdir`** Crea directorios.
- **`mv`:**
- **`cp`**: Copia archivos o directorios.
	- Parámetros Comunes: 
        - `-r` copia recursiva (directorios).            
        - `-p` preserva permisos.            
        - `-i` confirma sobrescritura.            
        - `-v` muestra detalle.

- **`rm`**: Borra archivos o directorios.
	- Parámetros Comunes: 
        - `-r` o `-R`: Borra recursivamente (directorios y su contenido).
        - `-f`: Fuerza la eliminación sin preguntar confirmación.
        - `-i`: Pide confirmación antes de borrar cada archivo.
        - `-v`: Muestra detalles de los archivos borrados.

- **`xxd`**: Crea y revierte hexdumps; convierte entre texto hexadecimal y binario.
	- Parámetros Comunes: 
        - `-r` revierte de hexdump a binario.            
        - `-p` usa/espera hex “plano” sin offsets ni ASCII.            
        - `-u` muestra hex en mayúsculas (cuando generas hexdump).            
        - `-s OFFSET` comienza en un desplazamiento específico (útil al revertir parciales).

- **`gzip`**: Comprime y descomprime datos en formato gzip.
	- Parámetros Comunes: 
        - `-d` descomprime.            
        - `-S SUF` usa/espera el sufijo indicado (p. ej., `.bin`).            
        - `-k` conserva el archivo original (por defecto lo elimina).            
        - `-c` escribe la salida a stdout (no crea archivo).            
        - `-v` modo detallado.
   
- **`bzip2`**: Comprime y descomprime datos en formato bzip2.
    - Parámetros Comunes: 
		- `-d` descomprime.            
        - `-k` conserva el archivo original.            
        - `-v` modo detallado.            

- **`tar`**: Empaqueta y extrae archivos de un contenedor tar.
	- Parámetros Comunes: 
		- `-x` extrae contenido.            
        - `-v` salida detallada de los archivos procesados.            
        - `-f ARCHIVO` especifica el archivo tar a usar.            
        - `-C DIR` extrae en el directorio indicado.            
        - `-t` lista el contenido sin extraer.            
        - `-z` filtra por gzip (tar.gz).            
        - `-j` filtra por bzip2 (tar.bz2).

---
## Solución 

### 1. Conectarnos al servidor
```
ssh -p 2220 bandit12@bandit.labs.overthewire.org
```
![[OverTheWire.bandit 8.png]]

### 2. Creamos directorio de trabajo
```
ls
mkdir /tmp/netenebrae
cp data.txt /tmp/netenebrae
cd /tmp/netenebrae
```

![[OverTheWire.bandit 9.png]]

El comando `mkdir` (make directory) se utiliza para crear nuevos directorios o carpetas en el sistema de archivos. Puede crear desde un solo directorio hasta estructuras jerárquicas completas, y también permite asignar permisos específicos o crear varios directorios a la vez. Su sintaxis básica es `mkdir nombre/ubicacion_del_directorio`.

Por otro lado, `cp` se utiliza para copiar archivos o directorios de un lugar a otro, replicando datos sin modificar el original. **Por recomendación de OverTheWire**, crearemos una carpeta temporal dentro de `/tmp` con un nombre aleatorio para trabajar cómodamente con la descompresión de archivos y copiaremos el archivo `data.txt` a dicho directorio.
### 3. Revertimos Hexdump 

```
xxd -d data.txt data
file data 
mv data data2.bin
```

![[OverTheWire.bandit 16.png]]

Usamos el comando `xxd -r` para convertir el hexdump guardado en `data.txt` de nuevo a su forma binaria, y lo guardamos en un nuevo archivo llamado `data`. Luego ejecutamos `file` para identificar el tipo de archivo, que nos indica que es un archivo `gzip` previamente llamado `data2.bin`. Finalmente, usamos `mv` para renombrar `data` a `data2.bin`. Este paso es necesario porque, si no renombramos el archivo, la herramienta de descompresión no nos permite extraerlo correctamente. Renombrar garantiza que el archivo tenga la extensión esperada y facilita su manejo en los siguientes pasos.


### 4. Extracción con gzip
```
gzip -d -S .bin data2.bin
file data2
```
![[OverTheWire.bandit 15.png]]
	

Procedemos a extraer el archivo `data2.bin` utilizando el comando `gzip -d -S .bin`, la opción `-S .bin` especifica que el archivo tiene la extensión `.bin` en lugar de la estándar `.gz` y genera un nuevo archivo llamado `data2`. A continuación, identificamos el contenido del archivo resultante con `file`, y esta vez nos indica que el archivo está en formato `bzip2`.

### 5. Extracción con bzip2
![[OverTheWire.bandit 14.png]]
	
Usamos la herramienta de descompresión `bzip2` con el archivo `data2`. Al descomprimir, `bzip2` genera un archivo llamado `data2.out`. Esto se debe a que cuando `bzip2` descomprime un archivo que no tiene la extensión estándar `.bz2`, añade `.out` al nombre del archivo de salida para diferenciarlo y evitar sobrescribir archivos existentes.

Después, verificamos con `file` y vemos que el archivo resultante es un archivo `gzip` que antes se llamaba `data4.bin`. Por último, renombramos el archivo.

### 6. Extracción con tar
```
gzip -d -S .bin data4.bin
file data4
```
   
   ![[OverTheWire.bandit 17.png]]

Descomprimimos el archivo utilizando `gzip` con las opciones `-d -S .bin`, ya que, como sabemos, la extensión  del archivo no es la habitual "`.gz`". Esto genera un nuevo archivo llamado `data4`. Para comprobar su nuevo formato, ejecutamos el comando `file` y observamos que ahora se trata de un archivo `tar`.

![[OverTheWire.bandit 12.png]]
Utilizamos la herramienta `tar` para extraer el archivo `data4`, lo que nos genera el archivo `data5.bin`. Al analizar `data5.bin` con el comando `file`, notamos que también es un archivo tar. Por eso, repetimos el proceso y usamos nuevamente `tar` sobre `data5.bin`, obteniendo así el archivo `data6.bin`. Para asegurarnos del siguiente paso, volvemos a emplear `file` y vemos que ahora se trata de un archivo en formato `bzip2`.

Esta metodología es sencilla pero poderosa:

- Primero identificamos el tipo de archivo usando `file`.    
- Luego, aplicamos la herramienta correspondiente (tar, gzip, bzip2, etc.) según el formato detectado.    
- Finalmente, verificamos el resultado antes de avanzar al siguiente paso.

De esta forma, mantenemos un flujo controlado y organizado, asegurándonos de no perder nunca la pista del tipo de archivo en cada etapa del reto técnico. **¡Así ningún formato raro nos toma por sorpresas!**

### 7.  Usamos la metodología
```
bzip2 -d data6.bin
file data6.bin.out
tar -xvf data6.bin.out
file data8.bin
gzip -d -S .bin data8.bin
file data8.bin
cat data8.bin
```


![[OverTheWire.bandit 11.png]]
Siguiendo la misma metodología, utilizamos la herramienta adecuada para extraer el contenido de `data6.bin.out`, que nuevamente resulta ser un archivo tar. Usamos `tar` para extraerlo, lo que nos da el archivo `data8.bin`. Al analizarlo con `file`, comprobamos que ahora es un archivo gzip que anteriormente se llamaba `data9.bin`.

![[OverTheWire.bandit 2 1.png]]
![[OverTheWire.bandit 10.png]]


Repetimos el proceso: extraemos el archivo, verificamos el formato, y en **este caso final vemos que el contenido ya es un archivo de texto**. Usando `cat` revisamos su contenido… ¡y finalmente encontramos la contraseña! 

Esta rutina de identificar el formato, aplicar la herramienta correcta y verificar el resultado garantiza que ningún tipo de archivo comprimido o empaquetado se resista durante el reto técnico.

---

## Errores comunes

bzip2: `Can't guess original name for "file"﻿`

aparece cuando el archivo comprimido no tiene una extensión estándar reconocida (como `.bz2`). En ese caso, `bzip2` no puede inferir automáticamente cuál debería ser el nombre del archivo descomprimido, por lo que le asigna el mismo nombre del archivo comprimido con la extensión `.out`.

Puedes seguir adelante con la descompresión sin renombrar el archivo, el archivo extraído aparecerá con la extensión `.out` y podrás renombrarlo después si lo deseas para mayor claridad.

Sin embargo, renombrar el archivo comprimido para que tenga una extensión estándar (`.bz2`) antes de descomprimir puede hacer que `bzip2` asigne automáticamente un nombre adecuado al archivo extraído y evites el sufijo `.out`. Esto puede ser útil para mantener un flujo de trabajo más ordenado.


