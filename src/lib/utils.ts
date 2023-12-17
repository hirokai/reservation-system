// place files you want to import through the `$lib` alias in this folder.

export const formatTime = (time: Date) => {
	// 日付と時刻を指定する
	return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${time
		.getMinutes()
		.toString()
		.padStart(2, '0')}`;
};
