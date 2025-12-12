---
title: "OTW Bandit: 17"
description: Este nivel pone a prueba tu capacidad para detectar cambios mínimos en archivos usando herramientas de comparación. Debes acceder como bandit17 y emplear el comando diff para localizar la única diferencia entre dos listas de contraseñas
tags:
  - linux
  - bash
  - bandit
  - diff
Dificultad:
  - ★☆☆☆☆
publishDate: 2025-12-05
---
## Introducción y Desafío
![[Cover OTW2.png]]
Este nivel prueba tu capacidad para detectar cambios sutiles en archivos mediante herramientas de comparación. Con la llave SSH privada obtenida en [[Bandit Level 16]], accede como `bandit17` y usa el comando `diff` para identificar **la única** diferencia entre dos listas de contraseñas, `passwords.new` y `passwords.old`. 

**El enfoque clave es la precisión**: Un solo cambio revela la solución sin necesidad de revisar manualmente miles de líneas.
##  Conceptos Clave

El comando `diff` compara archivos línea por línea y resalta diferencias específicas, ideal para detectar cambios en listas grandes como contraseñas o configuraciones.

La **mentalidad de hacker** aquí radica en el pensamiento lateral: Ante dos archivos similares, no vas a revisar manualmente miles de líneas, sino que usas la herramienta precisa (`diff`) para revelar la única modificación en segundos.​![[2.png]]
###  Sintaxis General del Comando `diff`

La sintaxis básica es la siguiente:
```Bash
diff [OPCIONES] ARCHIVO1 ARCHIVO2
```

O, si quieres comparar directorios:
```Bash
diff [OPCIONES] DIRECTORIO1 DIRECTORIO2
```
#### Argumentos Principales:
- **`ARCHIVO1`**: El primer archivo que se va a comparar (a menudo considerado el "original").    
- **`ARCHIVO2`**: El segundo archivo que se va a comparar (la versión "modificada").    
- **`DIRECTORIO1`**: El primer directorio a comparar.
- **`DIRECTORIO2`**: El segundo directorio a comparar.

**Casos de uso comunes**: Validar actualizaciones de software (comparar configs antes/después), debugging de scripts, auditorías de seguridad en logs, o desafíos CTF donde un solo byte cambiado **es la clave**. ​

## Comandos Clave para este nivel.
* **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante el protocolo Secure Shell (SSH).
    * Parámetros usados:
        * `-p [puerto]`: Especifica el puerto remoto (ej: `-p 2220`).
        * `usuario@host`: Define el usuario y el servidor al que te conectas.
- **`touch`**: Crea un archivo vacío.    
- **`nano`**: Editor de texto en terminal.    
- **`chmod`**: Cambia los permisos de un archivo (usado para asegurar la clave SSH).    
- **`cat`**: Muestra el contenido de un archivo.    
- **`diff`**: Muestra diferencias entre dos archivos.

---
##  Solución Paso a Paso

### 1. Creación y configuración llave SSH bandit17

Nos conectamos al servidor como el usuario `bandit17` usando la llave encontrada en [[Bandit Level 16]]. Primero creamos el archivo que almacenará la llave privada y se ajustan sus permisos:
```bash
touch bandit17.key
nano bandit17.key
chmod 600 bandit17.key 
```
<!-- Imagen de la edición del archivo con la llave SSH-->
![[Pasted image 20251212142101.png]]
Aquí estoy usando `nano`, pero puedes emplear cualquier editor de texto que prefieras. Lo crucial es pegar la llave sin alterar **ningún** carácter y luego ajustar los permisos correctamente.

- `chmod 600 ARCHIVO` significa que solo el propietario puede leer y escribir ese archivo, mientras que el grupo y el resto de usuarios no tienen ningún permiso sobre él.

### 2. Conexión a bandit17.
```
ssh -p 2220 bandit17@bandit.labs.overthewire.org
```
<!-- Imagen de la conexión SSH con OverTheWire -->
![[BanditLevel17-01.webp]]

Asegúrate de que la llave quede **idéntica** en un fichero, por ejemplo `bandit17.key` o `llaveotw` (el nombre es libre), porque cualquier cambio en el texto o en el formato hará que el servidor la rechace.
### 3. Confirmamos la contraseña de nivel actual
```
cat /etc/bandit_pass/bandit17
```
<!-- Imagen de la contraseña del nivel actual de Over The Wire-->
![[BanditLevel17-02.webp]]

Una vez dentro, es posible comprobar la contraseña actual del nivel.
### 4. Verificamos el contenido de los archivos
```
ls -l
cat passwords.new passwords.old 
```
<!-- Listado de archivos con contraseñas -->
![[BanditLevel17-03.webp]]

Usamos `ls` para verificar el contenido en el directorio `home` de `bandit17`. Encontramos dos listas: `passwords.old` y `passwords.new`.​ Vamos a relevar el contenido con cat para verificar la magnitud de lo que nos estamos enfrentando. 

### 5. Comparativa de Archivos
```
diff passwords.old passwords.new
```
<!-- Aplicamos comparativa con el comando diff -->
![[BanditLevel17-04.webp]]
La salida de `diff` indica el número de línea donde hay una diferencia y muestra qué había en `passwords.old` y qué hay ahora en `passwords.new`. Por intuición, la nueva línea que aparece solo en `passwords.new` corresponde a la contraseña de `bandit18`.
### 6. Prueba de conexión con bandit18
Con la nueva contraseña identificada, se realiza una conexión SSH como `bandit18`.
```
ssh -p 2220 bandit18@bandit.labs.overthewire.org
```
<!-- GIF verificando la conexión con bandit18 -->
![[BanditLevel17-GIF.gif]]
Tras autenticarse, el servidor cierra la sesión mostrando un mensaje de despedida (“bye bye”) para `bandit18`.
![[BanditLevel17-05.webp]]
**Aquí entra de nuevo el pensamiento lateral**: A primera vista podría parecer un error o que algo falló, pero al revisar la página se entiende que este comportamiento es **intencional** y forma parte del diseño del nivel. El equipo de OverTheWire quiere que **confirmes la solución tanto desde la terminal como desde la interfaz web**, reforzando la idea de que la salida inesperada de un sistema también puede ser una pista, **no solo un fallo**.
![[Pasted image 20251212114048.png]]

---
## Lecturas recomendadas

- [Documentación oficial de `diff`](https://www.gnu.org/software/diffutils/manual/diffutils) (GNU diffutils)
- [Página de manual de `diff` en Linux](https://man7.org/linux/man-pages/man1/diff.1.html) 
