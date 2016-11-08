import re, sys
import pexpect
import paho.mqtt.client as mqtt
import threading
import time

class myThread(threading.Thread):

    def __init__(self, threadID, run_event):
        print("Thread initialized!")
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.run_event = run_event

    def run(self):
        print("Thread started!")
        readAdvertise(self.run_event)
        print("Thread ended!")

#Callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))

    #Subscribing in on_connect() means tha if we lose the connection and reconnect the subscription will be renewed.
    #client.subscribe("firefly/command")

#The callback for then a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print(msg.topic + " " +str(msg.payload))

def publishMQTT(data, name, clientMQTT):

    if(name == 'FF-XXX'): # ID firefly-ja, ki posilja accelometer podatke

        ax = (int(data[0:2],16) << 8) | int(data[2:4],16)
        ay = (int(data[4:6],16) << 8) | int(data[6:8],16)
        az = (int(data[8:10],16) << 8) | int(data[10:12],16)

        a1x = ax / 16384.0
        a1y = ay / 16384.0
        a1z = az / 16384.0

        if (int(data[0:2],16) > 127):
            a1x = a1x - 4.0
        if (int(data[4:6],16) > 127):
            a1y = a1y - 4.0
        if (int(data[8:10],16) > 127):
            a1z = a1z - 4.0

        sendData = ("{\"d\": {\"ID\":\"%s\", \"accX\": %.1f, \"accY\": %.1f,\"accZ\" :%.1f}}" % (name, a1x, a1y, a1z))
    else:

        lux = (int(data[4:6],16) << 8) | int(data[6:8],16)

        t = (int(data[8:10],16) << 8) | int(data[10:12],16)
        temp = ((175.72 * t) / 65536) - 46.85

        rh = (int(data[0:2],16) << 8) | int(data[2:4],16)
        humid = ((125.0 * rh) / 65536) - 6

        sendData = ("{\"d\": {\"ID\":\"%s\", \"Lux\": %d, \"Temp\": %.1f,\"RelHum\" :%.1f}}" % (name, lux, temp, humid))

    clientMQTT.publish("iot-2/evt/status/fmt/json", sendData)
    print(sendData)

def measureDistance(txPower, rssi):
  if rssi == 0:
    return -1.0 # if we cannot determine accuracy, return -1.
  ratio = rssi * 1.0 / txPower
  if ratio < 1.0:
    return pow(ratio,10)
  else:
    return (0.89976) * pow(ratio, 7.7095) + 0.111

def readAdvertise(run_event):

    scan = pexpect.spawn("sudo hcitool lescan --duplicates 1>/dev/null")
    p = pexpect.spawn("sudo hcidump --raw", timeout=3)
    packet = ""

    while run_event.is_set():
      try:
          line = p.readline()
          #print(line)
          packet = line[2:].strip()
          packet = packet.replace(" ", "")
          #print packet
          if(packet[32:38] == '46462D'):
            if packet[26:28] == '1E':
              line = p.readline()
              line += p.readline()
              packet += line.replace(" ", "")
              #print packet[:len(packet)]
              packet = packet.rstrip()
              #print len(packet)
              #print packet
              name = packet[32:44].decode('hex')
              #print "name: " + name
              data = packet[58:72]
              #print "data: " + data
              #print packet[58:72]

              publishMQTT(data, name, client)
          if not line: break
          packet = ""
      except pexpect.TIMEOUT:
          pass # Timeout, restarting process or exiting ...
      except:
          print("Unknown exception:", sys.exc_info()[0])
          print("Will try to continue, send SIGINT to stop.")


time.sleep(30) # za testiranje lahko zakomentiras, pomembno, ce se skripta starta ob zagonu sistema
client = mqtt.Client("d:123456:RaspberryPi:MyRPi") # format: d:<organisation-id>:<device-type>:<device-name>
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set("use-token-auth", "mojegeslo") # geslo za firefly
client.connect("123456.messaging.internetofthings.ibmcloud.com", 1883, 15) # spremeni 123456 na organisation-id

_run_event = threading.Event()
_run_event.set()
t = myThread(1, _run_event)
t.start()
try:
    client.loop_forever()
except KeyboardInterrupt:
    print("Stopping thread ...")
    _run_event.clear()
    t.join()
    print("Disconnecting client.")
    client.disconnect()
    print("Goodbye!")
