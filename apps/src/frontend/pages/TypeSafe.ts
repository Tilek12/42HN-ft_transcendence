export function getEnvVariable(key: string) :string {
	const value = (import.meta as any).env[key];
	if (!value) throw new Error(`Missing the: ${key}`);
	return value;
}