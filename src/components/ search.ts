// Komponent för sökning
export function renderSearch(
    root: HTMLElement,
    onSearch: (value: string) => void | Promise<void>
): void {
    root.innerHTML = `
        <div class="search-field">
            <input 
                type="search" 
                id="movie-search" 
                placeholder="Search movies..." 
                aria-label="Search movies"
            />
            <i class="fa-solid fa-search fa-xl search-field__icon"></i>
        </div>
    `;

    const input = root.querySelector<HTMLInputElement>("#movie-search")!;
    let timeoutId: number | undefined;

    input.addEventListener("input", () => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
            void onSearch(input.value);
        }, 300);
    });

    // Also trigger on Enter key
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            void onSearch(input.value);
        }
    });
}
