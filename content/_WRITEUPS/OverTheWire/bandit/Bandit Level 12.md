---
level: Bandit 12 → Bandit 13
cover:
title: "OTW Bandit: 12"
description: Te guío para encontrar la contraseña del nivel descifrando un archivo protegido con ROT13. Aprenderás no solo a aplicar y revertir este cifrado clásico desde la terminal usando el comando adecuado, sino también a profundizar en el manejo de texto y en los comandos básicos de Linux fundamentales para administración y pentesting.
tags:
  - linux
  - bash
  - bandit
  - rot13
  - cifrado
difficulty:
  - ★★☆☆☆
publishDate: 2025-11-08
---
# Bandit Level 12 → Level 13

## Level Goal

The password for the next level is stored in the file **data.txt**, which is a hexdump of a file that has been repeatedly compressed. For this level it may be useful to create a directory under /tmp in which you can work. Use mkdir with a hard to guess directory name. Or better, use the command “mktemp -d”. Then copy the datafile using cp, and rename it using mv (read the manpages!)

## Commands you may need to solve this level

grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd, mkdir, cp, mv, file

## Helpful Reading Material

- [Hex dump on Wikipedia](https://en.wikipedia.org/wiki/Hex_dump)
sdfgsdfgsdfg

