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

## 💡 ¿Qué es un SSRF? (Explicado fácil)

Imagina que quieres entrar a una fiesta privada (la red interna de una empresa), pero el portero (el **Firewall**) no te deja pasar porque no te conoce. Sin embargo, hay un mensajero oficial (el **Servidor Web**) que tiene permiso de entrar y salir cuando quiera porque todos confían en él.

Un **SSRF** (Server-Side Request Forgery) es cuando tú, con toda la malicia, engañas a ese mensajero para que vaya a la fiesta por ti, haga un mandado y te traiga la información de vuelta.

En resumen:

- **Lo normal:** Tú le pides algo al servidor -> El servidor te lo da.
- **El ataque:** Tú le dices al servidor: _"Oye, ve a esta dirección interna que yo no puedo ver y dime qué hay"_. Como el servidor confía en su propia red, va, lo busca y te lo entrega en bandeja de plata.

### ¿Por qué esto es un problema?

Porque el servidor suele tener acceso a cosas que nosotros desde afuera ni soñamos ver: bases de datos, paneles de control o servicios en la nube que guardan las llaves del reino (credenciales).


## 🚀 ¿Cómo se ve esto en la vida real? (Ataque al Localhost)

Muchos servidores tienen una "puerta trasera" para ellos mismos llamada **localhost** (o la IP `127.0.0.1`). Es como el baño privado del dueño del local: si vienes de la calle, está cerrado, pero si ya estás adentro del edificio, entras sin preguntar.

### El ejemplo del inventario

Imagina una tienda online. Cuando vas a ver si hay stock de un producto, la página hace esto por debajo:

```http
POST /product/stock

stockApi=http://api-logistica.com/check?id=123
```

El servidor agarra esa URL, pregunta por el stock y te muestra el resultado. **¿Cuál es el truco?** Que nosotros podemos cambiar esa URL por lo que queramos.

Imagina que la modificamos y mandamos esto: 
```http
POST /product/stock

stockApi=http://localhost/admin
```

El servidor dice: _"Ah, me están pidiendo algo de mi propia casa. ¡Como soy yo mismo, no necesito contraseña XD!"_. El servidor te acabaría renderizando un panel de administración que se supone era secreto.

Un atacante podría intentar visitar el endpoint `/admin` directamente en su navegador, pero la funcionalidad administrativa normalmente solo debería ser accesible para usuarios autenticados. Esto significa que un atacante no vería nada de interés.

## 🛡️ ¿Por qué caen en la trampa?

A veces los desarrolladores se confían demasiado y dicen: _"Si la petición viene de mi propia IP, fijo soy yo haciendo mantenimiento"_. Se saltan el login por pura "comodidad" o por miedo a quedarse por fuera del sistema. **Esa confianza es nuestro pase VIP.**

Aquí te explico por qué ese exceso de confianza nos da ventaja:

- **El "Punto Ciego" del Control:** A veces el guardia de seguridad (como un WAF o un Proxy Inverso) está solo en la puerta principal. Cuando logramos que el servidor se haga una petición a sí mismo (_callback_), el control se queda procesando la entrada de afuera y nos deja pasar derechito a la cocina sin pedir identificación.

- **La Llave de Emergencia:** Muchos sistemas tienen un "modo rescate". Si el administrador pierde la clave, la aplicación lo deja entrar sin nada, siempre y cuando la petición venga de su misma máquina (`localhost`). El programador asume que nadie más tiene acceso físico al servidor, pero se le olvida que con un SSRF nosotros podemos "hablar" desde adentro.

- **La Puerta de Atrás:** A veces el panel de control está escondido en otro puerto que no se ve desde internet. El desarrollador piensa: _"Si nadie afuera puede ver el puerto 8080, no necesito ponerle tanta seguridad"_. Error fatal, porque si logramos que el servidor consulte ese puerto por nosotros, estamos adentro.


En resumen, tratar las peticiones internas como "confiables" por defecto es lo que convierte un simple error en una **vulnerabilidad crítica**.

---
¡Entendido, panita! Si quieres mantener exactamente ese bloque de contenido pero con el estilo visual y el lenguaje que venías usando en el resto del blog, aquí tienes una propuesta bien pulida.

Le ajusté un poco las palabras para que no suene a "manual de instrucciones aburrido" y se sienta más como un consejo de alguien que ya se pasó el nivel.

---

## 🛠️ Manos a la obra: SSRF contra el Localhost

**Nivel:** [🟢 APRENDIZ](https://portswigger.net/web-security/learning-paths/ssrf-attacks/ssrf-attacks-common-ssrf-attacks/ssrf/lab-basic-ssrf-against-localhost)

Este lab es el patio de juegos perfecto para ver la teoría en acción. La web tiene un botón de "Check stock" que, por debajo, le pide datos a un sistema interno. **Ahí es donde vamos a meter mano.**

**Tu misión:** Engañar al servidor para que entre a su propia zona de admin (`http://localhost/admin`) y borre al usuario **carlos**.

> [!SUCCESS]- Paso a paso: Cómo "explotar" a Carlos
> 
> 1. **El choque con la realidad:** Intenta entrar a `/admin` desde tu navegador. Verás que te rebota porque no tienes permiso.
> 
> 2. **Caza la petición:** Ve a cualquier producto, dale a **"Check stock"** e intercepta ese paquete con **Burp Suite**.
>    
> 3. **El cambiazo:** En el parámetro `stockApi`, borra la URL que sale y pon `http://localhost/admin`. ¡Dale a enviar y mira cómo el servidor te abre la puerta de la cocina!
>    
> 4. **Buscando el botón rojo:** Revisa el HTML que te devolvió el servidor. Ahí verás el enlace para borrar usuarios. El premio gordo es: `http://localhost/admin/delete?username=carlos`.
>    
> 5. **Golpe final:** Pon esa URL en el `stockApi`, dispara de nuevo y listo. Carlos ya es historia y el laboratorio está resuelto.


Te dejo el Write up paso a paso para que lo veas si estás perdido: [[Writeup Level 1]]

---

