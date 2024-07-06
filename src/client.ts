import mqtt from 'mqtt';
import axios from 'axios';
import push from 'pushsafer-notifications';

/**
 * mqtt borker
 */
const client = mqtt.connect('mqtt://localhost:1883');
const topic = 'MQTTMakerHeroRecebe';

/**
 * pushsafer
 */

const psh = new push({
  k: 'YAcx77Xq5gDcsHYmh9ew',
  debug: true
});

interface Message {
  m: string,
  t: string,
  s: string,
  v: string,
  i: string,
  c: string,
  d: string
}

client.on('connect', () => {
  console.log('\x1b[33m', 'Conectado ao broker com sucesso');
  client.subscribe(topic);
});

const lastNotify: any = [];

client.on('message', (topic, message) => {
  console.log("\x1b[35m", `Mensagem recebida: ${formater(message.toString())} no tópico: ${topic}`);
  const data = normalize(formater(message.toString()));
  console.log("\x1b[35m", `Mensagem normalizada: ${JSON.stringify(data)}`);
  notifyEvery45Minutes(data);
});

function formater(message: string) {
  let messate: any = message.split("#").join("").split("$").join("");
  messate = messate.split("-");
  return messate;
}

function getTemperature(message: string[]) {
  return message[1];
}

function getHumidity(message: string[]) {
  return message[3];
}

function normalize(message: string[]) {
  return {
    temperature: getTemperature(message),
    humidity: getHumidity(message)
  };
}

async function notifyPush(message: string){

  let msw: Message = {
    m: message,
    t: 'Temperatura do quarto',
    s: '8',
    v: '2',
    i: '5',
    c: '#ffcd70',
    d: '81446'
  }

  await psh.send(
    msw,
    function(err: any, data: any) {
      console.log(err, data);
    }
  )
}

async function notifyEvery45Minutes(data: { temperature: string, humidity: string }) {
  const lastnn = lastNotify[lastNotify.length - 1];

  if (lastnn && lastnn.date + 2700000 > Date.now()) {
    console.log("\x1b[35m", `Mensagem não enviada: ${JSON.stringify(lastnn)}`);
    return;
  }

  let msg = encodeURIComponent(`Temperatura: ${data.temperature}°C\nHumidade: ${data.humidity}%`);

  try {
    const response = await axios.get("https://signal.callmebot.com/signal/send.php?phone=5577991716934&apikey=234765&text=" + msg);
    
    await notifyPush(msg);
    
    console.log("\x1b[35m", `Mensagem enviada: ${JSON.stringify(response.data)}`);
    lastNotify.push({
      temperature: data.temperature,
      humidity: data.humidity,
      date: Date.now()
    });
  } catch (err) {
    console.log("\x1b[35m", `Mensagem não enviada: ${JSON.stringify(err)}`);
  }
}
