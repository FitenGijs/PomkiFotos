<script>
	import { onMount } from 'svelte';
	import { imageStatus } from '$lib/components/mqttHandler';

	let videoEl;
	let errorMessage;
	let canvas;
	let link;
	let enabled = 0;

	$: $imageStatus, makeImageAndDownload();

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

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				}
			});

			videoEl.srcObject = stream;
			videoEl.play();

			handleConnect('ws://192.8.9.10:9001/');
		} catch (e) {
			console.error(e, 'camera access denied');
			errorMessage = 'Camera Access Denied';
		}
	});
</script>

<div class="container">
	<h1 class="title">Camera feed</h1>
	<div class="videosContainer">
		<video bind:this={videoEl}>webcam</video>
		<canvas id="canvas" width="1920" height="1080" />
	</div>

	<button on:click={makeImageAndDownload}> Take picture </button>
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
		gap: 5%;
	}
	video {
		width: 35%;
	}
	canvas {
		width: 35%;
	}
	button {
		position: relative;
		top: 5%;
		left: 6%;
		width: 200px;
		height: 100px;
	}
	canvas {
	}
</style>
