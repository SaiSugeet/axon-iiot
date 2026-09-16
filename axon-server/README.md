# AXON Central Server

## Setup on Ubuntu

sudo apt install mosquitto mosquitto-clients python3-pip
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
cd axon-server
pip install -r requirements.txt --break-system-packages
python3 main.py

## Test the API

curl http://localhost:5000/health
curl http://localhost:5000/api/iasi/latest
curl http://localhost:5000/api/iasi/history

## MQTT Topics

railway/vibration      — 500-sample vibration windows at 500Hz
railway/obstacle       — obstacle detection events  
railway/system/heartbeat — Pi heartbeat every 30 seconds

## Server Info

Local IP: 192.168.1.12
Flask port: 5000
MQTT port: 1883
