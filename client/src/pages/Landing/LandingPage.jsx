import { useState } from "react";
import { useHandleRoute } from "../../lib/util";
import "./LandingPage.css";
import faqs from "../../lib/faq"

export default function LandingPage() {
    
    const { handleRoute } = useHandleRoute();
    const [openQuestions, setOpenQuestions] = useState([]);


    const toggleQuestion = (index) => {
        setOpenQuestions((prevState) => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };

    const handleEditNext = () => {
		handleRoute("/edit/1");
	};
    const handleModifyNext = () => {
		handleRoute("/premium");
	};


  return (
    <div className="root">

        {/* 랜딩 페이지 */}
        <br></br>
        <h1>인공지능 vlog 편집자</h1>
        <div className="content">
            <div className="logoImg">
                <img src="/logo.png" alt="logo" />
            </div>
            
            <div className="contentDesc">
                <p>📸 귀찮은 영상 편집은 그만, 찍기만 하면 끝!</p>
                <p>🎞️ 편집 걱정 없이 소중한 순간을 남기세요</p>
                <p>🚀 편집은 Clipper-GPT가 할게요</p>
            </div>
        </div>


      {/* 버튼 그룹 */}
      <div className="buttons">
        <button className="start-button" onClick={handleEditNext} >편집 시작</button>
        <button className="modify-button" onClick={handleModifyNext} >수정하기</button>
      </div>


      {/* 사용 방법 */}
      <br></br><br></br><br></br><br></br>
      <h2 id="usage">사용 방법</h2>
      <div className="usage">
            
            <div className="step">
                <div className="screen-container">
                    <img src="/screenshot1.png" alt="step1" className="screenImg" />
                </div>
                <div className="desc">
                    <img src="/icon1.png" alt="step1" className="icon" />
                    <h2>Step 1</h2>
                    <p>
                        편집본을 받으실 이메일을 입력해주세요.
                        <br />
                        (Share with others 에 공유할 사람들의 메일을 모두 적어주세요.)
                    </p>
                </div>
            </div>

            <div className="step">
                <div className="screen-container">
                    <img src="/screenshot2.png" alt="step2" className="screenImg" />
                </div>
                <div className="desc">
                    <img src="/icon2.png" alt="step2" className="icon" />
                    <h2>Step 2</h2>
                    <p>
                        편집하실 영상을 업로드해주세요.
                        <br />
                        자막을 씌운 영상을 받고 싶으시면 체크박스를 선택해주세요.
                        <br />
                        선택하지 않으시면 자막 파일을 편집된 동영상과 함께 제공합니다.
                    </p>
                </div>
            </div>

            <div className="step">
                <div className="screen-container">
                    <img src="/screenshot3.png" alt="step3" className="screenImg" />
                </div>
                <div className="desc">
                    <img src="/icon1.png" alt="step3" className="icon" />
                    <h2>Step 3</h2>
                    <p>
                        이제 모든 과정이 끝났어요.
                        <br />
                        AI가 영상을 편집한 뒤 이메일로 보내드릴게요.
                        <br />
                        (해당 과정은 영상에 따라 1시간 ~ 3일정도 소요될 수 있습니다.)
                    </p>
                </div>
            </div>
        </div>


        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <div className="content">
            <h1>AI 완전 자동 영상 편집기</h1>
            <div className="logoImg">
                    <img src="/logo.png" alt="logo" />
            </div>
            <div className="freeDesc">
                    프리런칭 2025년 3월까지 무료로 이용해보세요<br />
                    프리런칭 기간 중 이용하신 분들께는 정식 런칭 후 무료 쿠폰을 드려요!
            </div>
        </div>



        {/* 버튼 그룹 */}
        <div className="buttons">
            <button className="start-button" onClick={handleEditNext} >편집 시작</button>
            <button className="modify-button" onClick={handleModifyNext} >수정하기</button>
        </div>



        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

        <h2>자주 묻는 질문</h2>
        <div className="faq-container">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className={`faq-item ${openQuestions[index] ? "active" : ""}`}
                >
                    <div
                        className="faq-question"
                        onClick={() => toggleQuestion(index)}
                    >
                        {faq.question}
                        <img
                            src={openQuestions[index] ? "/upperArrow.svg" : "/underArrow.svg"}
                            alt={openQuestions[index] ? "Close" : "Open"}
                            className="faq-toggle-icon"
                        />
                    </div>
                    <div
                        className={`faq-answer-wrapper ${
                            openQuestions[index] ? "open" : "closed"
                        }`}
                        onClick={() => toggleQuestion(index)}
                    >
                        <div className="faq-answer">{faq.answer}</div>
                    </div>
                </div>
            ))}
        </div>


        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

        <div className="content">
            <div className="freeDesc">
                문제가 발생하거나 더 궁금하신 점이 있다면 clippergpt.ai@gmail.com 으로 
                <br />
                메일 주시면 빠른 시일 내에 답변 드리도록 하겠습니다.
            </div>
        </div>

        <br /><br /><br /><br /><br /><br />

    </div>
    

  );
}
