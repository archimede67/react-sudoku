import React, { useEffect, useState } from "react";
import "./App.css";
import { makepuzzle, solvepuzzle, ratepuzzle } from "sudoku";
import colorThemes from "./themes";
import SourceFooter from "./SourceFooter";

type UserNumberProps = {
	onChange: (n: number) => void;
	onClick?: () => void;
	onBlur?: () => void;
	isHightlighted: boolean;
	number: number | null;
};
function UserNumber({ onChange, onClick, onBlur, isHightlighted = false, number }: UserNumberProps) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key >= "0" && e.key <= "9") {
			e.preventDefault();
			onChange(+e.key);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		onChange(+e.target.value);
	};

	return (
		<div
			className={`grid-item user-number ${isHightlighted ? "highlighted" : ""}`}
			onKeyDown={handleKeyDown}
			onClick={onClick}>
			<input
				onBlur={onBlur}
				type="number"
				min={1}
				max={9}
				value={!number ? "" : number}
				onChange={handleChange}></input>
		</div>
	);
}

type PuzzleItem = {
	user: boolean;
	number: number | null;
};
type SudokuPuzzle = [PuzzleItem] | [];
function App() {
	const [puzzle, setPuzzle] = useState<number[]>();
	const [currentPuzzle, setCurrentPuzzle] = useState<SudokuPuzzle>([]);
	const [difficulty, setDifficulty] = useState(0);
	const [colorTheme, setColorTheme] = useState<string>("default");

	const [highlight, setHighlight] = useState<number>(-1);
	const [win, setWin] = useState(false);

	const generatePuzzle = () => {
		const puzzle = makepuzzle();
		const correctedPuzzle = puzzle.map((e: number | null) => {
			if (e === null) {
				return { user: true, number: null };
			} else {
				return { user: false, number: e + 1 };
			}
		});
		setCurrentPuzzle(correctedPuzzle);
		setPuzzle(puzzle);
		setDifficulty(ratepuzzle(puzzle, 40));
	};

	useEffect(() => {
		generatePuzzle();
	}, []);

	const handleNumberInput = (index: number, n: number) => {
		const updated = [...currentPuzzle] as SudokuPuzzle;
		updated[index].number = n;
		setCurrentPuzzle(updated);

		const sol = solvepuzzle(puzzle).map((e: number) => e + 1);

		if (!win) {
			if (updated.join("") === sol.join("")) {
				setWin(true);
				setHighlight(-1);
			}
		}
	};

	const handleHighlight = (index: number) => {
		setHighlight(index === highlight ? -1 : index);
	};

	const playAgain = () => {
		setWin(false);
		generatePuzzle();
	};

	const switchTheme = (color: string) => {
		setColorTheme(color);
	};

	return (
		<div className={`App ${colorTheme ? "colors-" + colorTheme : ""}`}>
			<h1>Sudoku</h1>
			<p>Difficulty: {difficulty}</p>
			<div className="sudoku-container">
				{win ? (
					<div className="win-screen">
						<p>👏 Congratulations 👏</p>
						<button onClick={playAgain}>Play again</button>
					</div>
				) : null}
				{currentPuzzle?.map((item, index) => {
					const highlightedNumber = currentPuzzle[highlight]?.number || 0;
					const { user, number } = item;
					if (user) {
						return (
							<UserNumber
								onClick={() => setHighlight(index)}
								key={index}
								number={number}
								onChange={(nb) => handleNumberInput(index, nb)}
								onBlur={() => setHighlight(-1)}
								isHightlighted={
									highlightedNumber > 0 && highlightedNumber === currentPuzzle[index].number
								}
							/>
						);
					} else {
						return (
							<div
								key={index}
								className={`grid-item default-number ${
									number === highlightedNumber ? "highlighted" : ""
								}`}
								onClick={() => handleHighlight(index)}>
								{number}
							</div>
						);
					}
				})}
				<div className="separator0"></div>
				<div className="separator1"></div>
				<div className="separator2"></div>
				<div className="separator3"></div>
				<div
					className="highlight-x"
					style={{
						top: `calc(${Math.floor(highlight / 9)} * (50px + 0.25rem))`,
						display: highlight === -1 ? "none" : "block",
					}}></div>
				<div
					className="highlight-y"
					style={{
						left: `calc(${Math.floor(highlight % 9)} * (50px + 0.25rem))`,
						display: highlight === -1 ? "none" : "block",
					}}></div>
			</div>

			<div className="actions">
				<div className="theme-switcher">
					{Object.keys(colorThemes).map((color) => {
						return (
							<button
								className={`color-button ${color === colorTheme ? "selected" : ""}`}
								style={{ background: colorThemes[color] }}
								key={color}
								onClick={() => switchTheme(color)}></button>
						);
					})}
				</div>
				<button onClick={generatePuzzle}>↻ Regenerate</button>
			</div>

			<SourceFooter github="https://github.com/archimede67/react-sudoku" />
		</div>
	);
}

export default App;
