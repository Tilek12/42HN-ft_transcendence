import { getUser} from '../utils/auth.js'
import { defaultPicture } from '../utils/constants.js';
import { wsManager } from '../websocket/ws-manager.js';


export const compressFile = async (file: File) : Promise<File> =>
{
 return new Promise((resolve, reject)=>
{
			const file_name = file.name.substring(0, file.name.lastIndexOf('.') + 1);
			const img = new Image();
			const reader = new FileReader();
			reader.onload = (e) => img.src = e.target?.result as string;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = 200;
				canvas.height = 200;

				const ctx = canvas.getContext('2d');
				if (!ctx) return reject(new Error("Canvas not Available!"));
				ctx.drawImage(img, 0, 0, 200, 200);
				canvas.toBlob((blob) =>{
					if(!blob) return reject (new Error("Comression failed"));

					const compressed_file = new File([blob], (file_name + 'jpg'), {type : "image/jpeg"});
					resolve(compressed_file);
				}, 'image/jpeg', 0.6);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
})
}

export const listenerUploadPicture = async (e : any) =>
{
		e.preventDefault();
		const fileInput : any = document.getElementById('profile-pic-input');
		let file =fileInput?.files[0];
		if (!file) return alert('Please select an image. ');

		const file_type = file.name.substring(file.name.lastIndexOf('.') + 1);
		
		if (file_type !== 'png' && file_type !== 'jpg' && file_type !== 'jpeg') return alert('Please select a png or jpeg or jpg. ');
		if(file.size > 500000) file = await compressFile(file);

		const formData = new FormData();
		formData.append('profile_pic', file);
		
		const res = await fetch('/api/private/upload_pic',
			{
				method: 'POST',
				credentials: 'include',
				body: formData,
			});

		const result = await res.json();
		console.log("result ====>>> FrontEnd", result);
		if (res.ok)
		{
			// profile.image_blob ? `data:image/webp;base64,${profile.image_blob}` : `${BACKEND_URL}/profile_pics/${profile.image_path}`;
			// const BACKEND_URL = getEnvVariable('VITE_BACKEND_URL');
			const img = document.getElementById("profile_pic") as HTMLImageElement;
			img.src = `data:image/webp;base64, ${result.blob}`;
			// location.reload();
		}
		else
			alert(result.message || 'Failed to upload profile picture');
}

export const listenerDeletePicture = async (e : any) =>
{
	e.preventDefault();
	const res = await fetch(`/api/private/delete_pic`,
		
		{
			method: 'POST',
			credentials: 'include',
		}
	)
	const data = await res.json();
	if (res.ok)
	{
		const img  = document.getElementById('profile_pic') as HTMLImageElement;
		img.src = defaultPicture;

	}
	else
		alert(data.message || 'Failed to delete profile picture')
}

