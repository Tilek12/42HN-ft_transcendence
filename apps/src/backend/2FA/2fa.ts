import QRCode from 'qrcode'
import * as OTPAuth from "otpauth";


const issuer:string = "Linda, Thomas, Rustam, Tilek, Philipp";
const label:string = "Transcendence 42Heilbronn 2025";

export async function generateqrcode(secret: string):Promise<string> {

	let totp = new OTPAuth.TOTP({
		issuer: issuer,
		label: label,
		issuerInLabel: false,
		secret: OTPAuth.Secret.fromBase32(secret),
	});
	const uri = totp.toString();
	console.log(uri);
	return QRCode.toDataURL(uri);
}

export function generateSecret():string {
	const s = new OTPAuth.Secret({size: 20});
	return s.base32;
}


export function validate_2fa_token(token:string, secret:string):boolean
{
	const totp = new OTPAuth.TOTP({secret: OTPAuth.Secret.fromBase32(secret)});
	const ret = totp.validate({token, window: 1});
	if (!ret)
		return false;
	console.log("\ntoken delta: ", ret, "\n");
	return true;
}