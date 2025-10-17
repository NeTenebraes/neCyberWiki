Voy a hackear la maquina **Kioptrix** de Vulnhub, instalé ParrotOS en un maquina virtual de linux y al mismo tiempo la maquina vulnerable.

Lo primero que haré será un nmap a la IP de la maquina, a ver qlq

Tuve que realizar un proceso de configuracion de redes para quitarle acceso a la maquina vulnerable y la maquina atacante.  La idea es aislar ambas maquinas y poner ambas en una sola "Red Privada"

Instalar Parrot OS fue sencillo, al igual que abrir la ma quina Virtual con VMware

escaneo de Ip en la red s
```
nmap -O 192.168.0.0/24
```

el -O es para saber el sistema operativo
```
nmap -p- -sVCS --open --min-rate 5000 -vvv -n -Pn -oN scan 
```

verificar que hace -sT

```
sudo /usr/bin/env /bin/bash
```

192.168.107.93

