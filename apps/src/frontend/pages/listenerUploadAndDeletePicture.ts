import { getToken, clearToken} from '../utils/auth'
import { wsManager } from '../websocket/ws-manager';

export const listenerUploadPicture = async (e : any) =>
{
		e.preventDefault();
		const fileInput : any = document.getElementById('profile-pic-input');
		const file =fileInput?.files[0];
		if (!file)
		{
			alert('Please select an image. ');
			return;
		}
		const formData = new FormData();
		formData.append('profile_pic', file);
		const res = await fetch('/api/upload_pic',
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${getToken()}`,
				},
				body: formData,
			});

		const result = await res.json();
		if (res.ok)
			location.reload();
		else
			alert(result.message || 'Failed to delete profile picture');
}

export const listenerDeletePicture = async (e : any) =>
{
	e.preventDefault();
	const res = await fetch(`/api/delete_pic`,
		{
			method: 'POST',
			headers:
			{
				Authorization: `Bearer ${getToken()}`,
			}
		}
	)
	const data = await res.json();
	if (res.ok)
		location.reload();
	else
		alert(data.message || 'Failed to delete profile picture')
}

export const listenerLogoutBtn = async (e : any) =>
{
	e.preventDefault();
	{
		const token = getToken();
			await fetch('/api/logout',
				{
					method: 'POST',
					headers: {'Authorization': `Bearer ${token}`},
				});
			wsManager.disconnectAllSockets();
			wsManager.clearPresenceData();
			clearToken();
			location.hash = '#/login';
	}
}
