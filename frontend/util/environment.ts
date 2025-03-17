//Defines environment variables for the network/system
const HOST = "192.168.88.44";
export const HOST_WITH_PORT_API = `http://${HOST}:8000`;

export var curUser: string | null = null;
export const setUser = (user: string | null) => {
  curUser = user;
};
export const getUser = () => {
  return curUser;
};
