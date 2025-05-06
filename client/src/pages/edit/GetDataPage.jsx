import { useState, useEffect } from "react";
import styles from "../../styles/common/edit/Email.module.css";
import Step1 from "../../components/steps/step1";
import { useHandleRoute } from "../../lib/util";

export default function GetDataPage() {
	const { handleRoute } = useHandleRoute();

	const [email, setEmail] = useState("");
	const [title, setTitle] = useState("");
	const [isNextDisabled, setIsNextDisabled] = useState(true);

	const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	useEffect(() => {
		setIsNextDisabled(!(isValidEmail(email) && title.trim() !== ""));
	}, [email, title]);

	const handleEmailChange = (value) => {
		setEmail(value);
	};
	const handleTitleChange = (value) => {
		setTitle(value);
	};

	const handleNext = () => {
		handleRoute("/edit/2", { email, title });
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
			<h2 className={styles.title}>제목을 입력해주세요</h2>
			<div className={styles.subTitle}>브이로그 제목은 영상 편집 내용에 반영될 수 있습니다.</div>
			<div className={styles.wrapper}>
				<div className={styles.inputContainer}>
					<div className={styles.input}>
				
						<img className={styles.icon} src="/pen.svg" alt="Pen Icon" />
						<input
							type="text"
							placeholder={"Your Video Title"}
							className={styles.inputField}
							onChange={(e) => handleTitleChange(e.target.value)}
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
