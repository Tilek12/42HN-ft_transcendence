import { renderProfilesList } from './renderProfiles.js';


export const listenerLoadBtn = async (allProfiles : {profiles: any[]}[] | undefined , profile_offset :number, profile_limit :number) =>
{
	{
		if (allProfiles)
		{
			// allProfiles = await renderProfilesList('profiles-list', true, allProfiles, profile_offset, profile_limit);
			profile_offset += profile_limit;
		}
	}
}