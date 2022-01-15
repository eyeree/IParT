export type GetStat = () => number|string;

export class Info {

    private readonly info = document.getElementById("info")! as HTMLDivElement;
    private readonly stats = document.getElementById("stats")! as HTMLDListElement;
    private readonly token_id = document.getElementById("token_id") as HTMLSpanElement;

    private readonly updateFunctions = new Set<() => void>();

    private interval = -1;

    constructor(private tokenId: number) {
        this.token_id.innerText = tokenId.toString();
    }

    public addStat(name: string, value?: number | string | GetStat) {

        const dt = document.createElement("dt");
        dt.innerText = name;

        const dd = document.createElement("dd");
        switch (typeof (value)) {
            case "number":
                dd.innerText = value.toString();
                break;
            case "string":
                dd.innerText = value.toLowerCase().replace("_", " ");
                break;
            case "function":
                this.updateFunctions.add(
                    () => dd.innerText = value().toString()
                );
                break;
        }

        this.stats.append(dt, dd);

    }

    private updateInfo() {
        for (const update of this.updateFunctions) {
            update();
        }
    }

    showInfo() {
        this.updateInfo();
        this.info.classList.remove("hidden");
        this.interval = setInterval(() => this.updateInfo(), 1000);
    }

    hideInfo() {
        this.info.classList.add("hidden");
        clearInterval(this.interval);
        this.interval = -1;
    }

    get isVisible() { return this.interval != -1; }

}
