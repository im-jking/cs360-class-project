//Defines environment variables for the network/system

//Should be changed based on running system
// const HOST = "192.168.88.44";
const HOST = "192.168.88.42";
export const HOST_WITH_PORT_API = `http://${HOST}:8000`;

export var curUser: string | null = null;
export var approved: boolean = false;
export const setUser = (user: string | null) => {
  curUser = user;
};
export const getUser = () => {
  return curUser;
};

export const getApproved = () => {
  return approved;
};

export const checkAdmin = async (user: string) => {
  const response = await fetch(`${HOST_WITH_PORT_API}/user?username=${user}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => response.json())
    // .then((response) => console.log(response))
    .catch((error) => console.error("Error fetching user data:", error));
  return response.is_admin;
};

export const checkApproved = async (user: string) => {
  const response = await fetch(`${HOST_WITH_PORT_API}/user?username=${user}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => response.json())
    .catch((error) => console.error("Error fetching user data:", error));
  approved = response.is_approved;
  return response.is_approved;
};
