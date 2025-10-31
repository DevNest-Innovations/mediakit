export function formatBytes(bytes: number) {
	if (bytes === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
	let t: ReturnType<typeof setTimeout> | null = null;
	return (...args: Parameters<T>) => {
		if (t) clearTimeout(t);
		t = setTimeout(() => fn(...args), wait);
	};
}
