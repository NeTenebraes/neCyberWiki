---
title: "OTW Bandit: 14"
description: Conecta como bandit14, lee la contraseña en /etc/bandit_pass/bandit14 y envíala a localhost:30000 con nc para que el servicio devuelva la credencial de bandit15. ​Incluye pasos concisos con SSH, uso de nc y recomendaciones para evitar bloqueos al enviar la entrada.
tags:
  - linux
  - bash
  - bandit
  - nc
  - TCP
  - ss
difficulty:
  - ★☆☆☆☆
publishDate: 2025-11-13
---
## Introducción
En este nivel aprenderás a interactuar con un servicio local mediante conexiones TCP. Debes conectarte al localhost en el puerto 30000 y enviar la contraseña de bandit14 para recibir la contraseña de bandit15 como respuesta. Este ejercicio introduce el uso práctico de netcat en una sesión de terminal y el entendimiento básico de conexiones TCP. 
## Conexiones TCP
**El protocolo TCP es una forma ordenada de enviar datos entre dos equipos en la red por medio del three‑way handshake**, pero para no entrar en tecnicismos, puedes imaginarlo como una llamada telefónica: los equipos primero se saludan, luego se comunican entre sí y al final cuelgan la conexión. 

Mientras la conexión está abierta, **TCP se encarga de que todo llegue completo y en el orden correcto**, incluso reenviando lo que se pierda por el camino. Al terminar, la conexión se cierra de forma ordenada para que ninguna de las dos partes se quede esperando datos.
### Three‑way handshake
Antes de enviar datos por TCP, los dos equipos se mandan tres mensajes rápidos para abrir la conexión, como cuando saludas antes de empezar a hablar. 
![[Bandit_Level_14-01.webp]]
1. Tu máquina envía un mensaje al servidor diciendo: “¿Estás ahí? Quiero hablar” (SYN). 
2. El servidor responde: “Sí, estoy aquí y también quiero hablar” (SYN‑ACK).
3. Tu máquina contesta: “Perfecto, empecemos” (ACK). 

A esta secuencia de tres pasos se le llama **three‑way handshake** y, cuando termina, ya ambas máquinas pueden empezar a intercambiar datos por TCP de forma normal.
## Netcat
nc (netcat) es una herramienta de línea de comandos que lee y escribe datos a través de la red usando TCP o UDP, hoy la usaremos para conectar a localhost:30000 y enviar la contraseña de bandit14 mediante TCP para recibir la contraseña del siguiente nivel. 
![[Bandit_Level_14-02.webp]]
netcat actúa como un cliente/servidor TCP/UDP genérico: puedes abrir conexiones a puertos, enviarles datos por stdin y leer la respuesta por stdout. Es llamado el “cuchillo suizo” de redes porque sirve para depurar servicios, probar puertos, transferir archivos simples y hacer pruebas de conectividad.
### ¿Por qué el puerto 30000?
El puerto 30000 no tiene un significado especial fuera del juego; es el puerto que el nivel define para exponer el servicio que valida la contraseña actual y devuelve la siguiente, de modo que la instrucción es conectar exactamente a localhost:30000. 
## Comandos Clave
- **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante el protocolo Secure Shell (SSH).
    
    - Parámetros comunes:
        - `-i` usa una llave privada concreta.
        - `-p` especifica el puerto remoto (por ejemplo, `-p 2220`).
        - `usuario@host` define el usuario y el servidor al que te conectas.

- **`cat`**: Muestra contenido del archivo en terminal.

- **`nc`**: Navaja suiza de conexiónes TCP/UDP.
    
    - Parámetros comunes:        
        - `-n` evita resolver DNS (usa solo IPs numéricas).            
        - `-v` modo “verbose”, muestra más detalles de la conexión.            
        - `-l` lo pone en modo escucha (servidor).            
        - `-p PUERTO` define el puerto local a usar.

- **`ss -ltn`**: Muestra los sockets TCP en escucha, útil para comprobar que el servicio está activo en `localhost:30000`.
    
    - Parámetros comunes:        
        - `-l` solo puertos en escucha.            
        - `-t` solo conexiones TCP.            
        - `-n` muestra puertos/IPs numéricos sin resolver nombres.

---
## Solución

### 1. Conectarnos al server (Llave Privada)  
   
```
ssh -i bandit14.key -p 2220 bandit14@bandit.labs.overthewire.org
```

![[Bandit_Level_14-03.webp]]
	El clásico, nos conectamos directamente a la máquina como el usuario `badit14`.

### 2. Verificación de contraseña (bandit14)
```
 cat /etc/bandit_pass/bandit14
```
![[Bandit_Level_14-04.webp]]
	Recuerda que en [[Bandit Level 13]] nos confirmaron que la contraseña de cada usuario está en `/etc/bandit_pass/`, y solo ese usuario puede leerla, ahí es obtenemos la **contraseña actual** que luego enviaremos al servicio del puerto 30000.
### 3. Verificación del servicio.
```
ss -ltn
```
![[Bandit_Level_14-05.webp]]
	- `-l` → solo sockets en escucha (listening).   
	- `-t` → solo TCP.   
	- `-n` → no resuelve nombres, muestra IPs/puertos numéricos. 

 En la salida deberías ver una línea que termine en `:30000`, indicando que hay un servicio escuchando en ese puerto en `localhost`.
### 4.  Conexión con el servicio y Credenciales
```
nc localhost 30000
```
![[Bandit_Level_14-06.webp]]
	- `nc` es **netcat**, herramienta que permite enviar y recibir datos por TCP/UDP desde la terminal.  
	- `localhost` apunta a la propia máquina (`127.0.0.1`).  
	- `30000` es el puerto donde vimos que el servicio está escuchando.  
  
Al ejecutar el comando se abrirá una sesión interactiva en ese momento pega la contraseña de `bandit14`, pulsa Enter y el servicio responderá con la contraseña de `bandit15`.
  ![[Bandit_Level_14-07.webp]]
	La máquina te devolverá una cadena la cual es tu credencial para el siguiente nivel; consérvala para iniciar sesión como bandit15.​
	
---
## Lecturas recomendadas
- [Protocolo de control de transmisión (TCP)](https://es.wikipedia.org/wiki/Protocolo_de_control_de_transmisi%C3%B3n).
- [Qué es el protocolo TCP, cómo funciona y su papel crucial en las redes de hoy](https://www.polimetro.com/que-es-el-protocolo-tcp/).
- [Netcat](https://es.wikipedia.org/wiki/Netcat).
- [¿Qué es Netcat y para que sirve?](https://keepcoding.io/blog/que-es-netcat/).