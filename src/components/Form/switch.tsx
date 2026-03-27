export default function Switch({enabled = false, setEnabled}: any) {
	// const [enabled, setEnabled] = useState(false);

	return (
		<div className="relative flex flex-col items-center justify-center">
			<div className="flex">
				<label className="inline-flex relative items-center cursor-pointer">
					<input
						type="checkbox"
						className="sr-only peer"
						checked={enabled}
						readOnly
					/>
					<div
						onClick={() => {
							setEnabled(!enabled);
						}}
						className="w-9 h-5 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-300"
					></div>
				</label>
			</div>
		</div>
	);
}
