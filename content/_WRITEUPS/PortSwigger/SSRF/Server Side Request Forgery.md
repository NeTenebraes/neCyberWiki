---
title: Server-side Request Forgery
cover:
description: https://portswigger.net/web-security/learning-paths/ssrf-attacks/ssrf-attacks-what-is-ssrf/ssrf/what-is-ssrf
tags:
  - PortSwigger
  - Vulnerabilidad
  - Web
  - CTF
  - SSRF
difficulty: ★★☆☆☆
publishDate: 2026-02-11
---



![[Pasted image 20260209112651.png]]

## ¿Que es un SSRF?

Los Server-side Request Forgery es un tipo de vulnerabilidad de aplicaciones web que permite que un atacante realizar un **abuso de la confianza implícita** que entre el servidor y el entorno de red, esto provocando que la aplicación del lado del servidor realice peticiones a una ubicación no intencionada

En un flujo normal, el cliente (tú) solicita un recurso y el servidor (la aplicación) responde. El SSRF ocurre cuando el servidor deja de ser solo un receptor y se convierte en un **emisor de peticiones HTTP** (u otros protocolos) bajo el control del atacante. En un ataque SSRF típico, el atacante podría causar que el servidor establezca una conexión con servicios de solo acceso interno dentro de la infraestructura de la organización.

En otros casos, podrían ser capaces de forzar al servidor a conectarse a sistemas externos arbitrarios. Esto podría filtrar datos sensibles, tales como credenciales de autorización.

La mayoría de las infraestructuras están protegidas por un firewall de red que bloquea el tráfico externo (Internet) hacia la zona desmilitarizada (DMZ) o la red local (LAN).

- **El Mecanismo:** El servidor vulnerable tiene dos "caras": una pública (Internet) y una privada (LAN).
- **La Explotación:** Al enviar una petición al servidor por estos mecanismos para que consulte, por ejemplo, `http://web.com/admin`, el servidor realiza la petición **DESDE DENTRO** del firewall.
- **Resultado:** El firewall no bloquea la petición porque proviene de un "vecino" confiable dentro de la misma red. El atacante usa al servidor como un **Proxy No Autorizado**.

## ¿Cual es el impacto de un SSRF?

Un ataque SSRF exitoso a menudo puede resultar en acciones no autorizadas o en el acceso a datos dentro de la organización. Esto puede ocurrir tanto en la aplicación vulnerable como en otros sistemas del _back-end_ con los que la aplicación pueda comunicarse. Incluso en algunas situaciones, la vulnerabilidad SSRF podría permitir a un atacante realizar una ejecución de comandos arbitrarios.

Un exploit de SSRF que cause conexiones a sistemas externos de terceros puede dar lugar a ataques maliciosos posteriores. Haciendo que estos ataques parezcan originarse **desde dentro** de la organización que aloja la aplicación vulnerable.

### Ataques SSRF contra el servidor

En un ataque SSRF contra el servidor, el atacante provoca que la aplicación realice una petición HTTP de vuelta al servidor que la aloja, a través de su interfaz de red de _loopback_. Esto implica normalmente proporcionar una URL con un nombre de _host_ como `127.0.0.1` (una dirección IP reservada que apunta al adaptador de _loopback_) o `localhost` (un nombre comúnmente utilizado para el mismo adaptador).

Por ejemplo, imagine una aplicación de compras que permite al usuario ver si un artículo está en stock en una tienda particular. Para proporcionar la información de stock, la aplicación debe consultar varias APIs REST de _back-end_. Lo hace pasando la URL del _endpoint_ de la API de _back-end_ correspondiente a través de una petición HTTP de _front-end_. Cuando un usuario consulta el estado del stock de un artículo, su navegador realiza la siguiente petición:

```http
POST /product/stock HTTP/1.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 118

stockApi=http://web.com:8080/product/stock/check?productId=6&storeId=1
```

Esto provoca que el servidor realice una petición a la URL especificada, recupere el estado del stock y se lo devuelva al usuario.

En este ejemplo, un atacante podría modificar la petición para especificar una URL local al servidor:

```http
POST /product/stock HTTP/1.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 118

stockApi=http://localhost/admin
```

El servidor obtendría el contenido de la URL `/admin` y se lo devuelve al usuario.

Un atacante puede intentar visitar la URL `/admin` directamente en su navegador, pero la funcionalidad administrativa normalmente solo debería ser accesible para usuarios autenticados. Esto significa que un atacante no vería nada de interés. 

Sin embargo, si la petición a la URL `/admin` proviene de la máquina local (gracias a colocar `localhost`), los controles de acceso normales se omiten. La aplicación otorgaría acceso total a la funcionalidad administrativa porque la petición **parece** originarse desde la ubicación de confianza `localhost`.

## ¿Por qué las aplicaciones confían implícitamente en las peticiones que provienen de la máquina local?

Esto puede ocurrir por varias razones:

- **Ubicación del control de acceso:** El control de acceso podría estar implementado en un componente diferente que se sitúa por delante del servidor de aplicaciones (como un WAF o un proxy inverso). Cuando se realiza una conexión de vuelta al servidor (_callback_), este control se omite.

- **Recuperación ante desastres:** Para fines de recuperación ante desastres, la aplicación podría permitir el acceso administrativo sin iniciar sesión a cualquier usuario que provenga de la máquina local. Esto proporciona una vía para que un administrador recupere el sistema si pierde sus credenciales. Se asume que solo un usuario plenamente confiable accedería directamente desde el servidor.

- **Interfaces administrativas segmentadas:** La interfaz administrativa podría estar escuchando en un número de puerto diferente al de la aplicación principal y podría no ser alcanzable directamente por los usuarios externos.


Este tipo de relaciones de confianza, donde las peticiones que se originan en la máquina local se manejan de forma distinta a las peticiones ordinarias, a menudo convierten al SSRF en una vulnerabilidad crítica.

---
## Laboratorio: SSRF básico contra el servidor local

Nivel: [APRENDIZ](https://portswigger.net/web-security/learning-paths/ssrf-attacks/ssrf-attacks-common-ssrf-attacks/ssrf/lab-basic-ssrf-against-localhost)

Este laboratorio es un entorno controlado que nos permitirá ver como funciona este tipo de vulnerabilidad. La aplicación web posee una función de verificación de stock que obtiene datos de un sistema interno para gestionar el estado de los productos.

Para resolver el laboratorio, debes modificar la URL de verificación de stock para acceder a la interfaz de administración en `http://localhost/admin` y elimina el usuario **carlos**.

> [!SUCCESS]- Solución: Basic SSRF against the local server
> 1. Navega hacia `/admin` y observa que no puedes acceder directamente a la página de administración sin las credenciales correspondientes.
>     
> 2. Visita un producto, haz clic en **"Check stock"**, intercepta la petición en **Burp Suite** y envíela al **Burp Repeater**.
>     
> 3. Cambie la URL en el parámetro `stockApi` a `http://localhost/admin`. Esto debería mostrar la interfaz de administración.
>     
> 4. Lea el código HTML para identificar la URL necesaria para eliminar al usuario objetivo, la cual es: `http://localhost/admin/delete?username=carlos`
>     
> 5. Envía esta URL en el parámetro `stockApi` para ejecutar el ataque SSRF y ver como se elimina el usuario "carlos".



---

![[Pasted image 20260211212904.png]]

![[Pasted image 20260211212927.png]]

![[Pasted image 20260211212946.png]]

