function handleError(event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) {
    console.error(event, source, lineno, colno, error);
    const span = document.createElement("span");
    const message = typeof(event) === "string" ? event : error?.message ?? "an error has occurred";
    span.innerText = "(" + message + ")";
    document.body.replaceChildren(span);
}

window.onerror = handleError