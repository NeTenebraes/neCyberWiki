---
title: "OTW Bandit: 15"
description:
tags:
  - linux
  - bash
  - bandit
difficulty:
  - ★☆☆☆☆
publishDate: 2025-11-18
---
## Introducción
En este nivel damos nuestro **primer contacto** con servicios cifrados usando **SSL/TLS**, pasando de hablar con puertos “en crudo” a comunicarnos a través de un **canal seguro**. El objetivo es similar al nivel anterior, pero esta vez debemos conectarnos a un servicio que escucha en `localhost` sobre el puerto 30001 por medio de SSL/TLS y enviarle la contraseña del nivel actual para que nos devuelva la contraseña del siguiente nivel.​

A diferencia de niveles anteriores, donde bastaba con usar herramientas como `nc` o leer directamente archivos locales, aquí debemos usar `openssl s_client` para comportarnos como un cliente TLS real y entender mejor cómo se prueba un servicio cifrado desde la línea de comandos.
## Protocolo SSL/TLS
SSL/TLS es un protocolo de seguridad que sirve para cifrar la comunicación entre dos equipos (por ejemplo, tu navegador y un servidor) para que nadie pueda leer ni modificar lo que viaja por la red. Esto es precisamente lo que hace posible el “candadito” de las páginas webs HTTPS que visitas y **protege cosas como contraseñas, cookies y datos bancarios**. Básicamente, es una “capa” que se coloca encima de la conexión normal para que todo lo que se envía y recibe vaya cifrado y autenticado entre cliente y servidor.
### TLS Handshake 
![[Pasted image 20251119012813.png]]
El _TLS handshake_ es la “presentación” entre cliente y servidor para ponerse de acuerdo en cómo cifrar la conexión antes de enviar datos reales.

1. **Client Hello**: el cliente envía al servidor las versiones TLS que soporta, las suites de cifrado que puede usar y un número aleatorio del cliente.
2. **Server Hello + certificado**: el servidor elige versión y cifrado de la lista del cliente, envía su propio número aleatorio y adjunta su certificado con la clave pública para identificarse.
3. **Intercambio de claves (Pre‑Master Secret)**: usando la clave pública del servidor y un algoritmo de intercambio (RSA, Diffie‑Hellman, etc.), cliente y servidor generan de forma segura un secreto compartido.
4. **ChangeCipherSpec + Finished**: ambos derivan a partir de ese secreto las claves de sesión simétricas, avisan de que a partir de ahora cifrarán todo y se envían mensajes “Finished” para confirmar que todo salió bien.
5. **Datos cifrados**: con las claves de sesión listas, ya se envían y reciben los datos de la aplicación (HTTP, etc.) cifrados y autenticados.
### SSL vs TLS
SSL fue la primera versión histórica del protocolo, pero está obsoleta y con fallos, mientras que **TLS es la versión moderna y segura que se usa hoy**. Aun así, mucha documentación y gente sigue diciendo “SSL” o “SSL/TLS” aunque técnicamente estén usando versiones de TLS por debajo.​
## nmap
nmap es una herramienta que sirve para descubrir **qué puertos y servicios están abiertos en una máquina**, es decir, qué “puertas” de red están escuchando y qué tipo de servicio hay detrás de cada una. En pentesting normalmente se usa **como primer paso de reconocimiento** para saber contra qué servicios (HTTP, SSH, TLS, etc.) vas a "hablar" antes de intentar algo más específico.
## Comandos Clave
- **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante el protocolo Secure Shell (SSH).
    
    - Parámetros usados:
        - `-p` especifica el puerto remoto (por ejemplo, `-p 2220`).
        - `usuario@host` define el usuario y el servidor al que te conectas.

- **`nmap`**: 

- **`openssl`**: 

---
## Solución

Conectarnos

![[Pasted image 20251118231146.png]]

 Verificar puertos 30001

![[Pasted image 20251118231322.png]]

Enviar Handshake 
![[Pasted image 20251118231440.png]]
![[Pasted image 20251118231450.png]]
	aqui presionamos enter
	
.3 ultimo
![[Pasted image 20251118231508.png]]
	recibimos la contraseña
	
---
## Lecturas recomendadas
