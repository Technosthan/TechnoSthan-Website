const axios = require("axios");


// NORMAL MESSAGE

const sendWhatsAppMessage = async (

   to,
   message

)=>{

   try {

      const response = await axios.post(

         `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,

         {

            messaging_product:"whatsapp",

            to,

            type:"text",

            text:{
               body:message
            }
         },

         {

            headers:{

               Authorization:
               `Bearer ${process.env.WHATSAPP_TOKEN}`,

               "Content-Type":
               "application/json"
            }
         }
      );

      return response.data;

   } catch(err){

      console.log(
         err.response?.data || err.message
      );

      throw err;
   }
};


// TEMPLATE MESSAGE

const sendTemplateMessage = async (

   number,

   templateName,

   parameters

)=>{

   try {

      const response = await axios.post(

         `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,

         {

            messaging_product:"whatsapp",

            to:number,

            type:"template",

            template:{

               name:templateName,

               language:{
                  code:"en_US"
               },

               components:[
                  {
                     type:"body",

                     parameters
                  }
               ]
            }
         },

         {

            headers:{

               Authorization:
               `Bearer ${process.env.WHATSAPP_TOKEN}`,

               "Content-Type":
               "application/json"
            }
         }
      );

      return response.data;

   } catch(err){

      console.log(
         err.response?.data || err.message
      );

      throw err;
   }
};


module.exports = {

   sendWhatsAppMessage,

   sendTemplateMessage
};