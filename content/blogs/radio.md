---
title : Web-Radio 
date : 2024-01-28
description: A tutorial on how to setup web-radio using liquidsoap and icecast in 2024  
author: Unic-X 
tags: ['Rant', 'Web-Radio', 'LiquidSoap', 'Icecast']

---

## Hate for apt 

I feel the shittest package manager to ever exist is apt. Two packages needed different version of ubuntu and for some reason restricts me to do anything.


## Setup

> The icecast2 won't work if you are using Ubuntu 22.xx because of apt's bullshittry

1. First install icecast2 as a normal being using apt 
1. Install liquidsoap from apt as well

## Setting up Icecast

After installing icecast2 the config file can be found at `/etc/icecast2/icecast.xml`

The only important thing is the port that you are using for inbound and outbound connection should be open by your firewall check with or if using AWS add a security group for that port `netstat -plnt`.

Here's my `icecast.xml` file. 

```xml
<icecast>

    <location>India</location>
    <admin>arman@loonix.in</admin>

    <limits>
        <clients>100</clients>
        <sources>2</sources>
        <queue-size>524288</queue-size>
        <client-timeout>30</client-timeout>
        <header-timeout>15</header-timeout>
        <source-timeout>10</source-timeout>

        <burst-on-connect>1</burst-on-connect>

        <burst-size>65535</burst-size>
    </limits>

    <authentication>
        <!-- Sources log in with username 'source' -->
        <source-password>Your_Source_Username</source-password>
        <!-- Relays log in with username 'relay' -->
        <relay-password>Your_Relay_Username</relay-password>

        <!-- Admin logs in with the username given below -->
        <admin-user>Your_Admin_Username</admin-user>
        <admin-password>Your_Admin_Password</admin-password>
    </authentication>

    <hostname>loonix.in</hostname>

    <listen-socket>
	<port>8000</port>
    <bind-address>::</bind-address>
	<ssl>1</ssl>
    <ssl-certificate> /etc/letsencrypt/live/_location_/ssl_cert.pem </ssl-certificate>
     <ssl-private-key> /etc/letsencrypt/live/_location_/priv_key.pem </ssl-private-key>


    <http-headers>
        <header name="Access-Control-Allow-Origin" value="*" />
    </http-headers>

    <fileserve>1</fileserve>

    <paths>
        <!-- basedir is only used if chroot is enabled -->
        <basedir>/usr/share/icecast2</basedir>

        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>

        <alias source="/" destination="/status.xsl"/>

    </paths>


    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <!-- <playlistlog>playlist.log</playlistlog> -->
        <loglevel>3</loglevel> <!-- 4 Debug, 3 Info, 2 Warn, 1 Error -->
        <logsize>10000</logsize> <!-- Max size of a logfile -->
    </logging>

    <security>
        <chroot>0</chroot>
    </security>
</icecast>

```
Afer setting up simply start and enable the service icecast2.service using root perms


## Setting up LiquidSoap
I hate apt so much. and took me around 3 hours to figure out how to daemonize liquidsoap

So if you followed everything from this tutorial version of liquidsoap for you should be `1.4.1` and hence you cannot use [Liquid Soap Deamonize](https://github.com/savonet/liquidsoap-daemon/) because i guess it required version >= 2.x.x and i cannot simply install it using apt


So what else you can do is use this simple `liquid` file from my server 

```shell
#!/usr/bin/liquidsoap
set("init.daemon.pidfile",true)

set("init.allow_root",true)

set("init.daemon",true)


# Music
myplaylist = playlist(mode="randomize",reload=1,reload_mode="rounds",
<DIR OF YOUR PLAYLIST>)

# Use your absolute directory above as you will be running under root privileges

# If something goes wrong, we'll play this
security = single("ANY DEFAULT FILE")

# Start building the feed with music
radio = myplaylist

# And finally the security
radio = fallback(track_sensitive = false, [radio, security])

# Stream it out
output.icecast(%mp3,
  host = "ICECAST HOSTNAME", port = ICECAST_PORT,
  password = "YOUR ICECAST PASSWORD", mount = "radio",
  radio)

```

and run this using `sudo liquidsoap --quiet config.liq` this will make liquidsoap run in background. 

And now you have a working web-radio!



## Update: I hate AWS too

Why the free tier only allows usage of only 1GB of outbound data also if you exceed they charge $0.09/GB that might get exhausted pretty 
fast if you stream a radio so its more preferable to use a OCI instance instead of AWS because they allow for 10TB outbound data / month. But what is with these Amazon/Azure/Google cloud services why can't they make something like Oracle ?? Absolute state of money hungry tech giants.
{{<cover-image "aws.png" "Alt Text">}}