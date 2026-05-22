import React, {
  useEffect,
  useState
} from "react";

import socket from "../../socket";

import "./WhatsAppChat.css";

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

  <div className="wa-message-box">

    <div className="wa-header">

      <h3>WhatsApp Messaging</h3>

      <p>
        Send direct messages instantly
      </p>

    </div>

    <input

      type="text"

      placeholder="Enter WhatsApp Number"

      value={number}

      onChange={(e)=>
        setNumber(e.target.value)
      }

      className="wa-input"
    />

    <textarea

      value={text}

      onChange={(e)=>
        setText(e.target.value)
      }

      placeholder="Type Message"

      className="wa-textarea"
    />

    <div className="wa-actions">

      <button

        onClick={handleSend}

        className="wa-send-btn"
      >

        Send Message

      </button>

      <button

        onClick={handleTemplate}

        className="wa-template-btn"
      >

        Send Template

      </button>

    </div>


    <div className="wa-messages">

      {
        messages.map((msg,index)=>(

          <div
            key={index}

            className="wa-message"
          >

            {msg.message}

          </div>
        ))
      }

    </div>

  </div>
);
};

export default WhatsAppChat;