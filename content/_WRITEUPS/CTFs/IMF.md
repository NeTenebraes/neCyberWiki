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
  - https://www.vulnhub.com/entry/darkhole-2,740/
---
# CTF: IMF: 1

PORTADA

>[!INFO] Información General
>Este documento contiene un writeup detallado de cómo comprometer la máquina IMF en VulnHub. Se abordan técnicas de
---
## Objetivo

- Comprometer la máquina virtual [IMF: 1](https://www.vulnhub.com/entry/imf-1,162/).
- Obtener acceso inicial mediante enumeración web.
- Escalar privilegios hasta root mediante abuso de servicios vulnerables.
- Capturar las 5 flags.
## Herramientas y Comandos Recomendados

| Herramienta | Función principal                             |
| ----------- | --------------------------------------------- |
| arp-scan    | Descubre hosts en la red.                     |
| nmap        | Escaneo y enumeración de puertos y servicios. |
| wget        | Descarga de archivos desde la web.            |
| git         | Control de versiones de código.               |
| Burp Suite  | Análisis y pruebas de tráfico web.            |
| curl        | Transferencia de datos y pruebas HTTP.        |
| netcat      | Utilidad multipropósito de red.               |
| ssh         | Acceso remoto seguro por consola.             |
| htop        | Monitorización avanzada de procesos.          |
| netstat     | Revisión de conexiones y puertos activos.     |
> [!TIP] Preparativos Personales:  
>Esta máquina vulnerable fue ejecutada bajo un entorno virtualizado usando **VMware Workstation** sobre un sistema operativo **Arch Linux**. Todas las herramientas fueron descargadas e instaladas de los repositorios oficiales o desde la **AUR**. 

---
# Informe General:

> [!Abstract] Resumen Técnico
> Se obtuvo acceso inicial 
## I. Reconocimiento: Fase inicial | arp-scan / tcping

Lo primero que debes hacer antes de hacer cualquier cosa es reconocer que maquina vas a atacar. Para esto debe reconocer que IP tiene la máquina victima.

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

Indentificamos que hay una maquina conectada, por lo que podemos proceder ejecutar el comando ping para verificar conectividad con la máquina:

Comando utilizado
```
ping 172.16.23.129
```
![[Pasted image 20251031174154.png]]
	No hay conexión por medio de ping.

El comando "ping" usa el protocolo ICMP (Internet Control Message Protocol), que envía paquetes de eco para saber si un dispositivo está accesible en la red. Sin embargo, muchos sistemas o routers pueden bloquear estos paquetes ICMP por seguridad, por lo que "ping" puede fallar aunque el dispositivo esté activo.

Ya que no hay conexión mediante conexiones ICMP, probaremos la herramienta [tcping](https://github.com/cloverstd/tcping) para verificar la conexión mediante el protocolo TCP. tcping usa el protocolo TCP  para intentar establecer una conexión directa a un puerto TCP específico en la máquina destino (por ejemplo, puerto 80, 443, etc). Esto permite verificar si un servicio en ese puerto está disponible y funcionando, y no se basa en que ICMP esté permitido o no.

Una vez copilada ejecutamos:
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


---

