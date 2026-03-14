export type User = {
  email: string;
  password: string;
};

export type UserCredentials = User;

export type UserSession = {
  id: number;
  email: string;
  username: string;
};
