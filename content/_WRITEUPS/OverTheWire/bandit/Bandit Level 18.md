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

## 📂 El archivo .bashrc

Este es un script de shell que Bash ejecuta automáticamente cada vez que se inicia una sesión **interactiva** (cuando abres una terminal o te conectas por SSH sin comandos adicionales). Se encuentra oculto en el directorio home del usuario (`~/.bashrc`). Si el script encuentra un error o una instrucción de salida (`exit`), detendrá el proceso de inicio del shell, impidiendo que el usuario pueda escribir.

- **Ejecución automática**: No necesitas llamarlo manualmente; el sistema lo lee apenas el usuario "entra" a la terminal.
- **Persistencia**: Permite que tus configuraciones (como el color de la terminal o tus comandos abreviados) se mantengan cada vez que inicias sesión.
- Personalizar el entorno: definir alias, variables de entorno (como el `PATH`), configurar el aspecto del prompt (`PS1`) y cargar funciones personalizadas.

En estes caso, se utilizó como un mecanismo de denegación. Al final del archivo `.bashrc` de este nivel se incluyó un comando `exit 0`, lo que provoca que la sesión se cierre justo después de cargar las configuraciones, sin dar tiempo al usuario de interactuar.

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

### Comandos Clave para este nivel

- **ssh:** Comando para conectarse de forma segura a un servidor remoto.
    - **Uso avanzado:** Al añadir un comando al final (`ssh, cat, whoami`), se ignora la carga interactiva del `.bashrc`.

- **ls -a:** Lista todos los archivos del directorio, incluyendo los ocultos (como el `.bashrc` que causaba el problema).
- **cat:** Muestra el contenido de un archivo. En este nivel, se usa para leer el `readme` o inspeccionar el `.bashrc` malicioso.
- **bash --norc:** Opción para iniciar el shell de Bash ignorando los archivos de configuración del usuario (_Run Commands_). Requiere el parámetro `-t` en SSH para funcionar correctamente. 
---
##  Solución directa

### 1. Conexión ssh y concatenacion de comandos.

```bash
ssh bandit18@bandit.labs.overthewire.org -p 2220 cat readm
```
<!-- Imagen de la edición del archivo con la llave SSH-->

En este nivel nos lo ponen re fácil, nos dicen que debemos leer un archivo llamado "readme" dentro del home. Sabemos que por defecto la termina de suele abrir el el homo por lo que todo lo que tendríamos que hacer es un cat readme luego la conexión SSH

## Complicarse la vida xd
### 1. conectarse por ssh conel bypass
```
ssh bandit18@bandit.labs.overthewire.org -p 2220 -t "/bin/bash --norc"
```
<!-- Imagen de la conexión SSH con OverTheWire -->
 
### 2. listar comando para ver que nos ocultan
```
ls -a
```
<!-- Imagen de la contraseña del nivel actual de Over The Wire-->

### 3. buscar el culpable de nuestras desgracias
```
cat .bashrc
```
<!-- Listado de archivos con contraseñas -->

Preuba forecence:
```bash
export GAMEHOSTNAME=${GAMEHOSTNAME:-$HOSTNAME}
# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
# See bash(1) for more options
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
#shopt -s globstar

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@$GAMEHOSTNAME\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@$GAMEHOSTNAME:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@$GAMEHOSTNAME: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# colored GCC warnings and errors
#export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features (you don't need to enable
# this, if it's already enabled in /etc/bash.bashrc and /etc/profile
# sources /etc/bash.bashrc).
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi
echo 'Byebye !'
exit 0
```
<!-- GIF verificando la conexión con bandit18 -->
Podemos ver el exit boleta ahí mano viste esa vaina que malandro XD

### 4. Leer la contraseña
```
cat readme
```


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