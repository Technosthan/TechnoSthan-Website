import React, {
  useEffect,
  useState
} from "react";

import socket from "../../socket";

import {

  sendWhatsAppMessage,

  sendTemplate

} from "../../api/whatsappApi";

const WhatsAppChat = () => {

  const [text, setText] =
  useState("");

  const [number, setNumber] =
  useState("");

  const [messages, setMessages]
  = useState([]);

  // LIVE MESSAGES

  useEffect(()=>{

    socket.on(

      "new_message",

      (data)=>{

        setMessages(prev => [

          ...prev,

          data
        ]);
      }
    );

    return ()=>{

      socket.off("new_message");
    };

  },[]);


  // NORMAL MESSAGE

  const handleSend = async ()=>{

    try {

      await sendWhatsAppMessage(

        number,

        text
      );

      setMessages(prev => [

        ...prev,

        {
          message:text,
          sender:"hr"
        }
      ]);

      setText("");

    } catch(err){

      console.log(err);
    }
  };


  // TEMPLATE MESSAGE

  const handleTemplate = async ()=>{

    try {

      await sendTemplate(

        number,

        "interview_reminder",

        [

          {
            type:"text",

            text:"Rahul"
          },

          {
            type:"text",

            text:"Tomorrow 10 AM"
          }

        ]
      );

      alert("Template Sent");

    } catch(err){

      console.log(err);
    }
  };


  return (

    <div>

      <input

        type="text"

        placeholder="Enter Number"

        value={number}

        onChange={(e)=>
          setNumber(e.target.value)
        }
      />

      <textarea

        value={text}

        onChange={(e)=>
          setText(e.target.value)
        }

        placeholder="Type Message"
      />

      <button onClick={handleSend}>

        Send Message

      </button>

      <button onClick={handleTemplate}>

        Send Template

      </button>


      <div>

        {
          messages.map((msg,index)=>(

            <div key={index}>

              {msg.message}

            </div>
          ))
        }

      </div>

    </div>
  );
};

export default WhatsAppChat;