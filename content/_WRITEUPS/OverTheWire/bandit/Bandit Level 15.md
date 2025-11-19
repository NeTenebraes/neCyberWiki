---
title: "OTW Bandit: 15"
description:
tags:
  - linux
  - bash
  - bandit
difficulty:
  - ★☆☆☆☆
publishDate: 2025-11-18
---
## Introducción

## Comandos Clave
- **`ssh`**: Comando para conectarse de forma segura a un servidor remoto mediante el protocolo Secure Shell (SSH).
    
    - Parámetros comunes:
        - `-i` usa una llave privada concreta.
        - `-p` especifica el puerto remoto (por ejemplo, `-p 2220`).
        - `usuario@host` define el usuario y el servidor al que te conectas.

- **`cat`**: Muestra contenido del archivo en terminal.

- **`nc`**: Navaja suiza de conexiónes TCP/UDP.
    
    - Parámetros comunes:        
        - `-n` evita resolver DNS (usa solo IPs numéricas).            
        - `-v` modo “verbose”, muestra más detalles de la conexión.            
        - `-l` lo pone en modo escucha (servidor).            
        - `-p PUERTO` define el puerto local a usar.

- **`ss -ltn`**: Muestra los sockets TCP en escucha, útil para comprobar que el servicio está activo en `localhost:30000`.
    
    - Parámetros comunes:        
        - `-l` solo puertos en escucha.            
        - `-t` solo conexiones TCP.            
        - `-n` muestra puertos/IPs numéricos sin resolver nombres.

---
## Solución

Conectarnos

![[Pasted image 20251118231146.png]]

 Verificar puertos 30001

![[Pasted image 20251118231322.png]]

Enviar Handshake 
![[Pasted image 20251118231440.png]]
![[Pasted image 20251118231450.png]]
	aqui presionamos enter
	
.3 ultimo
![[Pasted image 20251118231508.png]]
	recibimos la contraseña
	
---
## Lecturas recomendadas
