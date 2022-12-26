<script>
	import { onMount } from 'svelte';
	import { handleConnect, mqttStatus, imageStatus } from '$lib/components/mqttHandler';

	let videoEl;
	let errorMessage;
	let canvas;
	let link;
	let enabled = 0;
	let inputBox;

	$: $imageStatus, makeImageAndDownload();

	async function mqttConnect() {
		handleConnect(inputBox.value);
	}

	async function makeImageAndDownload() {
		if (enabled < 1) {
			enabled++;
			return;
		}
		let ctx = canvas.getContext('2d');
		ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
		link.setAttribute('download', 'foto_' + $imageStatus + '.png');
		link.setAttribute('href', canvas.toDataURL('image/png'));
		link.click();
	}

	onMount(async () => {
		try {
			canvas = document.getElementById('canvas');
			link = document.getElementById('link');
			inputBox = document.getElementById('ip');

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: 1920,
					height: 1080
				}
			});

			videoEl.srcObject = stream;
			videoEl.play();
		} catch (e) {
			console.error(e, 'camera access denied');
			errorMessage = 'Camera Access Denied';
		}
	});
</script>

<div class="container">
	<h1 class="title">Camera feed</h1>
	<div class="ipContainer">
		<label for="ip">MQTT IP:</label>
		<input type="text" id="ip" name="ip" /><br /><br />
		<button class="connectButton" on:click={mqttConnect}>Connect</button>
	</div>
	<h2>Status: {$mqttStatus}</h2>
	<div class="videosContainer">
		<video width="1920" height="1080" bind:this={videoEl}>webcam</video>
		<canvas id="canvas" width="1920" height="1080" />
	</div>

	<button class="picButton" on:click={makeImageAndDownload}> Take picture </button>
	<a id="link" />
</div>

<style>
	.container {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;

		background-color: rgb(228, 228, 228);
	}
	label {
		font-family: Arial, Helvetica, sans-serif;
	}
	h2{
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
	}
	.title {
		margin-bottom: 0;
		font-size: 52px;
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
	}
	.videosContainer {
		width: 100%;
		height: 60%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 5%;
	}
	video {
		width: 35%;
	}
	canvas {
		width: 35%;
	}
	button.picButton {
		position: relative;
		bottom: 3%;
		left: 6%;
		width: 200px;
		height: 100px;
	}
	.ipContainer {
		display: flex;
		flex-flow: row;
		justify-content: center;
		gap: 15px;
	}
	button.connectButton {
		width: auto;
		height: auto;

	}
</style>
