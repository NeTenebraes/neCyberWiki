---
title: "OTW Bandit: 17"
description:
tags:
  - linux
  - bash
  - bandit
Dificultad:
  - ★★☆☆☆
publishDate: 2025-12-05
---
## Introducción y Desafío

Este nivel prueba tu capacidad para detectar cambios sutiles en archivos mediante herramientas de comparación. Con la llave SSH privada obtenida en el nivel 16, accede como `bandit17` y usa `diff` para identificar la única diferencia entre dos listas de contraseñas, `passwords.new` y `passwords.old`. 

**El enfoque clave es la precisión**: Un solo cambio revela la solución sin necesidad de revisar manualmente miles de líneas.
##  Conceptos Clave

El comando `diff` compara archivos línea por línea y resalta diferencias específicas, ideal para detectar cambios en listas grandes como contraseñas o configuraciones.

La **mentalidad de hacker** aquí radica en el pensamiento lateral: ante dos archivos similares, no vas a revisar manualmente miles de líneas, sino que usas la herramienta precisa (`diff`) para revelar la única modificación en segundos.​

### Sintaxis de `diff`

La sintaxis básica del comando `diff` es simple y directa:

bash

`diff [opciones] archivo1 archivo2`

Donde `archivo1` y `archivo2` son los ficheros a comparar, y las opciones modifican el formato y comportamiento de la salida.
## Opciones esenciales

- **`diff archivo1 archivo2`**: Comparación básica que muestra diferencias línea por línea con formato `< línea_eliminada` y `> línea_agregada`.[](https://eltallerdelbit.com/comando-diff-ejemplos/)

- **`diff -u archivo1 archivo2`**: Formato unificado (más legible para humanos y `patch`), con `--- archivo1`, `+++ archivo2`, `@@ rangos @@`, `-` (eliminado), `+` (agregado).
- **`diff -y archivo1 archivo2`**: Salida lado a lado, perfecta para diffs visuales en terminal amplia.
- **`diff -q archivo1 archivo2`**: Solo indica si difieren ("Files archivo1 and archivo2 differ"), sin mostrar detalles.
- **`diff -r dir1 dir2`**: Comparación recursiva de directorios (útil en recon de configs).
​
**Casos de uso comunes**: validar actualizaciones de software (comparar configs antes/después), debugging de scripts, auditorías de seguridad en logs, o desafíos CTF donde un solo byte cambiado es la clave. ​

## Comandos Clave
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

Nos conectamos al servidor como el usuario `bandit17` usando la llave encontrada en [[Bandit Level 16]].

```bash
touch bandit17.key
nano bandit17.key
chmod 600 bandit17.key 
```
![[BanditLevel17-01.webp]]
El contenido de la llave SSH encontrada en [[Bandit Level 16]] debemos colocarlo en un nuevo documento

Confirmamos contraseña actual nivel Općional
```
cat /etc/bandit_pass/bandit17
```
<!-- Imagen de la conexión SSH con OverTheWire -->
![[BanditLevel17-02.webp]]

Confirmamos contenido de las listas passwords.new passwords.old Verificacion y consulta de firerencias

<!-- Imagen de la conexión SSH con OverTheWire -->
```
ls -l
cat passwords.new passwords.old 
```
![[BanditLevel17-03.webp]]


```
diff passwords.old passwords.new
```
![[BanditLevel17-04.webp]]



Explicando solicuion final, cierre de bandit 18
ssh -p
![[BanditLevel17-GIF.gif]]



![[BanditLevel17-05.webp]]
Pagina de Over The wire diciendo que esto es normal


---
## Lecturas recomendadas

-  Comando diff
- Metalidad del hacker



---

---

## Introducción y desafío

Explica el contexto del nivel con 3–5 líneas: qué se busca, qué archivos hay y cuál es la meta (encontrar la línea diferente entre `passwords.old` y `passwords.new`).  

El comando `diff` compara archivos línea por línea y resalta diferencias específicas, ideal para detectar cambios en listas grandes como contraseñas o configuraciones.

​



​
## Comandos clave

- `ssh`: conexión al servidor Bandit (menciona `-p 2220` y usuario).  
- `touch`: creación del archivo de llave `bandit17.key`.  
- `nano` o editor favorito: para pegar la llave privada.  
- `chmod`: asegurar permisos de la llave (`chmod 600 bandit17.key`).  
- `cat`: revisar contenido de archivos.  
- `diff`: comparar `passwords.old` y `passwords.new` para encontrar la contraseña.  

---

## Solución paso a paso

### 1. Preparar la llave SSH de bandit17

- Crear el archivo `bandit17.key`.
- Pegar la llave obtenida en el nivel 16.
- Ajustar permisos.  
Incluye aquí el bloque de comandos y la captura `BanditLevel17-01.webp`. [file:1]

### 2. Verificar acceso y archivos del nivel

- (Opcional) mostrar cómo validar la contraseña actual con `cat /etc/bandit_pass/bandit17`.  
- Listar archivos del home (`ls -l`) y mostrar `passwords.old` y `passwords.new`.  
Inserta las capturas `BanditLevel17-02.webp` y `BanditLevel17-03.webp`. [file:1]

### 3. Usar diff para encontrar la contraseña

- Ejecutar `diff passwords.old passwords.new`.  
- Explicar brevemente cómo leer la salida de `diff` y señalar cuál es la línea que corresponde a la nueva contraseña.  
Aquí va `BanditLevel17-04.webp`. [file:1]

### 4. Conexión al siguiente nivel

- Mostrar el comando `ssh -i bandit17.key -p 2220 bandit17@bandit.labs.overthewire.org` (o la variante que uses).  
- Cerrar comentando que es normal que la web de OTW muestre el mensaje de error al reconectar, con la captura `BanditLevel17-05.webp` y el GIF. [file:1]

---

## Lecturas recomendadas

- Enlace a documentación o manpage de `diff`.  
- Nota breve sobre mentalidad de hacker aplicada a leer manpages y comparar archivos.  

Si quieres, en el siguiente mensaje se puede reescribir tu `Bandit-Level-17.md` completo usando esta estructura manteniendo tu estilo, pero más pulido para publicar directo en neCyberWiki.
