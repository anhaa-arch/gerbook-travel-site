import axios, { AxiosResponse } from 'axios';

interface QPayTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

async function token(): Promise<QPayTokenResponse | string> {
  console.log("111");
  const session_url = process.env.qpayUrl + "auth/token";
  console.log(session_url);
  
  try {
    const response = await axios.post(
      session_url,
      {},
      {
        auth: {
          username: process.env.QpayUserName,
          password: process.env.QpayPassword,
        },
      }
    );
    
    console.log("res.data");
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
    } else {
      console.log("Unexpected error", error);
    }
    return "Service iin aldaa garlaa orchuulah";
  }
}

const makeRequest = async (): Promise<QPayTokenResponse | string | number> => {
  try {
    const response: AxiosResponse = await axios.post(
      process.env.qpayUrl + "auth/token",
      {},
      {
        auth: {
          username: process.env.QpayUserName,
          password: process.env.QpayPassword,
        },
      }
    );
    if (response.status === 200) {
      // response - object, eg { status: 200, message: 'OK' }
      console.log("success stuff");
      return response.data;
    }
    return response.status;
  } catch (err) {
    console.error(err);
    return "error";
  }
};

export { token, makeRequest };