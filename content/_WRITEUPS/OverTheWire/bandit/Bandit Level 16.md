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


## Protocolo SSL/TLS

### TLS Handshake 
![[Bandit_Level_15-01.webp]]

1. **Client Hello**: el cliente envía al servidor las versiones TLS que soporta, las suites de cifrado que puede usar y un número aleatorio del cliente.
2. **Server Hello + certificado**: el servidor elige versión y cifrado de la lista del cliente, envía su propio número aleatorio y adjunta su certificado con la clave pública para identificarse.
3. **Intercambio de claves (Pre‑Master Secret)**: usando la clave pública del servidor y un algoritmo de intercambio (RSA, Diffie‑Hellman, etc.), cliente y servidor generan de forma segura un secreto compartido.
4. **ChangeCipherSpec + Finished**: ambos derivan a partir de ese secreto las claves de sesión simétricas, avisan de que a partir de ahora cifrarán todo y se envían mensajes “Finished” para confirmar que todo salió bien.
5. **Datos cifrados**: con las claves de sesión listas, ya se envían y reciben los datos de la aplicación (HTTP, etc.) cifrados y autenticados.
### SSL vs TLS

## OpenSSL

### ¿Por qué usamos "OpenSSL s_client"?


![[Bandit_Level_15-02.webp]]

## nmap

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

### 1. Conectarnos como Bandit16
```
ssh -p 2220 bandit15@bandit.labs.overthewire.org
```
![[Bandit_Level_15-03.webp]]
	Aquí no hay magia: mismo host, mismo puerto 2220, solo cambia el usuario. Ya todo un clásico.
### 2. Verificar servicios en puerto 30001
```
nmap -p 30001 localhost
```
![[Bandit_Level_15-04.webp]]
	Verificamos que el **puerto 30001** esté abierto y escuchando en `localhost`. 

Esto es pura mentalidad de pentester: antes de hablarle a algo, asegúrate de que exista y de que esté vivo.
### 3. Enviar Handshake al servidor y  Credenciales de bandit16. 
```
openssl s_client -connect localhost:30001
```
![[Bandit_Level_15-05.webp]]
El comando **`openssl s_client`** iniciará la conexión. Automáticamente se realizará el **TLS Handshake**, negociando el cifrado y mostrando el certificado en pantalla. Una vez que el _handshake_ ha finalizado, el canal está **cifrado**. Solo recuerda que `s_client` se comporta como un navegador muy feo pero **muy honesto**, es este paso se hace el TLS Handshake, te muestra el certificado y, cuando termina, todo lo que escribas va **completamente cifrado**.

- Una vez que aparezca la información del certificado, **introduce la contraseña de Bandit 15** (Puedes verla en `/etc/bandit_pass/bandit15`).    
![[Bandit_Level_15-06.webp]]    

- Presiona **Enter** para enviarla, dah.
![[Bandit_Level_15-07.webp]]
	Espera la respuesta, el servicio valida la contraseña y te escupirá la contraseña de Bandit 16 por el mismo canal cifrado. Y listo, nivel pasado, crack.

---
## Lecturas recomendadas

-  **[¿Qué es OpenSSL? ¿Cómo funciona OpenSSL?](https://www.ssldragon.com/es/blog/que-es-openssl/)**
-  **[Handshake TLS/SSL: Cómo Funciona y Por Qué es Vital para la Seguridad Web](https://estudyando.com/handshake-tls-ssl-como-funciona-y-por-que-es-vital-para-la-seguridad-web/)**