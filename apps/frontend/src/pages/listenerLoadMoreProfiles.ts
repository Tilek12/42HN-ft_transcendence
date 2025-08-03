import { renderNav } from './nav'
import { getToken, clearToken, validateLogin } from '../utils/auth'
import { renderProfilesList } from './renderProfiles';
import { renderUserProfile, profile_ids, Profile_details} from './renderUserProfile';
import { listenerFriendAndBlock } from './listenerProfileList';
import { listenerDeletePicture, listenerLogoutBtn, listenerUploadPicture } from './listenerUploadAndDeletePicture';
import { getEnvVariable } from './TypeSafe';


export const listenerLoadBtn = async (allProfiles : {profiles: any[]}[] | undefined , profile_offset :number, profile_limit :number) =>
{
	{
		if (allProfiles)
		{
			allProfiles = await renderProfilesList('profiles-list', true, allProfiles, profile_offset, profile_limit);
			profile_offset += profile_limit;
		}
	}
}