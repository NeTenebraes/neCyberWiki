---
title: "OTW Bandit: 13"
description: The password for the next level is stored in /etc/bandit_pass/bandit14 and can only be read by user bandit14. For this level, you don’t get the next password, but you get a private SSH key that can be used to log into the next level.
tags:
  - linux
  - bash
  - bandit
  - descompresión
  - hexdump
difficulty:
  - ★★☆☆☆
publishDate: 2025-11-08
---
Conexion SSH por medio de llave privada

en este nivel no hay contraseña, solo hay una archivo que contiene la infor necesario par aestablecer conexion a bandit14

vamos a romper la 4ta pared un poco xd




## Commands you may need to solve this level

ssh, telnet, nc, openssl, s_client, nmap

## Helpful Reading Material

- [SSH/OpenSSH/Keys](https://help.ubuntu.com/community/SSH/OpenSSH/Keys)

---

![[OverTheWire.bandit 18.png]]

copiamos y nos salimos
![[OverTheWire.bandit 19.png]]

creamos y pegamos 

![[OverTheWire.bandit 20.png]]

Yo utilizo nvim pero puedes usar CUALQUIER EDITOR DE TEXTO QUE GUSTES

cambiamos los permisos y nos conectamos a lserver
chmod 600 sshbandit14

Hay que cambiar los permisos ya que si no no nos deja conectarnos, la conexion es exactamente igual, solo que usando una SSH


![[OverTheWire.bandit 21.png]]y listo crack, ya dentro de bandit 14 v: 