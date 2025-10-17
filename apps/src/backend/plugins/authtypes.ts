import { StringLiteral } from "typescript";

export type JWTPayload = {
  id: number,
  role: string,
  username: string,
};

export type User = {
  id: number,
  username: string,
  email:string,
  password: string,
  role: string,
  tfa: boolean,
  tfa_secret:string,
}