import mqtt from 'mqtt';

/**
 * mqtt broker
 */
const client = mqtt.connect('mqtt://localhost:1883');
const topic = 'MQTTMakerHeroRecebe';

client.on('connect', () => {
  console.log('\x1b[33m', 'Conectado ao broker com sucesso');
  client.subscribe(topic);
});

client.on('message', (topic, message) => {
  console.log("\x1b[35m", `Mensagem recebida no tópico ${topic}: ${message.toString()}`);
});
