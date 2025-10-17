```

|<script src="[js/vendor/modernizr-2.6.2.min.js](http://172.16.23.129/js/vendor/modernizr-2.6.2.min.js)"></script>|
|<script src="[js/vendor/jquery-1.10.2.min.js](http://172.16.23.129/js/vendor/jquery-1.10.2.min.js)"></script>|
|<script src="[js/bootstrap.min.js](http://172.16.23.129/js/bootstrap.min.js)"></script>|
|<script src="[js/ZmxhZzJ7YVcxbVl.js](http://172.16.23.129/js/ZmxhZzJ7YVcxbVl.js)"></script>|
|<script src="[js/XUnRhVzVwYzNS.js](http://172.16.23.129/js/XUnRhVzVwYzNS.js)"></script>|
|<script src="[js/eVlYUnZjZz09fQ==.min.js](http://172.16.23.129/js/eVlYUnZjZz09fQ==.min.js)"></script>|
```
Escaneo basico de reconocimiento
```
Starting Nmap 7.98 ( https://nmap.org ) at 2025-10-14 22:36 -0500
Initiating ARP Ping Scan at 22:36
Scanning 172.16.23.129 [1 port]
Completed ARP Ping Scan at 22:36, 0.07s elapsed (1 total hosts)
Initiating SYN Stealth Scan at 22:36
Scanning 172.16.23.129 [65535 ports]
Discovered open port 80/tcp on 172.16.23.129
SYN Stealth Scan Timing: About 23.23% done; ETC: 22:39 (0:01:42 remaining)
SYN Stealth Scan Timing: About 59.61% done; ETC: 22:38 (0:00:41 remaining)
Completed SYN Stealth Scan at 22:38, 87.52s elapsed (65535 total ports)
Nmap scan report for 172.16.23.129
Host is up, received arp-response (0.00027s latency).
Scanned at 2025-10-14 22:36:49 -05 for 88s
Not shown: 65534 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON

80/tcp open  http    syn-ack ttl 64
MAC Address: 00:0C:29:73:6C:8B (VMware)

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 87.73 seconds
           Raw packets sent: 131138 (5.770MB) | Rcvd: 104 (5.320KB)

```

sudo nmap -p- --open -sS -T4 -vvv -n -Pn 172.16.23.129

sudo nmap -p80 -sCV 172.16.23.129


172.16.23.129	00:0c:29:73:6c:8b	VMware, Inc.

ZmxhZzJ7YVcxbVlXUnRhVzVwYzNSeVlYUnZjZz09fQ==

DESCARGAR;
- tcping GITHUB
