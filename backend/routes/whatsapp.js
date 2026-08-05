const express = require("express");

const router = express.Router();

const {

   sendWhatsAppMessage,

   sendTemplateMessage

} = require("../services/whatsapp");


// NORMAL MESSAGE

router.post(

 "/send",

 async (req,res)=>{

   try {

      const {

         to,
         message

      } = req.body;

      const data =
      await sendWhatsAppMessage(

         to,
         message
      );

      res.json({

         success:true,

         data
      });

   } catch(err){

      res.status(500).json({

         success:false,

         error:err.message
      });
   }
});


// TEMPLATE MESSAGE

router.post(

 "/send-template",

 async (req,res)=>{

   try {

      const {

         number,

         templateName,

         parameters

      } = req.body;

      const data =
      await sendTemplateMessage(

         number,

         templateName,

         parameters
      );

      res.json({

         success:true,

         data
      });

   } catch(err){

      res.status(500).json({

         success:false,

         error:err.message
      });
   }
});


module.exports = router;