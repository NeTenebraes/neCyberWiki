---
level: Bandit 12 → Bandit 13
title: "OTW Bandit: 12"
description: Explicación detallada paso a paso de cómo resolver el nivel 12 de Bandit, abordando hexdump hasta la obtención final de la contraseña, explicada de forma clara para enseñar a alguien más.
tags:
  - linux
  - bash
  - bandit
  - descompresión
  - hexdump
difficulty:
  - ★★☆☆☆
publishDate: 2025-11-08
---
### Resumen
[Este nivel](https://overthewire.org/wargames/bandit/bandit13.html) consiste en revertir un [hexdump](https://es.wikipedia.org/wiki/Volcado_hexadecimal) contenido en el archivo `data.txt` para obtener un archivo binario que está comprimido **múltiples veces** por herramientas como tar, bzip2 y gzip. El objetivo es extraer la contraseña del siguiente nivel deshaciendo todas las capas de compresión.

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


## Compresión de archivos y herramientas útiles 

La compresión de archivos es un proceso que reduce el tamaño de uno o varios archivos para ahorrar espacio en disco o facilitar su traslado entre dispositivos. Imagina que quieres enviar un paquete muy grande y voluminoso; al comprimirlo, lo haces más pequeño sin perder nada importante, para que ocupe menos espacio y se mueva más rápido.

La compresión funciona detectando patrones repetidos y eliminando redundancias. Así, aunque el archivo se ve distinto (y ocupa menos), es posible recuperarlo exactamente igual que el original más adelante.

---

## Gzip: 
herramienta muy popular en Linux para comprimir archivos. Usa un algoritmo que comprime rápido y bien para textos, código o páginas web. Cuando ves un archivo que termina en `.gz`, generalmente es un archivo comprimido con gzip.

Por sí mismo, gzip trabaja con un solo archivo, pero normalmente lo combinamos con tar﻿

para empaquetar y comprimir varias carpetas o archivos en uno solo (por ejemplo, `.tar.gz`).

---

## Bzip2;
Ofrece una compresión más eficiente que gzip, aunque tarda un poco más. Genera archivos con extensión `.bz2`. Su algoritmo es distinto y usa técnicas avanzadas para lograr archivos aún más pequeños, ideal para archivos pesados o donde importar un poco más de tiempo para comprimir vale la pena.

Como gzip, también suele combinarse con tar﻿

para comprimir directorios completos.

---

## Tar
Tape Archive, su función no es comprimir, sino agrupar varios archivos y carpetas en uno solo llamado "tarball". Por sí solo, tar no reduce el tamaño; solo crea un archivo que contiene todo lo que agrupaste.

Luego, para reducir realmente el tamaño del archivo tar, se combina con gzip o bzip2 para crear archivos comprimidos que además están empaquetados, como `.tar.gz` o `.tar.bz2`.

Además, tar conserva la estructura original de carpetas y permisos, lo que es fundamental para preservar la integridad en backups o migraciones.

---

Conocer cómo funcionan juntos estos formatos te da una gran ventaja para manejar archivos eficientemente en Linux, especialmente en contextos de administración de sistemas, desarrollo y ciberseguridad.

### Conceptos y comandos Linux clave

- **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante protocolo Secure Shell (SSH).

- **`file`**: Identifica el tipo de archivo analizando su contenido (no solo extensión).

    - Sintaxis: `file archivo`

    - Parámetros comunes:        
        - `-b` muestra solo el tipo sin nombre.
        - `-i` muestra tipo MIME.

- **`cat`**: Muestra contenido del archivo en terminal. Útil para ver texto plano.

- **`xxd`**: Crea y revierte hexdumps; convierte entre texto hexadecimal y binario.

    - Sintaxis: `xxd -r archivo.hex archivo.bin`

    - Parámetros comunes:        
        - `-r` revierte de hexdump a binario.            
        - `-p` usa/espera hex “plano” sin offsets ni ASCII.            
        - `-u` muestra hex en mayúsculas (cuando generas hexdump).            
        - `-s OFFSET` comienza en un desplazamiento específico (útil al revertir parciales).

- **`gzip`**: Comprime y descomprime datos en formato gzip.
    
    - Sintaxis: `gzip -d -S .bin archivo.bin`

    - Parámetros comunes:        
        - `-d` descomprime.            
        - `-S SUF` usa/espera el sufijo indicado (p. ej., `.bin`).            
        - `-k` conserva el archivo original (por defecto lo elimina).            
        - `-c` escribe la salida a stdout (no crea archivo).            
        - `-v` modo detallado.

- **`bzip2`**: Comprime y descomprime datos en formato bzip2.
    
    - Sintaxis: `bzip2 -d archivo.bz2`

    - Parámetros comunes:        
        - `-d` descomprime.            
        - `-k` conserva el archivo original.            
        - `-v` modo detallado.            

- **`tar`**: Empaqueta y extrae archivos de un contenedor tar.

	Sintaxis: `tar -xvf archivo.tar`

    - Parámetros comunes:        
        - `-x` extrae contenido.            
        - `-v` salida detallada de los archivos procesados.            
        - `-f ARCHIVO` especifica el archivo tar a usar.            
        - `-C DIR` extrae en el directorio indicado.            
        - `-t` lista el contenido sin extraer.            
        - `-z` filtra por gzip (tar.gz).            
        - `-j` filtra por bzip2 (tar.bz2).

- **`mkdir`** Crea directorios.

- **`cp`**: Copia archivos o directorios.

    - Sintaxis: `cp [opciones] archivo_origen archivo_destino`

    - Parámetros comunes:        
        - `-r` copia recursiva (directorios).            
        - `-p` preserva permisos.            
        - `-i` confirma sobrescritura.            
        - `-v` muestra detalle.

- **`rm`**: Borra archivos o directorios.

    - Sintaxis: `rm [opciones] archivo_o_directorio`

    - Parámetros comunes:        
        - `-r` o `-R`: Borra recursivamente (directorios y su contenido).
        - `-f`: Fuerza la eliminación sin preguntar confirmación.
        - `-i`: Pide confirmación antes de borrar cada archivo.
        - `-v`: Muestra detalles de los archivos borrados.
---
### Paso a paso para resolver el nivel

conectarnos

![[OverTheWire.bandit 8.png]]



listamos, creamos copiamos y nos mevemos al directorio de trabajo

ls
data.txt
mkdir /tmp/netenebrae
cp data.txt /tmp/netenebrae
cd /tmp/netenebrae

![[OverTheWire.bandit 9.png]]
	Nos aconsejan crear una carpeta que ya vamos manejar la descompresion de varios archivos, por lo que vamos a usar comandos simples para crear las carpetas y hacer todo lo necesario

verificamos, hexxdumpeamos verificamos y renombremos 
![[OverTheWire.bandit 16.png]]
	hacemos el hexdump y lanzamos un file para identificar el tipo de archivo. Esto nos indica que es un tipo de archivo gzip que antes se llamaba data2.bin, renombrear  "archivo" a data2.bin.

3. Repetir,
![[OverTheWire.bandit 15.png]]
	Repetimos lo mismo, solo que en esta ocasion vemos data 2 esta vez nos da un archivo descomprimido en formato bzip2.

4. Repetir
![[OverTheWire.bandit 14.png]]
	
verificamos el contenido, usamos la herramienta de descompresion, . verificamos el contenido descomrpimido. mirara que la herramienta nos da el archivo "data2.out". verificamos con file y vemos que un archivo gzip anteriormente llamado data4.bin, lo renombramos.

5. Repetir
   
   ![[OverTheWire.bandit 17.png]]

	verificamos el contenido de data4.bin, uzamos la herramienta gzip para descomprirmirla ya que  verificamos que es ese tipo. verificamos el contenido y vemos que esta vez nos da un archivo tar.

6. Repetir
![[OverTheWire.bandit 12.png]]
	usamos la herramienta tar para extrar el archivo data4, esto nos da el archivo data5.bin , al usar file a data5.bin vemos que tambien es un archivo tar por lo que usamos nuevamente el comando, pero esta vez sombre el archivo data5.bin, esto nos da el archivo data6.bin por lo que usamos el comando file para confirmar el tipo de archivo y vemos que esta vez es bzip2. 

7.  Repetir

![[OverTheWire.bandit 11.png]]
	Usamos las herramienta para extrar el contenido del archivo, me da un resultador data6.bin.out. Solo que esta vez es un archivo tar, usamos la herramienta tar y extramos el archivo data8.bin y al verificarlo vemos que es un archivo gzip anteriormente llamado data9.bin.

8. Repetir

Usamos la herramienta para extrar, verificamos el contenido extraido y vemos que es un archivo de texto. usamos cat y vemos la contraseña :v 

![[OverTheWire.bandit 10.png]]


---



bzip2: Can't guess original name for data2 -- using data2.out﻿

aparece cuando el archivo comprimido no tiene una extensión estándar reconocida (como `.bz2`). En ese caso, `bzip2` no puede inferir automáticamente cuál debería ser el nombre del archivo descomprimido, por lo que le asigna el mismo nombre del archivo comprimido con la extensión `.out`.

Puedes seguir adelante con la descompresión sin renombrar el archivo, el archivo extraído aparecerá con la extensión `.out` y podrás renombrarlo después si lo deseas para mayor claridad.

Sin embargo, renombrar el archivo comprimido para que tenga una extensión estándar (`.bz2`) antes de descomprimir puede hacer que `bzip2` asigne automáticamente un nombre adecuado al archivo extraído y evites el sufijo `.out`. Esto puede ser útil para mantener un flujo de trabajo más ordenado.


