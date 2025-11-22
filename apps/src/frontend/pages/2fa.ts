
export async function renderQrcode(root: HTMLElement) {

	const res = await fetch('api/qr', {
		method: 'POST',
		credentials: 'include'
	});
	const {qr} = await res.json();

	if (!res.ok )
	{
		console.log("no respone")
		return;
	}
	console.log(res);
	
	root.innerHTML = `<div class="flex justify-center h-screen relative">
						<img
							id="qrcode"
							src="${qr}"
							class="w-[512px] h-[512px] m-1/2 justify-center items-center bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl"
						></img>
						</div>`;

}

