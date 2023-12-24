export const downloadFile = (filename: string, mime: string, text: string): void => {
	const element = document.createElement('a');
	element.setAttribute('href', `data:${mime};charset=utf-8,` + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
};
