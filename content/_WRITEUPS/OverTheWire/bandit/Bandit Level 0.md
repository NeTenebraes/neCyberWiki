---
title: "OTW Bandit: 0"
cover:
description: Bandit es un wargame de seguridad informática diseñado para principiantes que te introduce al uso de comandos básicos de Linux y scripting en un entorno controlado. Su objetivo es enseñarte conceptos fundamentales de administración de sistemas y seguridad a través de retos prácticos.
tags:
  - bandit
  - linux
  - ssh
  - ls
  - cat
difficulty:
  - ★☆☆☆
publishDate: 2025-11-07
---
# Introducción
![[Cover OTW.webp]]
[OverTheWire](https://overthewire.org) ofrece wargames para aprender y practicar conceptos del terminal de Linux basados en seguridad, todo gracias a un entorno legal y controlado. El wargame **[Bandit](https://overthewire.org/wargames/bandit/)** está diseñado específicamente para **principiantes absolutos**. Su propósito es enseñar los comandos y conceptos fundamentales de la línea de comandos en sistemas GNU/Linux, todo mientras atacamos una máquina por medio de una conexión SSH.

El juego se estructura en niveles progresivos, iniciando en [Bandit Level 0](https://overthewire.org/wargames/bandit/bandit0.html). Cada nivel consiste en un desafío que, al ser resuelto, proporciona la información necesaria para acceder al siguiente, generalmente en forma de una contraseña para el siguiente usuario.
## Buenas Prácticas
* **Toma de notas**: Mantén un archivo local con las contraseñas de cada nivel. Si tu conexión se interrumpe, no tendrás que empezar desde cero.
* **Documenta el proceso**: Anota no solo la solución, sino también los comandos que probaste y por qué. Esto te ayudará a construir una metodología para resolver problemas más complejos.
----
## Conceptos Fundamentales

### ¿Qué es SSH?

![[OTW14.03.webp]]
SSH (Secure Shell) es un protocolo de red que permite establecer una conexión segura y cifrada entre dos máquinas. A través de esta conexión, se obtiene un **shell** (una terminal o línea de comandos) para ejecutar comandos en el sistema remoto como si se estuviera físicamente frente a él. En español crack, **controlas esa máquina a distancia**.
#### ¿Por qué el puerto 2220?

**El puerto estándar para SSH es el 22**. Utilizar un puerto no estándar como el `2220` e**s una medida básica de seguridad** por oscuridad. Ayuda a evitar la detección por parte de escáneres automatizados que buscan servicios SSH en el puerto predeterminado.
## Requisitos para jugar

* **Cliente SSH**: La verdad no necesitas mucho, **sistemas como Linux, macOS o Windows incluyen SSH por defecto** (Incluso lo puedes hace en Android, revisa [Termux](https://wiki.termux.com/wiki/Remote_Access)). ¡Solo debes acceder al mismo a través de tu respectiva terminal!
---
# Conectarse al Servidor via SSH y leer información.

## Objetivo

El objetivo de esta introducción es que logres iniciar sesión en el servidor del juego utilizando el protocolo SSH con las credenciales aquí proporcionadas:
## Datos de Conexión

* **Host**: `bandit.labs.overthewire.org`
* **Puerto**: `2220`
* **Usuario**: `bandit0`
* **Contraseña**: `bandit0`

La contraseña para el nivel `bandit1` se encuentra en un archivo llamado `readme` en el directorio `home` del usuario `bandit0`, **una vez dentro de la máquina hay que leer el contenido del archivo.**
### Comandos y Conceptos Relevantes
* **`ssh`**: Permite iniciar una sesión de shell segura en un sistema remoto.
* **`ls`**: Lista los archivos y directorios en la ubicación actual.
* **`cat`**: Muestra el contenido de los archivos.

Este nivel establece las bases para todos los desafíos futuros. Enseña las dos acciones más fundamentales al interactuar con un sistema remoto:
1.  **Acceso Remoto**: Conectarse de forma segura a otra máquina usando el protocolo SSH.
2.  **Enumeración y Lectura Básica**: Listar los archivos en un directorio y leer el contenido de un archivo de texto.

En un pentesting, obtener credenciales SSH válidas es un objetivo critico. Otorga al atacante un punto de entrada totalmente interactivo al sistema de la victima. Una vez dentro, los primeros comandos que se suelen ejecutar son casi siempre `ls`, `pwd` y `cat` para realizar una enumeración básica y buscar archivos sensibles.

---
## Solución 

Esto cubrirá tus primeros paso en los wargames de "OverTheWire" donde lograrás **establecer una conexión remota vía SSH y utilizar comandos básicos de la shell de Linux  para encontrar y leer archivos** que contienen contraseñas para avanzar al siguiente nivel.

Solo utiliza el comando `ssh` para la conexión, del cual existen dos sintaxis equivalentes. 

### Método 1: Sintaxis `usuario@host` 

Este es el método más común. Se usa el flag `-p` para especificar el puerto seguido del usuario y el host unidos por un "`@`".

```
ssh -p 2220 bandit0@bandit.labs.overthewire.org
```

* **`ssh`**: Invoca el programa cliente de Secure Shell.
* **`-p 2220`**: Especifica que la conexión debe realizarse a través del puerto no estándar `2220`. Por defecto, SSH usa el puerto 22.
* **`bandit0@bandit.labs.overthewire.org`**: Define el usuario (`bandit0`) y el servidor al que te conectarás.

Tras ejecutar el comando, la terminal solicitará la contraseña (`password:`). Escribe `bandit0` y presiona Enter. No verás los caracteres mientras escribes; es un comportamiento normal de seguridad.

![[OTW14.03.webp]]
### Método 2: Sintaxis con flag `-l`

Una alternativa funcionalmente idéntica que utiliza el flag `-l` (*login name*) para definir el usuario.

```
ssh bandit.labs.overthewire.org -p 2220 -l bandit0
```

Tras ejecutar cualquiera de los comandos, el sistema solicitará la contraseña. Escribe `bandit0` y presiona Enter. La entrada de la contraseña es invisible por seguridad. Una vez autenticado, habrás completado el nivel.

![[OverTheWire.bandit0.webp]]
#### Lectura de contenido

1.  **Listar el contenido del directorio `home` para localizar el archivo.**
```
ls
```
![[OverTheWire.bandit2.webp]]

2.  **Confirmar que el archivo es de texto plano (Opcional)**
```
file readme
```
![[OverTheWire.bandit3.webp]]
	La entra nos da una respuesta "ASCII text" lo que nos da a entender que el mismo contiene texto.

3.  **Leer el contenido del archivo `readme` para obtener la contraseña.**
```
cat readme
```
![[OverTheWire.bandit4.webp]]
	**Contraseña Censurada** por [Reglas de OverTheWire.](https://overthewire.org/rules/)

---
## Errores Comunes y Soluciones

- **Error: No se encuentra el archivo `readme`**
    - **Causa**: No estás en el directorio `home` del usuario `bandit0`.        
    - **Solución**: Regresa al directorio `home` con `cd ~` y lista los archivos con `ls`.   
    
- **Error: `Permission denied` al conectar por SSH**
    - **Causa**: La contraseña o usuario son incorrectos.        
    - **Solución**: Muestra nuevamente el contenido del archivo `readme` y copia la contraseña con cuidado, sin espacios adicionales.
        
- **Error: `Connection refused` (rechazo de conexión)**
    - **Causa**: El host no acepta la conexión. Puede deberse a un puerto incorrecto (`-p 2220`) o a un firewall local o de red.
    - **Solución**: Verifica el número de puerto, credenciales y que no haya restricciones de conexión.
    
- **Error: `Permission denied (publickey,password)`**
    - **Causa**: La contraseña ingresada es incorrecta.
    - **Solución**: Escribe la contraseña nuevamente, sin copiar caracteres extra.
    
- **Error: `Host key verification failed`**
    - **Causa**: La firma criptográfica del servidor cambió. Esto puede ocurrir si es tu primera conexión o si la clave del servidor fue actualizada.
    - **Solución**: Elimina la clave antigua en tu archivo de hosts conocidos ejecutando:  
        `ssh-keygen -R bandit.labs.overthewire.org`

---
## Conceptos Adicionales | Material de lectura

La autenticación por contraseña es básica. En entornos profesionales se utiliza la autenticación por clave pública/privada, que es más segura.

* **[Secure Shell (SSH)](https://en.wikipedia.org/wiki/Secure_Shell)**: Arquitectura del protocolo, casos de uso y detalles del cifrado.
* **[Autenticación con claves SSH](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04-es)**: Configurar más métodos de autenticación SSH.
* [How to use SSH with ssh-keys on wikiHow](https://www.wikihow.com/Use-SSH): Lectura adicional de como usar SSH Keys.
- [How to use SSH with a non-standard port on It’s FOSS](https://itsfoss.com/ssh-to-port/): SSH fuera del puerto 22.