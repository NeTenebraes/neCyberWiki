---
title: "OTW Bandit: 18"
description:
tags:
  - linux
  - bash
  - bandit
Dificultad:
  - ★☆☆☆☆
publishDate: 2025-12-31
---
## Introducción y Desafío

En este nivel, el objetivo es leer el archivo `readme` en el home del usuario `bandit18`. Sin embargo, el archivo `.bashrc` ha sido modificado para imprimir un mensaje y cerrar la sesión inmediatamente, impidiendo el acceso interactivo normal.

![[Pasted image 20251231174810.png]]

## Conceptos Clave

Normalmente, cuando te conetas por medio de `ssh`, el servidor inicia un "login shell". Al hacerlo, el sistema lee archivos de configuración como el `.bashrc`. Si este archivo tiene un comando `exit` o `logout`, te saca de inmediato, matando la conexión SSH antes de que podamos escribir cualquier comando...

> [!DANGER] Disclaimer Ético
> Este material ha sido creado exclusivamente con fines educativos y de investigación. **El uso indebido de esta información para atacar objetivos sin autorización explícita es ilegal y contraviene los principios del hacking ético**.
> 
> **Antes de continuar:** Lee mi nota "**[[Ética en la Ciberseguridad]]**" para más información. 

## 📂 ¿Qué es el archivo .bashrc?
El archivo `.bashrc` es un script de shell que **Bash** ejecuta automáticamente cada vez que se inicia una nueva sesión interactiva (terminal).

- **¿Para qué sirve?** Se utiliza para personalizar el entorno del usuario: definir alias, variables de entorno (como el `PATH`), configurar el aspecto del prompt (`PS1`) y cargar funciones personalizadas.
- **Uso en este nivel:** Se utilizó como un mecanismo de denegación. Al final del archivo se incluyó un comando `exit 0`, lo que provoca que la sesión se cierre justo después de cargar las configuraciones, sin dar tiempo al usuario de interactuar.

## 🚀 Técnicas de Bypass

### 1. Ejecución Directa de Comandos (Non-interactive)

**`ssh` permite pasar un comando como argumento**. Esto ejecuta el binario directamente en el servidor y devuelve la salida sin llegar a procesar completamente el entorno interactivo que gatilla el `exit` del `.bashrc`.

```bash
ssh bandit18@bandit.labs.overthewire.org -p 2220 whoami
```

### 2. Bypass mediante `--norc` (Sesión Interactiva)

Si necesitas quedarte dentro del servidor para explorar, puedes forzar a Bash a ignorar los archivos de configuración del usuario.

```Bash
ssh bandit18@bandit.labs.overthewire.org -p 2220 -t "/bin/bash --norc"
```
La sintaxis para iniciar un shell ignorando configuraciones locales es:

```Bash
/bin/bash --norc
```

- **`/bin/bash`**: La ruta absoluta al binario del intérprete de comandos BASH.
- **`--norc`**: (No Run Commands). Es el parámetro crítico que le ordena a Bash **no leer** el archivo de configuración personal `~/.bashrc` al iniciar una sesión interactiva.
- `-p` seleccion de puertos.  
- `-t` forzar TTY.

**Casos de uso comunes:** Evadir scripts de bloqueo en el login (como el `exit 0` de este nivel), automatizar auditorías en múltiples servidores, o exfiltrar archivos específicos de forma rápida sin dejar una sesión abierta en los registros de última conexión.

Ejemplo:
```bash
ssh bandit18@bandit.labs.overthewire.org -p 2220 whoami
```

## El archivo .bashrc

El **.bashrc** es un script de shell que Bash ejecuta automáticamente cada vez que se inicia una sesión **interactiva** (cuando abres una terminal o te conectas por SSH sin comandos adicionales). Se encuentra oculto en el directorio home del usuario (`~/.bashrc`).

#### Estructura y Funcionamiento:
- **Ejecución automática**: No necesitas llamarlo manualmente; el sistema lo lee apenas el usuario "entra" a la terminal.
- **Persistencia**: Permite que tus configuraciones (como el color de la terminal o tus comandos abreviados) se mantengan cada vez que inicias sesión.
- **Impacto en el flujo**: Si el script encuentra un error o una instrucción de salida (`exit`), detendrá el proceso de inicio del shell, impidiendo que el usuario pueda escribir.

**Casos de uso comunes**:

1. **Personalización**: Crear **alias** (`alias ll='ls -la'`) para ahorrar tiempo.
2. **Variables de Entorno**: Configurar el `PATH` para que el sistema encuentre programas instalados en carpetas personalizadas.
3. **Automatización**: Ejecutar scripts de bienvenida o recolectar métricas cada vez que un administrador se loguea.
4. **Seguridad (Desafíos)**: Como técnica de denegación de servicio local o para forzar el cierre de sesión de usuarios no autorizados.

### Comandos Clave para este nivel

- **ssh:** Comando para conectarse de forma segura a un servidor remoto.
    - **Uso avanzado:** Al añadir un comando al final (`ssh, cat, whoami`), se ignora la carga interactiva del `.bashrc`.

- **ls -a:** Lista todos los archivos del directorio, incluyendo los ocultos (como el `.bashrc` que causaba el problema).
- **cat:** Muestra el contenido de un archivo. En este nivel, se usa para leer el `readme` o inspeccionar el `.bashrc` malicioso.
- **bash --norc:** Opción para iniciar el shell de Bash ignorando los archivos de configuración del usuario (_Run Commands_). Requiere el parámetro `-t` en SSH para funcionar correctamente. 
---
##  Solución Paso a Paso

### 1. 

```bash

```
<!-- Imagen de la edición del archivo con la llave SSH-->



### 2. 
```

```
<!-- Imagen de la conexión SSH con OverTheWire -->
 
### 3. 
```

```
<!-- Imagen de la contraseña del nivel actual de Over The Wire-->

### 4. 
```

```
<!-- Listado de archivos con contraseñas -->

### 5. 
```

```
<!-- Aplicamos comparativa con el comando diff -->

### 6. 
```

```
<!-- GIF verificando la conexión con bandit18 -->

---
## Lecturas recomendadas

- [Documentación oficial de `diff`](https://www.gnu.org/software/diffutils/manual/diffutils) (GNU diffutils)
- [Página de manual de `diff` en Linux](https://man7.org/linux/man-pages/man1/diff.1.html) 



---



---

## Análisis del Código "Malicioso"

El archivo `.bashrc` en este nivel termian con:

```Bash
echo 'Byebye !'
exit 0
```

Como ya sabemos, esto quiere decir que cualquier intento de login estándar terminará con el mensaje "Byebye !" y el cierre de la conexión.