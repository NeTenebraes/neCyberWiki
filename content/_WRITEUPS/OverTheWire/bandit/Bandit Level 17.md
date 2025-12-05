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

There are 2 files in the homedirectory: **passwords.old and passwords.new**. The password for the next level is in **passwords.new** and is the only line that has been changed between **passwords.old and passwords.new**

**NOTE: if you have solved this level and see ‘Byebye!’ when trying to log into bandit18, this is related to the next level, bandit19**

https://overthewire.org/wargames/bandit/bandit18.html
##  Conceptos Clave

diff y como funciona

## Comandos Clave
* **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante el protocolo Secure Shell (SSH).
    * Parámetros usados:
        * `-p [puerto]`: Especifica el puerto remoto (ej: `-p 2220`).
        * `usuario@host`: Define el usuario y el servidor al que te conectas.
diff

---

##  Solución Paso a Paso

### 1. Configuración llave SSH bandit17

Nos conectamos al servidor como el usuario `bandit17` usando la llave encontrada en [[Bandit Level 16]].

```bash
ssh -i bandit17.key -p 2220 bandit17@bandit.labs.overthewire.org  
```

<!-- Imagen de la conexión SSH con OverTheWire -->
![[BanditLevel17-01.webp]]

### 2. verificar la contraseña del nivel actual (opcional)

```bash
cat /etc/bandit_pass/bandit17
```

<!-- Imagen del resultado de cat -->
![[BanditLevel17-02.webp]]

Esto es opcional ya que contamos con una llave SSH pero funciona para tener un seguimiento claro de las contraseñas

### 3 Identificación de magnitud de archivos 
Ahora toca diferenciar: ¡cual de todas las lilneas el archivo ha cambiado los dos archivos ha cambiado? que tan grande es  la lista bueno vamos a comproarlo con cat

Esto lo podemos hacer c

```bash
cat paswords.new paswords.old
# Repetir con todos los puertos para encontrar la conexión cifrada.
```

 <!-- Imagen de la respuesta sin SSL -->
![[BanditLevel17-03.webp]]- **Una fiesta de contraseñas**

### 4. buscar las direferencias entre los dos archivos

podemos usar diff

> _Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage._

<!-- Imagen de la nota de OverTheWire -->


Al revisar el manual de `openssl s_client` nos indican que el flag "**`-quiet`**" es la clave:

```bash
diff passwords.old passwords.new
```

<!-- Imagen del manual de openssl s_client -->
![[BanditLevel17-04.webp]]
Genial, ya con esto tenemos la contraseña

Vamos a comprobar y vceremos que temos un error
<!-- Nos expulsan del server-->
![[BanditLevel17-05.webp]]
Resulta que la contraseña es correcta, pero nos expulsan del server


<!-- IResultado de la búsqueda en Google-->
![[BanditLevel17-06.webp]]

En la pagina dicen que vamos a tener un error y eso normal, pero esto lo podemos resolver en el siguiente nivel 

---
## Lecturas recomendadas

-  Comando diff
- Metalidad del hacker