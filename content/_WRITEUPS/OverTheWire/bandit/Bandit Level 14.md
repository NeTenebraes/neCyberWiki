---
title: "OTW Bandit: 14"
description: Conecta como bandit14, lee la contraseña en /etc/bandit_pass/bandit14 y envíala a localhost:30000 con nc para que el servicio devuelva la credencial de bandit15. ​Incluye pasos concisos con SSH, uso de nc y recomendaciones sobre salto de línea/EOF para evitar bloqueos al enviar la entrada.
tags:
  - linux
  - bash
  - bandit
  - nc
difficulty:
  - ★☆☆☆☆
publishDate: 2025-11-13
---
## Introducción

En este nivel aprenderás a interactuar con un servicio local mediante TCP: debes conectarte a localhost en el puerto 30000 y enviar la contraseña de bandit14 para recibir la contraseña de bandit15 como respuesta. Este ejercicio introduce el uso práctico de netcat y el flujo de datos por stdin/EOF en una sesión de terminal.

## Qué es TCP

El protocolo TCP establece una conexión mediante el three‑way handshake (SYN, SYN/ACK, ACK) antes de transferir datos, y finaliza con un cierre en cuatro pasos, lo que permite sincronizar números de secuencia y parámetros de la sesión.
​  
Durante la transferencia, implementa control de flujo con ventana deslizante y control de congestión, confirmando recepción con ACKs y retransmitiendo segmentos perdidos para mantener fiabilidad y orden de entrega extremo a extremo.


## Cómo funciona

En TCP, el flujo típico es: negociación en tres pasos para abrir, transferencia con numeración y ACKs, y cierre ordenado de la conexión, todo gestionado por el protocolo para asegurar integridad y orden de los datos.

## Cuándo usar

TCP se elige cuando el contenido debe llegar completo y en orden, como en SSH, HTTP/HTTPS, correo o transferencias de archivos, ya que una pérdida rompe la experiencia o el contenido.
​ ​
## Qué es nc

nc (netcat) es una herramienta de línea de comandos que lee y escribe datos a través de la red usando TCP o UDP, hoy la usaremos para conectar a localhost:30000 y enviar la contraseña de bandit14 mediante TCP para recibir la contraseña del siguiente nivel.

nc (o netcat) actúa como un cliente/servidor TCP/UDP genérico: puedes abrir conexiones a puertos, enviarles datos por stdin y leer la respuesta por stdout. Es llamado el “cuchillo suizo” de redes porque sirve para depurar servicios, probar puertos, transferir archivos simples y hacer pruebas de conectividad.

## Para qué sirve aquí

En este nivel, nc se usa como cliente TCP hacia localhost en el puerto 30000: abres la conexión, envías la password de bandit14 con un salto de línea y lees la respuesta que contiene la password de bandit15.​

## Por qué el 30000

El puerto 30000 no tiene un significado especial fuera del juego; es el puerto que el nivel define para exponer el servicio que valida la contraseña actual y devuelve la siguiente, de modo que la instrucción es conectar exactamente a localhost:30000.

​  
El objetivo práctico es que pruebes cómo enviar datos por TCP a un proceso que está escuchando localmente y leer su respuesta, y por eso el documento indica “conéctate a localhost en el puerto 30000 y envía la contraseña de bandit14”.

​

## Qué es un servicio

En este contexto, un servicio es un proceso que está “escuchando” en un puerto TCP de la máquina local y espera recibir la contraseña por la conexión para contestar con la credencial del siguiente nivel.

​  
La interacción es de texto plano por TCP: abres la conexión, envías la contraseña con un salto de línea y lees la respuesta que devuelve el propio servicio.​


## Servicios en localhost

El servicio objetivo está accesible en la misma máquina del nivel (localhost) y escucha en el puerto 30000, esperando que envíes la contraseña actual para devolverte la del siguiente nivel. La conexión se realiza como usuario bandit14, y el intercambio es de texto plano por TCP, por lo que basta con escribir o canalizar la contraseña y leer la respuesta.


## Comandos Clave

- ssh: establece la sesión como bandit14 para ejecutar los pasos desde la máquina correcta y acceder al servicio local.

- nc: abre una conexión TCP a localhost:30000 y permite enviar la contraseña por stdin o pegándola en la sesión interactiva.​

- printf/echo: imprimen la contraseña seguida de salto de línea para canalizarla a netcat sin entrar en modo interactivo.

- Ctrl+D: envía EOF cuando usas nc en modo interactivo para indicar que ya no enviarás más datos.



---
## Solución

1. Inicia sesión como bandit14 (usando la llave del nivel anterior)  


`ssh -i sshkey.private bandit14@bandit.labs.overthewire.org -p 2220`

![[Pasted image 20251113025322.png]]

Esto te sitúa en el entorno donde corre el servicio en localhost.
- ​
    
- Obtén la contraseña actual (bandit14)  
    Ejecuta:
    

bash

`cat /etc/bandit_pass/bandit14`
![[Pasted image 20251113025615.png]]

Copia este valor porque es lo que debes enviar al servicio en localhost:30000.
- ​
`nc localhost 30000

![[Pasted image 20251113025702.png]]`

Pega la contraseña y presiona Enter; si la sesión queda esperando, envía EOF con Ctrl+D y copia la respuesta que contiene la contraseña de bandit15.
- ​
  
  ![[Pasted image 20251113025724.png]]
    
- Guarda la contraseña de bandit15  
    La cadena devuelta por el servicio es tu credencial para el siguiente nivel; consérvala para iniciar sesión como bandit15.[](https://thegrayarea.tech/overthewire-wargames-bandit-l14-e554d51f1b9e)
    

1. ​
    
---
## Errores comunes

- Enviar la contraseña sin salto de línea: añade un \n con printf o presiona Enter al pegar en nc interactivo.[](https://mayadevbe.me/posts/overthewire/bandit/level15/)
    

- ​
    
- Olvidar cerrar la entrada en nc: en modo interactivo, usa Ctrl+D para enviar EOF si el servicio sigue esperando datos.[](https://thegrayarea.tech/overthewire-wargames-bandit-l14-e554d51f1b9e)
    
- ​
    
- Usar una contraseña incorrecta: asegúrate de leer exactamente /etc/bandit_pass/bandit14 desde la sesión de bandit14.[](https://mayadevbe.me/posts/overthewire/bandit/level15/)
    

- ​
    

## Conceptos reforzados

- Cliente TCP simple con nc: conexión a un puerto local y envío/recepción de texto por stdin/stdout.[](https://thegrayarea.tech/overthewire-wargames-bandit-l14-e554d51f1b9e)
    

- ​
    
- Flujo de datos en shell: canalizar con | y finalizar entradas con salto de línea o EOF según lo que espere el servicio[](https://mayadevbe.me/posts/overthewire/bandit/level15/)
    

- ​.
    

## Comandos resumen

- Conexión al nivel:
    

- bash
    
    `ssh -i sshkey.private bandit14@bandit.labs.overthewire.org -p 2220`
    
- Leer contraseña actual:
    
- bash
    
    `cat /etc/bandit_pass/bandit14`
    
- Enviar contraseña (no interactivo):
    
- bash
    
    `printf "<PASS>\n" | nc localhost 30000`
    
- Enviar contraseña (interactivo):
    
- bash
    
    `nc localhost 30000 # pegar PASS, presionar Enter, y si es necesario Ctrl+D`
    
- Copiar la salida como contraseña de bandit15 y continuar al siguiente nivel.