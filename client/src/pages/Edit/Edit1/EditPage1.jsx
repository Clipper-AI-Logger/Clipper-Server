import { useState, useEffect } from "react";
import styles from "./EditPage1.module.css";
import Step1 from "../../../components/steps/step1";
import { useHandleRoute } from "../../../lib/util";

export default function EditPage1() {
	const { handleRoute } = useHandleRoute();

	const [email, setEmail] = useState("");
	const [prompt, setPrompt] = useState("");
	const [isNextDisabled, setIsNextDisabled] = useState(true);

	const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	useEffect(() => {
		setIsNextDisabled(!(isValidEmail(email) && prompt.trim() !== ""));
	}, [email, prompt]);

	const handleEmailChange = (value) => {
		setEmail(value);
	};
	const handlePromptChange = (value) => {
		setPrompt(value);
	};

	const handleNext = () => {
		handleRoute("/edit/2", { email, prompt });
	};

	return (

		<div className={styles.root}>

			{/* 이메일 입력 필드 */}
			<h2 className={styles.title}>Email</h2>
			<div className={styles.subTitle}>편집 완성본을 받을 이메일을 입력해주세요.</div>
			<div className={styles.wrapper}>
				<div className={styles.inputContainer}>
					<div className={styles.input}>
						<img className={styles.icon} src="/email.svg" alt="Email Icon" />
						<input
							type="email"
							placeholder={"Your email"}
							className={styles.inputField}
							onChange={(e) => handleEmailChange(e.target.value)}
						/>
					</div>
				</div>
			</div>

			<br />

			{/* 제목 입력 필드 */}
			<h2 className={styles.title}>Prompt</h2>
			<div className={styles.subTitle}>
				[제목 또는 여행지] - [특정 날짜나 상황] - [중점적으로 편집할 포인트나 주요 장면 요약]<br />
				위의 형식에 따라 편집에 반영되었으면 하는 내용을 작성해주세요. <br />
				ex) [도쿄 여행 2일차 - 디즈니랜드 - 어트랙션 설명 및 탑승 전후 반응과 인터뷰 중심으로 편집. 다음 일정도 자연스럽게 연결.]
			</div>
			<div className={styles.wrapper}>
				<div className={styles.inputContainer}>
					<div className={styles.input}>
				
						<img className={styles.icon} src="/pen.svg" alt="Pen Icon" />
						<input
							type="text"
							placeholder={"Your Video Title"}
							className={styles.inputField}
							onChange={(e) => handlePromptChange(e.target.value)}
						/>
					</div>
				</div>
			</div>


			{/*  다음 버튼 */}
			<div className={styles.buttonWrapper}>
				<button
					className={styles.startButton}
					disabled={isNextDisabled}
					onClick={handleNext}
				>
				다음
				</button>
			</div>


			{/* 진행도 그래프 */}
			<div className={styles.graph}>
				<Step1 />
			</div>
		</div>
	);
}
