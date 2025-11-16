---
title: "OTW Bandit: 13"
description: Aqui se presenta un reto donde el usuario recibe una clave privada SSH en lugar de una contraseña. El objetivo es aprender a usar claves privadas para autenticarse por SSH y comprender la importancia de los controles de acceso en sistemas GNU/Linux.
tags:
  - linux
  - bash
  - bandit
  - ssh
  - chmod
publishDate: 2025-11-12
Dificultad:
  - ★☆☆☆☆
---
## Introducción

En este nivel de [Over The Wire Bandit](https://overthewire.org/wargames/bandit/bandit14.html), el objetivo no es descubrir una contraseña tradicional, sino utilizar una llave privada SSH que nos permite establecer la conexión segura como el usuario bandit14. Este método de autenticación mediante llaves SSH nos invita a romper la cuarta pared y experimentar un nivel más real utlizando nuestro propio ordenador, avanzado de acceso remoto cifrado.
## Llaves SSH

Las llaves SSH son un método de autenticación basado en criptografía asimétrica, donde se usa una clave pública en el servidor y una clave privada en el cliente para establecer una conexión segura sin necesidad de contraseñas. Esto proporciona una capa adicional de seguridad y facilita accesos automatizados.
### Ejemplos

Para conectarnos usando la llave privada, usamos el comando `ssh` con la opción `-i`, indicando el archivo de la clave privada:

```
ssh -i llave_privada bandit14@localhost
```

Aquí, `llave_privada` es el archivo que recibimos en este nivel y `localhost` hace referencia a la misma máquina donde estamos trabajando.
## Permisos en Linux

Los permisos en Linux controlan **quién puede leer, escribir o ejecutar archivos**. Esto es fundamental para proteger archivos sensibles, como llaves privadas.

Para mantener la integridad y privacidad de la clave privada, usamos el comando `chmod` para establecer permisos restrictivos, por ejemplo `chmod 600`, que permite solo al propietario leer y escribir, bloqueando acceso a otros usuarios.
### Ejemplos
![[OTW14.06.webp]]

- `chmod 600 sshkey.private` restringe acceso solo a ti, **el dueño**.    
- Otros permisos comunes incluyen `644` para archivos de solo lectura pública, o agregar ejecución con `+x`.

---
## Comandos Clave

- **ssh**: Establece una conexión segura a un servidor remoto mediante el protocolo Secure Shell (SSH).  
    Parámetros comunes:
    
    - `-i <archivo>`: Usa una llave privada específica para la autenticación.
    - `-p <puerto>`: Conecta a un puerto distinto del 22 por defecto.
    - `-C`: Comprime la sesión para mejorar el rendimiento.
    - `-v`: Muestra información detallada para depuración.

- **cat**: Muestra el contenido de archivos por pantalla.  
    Parámetros comunes:
    
    - `-n`: Numera las líneas en la salida.        
    - `-E`: Marca el final de cada línea con un `$`.  

- **chmod**: Cambia los permisos de archivos en Linux, controlando quién puede leer, escribir o ejecutar.  
    Parámetros comunes:
    
    - `600`: Permisos restrictivos, solo el propietario puede leer y escribir.
    - `644`: Lectura para todos, escritura solo para el propietario.
    - `+x`: Añade permiso de ejecución.  

- **touch**: Crea archivos vacíos o actualiza la fecha de último acceso/modificación de un archivo.

- **bat** (alternativa moderna a `cat`): Muestra el contenido de archivos con resaltado de sintaxis y paginación, ideal para lectura cómoda en terminal.

- **nvim** (similares: `vim`, `nano`, `micro`): Editor de texto avanzado para la terminal, perfecto para editar configuraciones o llaves SSH de manera rápida y eficaz.

---
## Solución
Este nivel es realmente sencillo: solo necesitas conectarte al servidor remoto usando la cuenta bandit13. No hay trucos ocultos ni pasos extraños, es puro SSH básico, así que lo único que debes tener a mano es el password correspondiente.

### 1. Conectarnos al servidor.
```
ssh -p 2220 bandit13@bandit.labs.overthewire.org
```

![[OverTheWire.bandit 20.webp]]
Aparecerá el logo clásico de OverTheWire y la máquina te pedirá la contraseña de `bandit13`, obtenida en [[Bandit Level 12]].

### 2. Verificación de llave SSH.
```
ls
cat sshkey.private
exit
```

![[OverTheWire.bandit 19.webp]]

Al ejecutar estos comandos veremos el contenido de un archivo llamado `sshkey.private`, que almacena la clave RSA privada necesaria para acceder como el usuario `bandit14` en el siguiente nivel. Puedes copiar todo el contenido de la clave y guardarla en tu máquina local (en cualquier archivo nuevo, por ejemplo, `bandit14.key`). Recuerda que esta información es altamente sensible: es fundamental **no compartirla nunca y protegerla** en tu entorno local asegurando los permisos correctos (`chmod 600 bandit14.key`) para evitar accesos indebidos.​
### 3. Creación de llave SSH.
```
touch bandit14.key
nvim bandit14.key
bat bandit14.key
```

Primero, en tu PC local, creamos un archivo para guardar la clave privada usando el comando que quieras (yo uso `touch`, pero puedes llamarlo como te dé la gana):

![[OverTheWire.bandit 22.webp]]
Luego, pegamos el contenido copiado de `sshkey.private` dentro del archivo recién creado. Personalmente, prefiero usar `nvim`, pero aquí aplica cualquier editor de texto con el que te sientas cómodo: `vim`, `nano`, `micro`, hasta un editor gráfico si lo prefieres. El punto es que edites el archivo en tu entorno local y pegues toda la clave, cien por ciento.

No olvides guardar y cerrar el archivo (en `nvim` sería `:wq`). Al final, tu sistema tendrá el archivo privado listo para autenticación SSH.
![[OverTheWire.bandit 23.webp]]
Por último, puedes verificar que la clave esté bien copiada revisando el contenido del archivo con cualquier comando que prefieras. Si eres tradicional, puedes usar `cat bandit14.key`. En mi caso, suelo preferir `bat`, una versión más moderna y colorida (pero al final es lo mismo, solo cuestión de gustos).

**Notas rápidas:**
- El nombre del archivo es elección tuya, lo importante es que recuerdes cuál usaste.    
- Puedes verificar el contenido con `bat` (o `cat`).    
- No te olvides del siguiente paso crítico: ¡asigna permisos seguros a tu clave!
### 4. Cambio de permisos del fichero
```
chmod 600 bandit14.key
ls -l
```
![[OverTheWire.bandit 24.webp]]
Con esto, el archivo `bandit14.key` queda accesible **solo para el usuario propietario**: puede leerlo y modificarlo, pero nadie más puede tocarlo. Si intentas conectarte sin este paso, SSH te lanzará un error y no te dejará entrar, así que este **cambio es obligatorio**.

Puedes verificar que el cambio fue exitoso usando `ls -l`, donde el archivo debe mostrar permisos `-rw-------`.

En resumen: igual que con contraseñas, aquí la seguridad manda y el sistema no te deja pasar si la llave privada no está bien protegida.

### 5. Verificación de conexión 
```
ssh -i bandit14.key -p 2220 bandit14@bandit.labs.overthewire.org
```

Hora de la verdad, crack. Con la llave privada y los permisos en regla, tu comando debería verse así:

![[OverTheWire.bandit 21.webp]]

Si todo está bien, deberías ver el logo clásico de OverTheWire y ya estarás dentro como bandit14. Recuerda: **en este nivel la llave SSH es tu pase de entrada, así que procura guardarla y manejarla con cuidado** (piensa en esto como tu pase VIP, ¡no lo pierdas!).

--- 
## Errores comunes

- **Permiso denegado (publickey)**  
    El clásico. Suele pasar si la clave privada no tiene permisos 600, si el archivo está corrupto o si usas la clave incorrecta. Confirma el nombre exacto del archivo y que el comando incluya la opción `-i` correctamente.
  
- **Connection refused / Timeout**  
    Ocurre si el puerto (`-p 2220`) está mal, el servidor está caído o la red/firewall te bloquea. Revisa que el nombre de host y puerto sean correctos, y que tu conexión a internet está estable.

- **Bad permissions**  
    SSH es muy paranoico con los permisos. Si la clave privada tiene permisos demasiado abiertos, el cliente te bloquea. Usa `chmod 600 bandit14.key` sí o sí.
    
- **Clave privada dañada o formato incorrecto**  
    Si copias la clave a tu archivo y faltan líneas (o se agrega un salto de línea raro), no vas a conectar. Verifica que el archivo empieza y termina bien (`-----BEGIN RSA PRIVATE KEY-----` y `-----END RSA PRIVATE KEY-----`), sin espacios extra.

- **Usuario o dirección mal escrita**  
    Errores de tipeo en el usuario (`bandit14`) o el hostname suele terminar en intentos fallidos. Escribelo cuidadosamente.

- **Clave privada perdida o borrada**  
    Si eliminaste tu archivo por error, descarga o crea de nuevo tu llave a partir de la fuente y repite el proceso.