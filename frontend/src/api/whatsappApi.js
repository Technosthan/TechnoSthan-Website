import axios from "axios";


// NORMAL MESSAGE

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const sendWhatsAppMessage =
async (

   number,
   text

)=>{

   return await axios.post(

      `${API_BASE}/api/whatsapp/send`,

      {

         to:number,

         message:text
      }
   );
};


// TEMPLATE MESSAGE

export const sendTemplate =
async (

   number,

   templateName,

   parameters

)=>{

   return await axios.post(

      `${API_BASE}/api/whatsapp/send-template`,

      {

         number,

         templateName,

         parameters
      }
   );
};