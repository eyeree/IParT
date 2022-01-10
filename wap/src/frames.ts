window.onload = () => {

    const f1 = document.getElementById("f1") as HTMLIFrameElement;
    const f2 = document.getElementById("f2") as HTMLIFrameElement;
    const f3 = document.getElementById("f3") as HTMLIFrameElement;
    const f4 = document.getElementById("f4") as HTMLIFrameElement;
    const f5 = document.getElementById("f5") as HTMLIFrameElement;
    const f6 = document.getElementById("f6") as HTMLIFrameElement;
    const f = [f1, f2, f3, f4, f5, f6];

    const fromToken = document.getElementById("from_token") as HTMLSpanElement;
    const toToken = document.getElementById("to_token") as HTMLSpanElement;

    const nextPage = document.getElementById("next_page") as HTMLSpanElement;
    nextPage.onclick = () => load(firstTokenId + f.length);

    const prevPage = document.getElementById("prev_page") as HTMLSpanElement;
    prevPage.onclick = () => load(firstTokenId - f.length);

    const goto = document.getElementById("goto") as HTMLSpanElement;
    goto.onclick = () => load(Number.parseInt(gotoToken.value));

    const gotoToken = document.getElementById("goto_token") as HTMLInputElement;
    gotoToken.onkeyup = event => {
        console.log("event", event);
        if (event.key === "Enter") {
            event.preventDefault();
            goto.click();
        }
    }


    let firstTokenId = 0;
    function load(fromTokenId:number) {
        if(fromTokenId < 0) return;
        firstTokenId = fromTokenId;
        fromToken.innerText = firstTokenId.toString();
        toToken.innerText = (firstTokenId + f.length - 1).toString();
        gotoToken.value = firstTokenId.toString();
        for(let i = 0; i < f.length; ++i) {
            f[i].setAttribute('src', `index.html#${firstTokenId + i}`);
        }
    }

    load(0);

}