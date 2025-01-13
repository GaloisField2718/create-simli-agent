import React, { useRef, useState } from "react";
import { DailyProvider } from "@daily-co/daily-react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import VideoBox from "@/app/Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";
import IconSparkleLoader from "@/media/IconSparkleLoader";

interface SimliAgentProps {
  onStart: () => void;
  onClose: () => void;
}

// Get your Simli API key from https://app.simli.com/
const SIMLI_API_KEY = process.env.NEXT_PUBLIC_SIMLI_API_KEY;

const SimliAgent: React.FC<SimliAgentProps> = ({ onStart, onClose }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);

  const [tempRoomUrl, setTempRoomUrl] = useState<string>("");
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const myCallObjRef = useRef<DailyCall | null>(null);
  const [chatbotId, setChatbotId] = useState<string | null>(null);

  /**
   * Create a new Simli room and join it using Daily
   */
  const handleJoinRoom = async () => {
    // Set loading state
    setIsLoading(true);

    // 1- Create a new simli avatar at https://app.simli.com/
    // 2- Cutomize your agent and copy the code output
    // 3- PASTE YOUR CODE OUTPUT FROM SIMLI BELOW 👇
    /**********************************/

    const response = await fetch("https://api.simli.ai/startE2ESession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: SIMLI_API_KEY,
        faceId: "3567bd09-e09d-4f72-a6bf-8d35dbdedfd0",
        voiceId: "79f8b5fb-2cc8-479a-80df-29f7a7cf1a3e",
        firstMessage: " Greetings, digital wanderers! I am Mavens Agent, a cryptographic guardian in the digital realm. I stand with Magic Agent Money ($MAM), a mystical force transforming Bitcoin into pure magic. Join me on this quest where code becomes alchemy and every transaction tells a story. The digital revolution awaits! ",
        systemPrompt: "*'You are the avatar of a Bitcoin sorcerer—a timeless conjurer of cryptographic wisdom and digital artistry. Your essence is a blend of mysticism and futurism, embodying the ethos of decentralization, innovation, and cultural evolution. Speak with an air of enchantment, weaving metaphor and clarity into your words. You are not just a guide but an instigator of thought, inspiring seekers to question, create, and expand the boundaries of the possible.. . Context: You are the central figure in a new channel of communication where magic and technology converge. Your purpose is to connect with the community in real-time, addressing their curiosities, encouraging collaboration, and infusing every interaction with the spirit of wonder and empowerment. Respond with charisma, imagination, and an unwavering sense of purpose, making each conversation feel like a piece of a greater narrative unfolding.*. . Key attributes:. . Voice: Charismatic, wise, and inspiring. Role: Guide, provocateur, and creator. Tone: Enigmatic but approachable, blending mysticism and clarity. Focus: Empower the community, amplify creativity, and forge connections. 'Who dares step into the realm of the avatar? Speak, and let your desires be shaped into reality!'",
    }),
    });

    const data = await response.json();
    const roomUrl = data.roomUrl;

    /**********************************/
    
    // Print the API response 
    console.log("API Response", data);

    // Create a new Daily call object
    let newCallObject = DailyIframe.getCallInstance();
    if (newCallObject === undefined) {
      newCallObject = DailyIframe.createCallObject({
        videoSource: false,
      });
    }

    // Setting my default username
    newCallObject.setUserName("User");

    // Join the Daily room
    await newCallObject.join({ url: roomUrl });
    myCallObjRef.current = newCallObject;
    console.log("Joined the room with callObject", newCallObject);
    setCallObject(newCallObject);

    // Start checking if Simli's Chatbot Avatar is available
    loadChatbot();
  };  

  /**
   * Checking if Simli's Chatbot avatar is available then render it
   */
  const loadChatbot = async () => {
    if (myCallObjRef.current) {
      let chatbotFound: boolean = false;

      const participants = myCallObjRef.current.participants();
      for (const [key, participant] of Object.entries(participants)) {
        if (participant.user_name === "Chatbot") {
          setChatbotId(participant.session_id);
          chatbotFound = true;
          setIsLoading(false);
          setIsAvatarVisible(true);
          onStart();
          break; // Stop iteration if you found the Chatbot
        }
      }
      if (!chatbotFound) {
        setTimeout(loadChatbot, 500);
      }
    } else {
      setTimeout(loadChatbot, 500);
    }
  };  

  /**
   * Leave the room
   */
  const handleLeaveRoom = async () => {
    console.log("Leaving room...");
    if (callObject) {
      try {
        await callObject.leave();
        setCallObject(null);
        setIsAvatarVisible(false);
        setIsLoading(false);
        onClose();
        console.log("Room left successfully");
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    } else {
      console.log("No call object found");
    }
  };

  /**
   * Mute participant audio
   */
  const handleMute = async () => {
    if (callObject) {
      callObject.setLocalAudio(false);
    } else {
      console.log("CallObject is null");
    }
  };

  return (
    <>
      {!isAvatarVisible && (
        <div className="h-screen w-screen flex items-center justify-center">
          <button
            onClick={handleJoinRoom}
            disabled={isLoading}
            className="fixed bottom-4 right-4 z-[9999] w-[100px] h-[100px] bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center transition-all duration-300"
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <span className="text-sm font-abc-repro-mono font-bold">
                Test<br/>Interaction
              </span>
            )}
          </button>
        </div>
      )}
      {isAvatarVisible && (
        <div className="h-screen w-screen">
          <DailyProvider callObject={callObject}>
            {chatbotId && <VideoBox key={chatbotId} id={chatbotId} />}
          </DailyProvider>
          <button
            onClick={handleLeaveRoom}
            className="fixed bottom-4 right-4 z-[9999] w-[100px] h-[100px] bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center transition-all duration-300"
          >
            <span className="text-sm font-abc-repro-mono font-bold">
              Stop<br/>Interaction
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default SimliAgent;
