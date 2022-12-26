import mqtt from 'mqtt/dist/mqtt.min';
import { writable } from 'svelte/store';

export const mqttStatus = writable('initializing');
export const imageStatus = writable('-1');

export const handleConnect = (/** @type {string} */ ip) => {
	console.log('connection...');
	mqttStatus.set('connecting');
	const clientId = 'pomki_app' + Math.random().toString(16).substr(2, 8);

	let i = 0;
	const host = ip;

	const options = {
		keepalive: 60,
		clientId: clientId,
		username: 'test',
		password: 'test',
		protocolId: 'MQTT',
		protocolVersion: 4,
		clean: true,
		reconnectPeriod: 0,
		connectTimeout: 30 * 1000,
		will: {
			topic: 'dt/pomki/status',
			payload: JSON.stringify({
				ID: 'pomki_app',
				Time: 0,
				Status: 'offline'
			}),
			qos: 0,
			retain: false
		}
	};
	const client = mqtt.connect(host, options);

	if (client) {
		client.on('connect', () => {
			client.subscribe('dt/pomki/camtrigger');
			client.publish('dt/pomki/status', JSON.stringify({ ID: 'pomki_app', Status: 'online' }));
			mqttStatus.set('connected');
		});

		client.on('error', (/** @type {any} */ err) => {
			console.error('Connection error: ', err);
			client.end();
		});

		client.on('reconnect', () => {
			i += 1;
			console.log(i);
			mqttStatus.set('reconnecting');

			if (i > 2) {
				client.end();
			}
		});

		client.on('message', (/** @type {string} */ topic, /** @type {string} */ message) => {
			console.log('received: "' + message + '" on topic: ' + topic);
			if (topic == 'dt/pomki/status') {
				let payload = JSON.parse(message.toString());
				mqttStatus.set(payload.Status);
			} else if (topic == 'dt/pomki/camtrigger') {
				let payload = JSON.parse(message.toString());
				console.log(payload.nTriggerID);
				imageStatus.set(payload.nTriggerID);
			}
		});
	}
};
