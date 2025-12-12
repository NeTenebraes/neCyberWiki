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
- **`ARCHIVO1`**: El primer archivo que se va a comparar (a menudo considerado el original o la versión anterior).    
- **`ARCHIVO2`**: El segundo archivo que se va a comparar (a menudo considerado la versión modificada).    
- **`DIRECTORIO1`**: El primer directorio a comparar.
- **`DIRECTORIO2`**: El segundo directorio a comparar.

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

Explicando solicion final, cierre de bandit 18
ssh -p
![[BanditLevel17-GIF.gif]]



![[BanditLevel17-05.webp]]
Pagina de Over The wire diciendo que esto es normal


---
## Lecturas recomendadas

- Enlace a documentación o manpage de `diff`.  
- Nota breve sobre mentalidad de hacker aplicada a leer manpages y comparar archivos.  