import { useEffect, useRef, useState } from "react";
import OpenAI from "openai";

export function ChatRoom() {
  const dummy = useRef();
  const [formValue, setFormValue] = useState("");
  const [isAIWaiting, setIsAIWaiting] = useState(false);
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("messages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [aiConversation, setAiConversation] = useState([]); 
  const [step, setStep] = useState(0);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const steps = [
    "음악 추천을 시작할까요? (y/n)",
    "어떤 상황에서 듣고 싶으신가요?",
    "어떠한 장르 혹은 국가의 노래가 좋을까요?",
  ];

  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("Current Step:", step);
    console.log("Current aiConversation:", aiConversation);

    if (step === 3 && aiConversation.length === 2) {
      getRecommendation();
    }
  }, [aiConversation, step]);

  const startConversation = () => {
    const firstQuestion = "음악 추천을 시작할까요? (y/n)";
    addMessage({ text: firstQuestion, uid: "ai" });
    setStep(0);
    setAiConversation([]);
  };

  const getRecommendation = async () => {
    addMessage({ text: "로딩 중...", uid: "ai" });

    console.log("getRecommendation called with aiConversation:", aiConversation);

    const query = `${aiConversation[0]}에 어울리는 ${aiConversation[1]} 노래를 5곡 추천해 줘.`;
    const f =
      '질문에 국가가 명시되어 있을 경우 해당 국가의 노래만 출력하고, 질문에 나라가 명시되어 있지 않을 경우에만 국가와 상관없이 추천해 줘. 답변은 다음과 같은 json 형식을 따라야 함 [{ "idx": 1, "artistName":"", "songName":"" }] 형태로 출력';

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: query + f }],
        temperature: 0.2,
        max_tokens: 300,
        top_p: 1,
      });

      const content = response.choices[0].message.content;
      console.log("OpenAI 응답 내용:", content);

      const jsonResponse = JSON.parse(content.trim());

      console.log("파싱된 응답:", jsonResponse);

      if (jsonResponse.length === 0) {
        throw new Error("추천 결과가 없습니다.");
      }

      const recommendationMessage = jsonResponse
        .map(
          (song) =>
            `🎵 ${song.songName} - ${song.artistName}`
        )
        .join("\n");

      addMessage({ text: recommendationMessage, uid: "ai" });
      addMessage({ text: "다른 곡도 추천 받고 싶으신가요? (y/n)", uid: "ai" });
    } catch (error) {
      console.error("추천 과정에서 발생한 오류:", error);
      addMessage({ text: "추천 결과를 불러오는 중 오류가 발생했습니다.", uid: "ai" });
    }

    setIsAIWaiting(false);
  };

  const continueConversation = async (userMessage) => {
    setIsAIWaiting(true);

    if (step === 0 && userMessage.toLowerCase() === "y") {
      const aiMessage = steps[1];
      setStep(1);
      addMessage({ text: aiMessage, uid: "ai" });
    } else if (step === 1) {
      setAiConversation([userMessage]);
      const aiMessage = steps[2];
      setStep(2);
      addMessage({ text: aiMessage, uid: "ai" });
    } else if (step === 2) {
      setAiConversation((prev) => [...prev, userMessage]);
      setStep(3); // 다음 단계로 이동
    } else if (step === 3 && userMessage.toLowerCase() === "y") {
      startConversation();
    } else if (step === 3 && userMessage.toLowerCase() === "n") {
      addMessage({ text: "음악 추천을 종료합니다.", uid: "ai" });
    } else if (step === 0 && userMessage.toLowerCase() === "n") {
      addMessage({ text: "음악 추천을 종료합니다.", uid: "ai" });
      setIsAIWaiting(false);
      return;
    }

    setIsAIWaiting(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    addMessage({ text: formValue, uid: "user" });
    continueConversation(formValue);
    setFormValue("");
  };

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <>
      <main>
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isAIWaiting}
        />
        <button type="submit" disabled={!formValue || isAIWaiting}>
          보내기
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === "user" ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`} style={{ whiteSpace: "pre-line" }}>
      <p>{text}</p>
    </div>
  );
}
