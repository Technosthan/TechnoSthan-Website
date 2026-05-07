import axios from "axios";


// NORMAL MESSAGE

export const sendWhatsAppMessage =
async (

   number,
   text

)=>{

   return await axios.post(

      "http://localhost:5000/api/whatsapp/send",

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

      "http://localhost:5000/api/whatsapp/send-template",

      {

         number,

         templateName,

         parameters
      }
   );
};