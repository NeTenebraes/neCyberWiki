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
## OpenSSL

OpenSSL es una biblioteca y herramienta de software libre diseñada para implementar protocolos de seguridad como SSL y TLS. Proporciona un conjunto de funciones criptográficas que permiten generar claves, crear certificados digitales, cifrar datos y verificar identidades digitales de manera segura. OpenSSL es fundamental para proteger la comunicación en internet, asegurando la privacidad y autenticidad de los datos transmitidos entre clientes y servidores.
### ¿Por qué usamos "OpenSSL s_client"?

El comando `openssl s_client` es una utilidad dentro de OpenSSL que actúa como un cliente genérico para establecer conexiones SSL/TLS con servidores remotos. Se usa para probar, analizar y depurar conexiones seguras, permitiendo a los usuarios verificar certificados, probar protocolos soportados, y obtener detalles técnicos del proceso de handshake y cifrado. 

![[Pasted image 20251119041325.png]]
Esta herramienta es clave para diagnosticar problemas de seguridad, validar configuraciones y entender cómo un servidor maneja conexiones cifradas.
## nmap
nmap es una herramienta que sirve para descubrir **qué puertos y servicios están abiertos en una máquina**, es decir, qué “puertas” de red están escuchando y qué tipo de servicio hay detrás de cada una. En pentesting normalmente se usa **como primer paso de reconocimiento** para saber contra qué servicios (HTTP, SSH, TLS, etc.) vas a "hablar" antes de intentar algo más específico. Hoy no lo usaremos mucho, pero te aseguro que lo estarás usando más de lo que crees.
## Comandos Clave
* **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante el protocolo Secure Shell (SSH).
    * Parámetros usados:
        * `-p [puerto]`: Especifica el puerto remoto (ej: `-p 2220`).
        * `usuario@host`: Define el usuario y el servidor al que te conectas.

* **`nmap`**: Herramienta de escaneo de red para descubrir hosts activos, puertos abiertos y servicios. Es fundamental en las fases de **reconocimiento y auditoría básica**.
    * Parámetros usados relevantes:
        * `-p [puertos]`: Selecciona puertos específicos (ej: `-p 80,443` o `-p 30001`).
        * `localhost`: Se usa para escanear el propio sistema local.

* **`openssl`**: Toolkit de línea de comandos para trabajar con **TLS/SSL y criptografía**.
    * Subcomando clave para la tarea:
        * **`s_client -connect host:puerto`**: Actúa como un cliente TLS/SSL para establecer una conexión segura. Es esencial para **probar el handshake**, ver el certificado y enviar datos cifrados.

---
## Solución

### 1. Conectarnos como Bandit15
```
ssh -p 2220 bandit15@bandit.labs.overthewire.org
```
![[Pasted image 20251118231146.png]]
	Aquí no hay magia: mismo host, mismo puerto 2220, solo cambia el usuario. Ya todo un clásico.
### 2. Verificar servicios en puerto 30001
```
nmap -p 30001 localhost
```
![[Pasted image 20251118231322.png]]
	Verificamos que el **puerto 30001** esté abierto y escuchando en `localhost`. 

Esto es pura mentalidad de pentester: antes de hablarle a algo, asegúrate de que exista y de que esté vivo.
### 3. Enviar Handshake al servidor y  Credenciales de bandit16. 
```
openssl s_client -connect localhost:30001
```
![[Pasted image 20251118231440.png]]
El comando **`openssl s_client`** iniciará la conexión. Automáticamente se realizará el **TLS Handshake**, negociando el cifrado y mostrando el certificado en pantalla. Una vez que el _handshake_ ha finalizado, el canal está **cifrado**. Solo recuerda que `s_client` se comporta como un navegador muy feo pero **muy honesto**, es este paso se hace el TLS Handshake, te muestra el certificado y, cuando termina, todo lo que escribas va **completamente cifrado**.

- Una vez que aparezca la información del certificado, **introduce la contraseña de Bandit 15** (Puedes verla en `/etc/bandit_pass/bandit15`).    
![[Pasted image 20251118231450.png]]    

- Presiona **Enter** para enviarla, dah.
![[Pasted image 20251118231508.png]]
	Espera la respuesta, el servicio valida la contraseña y te escupirá la contraseña de Bandit 16 por el mismo canal cifrado. Y listo, nivel pasado, crack.

---
## Lecturas recomendadas

-  **[¿Qué es OpenSSL? ¿Cómo funciona OpenSSL?](https://www.ssldragon.com/es/blog/que-es-openssl/)**
-  **[Handshake TLS/SSL: Cómo Funciona y Por Qué es Vital para la Seguridad Web](https://estudyando.com/handshake-tls-ssl-como-funciona-y-por-que-es-vital-para-la-seguridad-web/)**