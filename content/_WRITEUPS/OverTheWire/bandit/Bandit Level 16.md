---
title: "OTW Bandit: 16"
description: El objetivo de este nivel es encontrar con nmap el puerto en el rango de 31000 a 32000 en localhost que escucha un servicio SSL/TLS, luego conectarse via openssl para obtener la siguiente contraseña.
tags:
  - linux
  - bash
  - bandit
  - nmap
  - puertos
  - openssl
  - s_client
Dificultad:
  - ★★☆☆☆
publishDate: 2025-12-04
---
## Introducción y Desafío

El desafío en este nivel consiste en encontrar un servicio cifrado (SSL/TLS) que escucha en un puerto dentro del amplio rango **31000 a 32000** en `localhost`. El objetivo es conectarnos al puerto correcto y enviarle la contraseña de Bandit16 para que nos devuelva la contraseña del siguiente nivel. 
### nmap | Escaneo de Puertos
![[BanditLevel16-01.webp]]
Nmap es una herramienta versátil y poderosa para escanear redes, descubrir hosts activos, puertos abiertos y servicios en ejecución. Se usa ampliamente en seguridad informática y pentesting para reconocimiento y auditoría de redes. Nmap envía paquetes a diferentes puertos de un objetivo para detectar cuáles están abiertos, filtrados o cerrados, incluso puede identificar el tipo de servicio y versión que escucha en esos puertos.

La flag `-p` permite especificar un rango o lista de puertos a escanear, por ejemplo, `-p 31000-32000` para analizar solo puertos dentro de ese rango en el host local (`localhost`). Esto es útil para enfocar el escaneo en puertos altos o poco comunes, típicos de servicios efímeros o personalizados, evitando un análisis completo para ganar velocidad y controles finos.
> [Post de Threads](https://www.threads.com/@netenebrae/post/DR7hVXMgNdW?xmt=AQF0ft6xpnp-OYT2wXVHGuju50onh04eRDU2p4m_5iYUZw)
### OpenSSL y parámetro -quiet
Las opciones **`-quiet`** e **`-ign_eof`** son cruciales para superar los desafíos específicos de este nivel:

- **`openssl s_client -connect localhost:31790`**:    
	 - Inicia una conexión de cliente SSL/TLS al puerto `31790` del host local. Este puerto es el que se identifica como el servicio SSL/TLS correcto que contiene la clave (otros puertos como `31518` podrían ser SSL/TLS pero simplemente rebotan la entrada).
	- Si un servicio no utiliza SSL/TLS, la conexión fallará inmediatamente.

- **`-quiet`**: Suprime la salida de diagnóstico detallada, incluyendo la información del **certificado** del servidor y la cadena de certificados. Esto es útil porque reduce el ruido y, en algunas versiones, ayuda a evitar que la salida de comandos internos como `KEYUPDATE` bloquee la entrada del usuario.

- **`-ign_eof`** (Ignore End Of File): Por defecto, `openssl s_client` en modo interactivo sale de la conexión cuando encuentra el fin de archivo (**EOF**) en su entrada (lo que sucede inmediatamente al usar `echo` o `cat` a través de un _pipe_). Esta opción **inhibe** el cierre de la conexión cuando se alcanza el EOF en la entrada. Esto permite que el cliente permanezca conectado y que la contraseña, enviada a través de `echo <PASSWORD> |`, sea procesada por el servidor, el cual luego envía la clave del Nivel 17.

> **Nota:** Al usar **`-quiet`**, el cliente **`openssl s_client`** ya no interpreta las letras `Q`, `R`, `K`, `k` (comandos conectados) como comandos especiales, lo que también resuelve el problema de que el servicio envíe mensajes como "KEYUPDATE" o "RENEGOTIATING" que podrían bloquear la entrada normal.

## Comandos Clave
* **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante el protocolo Secure Shell (SSH).
    * Parámetros usados:
        * `-p [puerto]`: Especifica el puerto remoto (ej: `-p 2220`).
        * `usuario@host`: Define el usuario y el servidor al que te conectas.

* **`nmap`**: Fundamental en las fases de **reconocimiento y auditoría básica**.
    * Parámetros usados:
        * `-p [puertos]`: Selecciona puertos específicos (ej: `-p 80,443` o `-p 30001-32000`).
        * `localhost`: Se usa para escanear el propio sistema local.

* **`openssl`**: Toolkit de línea de comandos para trabajar con **TLS/SSL y criptografía**.
    * Subcomando clave para la tarea:
        * **`s_client -connect host:puerto`**: Actúa como un cliente TLS/SSL para establecer una conexión segura. Es esencial para **probar el handshake**, ver el certificado y enviar datos cifrados.
        * **`-quiet`**: Suprime la salida de diagnóstico detallada
---

##  Solución Paso a Paso

### 1. Conexión Inicial por SSH

Nos conectamos al servidor como el usuario `bandit16`.

```bash
ssh -p 2220 bandit16@bandit.labs.overthewire.org  
```

<!-- Imagen de la conexión SSH con OverTheWire -->
![[BanditLevel16-02.webp]]
### 2. Escaneo del Rango de Puertos

Dado que los puerto con los que nos vamos a conectar son desconocido, usamos `nmap` para escanear rápidamente y listar los servicios activos en los puertos en rangos del 31000 al 32000.

```bash
nmap -p 31000-32000 localhost
```

<!-- Imagen del resultado de nmap -->
![[BanditLevel16-03.webp]]

**Puertos Abiertos Encontrados:** Cinco puertos fueron identificados como `open`. ¡Ya redujimos el problema de 1000 opciones a **solo 5**!
```bash
PORT      STATE SERVICE
31046/tcp open  unknown
31518/tcp open  unknown
31691/tcp open  unknown
31790/tcp open  unknown
31960/tcp open  unknown
```
### 3. Identificación del Puerto SSL/TLS

Ahora toca diferenciar: **¿cuál de estos cinco usa SSL/TLS?** Un puerto _open_ no significa nada hasta que sabes qué servicio hay detrás. Usamos `openssl s_client` para intentar la conexión SSL con cada uno.

```bash
openssl s_client localhost:31046
# Repetir con todos los puertos para encontrar la conexión cifrada.
```

- **Puertos NO SSL/TLS (31046, 31691, 31960):** La conexión fallará, se cerrará inmediatamente o no mostrará la secuencia de _handshake_ y certificado.
 <!-- Imagen de la respuesta sin SSL -->
![[BanditLevel16-04.webp]]- **Puertos SÍ SSL/TLS (31518 y 31790):** Estos puertos establecen una sesión SSL y muestran el certificado en pantalla. ¡Ya tenemos dos candidatos!

 <!-- Imagen de la respuesta con SSL -->    
![[BanditLevel16-05.webp]]
> **Nota:** Si tienes un script de Bash para automatizar esta verificación, ¡métele! Es mucho más eficiente que ir probando uno por uno.
### 4. Corrección del Error "KEYUPDATE"

Al intentar ingresar la contraseña en los puertos SSL, el servicio nos trolea respondiendo con mensajes como `KEYUPDATE` o `RENEGOTIATING`, impidiendo la interacción normal.

Este es un _bug_ o comportamiento intencional que OverTheWire nos pide resolver leyendo el manual. ¡Clásico!

> _Helpful note: Getting “DONE”, “RENEGOTIATING” or “KEYUPDATE”? Read the “CONNECTED COMMANDS” section in the manpage._

<!-- Imagen de la nota de OverTheWire -->
![[Bandit_Level_16-06.webp]]

Al revisar el manual de `openssl s_client` nos indican que el flag "**`-quiet`**" es la clave:

```bash
man openssl s_client 
```

<!-- Imagen del manual de openssl s_client -->
![[Bandit_Level_16-07.webp]] El manual dice: `-quiet: inhibit printing of sessions and certificate information. This implicitly turns on -ign_eof as well.`

**En español y sin rodeos:** Usar `-quiet` no solo limpia la pantalla de la información del certificado, sino que también activa `-ign_eof`, permitiéndote **escribir y enviar datos** inmediatamente después de que se establece la conexión SSL. ¡Justo lo que necesitamos!

<!-- IResultado de la búsqueda en Google-->
![[BanditLevel16-08.webp]]
Incluso una simple busqueda en google nos puede dar esta información si el manual nos está dando problemas. Gracias a [este usuario de Reddit](https://www.reddit.com/r/HowToHack/comments/1g2sivg/comment/lzxq8hc/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button) por compartir la solución. 
### 5. Envío de la Contraseña

Teniendo el parámetro `-quiet` en mano, probamos los dos puertos candidatos (31518 y 31790).

**Intento en el puerto 31518:**
```bash
openssl s_client -connect localhost:31518 -quiet
# Ingresar la contraseña de Bandit16 aquí
```
Solo nos devuelve la respuesta. **¡Fallo de servicio!**

<!-- Imagen del intento en 31518 -->
![[BanditLevel16-09.webp]]

**Intento en el puerto 31790 (Éxito):**
```bash
openssl s_client -quiet localhost:31790
# Ingresar la contraseña de Bandit16 aquí
```
¡Boom! Al enviar la contraseña de Bandit16, el servicio responde con la llave privada SSH, que es la contraseña de Bandit17. 

<!-- Imagen del éxito en 31790 -->
![[BanditLevel16-10.webp]]
Solo vamos a copiar las información para luego hacer las configuraciones de permisos necesarios.

**Nivel pasado, crack.**

---
## Lecturas Recomendadas

Expande la sección con recursos clave para profundizar en nmap, openssl y conceptos SSL/TLS.

- **[¿Qué es OpenSSL? ¿Cómo funciona OpenSSL?](https://www.ssldragon.com/es/blog/que-es-openssl/)**: Explicación completa del toolkit OpenSSL, su rol en TLS/SSL y casos de uso en pentesting.        
- **[Nmap Network Scanning Guide](https://nmap.org/book/man.html)**: Manual oficial con flags avanzados como `-sV`, `-sC` y escaneo de rangos para reconnaissance.
- **[OpenSSL sclient manpage](https://www.openssl.org/docs/man1.1.1/man1/s_client.html)**: Detalles técnicos de `-quiet`, `-igneof` y comandos CONNECTED para debugging TLS.