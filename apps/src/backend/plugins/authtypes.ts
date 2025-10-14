
export type JWTPayload = {
  id: number,
  role: string,
  username: string,
};

export type User = {
  id: number,
  username: string;
  password: string,
  role: string,
  tfa: boolean,
}