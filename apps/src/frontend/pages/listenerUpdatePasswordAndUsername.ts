import {getToken} from '../utils/auth'
//----------------------Password Listeners-------------------------------
const listenerPasswordEdit = (
	password_old_check : HTMLInputElement,
	 password_new : HTMLInputElement, 
	 password_confirm : HTMLInputElement,
	password_update_btn : HTMLButtonElement,
	password_cancel_btn : HTMLButtonElement,
	password_edit_btn : HTMLButtonElement
) =>
	{
		password_old_check?.classList.remove('hidden');
		password_new?.classList.remove('hidden');
		password_confirm?.classList.remove('hidden');
		password_update_btn?.classList.remove('hidden');
		password_cancel_btn?.classList.remove('hidden');
		password_edit_btn?.classList.add('hidden');
	}
const listenerPasswordCancel = (
	password_old_check : HTMLInputElement,
	password_new : HTMLInputElement, 
	password_confirm : HTMLInputElement,
	password_update_btn : HTMLButtonElement,
	password_cancel_btn : HTMLButtonElement,
	password_edit_btn : HTMLButtonElement
) =>
	{
		password_old_check?.classList.add('hidden');
		password_new?.classList.add('hidden');
		password_confirm?.classList.add('hidden');
		password_update_btn?.classList.add('hidden');
		password_cancel_btn?.classList.add('hidden');
		password_edit_btn?.classList.remove('hidden');
	}
	const listenerPasswordUpdate = async (
		password_old_check : HTMLInputElement,
		password_new : HTMLInputElement, 
		password_confirm : HTMLInputElement,
		password_update_btn : HTMLButtonElement,
		password_cancel_btn : HTMLButtonElement,
		password_edit_btn : HTMLButtonElement
	) =>
{
	let old_value = password_old_check.value;
	let new_value = password_new.value;
	let confirm_value = password_confirm.value;

	let res = await fetch('/api/private/check-given-old-password',
		{
			method: 'POST',
			headers:
			{
				'Authorization': `Bearer ${getToken()}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({password: old_value}),
		},
	);
	let data = await res.json();
	const is_verified = data.answer;
	console.log("OLD VALUE LENGTH: ", old_value.length);
	if (!is_verified)
	{
		alert('try again to write your old password!')
		return ;
	}
	if (new_value !== confirm_value)
	{
		alert('The new and confirm password are not the same');
		return ;
	}
	if (new_value.length < 6)
	{
		alert ('Try a password with more than 6 characters!');
		return ;
	}
	if (new_value === old_value)
	{
		alert('The given new password must be different than the older one');
		return ;
	}
		res = await fetch('/api/private/update-password',
		{
			method: 'POST',
			headers:
			{
				'Authorization': `Bearer ${getToken()}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({password: new_value}),
		},
		);
		data = await res.json();
		if (res.ok)
		{
			alert (data.message);
			password_old_check.value ='';
			password_confirm.value ='';
			password_new.value ='';
		}
		else 
			alert ('Something went wrong');

	password_old_check?.classList.add('hidden');
	password_new?.classList.add('hidden');
	password_confirm?.classList.add('hidden');
	password_update_btn?.classList.add('hidden');
	password_cancel_btn?.classList.add('hidden');
	password_edit_btn?.classList.remove('hidden');
}
//---------------------Username Listeners---------------------------------------------

const listenerUsernameCancel = (
	username_cancel_btn: HTMLButtonElement, 
	username_update_btn :HTMLButtonElement, 
	username_edit_btn: HTMLButtonElement, 
	username_input_el: HTMLInputElement, 
	username_par_el: HTMLParagraphElement

) =>
{
	username_cancel_btn?.classList.add('hidden');
	username_update_btn?.classList.add('hidden');
	username_input_el.classList.add('hidden');
	username_par_el.classList.remove('hidden');
	username_edit_btn?.classList.remove('hidden');
}
const listenerUsernameEdit = (
	username_cancel_btn: HTMLButtonElement, 
	username_update_btn :HTMLButtonElement, 
	username_edit_btn: HTMLButtonElement, 
	username_input_el: HTMLInputElement, 
	username_par_el: HTMLParagraphElement

) =>
{
	username_cancel_btn?.classList.remove('hidden');
	username_update_btn?.classList.remove('hidden');
	username_input_el.classList.remove('hidden');
	username_par_el.classList.add('hidden');
	username_edit_btn?.classList.add('hidden');
}
const listenerUsernameUpdate = async (
	username_cancel_btn: HTMLButtonElement, 
	username_update_btn :HTMLButtonElement, 
	username_edit_btn: HTMLButtonElement, 
	username_input_el: HTMLInputElement, 
	username_par_el: HTMLParagraphElement

) =>
{
	const new_username = username_input_el.value.trim();
	console.log(`====> INPUT: $$${new_username}$$$`);
	console.log(`====> username_par_el: $$${username_par_el.innerText}$$$`);
	if (!/^(?=.*[a-z])[a-z0-9]+$/.test(new_username))
	{
		alert(`Username must have atleast one lowercase letter and numbers`)
		return;
	}
	try
	{
		const res = await fetch('/api/private/update-username',
			{
				method: 'POST',
				headers: {
							'Authorization': `Bearer ${getToken()}`,
							'Content-Type': 'application/json',
						},
				body: JSON.stringify({username: new_username}),
			},
		)
		const data = await res.json();
		if(!res.ok)
		{
			alert(data.error || 'Failed to update username');
			return
		}
		username_par_el.textContent = data.new_username;
		username_par_el.classList.remove('hidden');
		username_edit_btn.classList.remove('hidden');
		username_cancel_btn.classList.add('hidden');
		username_update_btn.classList.add('hidden');
		username_input_el.classList.add('hidden');
	}catch (e)
	{
		console.error(e);
		alert('Error updating username');
	}
}
export {listenerPasswordEdit, listenerPasswordCancel, listenerPasswordUpdate, listenerUsernameCancel, listenerUsernameUpdate, listenerUsernameEdit};