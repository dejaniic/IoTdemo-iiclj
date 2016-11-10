# IoTdemo-iiclj

## Navodila za postavitev novega sistema

### Bluemix
Na Bluemix-u postavimo novo aplikacijo *Internet of Things Platform Starter*.

### IoT service
V IoT servisu dodamo nov *Device Type* z imenom *RaspberryPi* in naredimo novo napravo tega tipa,
ki bo predstavljala naš Raspberry Pi.

### Raspberry Pi
Kopiramo kodo iz direktorija *rpi* na napravo in nato v ukazni vrstici izvedemo naslednje ukaze:
- **sudo apt-get install bluez bluez-hcidump**
- **sudo pip install pexpect paho-mqtt**
- Z ukazom **cd** se premaknemo v direktorij *pygatt-2.0.1-readHandle*
- **sudo make install**

V datoteki *advertiseGateway.py* popravimo parametre:
- V vrstici *33* nastavimo ID firefly-a, ki pošilja podatke o pospeških
- V vrsticah *114*, *117* in *118* nastavimo parametre, ki jih uporablja naš IoT servis
- Za testiranje lahko zakomentiramo vrstico *113*, da se program zažene takoj

Kodo lahko zaženemo tako, da se v ukazni vrstici prestavimo na direktorij,
v katerem je datoteka *advertiseGateway.py* in izvedemo ukaz:
- **python advertiseGateway.py**

Da se bo koda začela samodejno izvajati ob vsakem zagonu Raspberry Pi-ja,
moramo v datoteki *advertiseGateway.py* odkomentirati vrstico *113* in popraviti datoteko */etc/rc.local* tako,
da pred vrstico **exit 0** vstavimo naslednjo vrstico:
- **python /home/pi/advertiseGateway.py &**

Če je datoteka *advertiseGateway.py* drugje, pot ustrezno popravimo. Sedaj lahko Raspberry Pi ponovno zaženemo in
koda se samodejno zažene po približno tridesetih sekundah.

### Node-Red
V Node-Red aplikacijo uvozimo logiko aplikacije tako, da vsebino datoteke *websocket-relay.txt* kopiramo v dialog,
ki ga v Node-Red aplikaciji dobimo tako, da v meniju izberemo *Import* > *Clipboard*.

### Statične strani
Vsebino mape *public* naše aplikacije zamenjamo z vsebino mape *public* tega repozitorija.
Do datotek naše aplikacije lahko dostopamo z orodji *git*, *cf*, ali pa prek spletne aplikacije *IBM developerWorks*.

Popravimo datoteko *index.html* tako, da v elementih **div** razreda **hex-text** nastavimo atribute **id** tako,
da ti predstavljajo ID-je naših firefly-ev. V datotekah *js/code_index.js* in *js/code_graph.js* popravimo spremenljivki
*host* tako, da bosta ti naslednjega formata: **"ws://\<url naše aplikacije\>/websocket"**
